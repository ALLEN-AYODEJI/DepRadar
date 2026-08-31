# DepRadar

## Build notes

`ed25519-dalek` is pinned to 2.2.0 via `Cargo.lock` due to a `CryptoRng` bound
incompatibility in 3.0.0 pulled in transitively by `soroban-env-host` v22.1.3.
Do not run `cargo update` on this dependency without re-verifying the build.
