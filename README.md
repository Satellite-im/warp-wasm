# warp-wasm
Web Assembly TypeScript library for interfacing with Warp.

### Setup

1 - Install Rust: https://www.rust-lang.org/tools/install

2 - Install wasm-pack:
```
cargo install wasm-pack
```

### Updating this library:

```
git submodule update --init --recursive
wasm-pack build Warp/extensions/warp-ipfs --target web --out-dir ../../../pkg
```