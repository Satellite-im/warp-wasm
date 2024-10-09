# warp-wasm
Web Assembly TypeScript library for interfacing with Warp.

### Setup

1 - Install Rust: https://www.rust-lang.org/tools/install

2 - Install wasm-pack:
```
cargo install wasm-pack
```

3 - Run examples
```
cargo run --example from-js
```

### Updating Warp

1 - Get a new commit hash from `Warp` repo. Set the same hash for both `Warp` and `warp-ipfs` in the `Cargo.toml` of this repo.

2 - Fix any issues and push a new version to `npm`

### Publishing to npm

1 - Make sure jq is installed (used for bumping version in package.json)
```
brew install jq
```

2 - Build (specify version to bump: [major/minor/patch])
```
sh build.sh minor
```

3 - Publish to npm

```
cd pkg
npm publish
```