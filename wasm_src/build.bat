@echo off
emcc DecryptSVG.c -o ../decryptSVG.wasm -O3 --no-entry -s EXPORTED_FUNCTIONS="['_decryptSVG', '_freeMemory', '_malloc', '_free']"