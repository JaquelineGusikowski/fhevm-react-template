/**
 * Next.js Home Page - FHEVM SDK Demo
 * Demonstrates encryption, decryption, and contract interaction
 */

import { useState } from 'react';
import { useFhevm, useEncrypt, useDecrypt, useAddress } from 'fhevm-sdk/react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { client, loading: clientLoading } = useFhevm();
  const { address, loading: addressLoading } = useAddress();
  const { encrypt, encrypting } = useEncrypt();
  const { decrypt, decrypting } = useDecrypt();

  const [value, setValue] = useState('');
  const [encryptedValue, setEncryptedValue] = useState(null);
  const [decryptedValue, setDecryptedValue] = useState(null);
  const [error, setError] = useState(null);

  const handleEncrypt = async () => {
    try {
      setError(null);
      const encrypted = await encrypt(parseInt(value), 'uint32');
      setEncryptedValue(encrypted);
      console.log('Encrypted value:', encrypted);
    } catch (err) {
      setError(err.message);
      console.error('Encryption error:', err);
    }
  };

  const handleDecrypt = async () => {
    try {
      setError(null);
      // This is a demo - you would normally get ciphertext from contract
      const contractAddress = '0x0000000000000000000000000000000000000000';
      const ciphertext = '0x...'; // Placeholder
      const decrypted = await decrypt(contractAddress, ciphertext);
      setDecryptedValue(decrypted.toString());
    } catch (err) {
      setError(err.message);
      console.error('Decryption error:', err);
    }
  };

  if (clientLoading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Loading FHEVM SDK...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>FHEVM SDK Demo</h1>

        <p className={styles.description}>
          Next.js application using the universal FHEVM SDK
        </p>

        <div className={styles.card}>
          <h2>Connection Status</h2>
          {addressLoading ? (
            <p>Loading address...</p>
          ) : address ? (
            <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
          ) : (
            <p>Not connected. Please connect your wallet.</p>
          )}
        </div>

        <div className={styles.card}>
          <h2>Encrypt a Value</h2>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter a number"
            className={styles.input}
          />
          <button
            onClick={handleEncrypt}
            disabled={!value || encrypting || !client}
            className={styles.button}
          >
            {encrypting ? 'Encrypting...' : 'Encrypt'}
          </button>
          {encryptedValue && (
            <p className={styles.result}>
              Encrypted! Length: {encryptedValue.length} bytes
            </p>
          )}
        </div>

        <div className={styles.card}>
          <h2>Decrypt a Value</h2>
          <button
            onClick={handleDecrypt}
            disabled={decrypting || !client}
            className={styles.button}
          >
            {decrypting ? 'Decrypting...' : 'Decrypt Demo Value'}
          </button>
          {decryptedValue && (
            <p className={styles.result}>Decrypted Value: {decryptedValue}</p>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            <p>Error: {error}</p>
          </div>
        )}

        <div className={styles.grid}>
          <div className={styles.infoCard}>
            <h3>Framework Agnostic</h3>
            <p>Works with React, Vue, Next.js, or vanilla JS</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Wagmi-like API</h3>
            <p>Familiar hooks-based interface for React developers</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Type Safe</h3>
            <p>Full TypeScript support with type definitions</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Easy Setup</h3>
            <p>Get started in less than 10 lines of code</p>
          </div>
        </div>
      </main>
    </div>
  );
}
