const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  console.log(`\n========================================`);
  console.log(`Deploying Agricultural Subsidy Platform`);
  console.log(`Network: ${networkName}`);
  console.log(`========================================\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Deploy configuration
  const initialBudget = hre.ethers.parseEther("10");
  console.log(`Initial subsidy budget: ${hre.ethers.formatEther(initialBudget)} ETH`);

  // Deploy contract
  console.log("\nDeploying FarmerSubsidy contract...");
  const FarmerSubsidy = await hre.ethers.getContractFactory("FarmerSubsidy");
  const farmerSubsidy = await FarmerSubsidy.deploy(initialBudget);

  await farmerSubsidy.waitForDeployment();

  const contractAddress = await farmerSubsidy.getAddress();

  console.log("\n========================================");
  console.log("Deployment Successful!");
  console.log("========================================");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Initial Budget: ${hre.ethers.formatEther(initialBudget)} ETH`);
  console.log(`Subsidy Authority: ${deployer.address}`);
  console.log(`Network: ${networkName}`);
  console.log(`ChainId: ${hre.network.config.chainId}`);

  // Save deployment information
  const deploymentInfo = {
    network: networkName,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    initialBudget: hre.ethers.formatEther(initialBudget),
    deploymentTime: new Date().toISOString(),
    chainId: hre.network.config.chainId,
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  // Display Etherscan link for supported networks
  if (networkName === "sepolia") {
    console.log(`\nView on Etherscan:`);
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`\nTo verify the contract, run:`);
    console.log(`npm run verify`);
  } else if (networkName === "mainnet") {
    console.log(`\nView on Etherscan:`);
    console.log(`https://etherscan.io/address/${contractAddress}`);
  }

  console.log(`\n========================================`);
  console.log(`Next Steps:`);
  console.log(`========================================`);
  console.log(`1. Update frontend with contract address: ${contractAddress}`);
  console.log(`2. Verify contract on Etherscan: npm run verify`);
  console.log(`3. Interact with contract: npm run interact`);
  console.log(`4. Run simulation: npm run simulate`);
  console.log(`========================================\n`);

  return contractAddress;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nDeployment failed:");
    console.error(error);
    process.exit(1);
  });
