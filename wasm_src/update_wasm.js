const fs = require('fs');
const path = require('path');

const wasmPath = path.join(__dirname, '..', 'decryptSVG.wasm');
const workerPath = path.join(__dirname, '..', 'worker.js');

if (!fs.existsSync(wasmPath)) {
    console.error('❌ Ошибка: файл decryptSVG.wasm не найден по пути:', wasmPath);
    process.exit(1);
}

if (!fs.existsSync(workerPath)) {
    console.error('❌ Ошибка: файл worker.js не найден по пути:', workerPath);
    process.exit(1);
}

const wasmBuffer = fs.readFileSync(wasmPath);
const base64String = wasmBuffer.toString('base64');

let workerContent = fs.readFileSync(workerPath, 'utf8');

const regex = /^const DECRYPT_SVG_WASM_BASE64\s*=\s*"[^"]*";?/m;

if (regex.test(workerContent)) {
    workerContent = workerContent.replace(regex, `const DECRYPT_SVG_WASM_BASE64 = "${base64String}";`);
    console.log('✅ Успешно обновлена строка DECRYPT_SVG_WASM_BASE64 в worker.js');
} else {
    workerContent = `const DECRYPT_SVG_WASM_BASE64 = "${base64String}";\n` + workerContent;
    console.log('✅ Добавлена строка DECRYPT_SVG_WASM_BASE64 в начало worker.js');
}

fs.writeFileSync(workerPath, workerContent, 'utf8');
console.log(`📊 Размер WASM: ${wasmBuffer.length} байт -> Строка Base64: ${base64String.length} символов`);
