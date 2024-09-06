# warp-wasm
Web Assembly TypeScript library for interfacing with Warp.

### Setup

1 - Install Rust: https://www.rust-lang.org/tools/install

2 - Install wasm-pack:
```
cargo install wasm-pack
```

3 - Build the wasm
```
sh generate_wasm_pkg.sh
```

### Updating Warp

1 - Get a new commit hash from `Warp` repo. Set the same hash for both `Warp` and `warp-ipfs` in the `Cargo.toml` of this repo.

2 - Rebuild the wasm
```
sh generate_wasm_pkg.sh
```

3 - Fix any issues and push a new version to `npm`