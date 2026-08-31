# Contributing

## Closing Issues

No issue is closed without an entry in [PROGRESS.md](PROGRESS.md)
describing what was built, by whom, and which issue it closes. This is
called out explicitly in the Definition of Done on the issue templates
(`.github/ISSUE_TEMPLATE/`), but it applies to any issue, templated or not.

## Testnet Identities

Don't share or commit Stellar secret keys, including testnet ones. Generate
your own local identity instead:

```bash
stellar keys generate <name> --network testnet --fund
```

This creates a keypair under your local Stellar CLI config (see
`.gitignore` — `.stellar/`, `.soroban/`, and `**/identity/*.toml` are all
excluded from the repo) and funds it via friendbot. Use `<name>` wherever
these docs or scripts expect a `--source` or `--admin` identity.

The testnet admin identity used for the current `deprader_router` deployment
(`GD7IF4QGOEOG6Q7WBD6GDZEZ7HAY4RLDJ5QQTRMJRHOBR43DI3YNJNM6`) will be rotated
before this repo goes public, since its address is already exposed on-chain
through the deploy and `initialize` transactions. Testnet funds have no real
value, but treat the rotation as a reminder not to reuse identities across
public and private stages of a project.
