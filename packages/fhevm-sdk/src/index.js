/**
 * FHEVM SDK - Universal Framework-Agnostic SDK for Fully Homomorphic Encryption
 *
 * This SDK provides a simple, consistent API for building confidential dApps
 * Compatible with React, Vue, Next.js, Node.js, and any JavaScript environment
 *
 * @module fhevm-sdk
 */

import { createInstance as createFhevmInstance } from 'fhevmjs';
import { Contract, BrowserProvider, JsonRpcProvider } from 'ethers';

/**
 * FHEVM SDK Client - Main entry point for the SDK
 */
export class FhevmClient {
  constructor() {
    this.instance = null;
    this.provider = null;
    this.signer = null;
    this.chainId = null;
    this.initialized = false;
  }

  /**
   * Initialize the FHEVM instance
   * @param {Object} config - Configuration object
   * @param {string|Object} config.provider - Ethereum provider (window.ethereum, RPC URL, or ethers provider)
   * @param {number} config.chainId - Chain ID (e.g., 11155111 for Sepolia)
   * @param {string} config.gatewayUrl - Gateway URL for FHE operations
   * @param {string} config.aclAddress - ACL contract address
   * @returns {Promise<FhevmClient>} Initialized client instance
   */
  async initialize({ provider, chainId, gatewayUrl, aclAddress }) {
    try {
      // Setup provider
      if (typeof provider === 'string') {
        this.provider = new JsonRpcProvider(provider);
      } else if (provider.request) {
        this.provider = new BrowserProvider(provider);
      } else {
        this.provider = provider;
      }

      // Get signer
      this.signer = await this.provider.getSigner();
      this.chainId = chainId;

      // Create FHEVM instance
      this.instance = await createFhevmInstance({
        chainId,
        network: this.provider,
        gatewayUrl: gatewayUrl || `https://gateway.fhevm.io/${chainId}`,
        aclAddress: aclAddress || '0x0000000000000000000000000000000000000000'
      });

      this.initialized = true;
      return this;
    } catch (error) {
      console.error('Failed to initialize FHEVM:', error);
      throw error;
    }
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get the FHEVM instance
   */
  getInstance() {
    if (!this.initialized) {
      throw new Error('FHEVM SDK not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Get the provider
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Get the signer
   */
  getSigner() {
    return this.signer;
  }

  /**
   * Encrypt a value for use in contract calls
   * @param {number|bigint} value - Value to encrypt
   * @param {string} type - Data type (uint8, uint16, uint32, uint64, address, bool)
   * @returns {Promise<Uint8Array>} Encrypted value
   */
  async encrypt(value, type = 'uint32') {
    const instance = this.getInstance();

    switch (type) {
      case 'uint8':
        return instance.encrypt8(value);
      case 'uint16':
        return instance.encrypt16(value);
      case 'uint32':
        return instance.encrypt32(value);
      case 'uint64':
        return instance.encrypt64(value);
      case 'address':
        return instance.encryptAddress(value);
      case 'bool':
        return instance.encryptBool(value);
      default:
        throw new Error(`Unsupported encryption type: ${type}`);
    }
  }

  /**
   * Request decryption of an encrypted value (user decrypt with EIP-712 signature)
   * @param {string} contractAddress - Contract address
   * @param {string} ciphertext - Encrypted value handle
   * @returns {Promise<bigint>} Decrypted value
   */
  async userDecrypt(contractAddress, ciphertext) {
    const instance = this.getInstance();
    const signer = this.getSigner();

    const { signature, publicKey } = await instance.generateToken({
      verifyingContract: contractAddress
    });

    // Sign EIP-712 typed data
    const eip712 = instance.createEIP712(ciphertext, publicKey);
    const signedData = await signer.signTypedData(
      eip712.domain,
      eip712.types,
      eip712.message
    );

    // Decrypt with signature
    const decrypted = await instance.decrypt(ciphertext, signedData);
    return decrypted;
  }

  /**
   * Request public decryption (via gateway callback)
   * @param {Object} contract - Ethers contract instance
   * @param {string} functionName - Function name to call
   * @param {Array} args - Function arguments
   * @returns {Promise<any>} Transaction result
   */
  async publicDecrypt(contract, functionName, args = []) {
    const tx = await contract[functionName](...args);
    const receipt = await tx.wait();
    return receipt;
  }

  /**
   * Create a contract instance with FHEVM support
   * @param {string} address - Contract address
   * @param {Array} abi - Contract ABI
   * @returns {Contract} Ethers contract instance
   */
  createContract(address, abi) {
    if (!this.signer) {
      throw new Error('Signer not available. Initialize provider first.');
    }
    return new Contract(address, abi, this.signer);
  }

  /**
   * Get user's Ethereum address
   * @returns {Promise<string>} User address
   */
  async getAddress() {
    const signer = this.getSigner();
    return await signer.getAddress();
  }

  /**
   * Get network chain ID
   * @returns {number} Chain ID
   */
  getChainId() {
    return this.chainId;
  }
}

/**
 * Create a new FHEVM client instance
 * @param {Object} config - Configuration object
 * @returns {Promise<FhevmClient>} Initialized client
 */
export async function createFhevmClient(config) {
  const client = new FhevmClient();
  await client.initialize(config);
  return client;
}

/**
 * Utility: Convert encrypted input to contract parameter format
 * @param {Uint8Array} encryptedValue - Encrypted value from encrypt()
 * @returns {Object} Input proof for contract
 */
export function toInputProof(encryptedValue) {
  return {
    data: encryptedValue,
    signature: '0x' // Signature will be added by contract
  };
}

/**
 * Export default instance creator
 */
export default {
  createFhevmClient,
  FhevmClient,
  toInputProof
};
