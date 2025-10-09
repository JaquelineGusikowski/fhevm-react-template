const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  console.log(`\n========================================`);
  console.log(`Interacting with Agricultural Subsidy Contract`);
  console.log(`Network: ${networkName}`);
  console.log(`========================================\n`);

  // Load deployment information
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`Error: Deployment file not found at ${deploymentFile}`);
    console.error(`Please deploy the contract first using: npm run deploy`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${networkName}\n`);

  // Get contract instance
  const FarmerSubsidy = await hre.ethers.getContractFactory("FarmerSubsidy");
  const contract = FarmerSubsidy.attach(contractAddress);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`Interacting with account: ${signer.address}\n`);

  try {
    // 1. Get contract basic information
    console.log("========================================");
    console.log("Contract Information");
    console.log("========================================");

    const subsidyAuthority = await contract.subsidyAuthority();
    const currentPeriod = await contract.currentDistributionPeriod();
    const totalBudget = await contract.totalSubsidyBudget();
    const totalFarmers = await contract.getTotalRegisteredFarmers();

    console.log(`Subsidy Authority: ${subsidyAuthority}`);
    console.log(`Current Distribution Period: ${currentPeriod}`);
    console.log(`Total Budget: ${hre.ethers.formatEther(totalBudget)} ETH`);
    console.log(`Total Registered Farmers: ${totalFarmers}`);

    // 2. Get current period information
    console.log("\n========================================");
    console.log("Current Distribution Period");
    console.log("========================================");

    const periodInfo = await contract.getCurrentPeriodInfo();
    console.log(`Period Number: ${periodInfo[0]}`);
    console.log(`Start Time: ${periodInfo[1] > 0 ? new Date(Number(periodInfo[1]) * 1000).toLocaleString() : 'Not started'}`);
    console.log(`End Time: ${periodInfo[2] > 0 ? new Date(Number(periodInfo[2]) * 1000).toLocaleString() : 'Not set'}`);
    console.log(`Total Budget: ${hre.ethers.formatEther(periodInfo[3])} ETH`);
    console.log(`Distributed Amount: ${hre.ethers.formatEther(periodInfo[4])} ETH`);
    console.log(`Beneficiary Count: ${periodInfo[5]}`);
    console.log(`Is Active: ${periodInfo[6]}`);
    console.log(`Distribution Completed: ${periodInfo[7]}`);

    // 3. Get farmer profile for current signer
    console.log("\n========================================");
    console.log("Your Farmer Profile");
    console.log("========================================");

    const farmerProfile = await contract.getFarmerProfile(signer.address);
    console.log(`Is Registered: ${farmerProfile[0]}`);
    console.log(`Has Received Subsidy: ${farmerProfile[1]}`);
    console.log(`Registration Time: ${farmerProfile[2] > 0 ? new Date(Number(farmerProfile[2]) * 1000).toLocaleString() : 'Not registered'}`);

    // 4. Display available actions
    console.log("\n========================================");
    console.log("Available Actions");
    console.log("========================================");

    const isAuthority = signer.address.toLowerCase() === subsidyAuthority.toLowerCase();

    if (isAuthority) {
      console.log("\nAs Subsidy Authority, you can:");
      console.log("1. Start new distribution period");
      console.log("2. Calculate subsidy amounts for farmers");
      console.log("3. Request subsidy decryption and distribution");
      console.log("4. Complete distribution period");
      console.log("5. Withdraw unused funds");
    }

    if (!farmerProfile[0] && periodInfo[6]) {
      console.log("\nAs a Farmer, you can:");
      console.log("1. Register with your farm data during active periods");
    } else if (farmerProfile[0] && !farmerProfile[1]) {
      console.log("\nYour registration is pending subsidy calculation.");
    } else if (farmerProfile[1]) {
      console.log("\nYou have already received your subsidy for this period.");
    }

    // 5. Example: Check contract balance
    console.log("\n========================================");
    console.log("Contract Balance");
    console.log("========================================");

    const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
    console.log(`Contract Balance: ${hre.ethers.formatEther(contractBalance)} ETH`);

    console.log("\n========================================");
    console.log("Interaction Complete");
    console.log("========================================\n");

    // 6. Display helpful links
    if (networkName === "sepolia") {
      console.log(`View contract on Etherscan:`);
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}\n`);
    } else if (networkName === "mainnet") {
      console.log(`View contract on Etherscan:`);
      console.log(`https://etherscan.io/address/${contractAddress}\n`);
    }

  } catch (error) {
    console.error("\nError interacting with contract:");
    console.error(error.message);
    process.exit(1);
  }
}

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nInteraction script failed:");
    console.error(error);
    process.exit(1);
  });
