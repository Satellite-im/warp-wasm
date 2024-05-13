git submodule update --init --recursive
cd Warp/extensions/warp-ipfs
wasm-pack build --target web

cd ../../..

# Check if the source directory exists
if [ -d "Warp/extensions/warp-ipfs/pkg" ]; then
    # Move the pkg directory to the repository's root
    mv Warp/extensions/warp-ipfs/pkg .
    echo "Pkg folder moved successfully."
else
    echo "The source directory does not exist."
fi