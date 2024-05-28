# warp-wasm
Web Assembly TypeScript library for interfacing with Warp.

### Setup

1 - Install Rust: https://www.rust-lang.org/tools/install

2 - Install wasm-pack:
```
cargo install wasm-pack
```

3 - Run the script 
```
sh generate_wasm_pkg.sh
```

<!-- ### Updating this library:

```
git submodule update --init --recursive --remote
wasm-pack build Warp/extensions/warp-ipfs --target web --out-dir ../../../pkg
``` -->