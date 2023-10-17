#!/bin/bash

cargo contract build --manifest-path contracts/math/arithmetic/ink/Cargo.toml --release &&
cargo contract build --manifest-path contracts/math/power/ink/Cargo.toml --release &&
cargo contract build --manifest-path contracts/cross-contracts-call/ink/PSP22/Cargo.toml --release &&
cargo contract build --manifest-path contracts/cross-contracts-call/ink/caller/Cargo.toml --release &&
npx hardhat compile
