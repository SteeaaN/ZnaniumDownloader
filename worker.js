function cleanText(raw) {
    if (!raw) return "";
    return raw.replace(/<\/?pre[^>]*>/gi, "").trim();
}

function escapeXML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function generateTOCNav(toc) {
    function buildTOC(items) {
        return `<ol>` + items.map(item => {
            let cleanTitle = escapeXML(item.title);
            let pageFilename = `page${item.page - 1}.xhtml`;

            return `
            <li><a href="${pageFilename}">${cleanTitle}</a>
                ${item.subitems.length ? buildTOC(item.subitems) : ""}
            </li>`;
        }).join("") + `</ol>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
        <title>Оглавление</title>
    </head>
    <body>
        <nav epub:type="toc" id="toc">
            <h2>Оглавление</h2>
            ${buildTOC(toc)}
        </nav>
    </body>
    </html>`;
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function blobToDataURL(blob) {
  try {
    const fr = new FileReader();
    const p = new Promise((res, rej) => {
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
    });
    fr.readAsDataURL(blob);
    return await p;
  } catch {
    const buf = await blob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return "data:image/png;base64," + btoa(binary);
  }
}

async function webpDataURLtoPngDataURL(dataURL) {
  const b64 = dataURL.split(",")[1];
  const bytes = base64ToBytes(b64);
  const bmp = await createImageBitmap(new Blob([bytes], { type: "image/webp" }));
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bmp, 0, 0);
  const pngBlob = await canvas.convertToBlob({ type: "image/png" });
  return await blobToDataURL(pngBlob);
}

async function convertWebPImagesInSVG(svgText) {
  const dataUrlRegex = /(<image[^>]+(?:href|xlink:href)\s*=\s*")[^"]+(")/gi;
  const hrefs = [];
  let match;
  while ((match = dataUrlRegex.exec(svgText))) {
    hrefs.push({ start: match.index + match[1].length, end: dataUrlRegex.lastIndex - match[2].length });
  }

  const slices = hrefs.map(({ start, end }) => svgText.slice(start, end));
  const unique = [...new Set(slices)];

  const replacements = new Map();
  for (const url of unique) {
    try {
      if (url.startsWith("data:image/webp")) {
        const pngUrl = await webpDataURLtoPngDataURL(url);
        replacements.set(url, pngUrl);
      } else if (/\.webp(\?|#|$)/i.test(url)) {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const bmp = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bmp, 0, 0);
        const pngBlob = await canvas.convertToBlob({ type: "image/png" });
        const pngDataURL = await blobToDataURL(pngBlob);
        replacements.set(url, pngDataURL);
      }
    } catch (e) {}
  }

  if (replacements.size === 0) return svgText;

  let out = svgText;
  for (const [from, to] of replacements.entries()) {
    out = out.split(from).join(to);
  }
  return out;
}

let epubZip, epubFolder, epubPages = [], epubBookId, epubTitle, epubAuthor, epubTOC;

async function finalizeEPUB() {
    try {
        epubZip.file("mimetype", "application/epub+zip", { compression: "STORE" });
        const tocNav = epubTOC ? generateTOCNav(epubTOC) : "";
        const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
        <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
            <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
                <dc:title>${escapeXML(epubTitle)}</dc:title>
                <dc:creator>${escapeXML(epubAuthor)}</dc:creator>
                <dc:identifier id="bookid">${escapeXML(epubBookId)}</dc:identifier>
                <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]+"Z"}</meta>
            </metadata>
            <manifest>
                ${epubTOC ? '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>' : ""}
                ${epubPages.map((_, i) => `<item id="page${i}" href="page${i}.xhtml" media-type="application/xhtml+xml"/>`).join("\n")}
            </manifest>
            <spine>
                ${epubPages.map((_, i) => `<itemref idref="page${i}"/>`).join("\n")}
            </spine>
        </package>`;

        epubFolder.file("content.opf", contentOpf);
        if (epubTOC) epubFolder.file("nav.xhtml", tocNav);

        epubPages.forEach((text, i) => {
            const pageXHTML = `<?xml version="1.0" encoding="UTF-8"?>
            <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <title>${escapeXML(epubTitle)} - Page ${i + 1}</title>
                    <style>
                        body { font-family: serif; line-height: 1.2; margin: 1em; text-align: justify; }
                        p { margin: 0 0 0em 0; }
                    </style>
                </head>
                <body>
                    ${escapeXML(cleanText(text))
                        .split(/\n+/g)
                        .map(line => `<p>${line.trim()}</p>`)
                        .join("\n")}
                </body>
            </html>`;
            epubFolder.file(`page${i}.xhtml`, pageXHTML);
        });

        epubZip.folder("META-INF").file("container.xml", `<?xml version="1.0"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
            <rootfiles>
                <rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml"/>
            </rootfiles>
        </container>`);

        const blob = await epubZip.generateAsync({ 
            type: "blob", 
            mimeType: "application/epub+zip",
            compression: "STORE"
        });
        
        self.postMessage({ action: "done", blob });
    } catch (err) {
        console.error(err);
        self.postMessage({ action: "error", error: err.message || String(err) });
    }
}

let wasm;
let memory;
let doc, stream;
let wasmUrl = null;

async function loadDecryptWASM() {
    if (wasm) return wasm;
    const resp = await fetch(wasmUrl);
    const buf = await resp.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(buf, {
        env: { emscripten_notify_memory_growth: () => {} }
    });
    wasm = instance.exports;
    if (wasm.memory) {
        memory = new Uint8Array(wasm.memory.buffer);
    } else {
        console.error("WASM-модуль не экспортирует память");
    }
    return wasm;
}

function wasmStringToJS(ptr) {
    let str = "";
    while (memory[ptr] !== 0) {
        str += String.fromCharCode(memory[ptr++]);
    }
    return str;
}

function stringToWasm(str) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str + "\0");
    const ptr = wasm.malloc(encoded.length);
    memory.set(encoded, ptr);
    return ptr;
}

function parseSVGDimensions(svgText) {
    const vbMatch = svgText.match(/viewBox\s*=\s*["']\s*([\d.+\-eE,\s]+)\s*["']/i);
    if (vbMatch) {
        const parts = vbMatch[1].trim().split(/[\s,]+/).map(parseFloat);
        if (parts.length >= 4 && !Number.isNaN(parts[2]) && !Number.isNaN(parts[3])) {
            return { width: parts[2], height: parts[3] };
        }
    }
    const wMatch = svgText.match(/<svg[^>]*\bwidth\s*=\s*["']\s*([0-9.+-eE]+)(?:px)?\s*["']/i);
    const hMatch = svgText.match(/<svg[^>]*\bheight\s*=\s*["']\s*([0-9.+-eE]+)(?:px)?\s*["']/i);
    if (wMatch && hMatch) {
        return { width: parseFloat(wMatch[1]), height: parseFloat(hMatch[1]) };
    }
    const anyVB = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i);
    if (anyVB) {
        const parts = anyVB[1].trim().split(/[\s,]+/).map(parseFloat);
        if (parts.length >= 4 && !Number.isNaN(parts[2]) && !Number.isNaN(parts[3])) {
            return { width: parts[2], height: parts[3] };
        }
    }
    console.error(`Ошибка при парсинге svg, используем дефолт А4`);
    return { width: 595, height: 842 };
}

async function handleMessage(e) {
    const { action } = e.data;

    try {
        if (action === "initEPUB") {
            epubZip = new JSZip();
            epubFolder = epubZip.folder("EPUB");
            epubBookId = e.data.bookId;
            epubTitle = e.data.bookTitle;
            epubAuthor = e.data.author;
            epubTOC = e.data.toc;
            epubPages = [];
            return;
        }

        if (action === "addPageEPUB") {
            epubPages.push(e.data.text);
            self.postMessage({ action: "pageAdded" });
            return;
        }

        if (action === "finalizeEPUB") {
            await finalizeEPUB();
            return;
        }

        if (action === "initPDF") {
            doc = new PDFDocument({ autoFirstPage: false });
            stream = doc.pipe(blobStream());
            wasmUrl = e.data.wasmUrl;
            return;
        }

        if (action === "addPagePDF") {
            if (!doc) throw new Error("PDF документ не инициализирован");
            const { svgData, key } = e.data;
            const wasm = await loadDecryptWASM();

            const ptrSvg = stringToWasm(svgData);
            const ptrKey = stringToWasm(key);
            const resultPtr = wasm.decryptSVG(ptrSvg, ptrKey);
            let decryptedSVG = wasmStringToJS(resultPtr);
            wasm.free(ptrSvg);
            wasm.free(ptrKey);
            wasm.free(resultPtr);

            decryptedSVG = await convertWebPImagesInSVG(decryptedSVG);

            const { width, height } = parseSVGDimensions(decryptedSVG);
            doc.addPage({ size: [width, height] });
            SVGtoPDF(doc, decryptedSVG, 0, 0, { preserveAspectRatio: "none" });

            self.postMessage({ action: "pageAdded" });
            return;
        }

        if (action === "finalizePDF") {
            if (!doc || !stream) {
                throw new Error("PDF документ не инициализирован");
            }
            stream.once("finish", async () => {
                const blob = stream.toBlob("application/pdf");
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    self.postMessage({ action: "done", buffer: arrayBuffer }, [arrayBuffer]);
                } catch {
                    self.postMessage({ action: "done", blob });
                }
            });
            doc.end();
            return;
        }
    } catch (err) {
        console.error(err);
        self.postMessage({ action: "error", error: err.message || String(err) });
    }
}

let messageQueue = Promise.resolve();

self.onmessage = (e) => {
    messageQueue = messageQueue
        .then(() => handleMessage(e))
        .catch(err => {
            console.error(err);
            self.postMessage({ action: "error", error: err.message || String(err) });
        });
};
