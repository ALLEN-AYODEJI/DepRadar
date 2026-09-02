# Progress Log

This file is the running record of concrete work landed in this repo: what
was built, who built it, and which issue (if any) it closes. It exists so
that "what's actually shipped" is answerable by reading one file, rather
than reconstructing it from git history or a scattered issue tracker.

Every issue's Definition of Done requires an entry here before the issue
is closed — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Entries

### deprader_router contract — create_bounty / submit_claim / release

- **What:** Initial Soroban smart contract at `contracts/deprader_router/`.
  Implements `initialize(admin)`, `create_bounty(creator, bounty_id,
  issue_ref, amount, token)` (locks funds against a bounty ID),
  `submit_claim(bounty_id, claimant, proof_ref)` (records a claim, no fund
  movement), and `release(admin, bounty_id)` (admin-gated, one-time payout
  of locked funds to the claimant). Getters: `get_bounty`, `get_claim`.
- **By:** ALLEN-AYODEJI
- **Closes:** N/A (predates the issue tracker)
- **Status:** Deployed and verified on Stellar testnet.
  - Contract ID: `CBFLUY6NB3JOQDEUOF2JG5TL3UD7GCQ7APUJ6EHNNSUJLUELHSGIG675`
  - A full `create_bounty` → `submit_claim` → `release` cycle was run
    against the live testnet contract using the native XLM Stellar Asset
    Contract as the test token, and confirmed via `get_bounty` / `get_claim`
    reads and on-chain transfer events.

### typosquat scanner — popular-package reference data + loader

- **What:** Groundwork for the typosquat detection scanner. Adds
  `data/popular-packages/npm-top1000.json` and
  `data/popular-packages/pypi-top1000.json` — each a JSON array of ~1000
  widely-used package names for that registry (a hand-curated representative
  snapshot, not a live-fetched ranking). Introduces the crate's off-chain
  Rust side: a root `deprader` library crate with
  `src/typosquat/dataset.rs`, exposing `load_popular_packages()`, which
  embeds both lists at compile time and returns them as one combined
  `Vec<String>` (npm first, then PyPI). No scoring logic yet — just the data
  and the loader. Covered by a unit test asserting the combined list is
  non-empty and contains known packages (`react`, `requests`).
- **By:** ALLEN-AYODEJI
- **Closes:** N/A (prep for the typosquat scanner module)
- **Status:** Merged. `cargo test --workspace --locked` passes.
