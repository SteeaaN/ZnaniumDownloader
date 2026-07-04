@echo off
emcc "%~dp0DecryptSVG.c" -o "%~dp0..\decryptSVG.wasm" -O3 --no-entry -s EXPORTED_FUNCTIONS="['_decryptSVG', '_freeMemory', '_malloc', '_free']"
if %ERRORLEVEL% EQU 0 (
    call "%~dp0update_wasm.bat"
)