#!/bin/bash

################################
# Determine new version number #
################################

VERSION=$(npm view warp-wasm version)
ARRAY=(${VERSION//./ })
if [[ "$1" == "major" ]]; then
   (( ARRAY[0]++ ))
   (( ARRAY[1]=0 ))
   (( ARRAY[2]=0 ))
elif [[ "$1" == "minor" ]]; then
   (( ARRAY[1]++ ))
   (( ARRAY[2]=0 ))
elif [[ "$1" == "patch" ]]; then
   (( ARRAY[2]++ ))
else
   echo "Please specify version bump argument: [major/minor/patch]"
   exit
fi
NEW_VERSION=${ARRAY[0]}.${ARRAY[1]}.${ARRAY[2]}
echo "Version: " $VERSION "->" $NEW_VERSION

################################################
# Rebuild wasm, but bump and keep package.json #
################################################

jq '.version = "'$NEW_VERSION'"' pkg/package.json > pkg/package.temp.json
wasm-pack build --target web
mv pkg/package.temp.json pkg/package.json
