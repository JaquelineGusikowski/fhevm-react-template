require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: process.env.OPTIMIZER_ENABLED !== "false",
        runs: parseInt(process.env.OPTIMIZER_RUNS || "200"),
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      evmVersion: "paris",
      metadata: {
        bytecodeHash: "none"  // Reduce bytecode size
      },
      outputSelection: {
        "*": {
          "*": ["evm.bytecode", "evm.deployedBytecode", "abi"]
        }
      }
    }
  },

  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
      mining: {
        auto: true,
        interval: 0
      },
      gas: "auto",
      gasPrice: "auto"
    },

    localhost: {
      url: process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545",
      chainId: 31337,
      timeout: 120000,
      gas: "auto",
      gasPrice: "auto"
    },

    // Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 120000,
      gas: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : "auto",
      gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) * 1e9 : "auto"
    },

    // Ethereum mainnet (for future production deployment)
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "https://eth.llamarpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
      timeout: 120000,
      gas: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : "auto",
      gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) * 1e9 : "auto"
    }
  },

  // Etherscan verification configuration
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || ""
    }
  },

  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: process.env.CI ? "gas-report.txt" : undefined,
    noColors: process.env.CI ? true : false,
    showTimeSpent: true,
    showMethodSig: true,
    gasPrice: 21,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    onlyCalledMethods: true,
    excludeContracts: [],
    src: "./contracts"
  },

  // Path configurations
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  // Mocha test framework configuration
  mocha: {
    timeout: 120000,
    bail: false,
    allowUncaught: false,
    require: [],
    grep: process.env.TEST_GREP || undefined
  },

  // Warnings configuration
  warnings: {
    "*": {
      "unused-param": "warn",
      "unused-var": "warn"
    }
  }
};
