/**
 * FHEVM SDK - React Hooks & Components
 *
 * Provides wagmi-like hooks and utilities for React applications
 *
 * @module fhevm-sdk/react
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FhevmClient } from './index.js';

/**
 * FHEVM Context for React
 */
const FhevmContext = createContext(null);

/**
 * FHEVM Provider Component
 * Wrap your app with this to enable FHEVM hooks
 *
 * @example
 * <FhevmProvider config={{ chainId: 11155111, provider: window.ethereum }}>
 *   <App />
 * </FhevmProvider>
 */
export function FhevmProvider({ config, children }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setLoading(true);
        const fhevmClient = new FhevmClient();
        await fhevmClient.initialize(config);

        if (mounted) {
          setClient(fhevmClient);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          console.error('Failed to initialize FHEVM:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [config]);

  return (
    <FhevmContext.Provider value={{ client, loading, error }}>
      {children}
    </FhevmContext.Provider>
  );
}

/**
 * Hook to access FHEVM client
 * @returns {Object} { client, loading, error }
 */
export function useFhevm() {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error('useFhevm must be used within FhevmProvider');
  }
  return context;
}

/**
 * Hook to encrypt values
 * @returns {Object} { encrypt, encrypting, error }
 */
export function useEncrypt() {
  const { client } = useFhevm();
  const [encrypting, setEncrypting] = useState(false);
  const [error, setError] = useState(null);

  const encrypt = useCallback(
    async (value, type = 'uint32') => {
      if (!client) {
        throw new Error('FHEVM client not initialized');
      }

      try {
        setEncrypting(true);
        setError(null);
        const encrypted = await client.encrypt(value, type);
        return encrypted;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setEncrypting(false);
      }
    },
    [client]
  );

  return { encrypt, encrypting, error };
}

/**
 * Hook to decrypt values with user signature (EIP-712)
 * @returns {Object} { decrypt, decrypting, error }
 */
export function useDecrypt() {
  const { client } = useFhevm();
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState(null);

  const decrypt = useCallback(
    async (contractAddress, ciphertext) => {
      if (!client) {
        throw new Error('FHEVM client not initialized');
      }

      try {
        setDecrypting(true);
        setError(null);
        const decrypted = await client.userDecrypt(contractAddress, ciphertext);
        return decrypted;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setDecrypting(false);
      }
    },
    [client]
  );

  return { decrypt, decrypting, error };
}

/**
 * Hook to create and interact with FHEVM contracts
 * @param {string} address - Contract address
 * @param {Array} abi - Contract ABI
 * @returns {Object} { contract, loading, error }
 */
export function useContract(address, abi) {
  const { client } = useFhevm();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!client || !address || !abi) {
      setLoading(false);
      return;
    }

    try {
      const contractInstance = client.createContract(address, abi);
      setContract(contractInstance);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Failed to create contract:', err);
    } finally {
      setLoading(false);
    }
  }, [client, address, abi]);

  return { contract, loading, error };
}

/**
 * Hook to read from FHEVM contract
 * @param {Object} config - { contract, functionName, args, watch }
 * @returns {Object} { data, loading, error, refetch }
 */
export function useContractRead(config) {
  const { contract, functionName, args = [], watch = false } = config;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!contract || !functionName) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await contract[functionName](...args);
      setData(result);
    } catch (err) {
      setError(err);
      console.error('Contract read error:', err);
    } finally {
      setLoading(false);
    }
  }, [contract, functionName, args]);

  useEffect(() => {
    fetchData();

    if (watch) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchData, watch]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to write to FHEVM contract
 * @param {Object} config - { contract, functionName }
 * @returns {Object} { write, writing, error, data }
 */
export function useContractWrite(config) {
  const { contract, functionName } = config;
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const write = useCallback(
    async (...args) => {
      if (!contract || !functionName) {
        throw new Error('Contract or function name not provided');
      }

      try {
        setWriting(true);
        setError(null);
        const tx = await contract[functionName](...args);
        const receipt = await tx.wait();
        setData(receipt);
        return receipt;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setWriting(false);
      }
    },
    [contract, functionName]
  );

  return { write, writing, error, data };
}

/**
 * Hook to get current user address
 * @returns {Object} { address, loading, error }
 */
export function useAddress() {
  const { client } = useFhevm();
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function getAddr() {
      if (!client) {
        setLoading(false);
        return;
      }

      try {
        const addr = await client.getAddress();
        if (mounted) {
          setAddress(addr);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getAddr();

    return () => {
      mounted = false;
    };
  }, [client]);

  return { address, loading, error };
}

/**
 * Export all hooks and components
 */
export default {
  FhevmProvider,
  useFhevm,
  useEncrypt,
  useDecrypt,
  useContract,
  useContractRead,
  useContractWrite,
  useAddress
};
