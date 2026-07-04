#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
emcc "$DIR/DecryptSVG.c" -o "$DIR/../decryptSVG.wasm" -O3 --no-entry -s EXPORTED_FUNCTIONS="['_decryptSVG', '_freeMemory', '_malloc', '_free']"
if [ $? -eq 0 ]; then
    "$DIR/update_wasm.sh"
fi