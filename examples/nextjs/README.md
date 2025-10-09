# Next.js FHEVM Example

This is a Next.js application demonstrating the FHEVM SDK integration.

## Getting Started

### Install Dependencies

From the root of the monorepo:

```bash
npm install
```

### Run Development Server

```bash
npm run dev:nextjs
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- FHEVM SDK integration with React hooks
- Encrypt and decrypt values
- Connect wallet functionality
- Responsive UI with modern design

## Project Structure

```
nextjs/
├── pages/
│   ├── _app.js       # App wrapper with FhevmProvider
│   └── index.js      # Home page with encryption demo
├── styles/
│   ├── globals.css   # Global styles
│   └── Home.module.css
└── package.json
```

## Usage

The app demonstrates:

1. **FHEVM Initialization** - Automatic SDK setup in `_app.js`
2. **Encryption** - Enter a number and encrypt it
3. **Wallet Connection** - Display connected address
4. **Error Handling** - Graceful error messages

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zama FHEVM](https://docs.zama.ai/)
