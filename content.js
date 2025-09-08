function getDecryptionKey() {
    const renderVerInput = document.querySelector('#render-ver');
    return renderVerInput.value.split(':')[0];
}

async function getBookMetadata(bookId) {
    const response = await fetch(`https://znanium.ru/catalog/document?id=${bookId}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
    });
    if (!response.ok) {
        console.error('Ошибка загрузки страницы');
        return { author: 'Неизвестный автор', toc: null };
    }
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let author = 'Неизвестный автор';
    const authorDiv = doc.querySelector('.book-link.qa_booklist_autors');
    if (authorDiv) {
        const firstAuthor = authorDiv.querySelector('a');
        if (firstAuthor) {
            author = firstAuthor.textContent.trim();
        }
    }
    let toc = null;
    const tocContainer = doc.querySelector('.book-single__headers-wrap');
    if (tocContainer) {
        toc = parseTableOfContents(tocContainer);
    }
    return { author, toc };
}

function parseTableOfContents(container) {
    function parseItems(parentElement) {
        let items = [];
        parentElement.querySelectorAll(":scope > .book-single__header-item").forEach((item) => {
            const titleElement = item.querySelector(".title");
            const pageElement = item.querySelector(".page-number");
            const subItemsContainer = item.querySelector(".subitems");
            if (titleElement && pageElement) {
                let tocItem = {
                    title: titleElement.textContent.trim(),
                    page: parseInt(pageElement.textContent.trim(), 10),
                    link: titleElement.getAttribute("href"),
                    subitems: subItemsContainer ? parseItems(subItemsContainer) : []
                };
                items.push(tocItem);
            }
        });
        return items;
    }

    return parseItems(container);
}

async function requestPage(pageNumber, bookId, format) {
    return new Promise((resolve, reject) => {
        function messageHandler(event) {
            if (event.source !== window) return;
            if (event.data.action === "pageResponse") {
                window.removeEventListener("message", messageHandler);
                resolve(event.data.page);
            } else if (event.data.action === "pageError") {
                window.removeEventListener("message", messageHandler);
                reject(new Error(event.data.error));
            }
        }
        window.addEventListener("message", messageHandler);
        window.postMessage({
    	    action: "getPage",
            pageNumber: pageNumber,
    	    bookId: bookId,
            format: format
        }, "*");
    });
}

function decryptSVG(encryptedSVG, crkey) {
    let digitOrd = { 0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57 };
    let digitChr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let key = Array.from(crkey).map(c => c.charCodeAt(0)).join("");
    let e = key.length, h = 0, decrypted = "", startDecrypt = false;
    for (const char of encryptedSVG) {
        if (char in digitOrd && startDecrypt) {
            let r = parseInt(char, 10) - parseInt(key[h], 10);
            if (r < 0) r += 10;
            decrypted += digitChr[r];
            h = (h + 1) % e;
        } else {
            decrypted += char;
            if (char === ">") startDecrypt = true;
        }
    }
    return decrypted;
}

async function fetchPage(bookId, pageNumber, format) {
    let attempts = 0;
    const maxAttempts = 25;
    while (attempts < maxAttempts) {
        try {
            let pageContent = await requestPage(pageNumber, bookId, format);
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(pageContent, "text/xml");
            if (format === 'text') {
                let pageTextElement = xmlDoc.querySelector("page_text");
                if (!pageTextElement?.textContent?.trim()) {
                    throw new Error("Текст страницы не найден");
                }
                let rawText = pageTextElement.textContent.trim();
                return rawText.replace(/<\/?pre[^>]*>/g, "").trim();
            } else {
                let bookpageElement = xmlDoc.querySelector("bookpage");
                if (!bookpageElement?.textContent?.trim()) {
                    throw new Error("SVG не найден");
                }
                return bookpageElement.textContent.trim();
            }
        } catch (error) {
            console.log(`Ошибка при загрузке страницы ${pageNumber}, попытка ${attempts + 1}/${maxAttempts}:`, error);
            attempts++;
            if (attempts >= maxAttempts) {
                alert(`Не удалось загрузить страницу ${pageNumber} после ${maxAttempts} попыток`);
                setError(`Не удалось загрузить страницу ${pageNumber} после ${maxAttempts} попыток`);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 2500));
        }
    }
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

async function generateEPUB(bookTitle, author, pages, bookId, totalPages, toc) {
    const zip = new JSZip();
    const epub = zip.folder("EPUB");
    let tocNav = toc ? generateTOCNav(toc) : "";
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
    <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title>${bookTitle}</dc:title>
            <dc:creator>${author}</dc:creator>
            <dc:identifier id="bookid">${bookId}</dc:identifier>
        </metadata>
	<manifest>
    	    ${toc ? '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>' : ""}
    	    ${pages.map((_, i) => `<item id="page${i}" href="page${i}.xhtml" media-type="application/xhtml+xml"/>`).join("\n")}
	</manifest>
	<spine>
    	    ${pages.map((_, i) => `<itemref idref="page${i}"/>`).join("\n")}
	</spine>
    </package>`;
    epub.file("content.opf", contentOpf);
    if (toc) {
        epub.file("nav.xhtml", tocNav);
    }
    pages.forEach((text, i) => {
        const pageXHTML = `<?xml version="1.0" encoding="UTF-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>Page ${i + 1}</title>
                <style>
                    body { font-family: serif; line-height: 1.2; margin: 1em; text-align: justify; }
                    p { margin: 0 0 0em 0; }
                </style>
            </head>
            <body>
                ${escapeXML(text)
                    .split(/\n+/g)
                    .map(line => `<p>${line.trim()}</p>`)
                    .join("\n")}
            </body>
        </html>`;
        epub.file(`page${i}.xhtml`, pageXHTML);
        let progress = Math.round(((i + 1) / totalPages) * 100);
        if (progress === 100 && (i + 1) < totalPages) {
            progress = 99;
        }
        updateProgress(progress, 2);
    });
    zip.folder("META-INF").file("container.xml", `<?xml version="1.0"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
            <rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
    </container>`);
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${bookTitle}.epub`;
    link.click();
}

async function startDownload(startPage, endPage, format) {
    const bookTitle = document.querySelector('p.book__name a')?.textContent.trim() || "Книга";
    const bookId = getBookIdFromURL();
    if (!bookId) {
        alert('Номер книги не найден в ссылке.');
        setError('Номер книги не найден в ссылке.');
        return;
    }
    const decryptionKey = getDecryptionKey();
    let pagesData = [];
    let totalPages = endPage - startPage + 1;
    let processedPages = 0;
    for (let page = startPage; page <= endPage; page++) {
        try {
            let pageContent = await fetchPage(bookId, page, format);
            if (pageContent === undefined) {
                return;
            }
            if (format === "text") {
                pagesData.push(pageContent);
            } else {
                pagesData.push({
                    svgData: pageContent,
                    key: decryptionKey
                });
            }
            processedPages++;
            let progress = Math.round((processedPages / totalPages) * 100);
            if (progress === 100 && processedPages < totalPages) {
                progress = 99;
            }
            updateProgress(progress, 1);
        } catch (err) {
            console.error(err);
            alert('Ошибка при скачивании');
            setError('Ошибка при скачивании');
            return;
        }
    }
    if (format === "text") {
        const { author, toc } = await getBookMetadata(bookId);
        generateEPUB(bookTitle, author, pagesData, bookId, totalPages, toc);
    } else {
        processPages(bookTitle, pagesData);
    }
    chrome.runtime.sendMessage({ action: "stopDownload" });
}

async function processPages(bookTitle, pagesData) {
    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = doc.pipe(blobStream());
    let totalPages = pagesData.length;
    let processedPages = 0;
    try {
        for (const { svgData, key } of pagesData) {
            let decryptedSVG = decryptSVG(svgData, key);
            let tempDiv = document.createElement("div");
            tempDiv.innerHTML = decryptedSVG.trim();
            let svgElement = tempDiv.querySelector("svg");
            let viewBox = svgElement.getAttribute("viewBox");
            let width, height;
            if (viewBox) {
                let parts = viewBox.split(" ").map(parseFloat);
                width = parts[2];
                height = parts[3];
            } else {
                width = parseFloat(svgElement.getAttribute("width"));
                height = parseFloat(svgElement.getAttribute("height"));
            }
            doc.addPage({ size: [width, height] });
            svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
            svgElement.setAttribute("width", width);
            svgElement.setAttribute("height", height);
            SVGtoPDF(doc, decryptedSVG, 0, 0, { preserveAspectRatio: 'none' });
            processedPages++;
            let progress = Math.round((processedPages / totalPages) * 100);
            if (progress === 100 && processedPages < totalPages) {
                progress = 99;
            }
            updateProgress(progress, 2);
        }
    } catch (error) {
        alert('Ошибка при сохранении PDF.');
        setError('Ошибка при сохранении PDF.');
        console.error(error);
        return;
    }

    doc.end();
    stream.on('finish', function() {
        const blob = stream.toBlob('application/pdf');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${bookTitle}.pdf`;
        link.click();
    });
}

function updateProgress(percentage, stage) {
    chrome.runtime.sendMessage({ action: 'updateProgress', percentage, stage });
}

function getBookIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
}

function setError(text) {
    chrome.runtime.sendMessage({ action: 'setError', text });
}

window.startDownload = startDownload;
