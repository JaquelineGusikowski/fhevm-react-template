# FHEVM SDK

> Universal framework-agnostic SDK for building confidential dApps with Fully Homomorphic Encryption (FHE)

## Features

- **Framework Agnostic** - Works with React, Vue, Next.js, Node.js, or vanilla JavaScript
- **Wagmi-like API** - Familiar hooks-based interface for React developers
- **Type Safe** - Full TypeScript support
- **Modular** - Use only what you need
- **Easy Setup** - Get started in less than 10 lines of code

## Installation

```bash
npm install fhevm-sdk ethers@^6
```

## Quick Start

### Vanilla JavaScript / Node.js

```javascript
import { createFhevmClient } from 'fhevm-sdk';

// Initialize client
const client = await createFhevmClient({
  provider: window.ethereum, // or RPC URL
  chainId: 11155111, // Sepolia
  gatewayUrl: 'https://gateway.fhevm.io/11155111'
});

// Encrypt a value
const encrypted = await client.encrypt(42, 'uint32');

// Create contract instance
const contract = client.createContract(contractAddress, contractABI);

// Call contract with encrypted input
const tx = await contract.myFunction(encrypted);
await tx.wait();

// Decrypt with user signature (EIP-712)
const decrypted = await client.userDecrypt(contractAddress, ciphertext);
```

### React (with Hooks)

```javascript
import { FhevmProvider, useFhevm, useEncrypt, useContract } from 'fhevm-sdk/react';

// 1. Wrap your app
function App() {
  return (
    <FhevmProvider config={{
      provider: window.ethereum,
      chainId: 11155111
    }}>
      <MyComponent />
    </FhevmProvider>
  );
}

// 2. Use hooks in components
function MyComponent() {
  const { client, loading } = useFhevm();
  const { encrypt, encrypting } = useEncrypt();
  const { contract } = useContract(contractAddress, contractABI);

  const handleSubmit = async () => {
    const encrypted = await encrypt(42, 'uint32');
    const tx = await contract.myFunction(encrypted);
    await tx.wait();
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Next.js

```javascript
// pages/_app.js
import { FhevmProvider } from 'fhevm-sdk/react';

export default function App({ Component, pageProps }) {
  return (
    <FhevmProvider config={{
      provider: typeof window !== 'undefined' ? window.ethereum : null,
      chainId: 11155111
    }}>
      <Component {...pageProps} />
    </FhevmProvider>
  );
}
```

## API Reference

### Core API

#### `createFhevmClient(config)`

Create and initialize an FHEVM client.

**Parameters:**
- `config.provider` - Ethereum provider (window.ethereum, RPC URL, or ethers provider)
- `config.chainId` - Chain ID (e.g., 11155111 for Sepolia)
- `config.gatewayUrl` - (Optional) Gateway URL for FHE operations
- `config.aclAddress` - (Optional) ACL contract address

**Returns:** `Promise<FhevmClient>`

#### `client.encrypt(value, type)`

Encrypt a value for use in contract calls.

**Parameters:**
- `value` - Value to encrypt (number or bigint)
- `type` - Data type: `'uint8'`, `'uint16'`, `'uint32'`, `'uint64'`, `'address'`, `'bool'`

**Returns:** `Promise<Uint8Array>`

#### `client.userDecrypt(contractAddress, ciphertext)`

Decrypt an encrypted value using EIP-712 signature.

**Parameters:**
- `contractAddress` - Contract address
- `ciphertext` - Encrypted value handle

**Returns:** `Promise<bigint>`

### React Hooks

#### `useFhevm()`

Access the FHEVM client instance.

**Returns:**
```typescript
{
  client: FhevmClient | null;
  loading: boolean;
  error: Error | null;
}
```

#### `useEncrypt()`

Hook for encrypting values.

**Returns:**
```typescript
{
  encrypt: (value: number | bigint, type?: string) => Promise<Uint8Array>;
  encrypting: boolean;
  error: Error | null;
}
```

#### `useDecrypt()`

Hook for decrypting values with user signature.

**Returns:**
```typescript
{
  decrypt: (contractAddress: string, ciphertext: string) => Promise<bigint>;
  decrypting: boolean;
  error: Error | null;
}
```

#### `useContract(address, abi)`

Create a contract instance.

**Returns:**
```typescript
{
  contract: Contract;
  loading: boolean;
  error: Error | null;
}
```

#### `useContractRead(config)`

Read from a contract.

**Parameters:**
```typescript
{
  contract: Contract;
  functionName: string;
  args?: any[];
  watch?: boolean; // Auto-refresh every 5s
}
```

#### `useContractWrite(config)`

Write to a contract.

**Parameters:**
```typescript
{
  contract: Contract;
  functionName: string;
}
```

**Returns:**
```typescript
{
  write: (...args: any[]) => Promise<any>;
  writing: boolean;
  error: Error | null;
  data: any;
}
```

## Examples

See the `/examples` directory for complete working examples:
- `examples/nextjs` - Next.js application
- `examples/farmer-subsidy` - Privacy-preserving subsidy system

## License

MIT
