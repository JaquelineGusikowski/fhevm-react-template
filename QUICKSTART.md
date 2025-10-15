# Quick Start Guide

Get started with FHEVM SDK in less than 5 minutes!

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask or another Web3 wallet

## Installation

### Option 1: Clone the Repository

```bash
git clone https://github.com/your-repo/fhevm-react-template.git
cd fhevm-react-template
npm install
```

### Option 2: Use the SDK in Your Project

```bash
npm install fhevm-sdk ethers@^6
```

## Your First Encrypted Transaction

### Step 1: Initialize the SDK (< 10 lines!)

```javascript
import { createFhevmClient } from 'fhevm-sdk';

const client = await createFhevmClient({
  provider: window.ethereum,
  chainId: 11155111 // Sepolia testnet
});

console.log('SDK initialized!');
```

### Step 2: Encrypt a Value

```javascript
// Encrypt a number
const encrypted = await client.encrypt(42, 'uint32');
console.log('Encrypted:', encrypted);

// Different types
const encryptedBool = await client.encrypt(true, 'bool');
const encryptedBigNum = await client.encrypt(1000000n, 'uint64');
```

### Step 3: Use with Smart Contract

```javascript
// Create contract instance
const contract = client.createContract(
  '0xYourContractAddress',
  contractABI
);

// Send encrypted value to contract
const tx = await contract.submitEncryptedValue(encrypted);
await tx.wait();

console.log('Transaction confirmed!');
```

### Step 4: Decrypt a Value

```javascript
// Decrypt with user signature (EIP-712)
const decrypted = await client.userDecrypt(
  '0xYourContractAddress',
  ciphertextHandle
);

console.log('Decrypted value:', decrypted);
```

## React Quick Start

### Step 1: Wrap Your App

```javascript
// pages/_app.js or App.js
import { FhevmProvider } from 'fhevm-sdk/react';

export default function App({ Component, pageProps }) {
  return (
    <FhevmProvider config={{
      provider: window.ethereum,
      chainId: 11155111
    }}>
      <Component {...pageProps} />
    </FhevmProvider>
  );
}
```

### Step 2: Use Hooks in Components

```javascript
import { useEncrypt, useAddress } from 'fhevm-sdk/react';

function MyComponent() {
  const { address } = useAddress();
  const { encrypt, encrypting } = useEncrypt();

  const handleSubmit = async () => {
    const encrypted = await encrypt(42, 'uint32');
    // Use encrypted value...
  };

  return (
    <div>
      <p>Connected: {address}</p>
      <button onClick={handleSubmit} disabled={encrypting}>
        Encrypt Value
      </button>
    </div>
  );
}
```

## Run Examples

### Next.js Example

```bash
# From project root
npm install
npm run dev:nextjs

# Open http://localhost:3000
```

### Farmer Subsidy Example

```bash
cd examples/farmer-subsidy

# Setup environment
cp ../../.env.example .env
# Edit .env with your keys

# Compile and deploy
npm run compile
npm run deploy

# Interact with contract
npm run interact
```

## Common Use Cases

### Use Case 1: Private Voting

```javascript
const client = await createFhevmClient({ ... });

// Encrypt vote (0 or 1)
const encryptedVote = await client.encrypt(1, 'uint8');

// Submit to contract
await votingContract.castVote(encryptedVote);
```

### Use Case 2: Confidential Balance

```javascript
// Encrypt balance
const encryptedBalance = await client.encrypt(1000n, 'uint64');
await tokenContract.setBalance(encryptedBalance);

// Decrypt your balance
const balance = await client.userDecrypt(
  tokenContract.address,
  balanceHandle
);
```

### Use Case 3: Private Auction Bid

```javascript
// Encrypt bid amount
const encryptedBid = await client.encrypt(500n, 'uint64');
await auctionContract.placeBid(encryptedBid);

// Contract compares bids without revealing amounts
```

## Troubleshooting

### SDK not initializing

**Problem:** `Failed to initialize FHEVM`

**Solution:**
- Check that MetaMask is installed
- Verify you're on the correct network
- Ensure wallet is unlocked

### Encryption fails

**Problem:** `Encryption error`

**Solution:**
- Verify SDK is initialized first
- Check value type matches (uint8, uint32, etc.)
- Ensure value is within type range

### Decryption fails

**Problem:** `User denied signature`

**Solution:**
- User must approve EIP-712 signature
- Verify contract address is correct
- Check user has permission to decrypt

## Next Steps

1. **Read the Docs**
   - [SDK API Reference](packages/fhevm-sdk/README.md)
   - [Architecture Guide](ARCHITECTURE.md)

2. **Explore Examples**
   - [Next.js App](examples/nextjs/)
   - [Farmer Subsidy](examples/farmer-subsidy/)

3. **Build Your dApp**
   - Use the SDK in your project
   - Follow Zama's best practices
   - Join the community

## Resources

- [Zama FHEVM Docs](https://docs.zama.ai/)
- [fhevmjs GitHub](https://github.com/zama-ai/fhevmjs)
- [Hardhat Documentation](https://hardhat.org/)
- [Ethers.js Docs](https://docs.ethers.org/)

## Support

- GitHub Issues: [Report bugs](https://github.com/your-repo/issues)
- Discord: Join Zama community
- Documentation: [Full docs](README.md)

---

**Congratulations!** You're now ready to build privacy-preserving dApps with FHEVM SDK.
