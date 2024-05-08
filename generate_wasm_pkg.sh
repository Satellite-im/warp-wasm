cd Warp/warp
wasm-pack build --target web

cd ..
cd ..

# Check if the source directory exists
if [ -d "Warp/warp/pkg" ]; then
    # Move the pkg directory to the repository's root
    mv Warp/warp/pkg .
    echo "Pkg folder moved successfully."
else
    echo "The source directory does not exist."
fi