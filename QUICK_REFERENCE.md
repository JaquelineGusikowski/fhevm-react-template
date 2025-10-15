# FHEVM SDK - Quick Reference Guide

One-page reference for the most common operations.

## Installation

```bash
npm install fhevm-sdk ethers@^6
```

## Quick Start (5 Lines)

```javascript
import { createFhevmClient } from 'fhevm-sdk';

const client = await createFhevmClient({
  provider: window.ethereum,
  chainId: 11155111
});
```

## Core API

### Initialize Client

```javascript
const client = await createFhevmClient({
  provider: window.ethereum,      // Or RPC URL
  chainId: 11155111,              // Network ID
  gatewayUrl: '...',              // Optional
  aclAddress: '0x...'             // Optional
});
```

### Encrypt Values

```javascript
// Different types
const uint8 = await client.encrypt(42, 'uint8');
const uint32 = await client.encrypt(1000, 'uint32');
const uint64 = await client.encrypt(1000000n, 'uint64');
const bool = await client.encrypt(true, 'bool');
const addr = await client.encrypt('0x...', 'address');
```

### Decrypt Values

```javascript
// User decrypt (requires signature)
const value = await client.userDecrypt(
  '0xContractAddress',
  ciphertextHandle
);

// Public decrypt (via gateway)
const receipt = await client.publicDecrypt(
  contract,
  'functionName',
  [args]
);
```

### Contract Interaction

```javascript
// Create contract
const contract = client.createContract(
  '0xContractAddress',
  contractABI
);

// Call with encrypted value
const encrypted = await client.encrypt(42, 'uint32');
const tx = await contract.submitValue(encrypted);
await tx.wait();
```

## React Hooks

### Setup Provider

```javascript
import { FhevmProvider } from 'fhevm-sdk/react';

<FhevmProvider config={{
  provider: window.ethereum,
  chainId: 11155111
}}>
  <App />
</FhevmProvider>
```

### Available Hooks

```javascript
import {
  useFhevm,
  useEncrypt,
  useDecrypt,
  useContract,
  useContractRead,
  useContractWrite,
  useAddress
} from 'fhevm-sdk/react';
```

### Hook Usage

```javascript
// Get client
const { client, loading, error } = useFhevm();

// Encrypt
const { encrypt, encrypting } = useEncrypt();
await encrypt(42, 'uint32');

// Decrypt
const { decrypt, decrypting } = useDecrypt();
await decrypt(contractAddress, ciphertext);

// Contract
const { contract } = useContract(address, abi);

// Read contract
const { data, loading, refetch } = useContractRead({
  contract,
  functionName: 'getValue',
  args: [],
  watch: true  // Auto-refresh every 5s
});

// Write contract
const { write, writing, data } = useContractWrite({
  contract,
  functionName: 'setValue'
});
await write(encryptedValue);

// Get address
const { address } = useAddress();
```

## Common Patterns

### Encrypt and Submit

```javascript
const client = await createFhevmClient({ ... });
const encrypted = await client.encrypt(value, type);
const contract = client.createContract(address, abi);
const tx = await contract.submitValue(encrypted);
await tx.wait();
```

### Read Encrypted Value

```javascript
const ciphertext = await contract.getEncryptedValue();
const decrypted = await client.userDecrypt(
  contractAddress,
  ciphertext
);
console.log('Value:', decrypted);
```

### React Component

```javascript
function MyComponent() {
  const { encrypt } = useEncrypt();
  const { contract } = useContract(address, abi);
  const [value, setValue] = useState('');

  const handleSubmit = async () => {
    const encrypted = await encrypt(parseInt(value), 'uint32');
    const tx = await contract.submitValue(encrypted);
    await tx.wait();
    alert('Submitted!');
  };

  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleSubmit}>
        Submit Encrypted Value
      </button>
    </div>
  );
}
```

## Error Handling

```javascript
try {
  const encrypted = await client.encrypt(value, type);
} catch (error) {
  if (error.message.includes('not initialized')) {
    console.error('SDK not ready');
  } else {
    console.error('Encryption failed:', error);
  }
}
```

## TypeScript

```typescript
import { FhevmClient } from 'fhevm-sdk';

const client: FhevmClient = await createFhevmClient({ ... });
const encrypted: Uint8Array = await client.encrypt(42, 'uint32');
const decrypted: bigint = await client.userDecrypt(addr, ct);
```

## Supported Types

| Type | Description | Range |
|------|-------------|-------|
| `uint8` | 8-bit unsigned | 0 - 255 |
| `uint16` | 16-bit unsigned | 0 - 65,535 |
| `uint32` | 32-bit unsigned | 0 - 4,294,967,295 |
| `uint64` | 64-bit unsigned | 0 - 2^64-1 |
| `bool` | Boolean | true/false |
| `address` | Ethereum address | 0x... |

## Network Configuration

### Sepolia Testnet

```javascript
{
  provider: window.ethereum,
  chainId: 11155111,
  gatewayUrl: 'https://gateway.fhevm.io/11155111'
}
```

### Local Hardhat

```javascript
{
  provider: 'http://127.0.0.1:8545',
  chainId: 31337
}
```

## Useful Commands

```bash
# Install dependencies
npm install

# Build SDK
npm run build

# Run Next.js example
npm run dev:nextjs

# Run farmer subsidy
cd examples/farmer-subsidy
npm run compile
npm run deploy
npm run interact

# Lint & format
npm run lint
npm run format
```

## Quick Debugging

### Check Initialization

```javascript
console.log(client.isInitialized()); // true/false
console.log(client.getChainId());    // Network ID
```

### Check Connection

```javascript
const address = await client.getAddress();
console.log('Connected:', address);
```

### Test Encryption

```javascript
const encrypted = await client.encrypt(1, 'uint8');
console.log('Encrypted:', encrypted);
console.log('Length:', encrypted.length); // Should be > 0
```

## Environment Variables

```env
# .env file
PRIVATE_KEY=your_key_without_0x
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_api_key
```

## Import Paths

```javascript
// Core SDK
import { createFhevmClient, FhevmClient } from 'fhevm-sdk';

// React hooks
import { FhevmProvider, useFhevm } from 'fhevm-sdk/react';

// TypeScript types
import type { FhevmClient } from 'fhevm-sdk';
```

## Resources

- **Full Docs:** [README.md](README.md)
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **API Reference:** [packages/fhevm-sdk/README.md](packages/fhevm-sdk/README.md)
- **Examples:** [examples/](examples/)
- **Zama Docs:** https://docs.zama.ai/

## Common Issues

### MetaMask not detected

```javascript
if (!window.ethereum) {
  alert('Please install MetaMask');
}
```

### Wrong network

```javascript
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa36a7' }] // Sepolia
});
```

### Encryption fails

- Ensure SDK is initialized
- Check value type matches
- Verify value is within range

### Signature rejected

- User must approve EIP-712 signature
- Check MetaMask is unlocked
- Verify contract address is correct

---

**Need More Help?**

- Read [QUICKSTART.md](QUICKSTART.md) for detailed guide
- Check [examples/](examples/) for working code
- See [README.md](README.md) for full documentation
