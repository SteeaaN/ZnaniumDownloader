async function createWorker() {
    const workerUrl = chrome.runtime.getURL("worker.js");
    const response = await fetch(workerUrl);
    let code = await response.text();

    const libs = [
        "libs/pdfkit.standalone.js",
        "libs/blob-stream.min.js",
        "libs/SVG-to-PDFKit.js",
        "libs/jszip.min.js"
    ].map(l => chrome.runtime.getURL(l));

    const header = `importScripts(${libs.map(u => `"${u}"`).join(", ")});\n`;
    const blob = new Blob([header + code], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
}

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

async function fetchPage(bookId, pageNumber, format) {
    let attempts = 0;
    const maxAttempts = 25;
    while (attempts < maxAttempts) {
        try {
            let pageContent = await requestPage(pageNumber, bookId, format);
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(pageContent, "text/xml");
            if (format === 'epub') {
                let pageTextElement = xmlDoc.querySelector("page_text");
                if (!pageTextElement?.textContent?.trim()) {
                    throw new Error("Текст страницы не найден");
                }
                return pageTextElement.textContent.trim();
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

async function downloadEPUB(startPage, endPage, bookTitle, bookId, totalPages, worker, processedPages) {
    const { author, toc } = await getBookMetadata(bookId);

    worker.postMessage({
        action: "initEPUB",
        bookTitle,
        bookId,
        author,
        toc
    });

    let downloadStopped = false;

    worker.onmessage = (e) => {
        if (e.data.action === "pageAdded") {
            processedPages++;
            updateProgress(Math.round((processedPages / totalPages) * 100));
        } else if (e.data.action === "done") {
            const blob = e.data.blob;
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${bookTitle}.epub`;
            link.click();
            chrome.runtime.sendMessage({ action: "stopDownload" });
        } else if (e.data.action === "error") {
            setError(`Ошибка в воркере EPUB`);
            chrome.runtime.sendMessage({ action: "stopDownload" });
            downloadStopped = true;
        }
    };

    for (let page = startPage; page <= endPage; page++) {
        if (downloadStopped) break;
        let pageContent = await fetchPage(bookId, page, "epub");
        if (pageContent === undefined) {
            setError(`Ошибка при скачивании странцы`);
            chrome.runtime.sendMessage({action: "stopDownload" })
            return;
        } 
        worker.postMessage({ action: "addPageEPUB", text: pageContent });
    }

    if (!downloadStopped) {
        worker.postMessage({ action: "finalizeEPUB" });
    }
}

async function downloadPDF(startPage, endPage, bookTitle, bookId, totalPages, worker, processedPages) {
    const decryptionKey = getDecryptionKey();
    worker.postMessage({ action: "initPDF", bookTitle, wasmUrl: chrome.runtime.getURL("decryptSVG.wasm") });

    let downloadStopped = false;
    
    worker.onmessage = (e) => {
        if (e.data.action === "pageAdded") {
            processedPages++;
            updateProgress(Math.round((processedPages / totalPages) * 100));
        } else if (e.data.action === "done") {
            const blob = new Blob([e.data.buffer], { type: 'application/pdf' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${bookTitle}.pdf`;
            link.click();
            chrome.runtime.sendMessage({ action: "stopDownload" });
        } else if (e.data.action === "error") {
            setError(`Ошибка при скачивании странцы`);
            chrome.runtime.sendMessage({ action: "stopDownload" });
            downloadStopped = true;
        }
    };

    for (let page = startPage; page <= endPage; page++) {
        if (downloadStopped) break;
        let pageContent = await fetchPage(bookId, page, "pdf");
        if (pageContent === undefined) {
            setError(`Ошибка в воркере PDF`);
            chrome.runtime.sendMessage({action: "stopDownload" })
            return;
        } 
        worker.postMessage({
            action: "addPagePDF",
            svgData: pageContent,
            key: decryptionKey,
            pageNumber: page
        });
    }
    if (!downloadStopped) {
        worker.postMessage({ action: "finalizePDF" });
    }
}

async function startDownload(startPage, endPage, format) {
    const bookTitle = document.querySelector('p.book__name a')?.textContent.trim() || "Книга";
    const bookId = getBookIdFromURL();
    if (!bookId) {
        alert('Номер книги не найден в ссылке.');
        setError('Номер книги не найден в ссылке.');
        return;
    }
    const totalPages = endPage - startPage + 1;
    const worker = await createWorker();
    if (format === "epub") {
        await downloadEPUB(startPage, endPage, bookTitle, bookId, totalPages, worker, 0);
    } else {
        if (!document.querySelector('#render-ver')) {
            alert('Не найден ключ расшифровки.');
            setError('Не найден ключ расшифровки.');
            return;
        }
        await downloadPDF(startPage, endPage, bookTitle, bookId, totalPages, worker, 0);
    }
}

function updateProgress(percentage) {
    chrome.runtime.sendMessage({ action: 'updateProgress', percentage });
}

function getBookIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
}

function setError(text) {
    chrome.runtime.sendMessage({ action: 'setError', text });
}

window.startDownload = startDownload;
