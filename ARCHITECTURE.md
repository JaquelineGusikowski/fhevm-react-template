# Architecture Documentation

## Overview

This project implements a universal FHEVM SDK with a modular, framework-agnostic architecture.

## System Design

```
┌─────────────────────────────────────────────────────┐
│                 Application Layer                    │
│  (React App, Next.js, Vue, Node.js, Vanilla JS)     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Framework Adapters                      │
│  • React Hooks (useFhevm, useEncrypt, etc.)         │
│  • Vue Composables (future)                         │
│  • Angular Services (future)                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│               FHEVM SDK Core                        │
│  • FhevmClient class                                │
│  • Encryption/Decryption logic                      │
│  • Provider management                              │
│  • Contract interaction utilities                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│            External Dependencies                     │
│  • fhevmjs (Zama's FHE library)                     │
│  • ethers.js (Ethereum interaction)                 │
│  • Provider (MetaMask, WalletConnect, etc.)         │
└─────────────────────────────────────────────────────┘
```

## Package Structure

### packages/fhevm-sdk

The core SDK package with:

- **src/index.js** - Framework-agnostic core
  - `FhevmClient` class
  - `createFhevmClient()` factory
  - Encryption utilities
  - Decryption helpers

- **src/react.js** - React-specific hooks
  - `FhevmProvider` context provider
  - `useFhevm()` - Access client
  - `useEncrypt()` - Encryption hook
  - `useDecrypt()` - Decryption hook
  - `useContract()` - Contract creation
  - `useContractRead()` - Contract reads
  - `useContractWrite()` - Contract writes

- **dist/** - Built output
  - CommonJS (`index.js`, `react.js`)
  - ES Modules (`index.esm.js`, `react.esm.js`)
  - TypeScript definitions (`*.d.ts`)

## Key Design Decisions

### 1. Framework-Agnostic Core

The core SDK (`src/index.js`) has no framework dependencies. This allows:

```javascript
// Works in Node.js
const { createFhevmClient } = require('fhevm-sdk');

// Works in browser
import { createFhevmClient } from 'fhevm-sdk';

// Works in React
import { useFhevm } from 'fhevm-sdk/react';
```

### 2. Adapter Pattern

Framework-specific features are in separate files:
- `react.js` - React hooks
- `vue.js` (future) - Vue composables
- `angular.js` (future) - Angular services

This keeps the core small and allows tree-shaking.

### 3. Wagmi-Inspired API

Following wagmi's patterns for familiarity:

```javascript
// Wagmi
const { data } = useContractRead({ contract, functionName });
const { write } = useContractWrite({ contract, functionName });

// FHEVM SDK (same pattern)
const { data } = useContractRead({ contract, functionName });
const { write } = useContractWrite({ contract, functionName });
```

### 4. Monorepo Structure

Using npm workspaces for:
- Single `npm install` at root
- Shared dependencies
- Easy cross-package development
- Example projects co-located

### 5. Build System

Simple Node.js scripts instead of complex bundlers:
- `build.js` - Transpile core to CJS/ESM
- `build-react.js` - Build React hooks
- No webpack/rollup needed for SDK

## Data Flow

### Initialization Flow

```
User Code
    │
    ▼
createFhevmClient(config)
    │
    ├─→ Setup provider (MetaMask, RPC, etc.)
    ├─→ Get signer from provider
    ├─→ Create fhevmjs instance
    │   └─→ Configure gateway URL
    │   └─→ Set ACL address
    └─→ Return initialized FhevmClient
```

### Encryption Flow

```
User Input (plaintext value)
    │
    ▼
client.encrypt(value, type)
    │
    ├─→ Validate type (uint8/16/32/64, address, bool)
    ├─→ Call fhevmjs encrypt method
    │   └─→ Generate encrypted value (Uint8Array)
    └─→ Return encrypted value
        │
        ▼
    Send to smart contract
```

### Decryption Flow (User)

```
Contract returns ciphertext handle
    │
    ▼
client.userDecrypt(contractAddress, ciphertext)
    │
    ├─→ Generate EIP-712 token
    │   └─→ Create typed data structure
    │   └─→ Request user signature (MetaMask popup)
    ├─→ Sign typed data with user's private key
    ├─→ Send signature to fhevmjs
    │   └─→ Call gateway for decryption
    └─→ Return decrypted value (bigint)
```

### Decryption Flow (Public)

```
Request public decryption
    │
    ▼
client.publicDecrypt(contract, functionName, args)
    │
    ├─→ Call contract function
    │   └─→ Contract requests gateway callback
    ├─→ Gateway verifies and decrypts
    ├─→ Gateway calls back to contract
    │   └─→ processDecryptionCallback()
    └─→ Return transaction receipt
```

## React Hooks Architecture

### Context Pattern

```javascript
FhevmProvider (Top level)
    │
    ├─→ Creates FhevmClient
    ├─→ Manages loading state
    ├─→ Handles errors
    └─→ Provides via Context
        │
        ▼
    FhevmContext
        │
        └─→ Consumed by hooks
            ├─→ useFhevm()
            ├─→ useEncrypt()
            ├─→ useDecrypt()
            └─→ useContract()
```

### Hook Dependencies

```
useFhevm()
    │
    ├─→ useEncrypt()
    │   └─→ Needs client for encrypt()
    │
    ├─→ useDecrypt()
    │   └─→ Needs client for userDecrypt()
    │
    ├─→ useContract()
    │   └─→ Needs client for createContract()
    │
    ├─→ useContractRead()
    │   └─→ Needs contract instance
    │
    └─→ useContractWrite()
        └─→ Needs contract instance
```

## Error Handling

### Levels of Error Handling

1. **SDK Core** - Throws errors for invalid input
2. **React Hooks** - Catch and expose via error state
3. **Application** - Display to user

Example:

```javascript
// SDK throws
if (!this.initialized) {
  throw new Error('SDK not initialized');
}

// Hook catches
try {
  await encrypt(value);
} catch (err) {
  setError(err);
}

// App displays
{error && <div>Error: {error.message}</div>}
```

## Security Considerations

### 1. Private Key Protection

- User's private key never leaves MetaMask
- EIP-712 signatures generated in wallet
- No key material in SDK

### 2. Encrypted Data

- All sensitive data encrypted before leaving client
- Ciphertext stored on-chain
- Decryption requires signature

### 3. Access Control

- Smart contracts enforce permissions
- ACL contract manages access rights
- Gateway validates signatures

## Performance Optimizations

### 1. Lazy Initialization

```javascript
// Provider only created when needed
const { client } = useFhevm();
```

### 2. Memoization

React hooks use `useCallback` and `useMemo` to prevent unnecessary re-renders.

### 3. Tree Shaking

Modular exports allow bundlers to eliminate unused code:

```javascript
// Only imports core
import { createFhevmClient } from 'fhevm-sdk';

// Only imports React hooks
import { useFhevm } from 'fhevm-sdk/react';
```

## Testing Strategy

### Unit Tests

- Test core SDK functions in isolation
- Mock fhevmjs and ethers dependencies
- Test error conditions

### Integration Tests

- Test with local Hardhat network
- Deploy test contracts
- Verify encryption/decryption flow

### Example Tests

- Ensure examples work end-to-end
- Test in different frameworks
- Verify documentation accuracy

## Future Enhancements

### Additional Adapters

- Vue composables (`fhevm-sdk/vue`)
- Angular services (`fhevm-sdk/angular`)
- Svelte stores (`fhevm-sdk/svelte`)

### Advanced Features

- Batch encryption
- Automatic retry logic
- Cache encrypted values
- Offline signing support

### Developer Experience

- CLI tool for scaffolding
- Browser extension
- Visual debugging tool
- Playground environment

## Conclusion

The architecture prioritizes:

1. **Simplicity** - Easy to understand and use
2. **Flexibility** - Works with any framework
3. **Modularity** - Use only what you need
4. **Familiarity** - Wagmi-like patterns
5. **Maintainability** - Clear separation of concerns

This design makes the SDK production-ready while remaining accessible to developers of all skill levels.
