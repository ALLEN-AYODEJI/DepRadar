# DepRadar Testnet Read Client (Soroban)

A minimal, TypeScript-based client to read bounty and claim states from the deployed `deprader_router` contract on Stellar testnet.

- **Contract ID:** `CBFLUY6NB3JOQDEUOF2JG5TL3UD7GCQ7APUJ6EHNNSUJLUELHSGIG675`
- **Network:** Stellar Testnet (`https://soroban-testnet.stellar.org`)

## Features

- Read single bounty data by `bounty_id` via contract call `get_bounty`
- Read single claim data by `bounty_id` via contract call `get_claim`
- Decodes Soroban SCVal to typed JavaScript primitives
- Formats amounts from stroops to human-readable units
- Graceful handling of missing or non-existent bounty/claim IDs
- Configurable RPC URL, Contract ID, and Network Passphrase

## Installation

```bash
cd clients/read-client
npm install
npm run build
```

## Usage

### Run via CLI

Query default bounty (ID `#1`):

```bash
npm run start
# or
node dist/index.js
```

Query a specific bounty by ID (e.g. ID `#2`):

```bash
node dist/index.js 2
```

### Programmatic Usage

```typescript
import { DepRadarReadClient } from "./dist";

const client = new DepRadarReadClient({
  rpcUrl: "https://soroban-testnet.stellar.org",
  contractId: "CBFLUY6NB3JOQDEUOF2JG5TL3UD7GCQ7APUJ6EHNNSUJLUELHSGIG675",
});

// Fetch bounty #1
const bounty = await client.getBounty(1n);
console.log("Bounty:", bounty);

// Fetch claim #1
const claim = await client.getClaim(1n);
console.log("Claim:", claim);
```
