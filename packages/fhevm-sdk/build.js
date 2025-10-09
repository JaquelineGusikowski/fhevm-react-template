/**
 * Simple build script for FHEVM SDK
 * Bundles the core SDK for CommonJS and ES modules
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy index.js as both CommonJS and ES module
const indexSource = fs.readFileSync(path.join(srcDir, 'index.js'), 'utf8');

// Write CommonJS version
fs.writeFileSync(
  path.join(distDir, 'index.js'),
  indexSource.replace(/export /g, 'module.exports.').replace(/import /g, 'const ')
);

// Write ES module version
fs.writeFileSync(path.join(distDir, 'index.esm.js'), indexSource);

// Create TypeScript definitions
const dts = `
export class FhevmClient {
  constructor();
  initialize(config: {
    provider: any;
    chainId: number;
    gatewayUrl?: string;
    aclAddress?: string;
  }): Promise<FhevmClient>;
  isInitialized(): boolean;
  getInstance(): any;
  getProvider(): any;
  getSigner(): any;
  encrypt(value: number | bigint, type?: string): Promise<Uint8Array>;
  userDecrypt(contractAddress: string, ciphertext: string): Promise<bigint>;
  publicDecrypt(contract: any, functionName: string, args?: any[]): Promise<any>;
  createContract(address: string, abi: any[]): any;
  getAddress(): Promise<string>;
  getChainId(): number;
}

export function createFhevmClient(config: any): Promise<FhevmClient>;
export function toInputProof(encryptedValue: Uint8Array): any;

declare const _default: {
  createFhevmClient: typeof createFhevmClient;
  FhevmClient: typeof FhevmClient;
  toInputProof: typeof toInputProof;
};
export default _default;
`;

fs.writeFileSync(path.join(distDir, 'index.d.ts'), dts);

console.log('✅ FHEVM SDK core built successfully');
