/**
 * Build script for React hooks
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy react.js
const reactSource = fs.readFileSync(path.join(srcDir, 'react.js'), 'utf8');

// Write CommonJS version
fs.writeFileSync(
  path.join(distDir, 'react.js'),
  reactSource.replace(/export /g, 'module.exports.').replace(/import /g, 'const ')
);

// Write ES module version
fs.writeFileSync(path.join(distDir, 'react.esm.js'), reactSource);

// Create TypeScript definitions for React hooks
const reactDts = `
import { ReactNode } from 'react';
import { FhevmClient } from './index';

export interface FhevmProviderProps {
  config: any;
  children: ReactNode;
}

export function FhevmProvider(props: FhevmProviderProps): JSX.Element;

export function useFhevm(): {
  client: FhevmClient | null;
  loading: boolean;
  error: Error | null;
};

export function useEncrypt(): {
  encrypt: (value: number | bigint, type?: string) => Promise<Uint8Array>;
  encrypting: boolean;
  error: Error | null;
};

export function useDecrypt(): {
  decrypt: (contractAddress: string, ciphertext: string) => Promise<bigint>;
  decrypting: boolean;
  error: Error | null;
};

export function useContract(address: string, abi: any[]): {
  contract: any;
  loading: boolean;
  error: Error | null;
};

export function useContractRead(config: {
  contract: any;
  functionName: string;
  args?: any[];
  watch?: boolean;
}): {
  data: any;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useContractWrite(config: {
  contract: any;
  functionName: string;
}): {
  write: (...args: any[]) => Promise<any>;
  writing: boolean;
  error: Error | null;
  data: any;
};

export function useAddress(): {
  address: string | null;
  loading: boolean;
  error: Error | null;
};
`;

fs.writeFileSync(path.join(distDir, 'react.d.ts'), reactDts);

console.log('✅ FHEVM SDK React hooks built successfully');
