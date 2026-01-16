---
title: Build and Run
---

# Build and Run

This guide explains how to run the frontend, deploy contracts, and test the flow.

## Requirements

- Node.js 20+
- Foundry

## Frontend

```
cd front-end
npm install
npm run dev
```

Create `front-end/.env`:
```
VITE_BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/your_key
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_ONCHAINKIT_API_KEY=your_onchainkit_key
VITE_MOCK_IDRX_ADDRESS=0x...
VITE_PAYLINK_ADDRESS=0x...
```

## Smart Contracts

```
cd smart-contract
forge install
forge test
```

Create `smart-contract/.env`:
```
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/your_key
PRIVATE_KEY=0x...
MOCK_IDRX_ADDRESS=0x...
BASESCAN_API_KEY=your_key
```

### Deploy Mock IDRX

```
forge script script/DeployMockIDRX.s.sol:DeployMockIDRX --rpc-url base_sepolia --broadcast --verify
```

### Deploy Paylink

```
forge script script/DeployPaylink.s.sol:DeployPaylink --rpc-url base_sepolia --broadcast --verify
```

### Mint Test IDRX

```
cast send <mock_idrx_address> "mint(address,uint256)" <wallet> <amount> --rpc-url base_sepolia --private-key <key>
```

## Run Docs

```
cd docs
npm install
npm run start
```

