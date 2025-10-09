# Farmer Subsidy Example

Privacy-preserving agricultural subsidy distribution system using FHEVM SDK.

## Overview

This example demonstrates a real-world use case of the FHEVM SDK: a confidential subsidy distribution platform where farmers can register with encrypted data and receive subsidies without revealing sensitive information.

## Features

- **Encrypted Registration** - Farm size, crop yield, and income encrypted on-chain
- **Privacy-Preserving Calculations** - Subsidy amounts calculated on encrypted data
- **Zero-Knowledge Eligibility** - Income threshold checks without data exposure
- **FHEVM SDK Integration** - Uses the universal SDK for all FHE operations

## Smart Contract

The `FarmerSubsidy.sol` contract demonstrates:

```solidity
// Encrypted data types
euint32 encryptedFarmSize;
euint32 encryptedCropYield;
euint64 encryptedIncomeLevel;
euint64 encryptedSubsidy;

// FHE operations
ebool isEligible = FHE.lt(income, threshold);
euint64 totalSubsidy = FHE.add(baseSubsidy, bonuses);
euint64 finalAmount = FHE.select(isEligible, total, zero);
```

## Getting Started

### Compile Contract

```bash
npm run compile
```

### Deploy to Sepolia

```bash
# Set up .env file first
cp ../../.env.example .env

# Deploy
npm run deploy
```

### Interact with Contract

```bash
npm run interact
```

## Integration with FHEVM SDK

This example shows how to use the SDK with smart contracts:

```javascript
import { createFhevmClient } from 'fhevm-sdk';

// Initialize
const client = await createFhevmClient({
  provider: window.ethereum,
  chainId: 11155111
});

// Encrypt farmer data
const encryptedFarmSize = await client.encrypt(100, 'uint32');
const encryptedIncome = await client.encrypt(50000, 'uint64');

// Register farmer
const contract = client.createContract(address, abi);
await contract.registerFarmer(
  encryptedFarmSize,
  encryptedCropYield,
  encryptedIncome
);

// Decrypt subsidy (with user signature)
const subsidy = await client.userDecrypt(
  contractAddress,
  ciphertextHandle
);
```

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Zama FHEVM Docs](https://docs.zama.ai/)
- [Original Project](https://github.com/JaquelineGusikowski/FHEFarmerSubsidy)
