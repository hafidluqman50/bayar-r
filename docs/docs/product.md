---
title: Product Experience
---

# Product Experience

BayarR focuses on a four-step flow that mirrors real behavior in chat:

1. **Create**: enter amount, optional note, and expiry days.
2. **Share**: copy a short pay link or QR.
3. **Pay**: buyer connects wallet and pays.
4. **Receipt**: confirmed status and transaction hash.

## UX Decisions

- **Minimal navigation**: only Create and Share are visible in the top bar.
- **Share popover**: accepts a paylink ID without extra RPC calls.
- **Guardrails**: creator cannot pay their own link, and expired or paid links are locked.
- **Mobile-first**: spacing, buttons, and typography tuned for small screens.

## Content Strategy

- Short, direct copy.
- Avoids “mock” language in UI to keep it pitch-ready.
- Clear system feedback (success, error, and locked states).

## Buyer vs Creator Flow

BayarR does not assume the creator and buyer are the same wallet. The app blocks self-payment and makes the buyer flow explicit in the UI.

## Trust and Transparency

Every paylink and payment status is read from the chain. Receipts show onchain confirmations, not local state. This keeps the product reliable across devices.

