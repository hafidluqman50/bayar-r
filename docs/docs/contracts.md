---
title: Smart Contracts
---

# Smart Contracts

BayarR uses two contracts on Base Sepolia.

## Paylink.sol

**Purpose:** store and manage payment requests.

**Core fields:**
- `creator`: who created the paylink
- `amount`: IDRX amount in 18 decimals
- `expiry`: unix timestamp
- `note`: short description stored onchain
- `paid`: status flag
- `payer`: wallet that paid
- `paidAt`: unix timestamp

**Key functions:**
- `createPaylink(amount, expiryDays, note)`
- `pay(id)`
- `getPaylink(id)`

**Events:**
- `PaylinkCreated`
- `PaylinkPaid`

## MockIDRX.sol

**Purpose:** test token with open minting for hackathon demo.

**Key functions:**
- `mint(to, amount)`
- `approve(spender, amount)`
- `balanceOf(account)`

