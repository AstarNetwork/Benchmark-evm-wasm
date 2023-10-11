#!/bin/bash

cargo contract build --manifest-path contracts/math/arithmetic/ink/Cargo.toml --release
npx hardhat compile
