# Campus Wallet — Algorand Hackathon Project

**One-line summary:** Campus Wallet is a hybrid Web2 / Web3 application that enables students to split expenses, purchase event tickets tokenized as Algorand ASAs, and view spending analytics using a connected Algorand address (Pera Wallet or manual address fallback).

---

## Overview

Campus Wallet combines a wallet-aware frontend with an Algorand-powered backend to provide a practical, demo-ready platform for campus events and shared finances. The project separates concerns across backend services and two frontends (user and organiser) to keep responsibilities clear and to support parallel development.

---

## Implemented capabilities

**Wallet & Session**

* Global wallet state (React Context) with connect / disconnect flows.
* Pera Wallet integration (preferred) and manual Algorand address fallback.
* Wallet address propagated to the backend via an `x-wallet-address` header and as a fallback in query/body parameters.

**Ticketing & Events (on-chain)**

* Organisers can create and manage events in the organiser frontend.
* Platform account mints tickets as Algorand Standard Assets (ASAs) via `algosdk`.
* Tickets are transferred to buyers' addresses on purchase; ownership is verifiable on-chain.
* Off-chain metadata and application state are persisted in the database.

**Groups & Expense Splitting (off-chain)**

* Create and manage groups, add members, add expenses, and split amounts.
* Track who owes whom and reconcile balances.

**Analytics & Activity (off-chain)**

* Net balance (you are owed vs you owe).
* Category breakdown and trend visualisations.
* Unified activity feed for payments, expenses, and ticket purchases.

**Organiser Dashboard**

* Create events, view ticket holders, check-in endpoints, and simple analytics for each event.

---

## Roadmap / Remaining work

* Peer-to-peer ticket marketplace (user-to-user ASA transfers with UI flows).
* Multi-signature or shared group wallets for pooled funds.
* Wallet ↔ campus identity verification and optional KYC for organisers.
* Indexer integration (Algorand Indexer) for richer, on-chain history and queries.
* CI/CD, automated tests (unit and integration), and production-grade secret management (KMS / Vault).

---

## Project structure (concise)

```
algorand-app/
├── backend/              # Express + Algorand SDK (Port 3000)
│   ├── server.js
│   ├── api-js/
│   ├── config/
│   ├── db/
│   ├── middleware/
│   ├── analysis/
│   └── package.json
├── user_frontend/        # Student App (React + Vite, Port 5173)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── organiser_frontend/   # Organiser App (React + Vite, Port 5174)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Quick start (local development)

> Requirements: Node.js, Docker, AlgoKit (requires Docker/Podman for LocalNet)

1. Install dependencies:

```bash
# top-level helper (optional) if present
npm run install-all

# or individually
cd backend && npm install
cd ../user_frontend && npm install
cd ../organiser_frontend && npm install
```

2. Start Algorand LocalNet:

```bash
algokit localnet start
```

3. Start backend (terminal #2):

```bash
cd backend
npm start
# backend listens at http://localhost:3000
```

4. Start user frontend (terminal #3):

```bash
cd user_frontend
npm run dev
# user app: http://localhost:5173
```

5. Start organiser frontend (terminal #4):

```bash
cd organiser_frontend
npm run dev
# organiser app: http://localhost:5174
```

---

## Environment variables

**Backend (`backend/.env`)**

```
PORT=3000
PLATFORM_MNEMONIC="<25-word-dev-mnemonic>"
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
FRONTEND_ORIGIN=http://localhost:5173
```

**User frontend (`user_frontend/.env`)**

```
VITE_API_URL=http://localhost:3000/api
```

**Organiser frontend (`organiser_frontend/.env`)**

```
VITE_API_URL=http://localhost:3000/api
```

---

## Important API endpoints (summary)

**User / Public**

* `GET /api/events` — list events
* `GET /api/events/:id` — event details
* `POST /api/tickets/buy` — buy ticket (wallet address required)
* `GET /api/tickets/mine` — list tickets owned by address
* `GET /api/analysis/net-balance` — net balance for a wallet

**Organiser**

* `GET /api/organiser/events` — events by organiser
* `POST /api/organiser/events/create` — create event
* `GET /api/organiser/events/:eventId/holders` — ticket holders
* `POST /api/organiser/events/:eventId/checkin/:ticketId` — check-in

> Note: The backend reads wallet address primarily from the header `x-wallet-address`. It will fall back to query/body parameters if the header is not present.

---

## Wallet integration notes

* The recommended wallet is Pera Wallet. The frontend integrates a wallet provider that exposes connect/disconnect and persists the connected address in React Context.
* `@perawallet/connect` has peer dependency requirements for `algosdk` (frontend usage should install a compatible `algosdk` version such as `^3.x` while backend may remain on `algosdk@2.x` to avoid breaking changes). Installing `@perawallet/connect` in the frontend package is the preferred approach.
* Manual address paste is available as a fallback for development or if the Pera SDK cannot be installed.

---

## Verifying blockchain flows (examples)

### Check LocalNet status

```bash
curl http://localhost:4001/v2/status
```

### Inspect accounts from AlgoKit LocalNet (console)

```bash
algokit localnet console
# inside the container console:
goal account list
```

### Mint ticket (example HTTP request)

Use a HTTP client or PowerShell `Invoke-RestMethod` to call the mint endpoint on the backend. The backend will return the minted asset id (ASA id) on success.

---

## Files and code paths to review

**Backend**

* `backend/server.js` — application bootstrap and middleware
* `backend/config/algorand.js` — Algorand SDK helpers for minting and transfer
* `backend/api-js/tickets.js` — ticket-related endpoints
* `backend/api-js/events.js` — organiser flows and analytics
* `backend/db/` — DDL and database access files

**User frontend**

* `user_frontend/src/App.tsx` — top-level providers and routing
* `user_frontend/src/contexts/WalletContext.tsx` — global wallet state and APIs
* `user_frontend/src/components/layout/AppLayout.tsx` — header with connect UI
* `user_frontend/src/pages/EventDetailScreen.tsx` — buy-ticket UI flow

**Organiser frontend**

* `organiser_frontend/src/pages/CreateEvent.tsx` — create and publish events
* `organiser_frontend/src/pages/EventAnalytics.tsx` — organiser analytics

---

## Troubleshooting (common errors and fixes)

* **Port 3000 already in use:** Stop the conflicting process or change `PORT` in `.env`.
* **AlgoKit / Docker not running:** Ensure Docker Desktop is running and that AlgoKit is installed and visible on PATH.
* **Pera SDK `algosdk` peer conflicts:** Install `@perawallet/connect` in the frontend only and install a compatible frontend `algosdk` if needed; avoid forcing dependency resolution in the backend.
* **Vite missing module errors:** Install missing frontend dependencies inside the relevant frontend package (e.g., `lucide-react`, `@radix-ui/*`, `sonner`).
* **Failed to decode mnemonic:** Verify `PLATFORM_MNEMONIC` is correctly set and formatted (25 words, single spaces). Use only for dev; never commit.

---

## Security considerations

* Do not commit `.env` files or the platform mnemonic to source control.
* The platform account mnemonic is for development/demo only. For production use a secure secrets store (KMS, Vault) and rotate keys.
* The backend does not store user private keys. Transaction signing for minting is performed by the platform account (dev flow); for production consider client-side signing flows where appropriate.

---

## Demo checklist (concise)

1. Start AlgoKit LocalNet.
2. Start backend and both frontends.
3. Connect a LocalNet account in the user frontend (via Pera or manual address).
4. Create an event in the organiser frontend.
5. Buy a ticket from the user frontend and confirm ASA transfer using `goal` inside the algokit console.
6. Observe analytics and activity logs update accordingly.

---

## Contributors

* Team lead: Atharva Mankar
* Contributors: Adish Nair, Atharva Mankar, Prasanna Mehkarkar

---

## License

This repository is provided for hackathon demonstration and is licensed under the MIT License.

---
