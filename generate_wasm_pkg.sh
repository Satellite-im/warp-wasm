wasm-pack build --target web --out-dir temp
mv temp/warp_ipfs_bg.wasm pkg/warp_ipfs_bg.wasm
mv temp/warp_ipfs_bg.wasm.d.ts pkg/warp_ipfs_bg.wasm.d.ts
mv temp/warp_ipfs.d.ts pkg/warp_ipfs.d.ts
mv temp/warp_ipfs.js pkg/warp_ipfs.js
rm -r temp