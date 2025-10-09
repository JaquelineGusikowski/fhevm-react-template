/**
 * Next.js App Component with FHEVM SDK Integration
 */

import { FhevmProvider } from 'fhevm-sdk/react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const fhevmConfig = {
    provider: typeof window !== 'undefined' ? window.ethereum : null,
    chainId: 11155111, // Sepolia testnet
    gatewayUrl: 'https://gateway.fhevm.io/11155111'
  };

  return (
    <FhevmProvider config={fhevmConfig}>
      <Component {...pageProps} />
    </FhevmProvider>
  );
}
