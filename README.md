
# Lottery Project

A full-stack, Chainlink-powered raffle platform. The Solidity layer lets an owner deploy and manage multiple raffles backed by Chainlink VRF v2.5 random numbers and Automation keepers. Two Next.js frontends (`frontend/` and `userinterface/`) expose the experience to end users, while Foundry scripts and tests keep the on-chain code reproducible.

---

## Repository Layout

| Path | Role |
| --- | --- |
| `src/` | Production contracts (`Raffle.sol`, `RaffleFactory.sol`). |
| `script/` | Foundry deployment + maintenance scripts (`Deploy*`, `HelperConfig`, `Interaction`). |
| `test/unit`, `test/integration`, `test/mocks` | Contract tests and local Chainlink mocks. |
| `userinterface/` | Primary Next.js App Router dapp (Supabase-powered landing, lottery lobby, admin area). |
| `frontend/` | Legacy hooks-based wagmi PoC retained for reference only. |
| `lib/` | Git submodules (Chainlink, forge-std, foundry-devops, solmate). |
| `broadcast/`, `cache/`, `out/` | Forge artifacts and deployment logs. |
| `Makefile`, `foundry.toml` | Developer automation and Foundry configuration. |

---

## Smart Contract Architecture

### `src/Raffle.sol`
- Implements the on-chain game loop: players call `enterRaffle` with multiple tickets, the contract tracks entries per address, periodically checks `checkUpkeep`, and asks Chainlink VRF for entropy inside `performUpkeep`.
- Uses weighted selection so a wallet’s chance to win is proportional to its tickets. After fulfillment the pot is split 90/10 between the winner and the factory owner, and the raffle can be reopened.
- Guard rails include pause states, ownership modifiers inherited from `VRFConsumerBaseV2Plus`, and automation helpers.

### `src/RaffleFactory.sol`
- Owns every deployed raffle instance, keeps id/name maps, registers automation upkeeps, and wires raffles into a VRF subscription.
- Provides admin utilities: create/fund VRF subscriptions, add raffles as consumers, fund automation with LINK, reopen raffles, read ticket counts, and withdraw accumulated ETH fees.
- Relies on local mocks (`test/mocks/*.sol`) for deterministic tests.

---

## Chainlink, Automation, and Scripts

- `script/HelperConfig.s.sol` centralizes per-chain addresses for VRF coordinators, LINK tokens, automation registries, and default broadcasters. When running on Anvil it lazily deploys mocks (`VRFCoordinatorV2_5Mock`, `MockAutomationRegistry`) so scripts stay predictable.
- `script/DeployRaffleFactory.s.sol` and `script/DeployRaffle.s.sol` broadcast deployments via `forge script ... --broadcast`. The factory deployment can be parameterized for Sepolia/Anvil using the `Makefile` targets.
- `script/Interaction.s.sol` holds operational helpers:
  - `CreateSubscription`, `FundSubscription`, `AddConsumer` for VRF v2.5 management.
  - `GetRaffleAttributes` for low-level debugging.
- `Makefile` wraps the most common flows (`make anvil`, `make deploy-anvil`, `make createSubscription`, keeper funding via `cast`, etc.) and stores handy addresses for both local and Sepolia networks.

### Automation Flow
1. Deploy `RaffleFactory`.
2. If needed, create/fund a VRF subscription and call `addConsumerToSubscription` for each raffle.
3. `CreateRaffle` registers a keeper via `registerUpKeep` so Chainlink Automation can trigger `performUpkeep`.
4. Player entries accumulate ETH in each raffle; when the upkeep triggers, VRF randomness picks the winner and ETH flows to the winner plus factory.

---

## Testing Strategy

- **Unit tests (`test/unit`)** focus on single contracts, mocking VRF callbacks and covering error paths such as insufficient payments or duplicate raffle names.
- **Integration tests (`test/integration`)** exercise a full lifecycle: deploy factory, create raffles, fund subscriptions, simulate upkeep, fulfill random words, reopen raffles, and assert balances.
- **Mocks (`test/mocks`)** replicate the minimal surface of Chainlink contracts to keep tests deterministic.
- Run with `forge test` (all), `forge test --match-path test/unit/RaffleTest.t.sol` (single suite), or `forge snapshot` for gas cost tracking.

---

## Frontend Clients

### `userinterface/` (primary dapp)
- Built with Next.js App Router + Tailwind, Zustand (`useWalletStore.js`) for wallet/auth state, wagmi/viem for contract IO, and Supabase (`src/lib/supabase.js`) as the persistence layer for raffles, players, and raffle_history.
- **Public area**: `Landing.jsx` pulls aggregate stats via `getLotteriesDetail` and renders hero/feature sections. `LotteryPage.jsx` renders the card grid + banner, converts Supabase raffle rows into UI objects, and opens `BuyTicketsPopup` or `LotteryHistoryUser` modals while `contractInteractions.js` sends `enterRaffle` writes.
- **Admin area**: `/admin/*` routes mount components like `admin/Overview.jsx`, `ActivePage.jsx`, `HistoryPage.jsx`, and `CreateLottery.jsx`. They hydrate from the Zustand raffle cache, reuse `AdminTable`, surface the `UserTicketsSoldGraph` chart (see `CHART_README.md`), and provide create/add-more flows.
- **APIs & auth**: App Router routes under `src/app/api/` proxy Supabase Edge functions (`generate-jwt/route.js`) and expose secured counts (`players-count/route.js`). Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus the on-chain RPC keys consumed by wagmi.
- Start the UI with:
  ```bash
  cd userinterface
  npm install
  npm run dev
  ```
  Ensure `userinterface/src/lib/contractData.js` points at your deployed factory/raffles and that Supabase tables (`raffles`, `raffle_history`, `players`) are populated or mocked.

### `frontend/` (legacy)
- Earlier wagmi demo kept for posterity. It still shows how to stream `WinnerPicked` events (`src/components/Home.jsx`) and read the raffle contract, but the production build uses `userinterface/`. Feel free to archive or delete once no longer needed.

---

## Local Development Workflow

1. **Install toolchains**
   - Foundry: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
   - Node.js 18+ for the frontends.
2. **Fetch dependencies**  
   `forge install` is already scripted via the `Makefile`. If you need to refresh them: `make update`.
3. **Start Anvil**  
   `make anvil` (uses the deterministic mnemonic from the Makefile).
4. **Deploy contracts**
   ```bash
   # Deploy the factory to Anvil with default broadcaster
   make deploy-anvil

   # Deploy a standalone raffle (mainly for tests)
   make deploy-raffle-anvil
   ```
5. **Create/fund VRF subscription & keeper (local)**  
   ```bash
   make createSubscription
   make fundSubscription
   make addConsumer   # after CreateRaffle mints an address
   ```
6. **Interact from CLI**
   - `make createRaffle` (local) / `make createRaffleSepolia`
   - `make getPlayers` or the `cast call` helpers at the bottom of the Makefile.
7. **Run tests / lint / gas checks**
   ```bash
   forge fmt
   forge build
   forge test
   forge snapshot
   ```
8. **Frontend (userinterface)**
   ```bash
   cd userinterface
   npm install
   npm run dev
   ```
   Double-check `userinterface/src/lib/contractData.js` (and Supabase env vars) so the UI is wired to the right deployments. The older `frontend/` app can be ignored unless you need the historical demo.

---

## Deployment (Sepolia example)

```bash
forge script script/DeployRaffleFactory.s.sol:DeployRaffleFactory \
  --rpc-url $SEPOLIA_RPC_URL \
  --account sepkey \
  --broadcast --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY -vvvv
```

After broadcasting, use the interaction scripts or Make targets (`createRaffleSepolia`, `enterRaffleSepolia`, `getPlayersSepolia`, etc.) to operate the factory and monitor raffles.

---

## Troubleshooting Tips
- If `performUpkeep` reverts with `Raffle_UpkeepNotNeeded`, check the interval, balance, and ticket count via `GetRaffleAttributes` or the `forge inspect` console helpers.
- When using a fresh local network, always run `make createSubscription` and `make addConsumer` before expecting VRF callbacks—otherwise the coordinator cannot fulfill requests.
- For frontend issues, confirm the wallet network matches the address loaded in `userinterface/src/lib/contractData.js`, and that your RPC URLs in `wagmiConfig` are reachable.

Happy shipping!
