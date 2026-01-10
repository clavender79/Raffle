# Lottery dApp UI (`userinterface/`)

Next.js App Router frontend for the Chainlink VRF lottery/raffle contracts.

## Features

- Wallet connection (wagmi + viem)
- User flow: browse raffles, buy tickets, view history
- Admin dashboard: create raffles, view analytics (Chart.js)
- Supabase-backed tables for fast UI reads and historical views

## Requirements

- Node.js 18+
- A Supabase project (URL + keys)

## Setup

Create `userinterface/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Install deps and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Contract configuration

- Update `src/lib/contractData.js` with your deployed `RaffleFactory` address (and keep ABIs in sync).
- Update `src/lib/wagmiConfig.js` RPC transports as needed (Anvil is `http://localhost:8545`).

## More

For the full project overview (contracts, Foundry scripts, tests), see the repository root README.
