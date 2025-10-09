// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";

contract FarmerSubsidy {

    address public subsidyAuthority;
    uint256 public currentDistributionPeriod;
    uint256 public totalSubsidyBudget;

    struct FarmerProfile {
        euint32 encryptedFarmSize;
        euint32 encryptedCropYield;
        euint64 encryptedIncomeLevel;
        bool isRegistered;
        bool hasReceivedSubsidy;
        uint256 registrationTime;
        address farmerAddress;
    }

    struct DistributionPeriod {
        uint256 startTime;
        uint256 endTime;
        uint256 totalBudget;
        uint256 distributedAmount;
        uint256 beneficiaryCount;
        bool isActive;
        bool distributionCompleted;
    }

    mapping(uint256 => DistributionPeriod) public distributionPeriods;
    mapping(address => FarmerProfile) public farmers;
    mapping(uint256 => mapping(address => euint64)) public encryptedSubsidyAmounts;

    address[] public registeredFarmers;

    event FarmerRegistered(address indexed farmer, uint256 timestamp);
    event DistributionPeriodStarted(uint256 indexed period, uint256 budget, uint256 startTime);
    event SubsidyCalculated(address indexed farmer, uint256 period);
    event SubsidyDistributed(address indexed farmer, uint256 period, uint256 amount);
    event DistributionCompleted(uint256 indexed period, uint256 totalDistributed, uint256 beneficiaries);

    modifier onlySubsidyAuthority() {
        require(msg.sender == subsidyAuthority, "Not authorized");
        _;
    }

    modifier onlyRegisteredFarmer() {
        require(farmers[msg.sender].isRegistered, "Not registered farmer");
        _;
    }

    modifier duringRegistrationPeriod() {
        DistributionPeriod storage period = distributionPeriods[currentDistributionPeriod];
        require(period.isActive && !period.distributionCompleted, "Registration not active");
        _;
    }

    constructor(uint256 _initialBudget) {
        subsidyAuthority = msg.sender;
        totalSubsidyBudget = _initialBudget;
        currentDistributionPeriod = 1;
    }

    function startNewDistributionPeriod(uint256 _budget, uint256 _duration) external onlySubsidyAuthority {
        require(!distributionPeriods[currentDistributionPeriod].isActive, "Current period still active");

        distributionPeriods[currentDistributionPeriod] = DistributionPeriod({
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            totalBudget: _budget,
            distributedAmount: 0,
            beneficiaryCount: 0,
            isActive: true,
            distributionCompleted: false
        });

        emit DistributionPeriodStarted(currentDistributionPeriod, _budget, block.timestamp);
    }

    function registerFarmer(
        uint32 _farmSize,
        uint32 _cropYield,
        uint64 _incomeLevel
    ) external duringRegistrationPeriod {
        require(!farmers[msg.sender].isRegistered, "Already registered");
        require(_farmSize > 0 && _cropYield > 0, "Invalid farm data");

        euint32 encryptedFarmSize = FHE.asEuint32(_farmSize);
        euint32 encryptedCropYield = FHE.asEuint32(_cropYield);
        euint64 encryptedIncomeLevel = FHE.asEuint64(_incomeLevel);

        farmers[msg.sender] = FarmerProfile({
            encryptedFarmSize: encryptedFarmSize,
            encryptedCropYield: encryptedCropYield,
            encryptedIncomeLevel: encryptedIncomeLevel,
            isRegistered: true,
            hasReceivedSubsidy: false,
            registrationTime: block.timestamp,
            farmerAddress: msg.sender
        });

        registeredFarmers.push(msg.sender);

        FHE.allowThis(encryptedFarmSize);
        FHE.allowThis(encryptedCropYield);
        FHE.allowThis(encryptedIncomeLevel);

        FHE.allow(encryptedFarmSize, msg.sender);
        FHE.allow(encryptedCropYield, msg.sender);
        FHE.allow(encryptedIncomeLevel, msg.sender);

        emit FarmerRegistered(msg.sender, block.timestamp);
    }

    function calculateSubsidyAmount(address _farmer) external onlySubsidyAuthority {
        require(farmers[_farmer].isRegistered, "Farmer not registered");
        require(!farmers[_farmer].hasReceivedSubsidy, "Subsidy already received");

        FarmerProfile storage farmer = farmers[_farmer];

        euint64 baseSubsidy = FHE.asEuint64(1000);

        // Calculate farm size bonus (larger farms get more subsidy)
        // Simplified bonus calculation - fixed bonuses for FHE compatibility
        euint64 farmSizeBonus = FHE.asEuint64(400);
        euint64 yieldBonus = FHE.asEuint64(300);

        euint64 maxIncomeThreshold = FHE.asEuint64(50000);
        ebool isEligibleByIncome = FHE.lt(farmer.encryptedIncomeLevel, maxIncomeThreshold);

        euint64 totalSubsidy = FHE.add(baseSubsidy, FHE.add(farmSizeBonus, yieldBonus));

        euint64 zeroAmount = FHE.asEuint64(0);
        euint64 finalSubsidy = FHE.select(isEligibleByIncome, totalSubsidy, zeroAmount);

        encryptedSubsidyAmounts[currentDistributionPeriod][_farmer] = finalSubsidy;

        FHE.allowThis(finalSubsidy);
        FHE.allow(finalSubsidy, _farmer);

        emit SubsidyCalculated(_farmer, currentDistributionPeriod);
    }

    mapping(uint256 => address) private decryptionRequests;

    function requestSubsidyDecryption(address _farmer) external onlySubsidyAuthority {
        require(farmers[_farmer].isRegistered, "Farmer not registered");

        euint64 encryptedAmount = encryptedSubsidyAmounts[currentDistributionPeriod][_farmer];
        require(FHE.toBytes32(encryptedAmount) != bytes32(0), "No subsidy calculated");

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(encryptedAmount);

        uint256 requestId = FHE.requestDecryption(cts, this.processSubsidyDistribution.selector);
        decryptionRequests[requestId] = _farmer;
    }

    function processSubsidyDistribution(
        uint256 requestId,
        uint64 subsidyAmount,
        bytes memory signatures
    ) external {
        bytes memory decryptedValues = abi.encodePacked(subsidyAmount);
        FHE.checkSignatures(requestId, decryptedValues, signatures);

        address farmer = decryptionRequests[requestId];
        require(farmer != address(0), "Invalid request ID");

        require(farmers[farmer].isRegistered, "Farmer not registered");
        require(!farmers[farmer].hasReceivedSubsidy, "Subsidy already received");

        delete decryptionRequests[requestId];

        if (subsidyAmount > 0) {
            DistributionPeriod storage currentPeriod = distributionPeriods[currentDistributionPeriod];

            require(currentPeriod.distributedAmount + subsidyAmount <= currentPeriod.totalBudget, "Budget exceeded");

            farmers[farmer].hasReceivedSubsidy = true;
            currentPeriod.distributedAmount += subsidyAmount;
            currentPeriod.beneficiaryCount += 1;

            emit SubsidyDistributed(farmer, currentDistributionPeriod, subsidyAmount);

            (bool success, ) = farmer.call{value: subsidyAmount}("");
            require(success, "Transfer failed");
        }
    }

    function completeDistributionPeriod() external onlySubsidyAuthority {
        DistributionPeriod storage period = distributionPeriods[currentDistributionPeriod];
        require(period.isActive, "Period not active");
        require(block.timestamp >= period.endTime, "Period not ended");

        period.isActive = false;
        period.distributionCompleted = true;

        emit DistributionCompleted(
            currentDistributionPeriod,
            period.distributedAmount,
            period.beneficiaryCount
        );

        for (uint i = 0; i < registeredFarmers.length; i++) {
            farmers[registeredFarmers[i]].hasReceivedSubsidy = false;
        }

        currentDistributionPeriod++;
    }

    function getFarmerProfile(address _farmer) external view returns (
        bool isRegistered,
        bool hasReceivedSubsidy,
        uint256 registrationTime
    ) {
        FarmerProfile storage farmer = farmers[_farmer];
        return (
            farmer.isRegistered,
            farmer.hasReceivedSubsidy,
            farmer.registrationTime
        );
    }

    function getCurrentPeriodInfo() external view returns (
        uint256 period,
        uint256 startTime,
        uint256 endTime,
        uint256 totalBudget,
        uint256 distributedAmount,
        uint256 beneficiaryCount,
        bool isActive,
        bool distributionCompleted
    ) {
        DistributionPeriod storage currentPeriod = distributionPeriods[currentDistributionPeriod];
        return (
            currentDistributionPeriod,
            currentPeriod.startTime,
            currentPeriod.endTime,
            currentPeriod.totalBudget,
            currentPeriod.distributedAmount,
            currentPeriod.beneficiaryCount,
            currentPeriod.isActive,
            currentPeriod.distributionCompleted
        );
    }

    function getTotalRegisteredFarmers() external view returns (uint256) {
        return registeredFarmers.length;
    }

    function getPeriodHistory(uint256 _period) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 totalBudget,
        uint256 distributedAmount,
        uint256 beneficiaryCount,
        bool distributionCompleted
    ) {
        DistributionPeriod storage period = distributionPeriods[_period];
        return (
            period.startTime,
            period.endTime,
            period.totalBudget,
            period.distributedAmount,
            period.beneficiaryCount,
            period.distributionCompleted
        );
    }

    receive() external payable {
        totalSubsidyBudget += msg.value;
    }

    function withdrawUnusedFunds() external onlySubsidyAuthority {
        require(!distributionPeriods[currentDistributionPeriod].isActive, "Distribution active");

        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = subsidyAuthority.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}