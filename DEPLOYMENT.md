# Deployment Guide

Complete guide for deploying FHEVM SDK applications to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Building the SDK](#building-the-sdk)
- [Deploying Smart Contracts](#deploying-smart-contracts)
- [Deploying Frontend](#deploying-frontend)
- [Production Checklist](#production-checklist)
- [Monitoring](#monitoring)

## Prerequisites

### Required Tools

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- MetaMask or Web3 wallet

### Required Accounts

- Ethereum wallet with private key
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))
- Etherscan API key (for verification)
- (Optional) Alchemy/Infura API key

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/fhevm-react-template.git
cd fhevm-react-template
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required: Your wallet private key (WITHOUT 0x prefix)
PRIVATE_KEY=your_private_key_here

# Required: RPC endpoint
SEPOLIA_RPC_URL=https://rpc.sepolia.org
# Or use Alchemy/Infura
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Required: For contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Gas settings
GAS_LIMIT=5000000
GAS_PRICE=20

# Optional: For gas reports
COINMARKETCAP_API_KEY=your_api_key
REPORT_GAS=true
```

### 4. Security Check

**IMPORTANT:** Never commit `.env` file!

```bash
# Verify .env is in .gitignore
grep -q "^\.env$" .gitignore && echo "✓ Safe" || echo "⚠ Add .env to .gitignore!"
```

## Building the SDK

### Build Core SDK

```bash
npm run build:sdk
```

This creates:
- `packages/fhevm-sdk/dist/index.js` (CommonJS)
- `packages/fhevm-sdk/dist/index.esm.js` (ES Module)
- `packages/fhevm-sdk/dist/react.js` (React hooks)
- TypeScript definitions

### Verify Build

```bash
ls -la packages/fhevm-sdk/dist/
```

You should see:
```
index.js
index.esm.js
index.d.ts
react.js
react.esm.js
react.d.ts
```

## Deploying Smart Contracts

### Farmer Subsidy Example

#### 1. Compile Contracts

```bash
cd examples/farmer-subsidy
npm run compile
```

Verify compilation:
```bash
ls -la artifacts/contracts/
```

#### 2. Deploy to Sepolia

```bash
npm run deploy
```

Output:
```
========================================
Deploying Agricultural Subsidy Platform
Network: sepolia
========================================

Deploying contracts with account: 0x...
Account balance: 0.5 ETH

Initial subsidy budget: 10 ETH

Deploying FarmerSubsidy contract...

========================================
Deployment Successful!
========================================
Contract Address: 0xYourContractAddress
Initial Budget: 10 ETH
Subsidy Authority: 0x...
Network: sepolia
ChainId: 11155111
```

**Save the contract address!**

#### 3. Verify Contract on Etherscan

```bash
npm run verify
```

Or manually:
```bash
npx hardhat verify --network sepolia 0xYourContractAddress "10000000000000000000"
```

#### 4. Test Deployment

```bash
npm run interact
```

This will:
1. Check contract connection
2. Start a distribution period
3. Register a test farmer
4. Calculate subsidies

### Custom Contract Deployment

If deploying your own contract:

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("YourContract");
  const contract = await Contract.deploy(/* constructor args */);
  await contract.waitForDeployment();

  console.log("Deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

## Deploying Frontend

### Next.js Example

#### 1. Build Application

```bash
cd examples/nextjs
npm run build
```

#### 2. Test Production Build

```bash
npm start
# Visit http://localhost:3000
```

#### 3. Deploy to Vercel

##### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow prompts:
- Link to Vercel account
- Configure project settings
- Deploy

##### Option B: GitHub Integration

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework:** Next.js
   - **Root Directory:** `examples/nextjs`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

6. Add environment variables:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

7. Deploy

#### 4. Configure Custom Domain (Optional)

In Vercel dashboard:
- Go to project settings
- Click "Domains"
- Add your domain
- Update DNS records

### Alternative Hosting Options

#### Netlify

```bash
npm run build
netlify deploy --prod
```

#### AWS S3 + CloudFront

```bash
npm run build
aws s3 sync out/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### GitHub Pages

```bash
npm run build
npm run export
# Push 'out' directory to gh-pages branch
```

## Production Checklist

### Smart Contracts

- [ ] Contracts compiled without warnings
- [ ] All tests passing
- [ ] Gas optimizations applied
- [ ] Security audit completed (if budget allows)
- [ ] Contract verified on Etherscan
- [ ] Access controls configured
- [ ] Emergency pause mechanism tested
- [ ] Deployment info saved securely

### SDK

- [ ] SDK built successfully
- [ ] All examples tested
- [ ] Documentation updated
- [ ] Version number incremented
- [ ] npm package published (if public)

### Frontend

- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Contract addresses updated
- [ ] Network settings correct
- [ ] Error handling tested
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] Browser compatibility checked

### Security

- [ ] Private keys secured (use environment variables)
- [ ] `.env` file in `.gitignore`
- [ ] No hardcoded secrets
- [ ] SSL/TLS enabled
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] CORS settings correct

### Performance

- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] Lazy loading implemented
- [ ] Caching configured
- [ ] CDN setup (if needed)

## Monitoring

### Contract Monitoring

#### Etherscan

Monitor your contract at:
```
https://sepolia.etherscan.io/address/0xYourContractAddress
```

Track:
- Transaction volume
- Gas usage
- Contract interactions
- Events emitted

#### Custom Monitoring

```javascript
// scripts/monitor.js
const contract = await ethers.getContractAt("FarmerSubsidy", address);

// Listen for events
contract.on("FarmerRegistered", (farmer, timestamp) => {
  console.log(`New farmer registered: ${farmer}`);
});

contract.on("SubsidyDistributed", (farmer, amount) => {
  console.log(`Subsidy distributed: ${amount} to ${farmer}`);
});
```

### Frontend Monitoring

#### Vercel Analytics

Enable in Vercel dashboard:
- Real user monitoring
- Performance metrics
- Error tracking

#### Custom Analytics

```javascript
// Track SDK usage
import { createFhevmClient } from 'fhevm-sdk';

const client = await createFhevmClient({ ... });

// Log important events
client.on('encrypt', () => {
  analytics.track('Encryption performed');
});

client.on('decrypt', () => {
  analytics.track('Decryption performed');
});
```

### Error Tracking

#### Sentry Integration

```bash
npm install @sentry/nextjs
```

```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your config
}, {
  // Sentry config
});
```

## Troubleshooting

### Deployment Fails

**Problem:** Contract deployment runs out of gas

**Solution:**
```env
GAS_LIMIT=8000000
```

**Problem:** Nonce too low

**Solution:**
```bash
# Reset MetaMask account or wait for pending transactions
```

### Verification Fails

**Problem:** Contract verification fails

**Solution:**
- Ensure exact compiler version matches
- Include constructor arguments
- Check flattened source if needed

```bash
npx hardhat flatten contracts/YourContract.sol > flattened.sol
```

### Frontend Issues

**Problem:** Contract not found

**Solution:**
- Verify contract address is correct
- Check you're on the right network
- Ensure contract is deployed

**Problem:** Wallet connection fails

**Solution:**
- Check MetaMask is installed
- Verify network in MetaMask matches app
- Try refreshing the page

## Rollback Plan

If deployment has issues:

1. **Keep old contract running**
2. **Deploy new contract to different address**
3. **Test new contract thoroughly**
4. **Update frontend to new address**
5. **Migrate data if needed**
6. **Deprecate old contract**

## Maintenance

### Regular Tasks

- Monitor contract events
- Check gas prices
- Update dependencies
- Review security advisories
- Backup deployment info
- Test disaster recovery

### Upgrades

If using upgradeable contracts:

```bash
npx hardhat run scripts/upgrade.js --network sepolia
```

## Support

- Documentation: [README.md](README.md)
- GitHub Issues: [Report issues](https://github.com/your-repo/issues)
- Community: [Discord](https://discord.gg/zama)

---

**Deployment Complete!** Your FHEVM application is now live.

Remember to:
- Save all contract addresses
- Backup deployment info
- Monitor performance
- Keep dependencies updated
