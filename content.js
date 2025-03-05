function loadPDFKit() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('libs/pdfkit.standalone.js');
        script.onload = () => resolve(window.PDFDocument);
        script.onerror = () => reject(new Error('Ошибка загрузки PDFKit'));
        document.body.appendChild(script);
    });
}

function loadBlobStream() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('libs/blob-stream.min.js');
        script.onload = () => resolve(window.blobStream);
        script.onerror = () => reject(new Error('Ошибка загрузки blobStream'));
        document.body.appendChild(script);
    });
}

function getDecryptionKey() {
    const renderVerInput = document.querySelector('#render-ver');
    return renderVerInput.value.split(':')[0];
}

async function requestPage(pageNumber, bookId) {
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
    	    bookId: bookId
        }, "*");
    });
}

function decryptSVG(encryptedSVG, crkey) {
    let digitOrd = { 0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57 };
    let digitChr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let key = Array.from(crkey).map(c => c.charCodeAt(0)).join("");
    let e = key.length, h = 0, decrypted = "", startDecrypt = false;
    for (let g = 0; g < encryptedSVG.length; g++) {
        if (encryptedSVG[g] in digitOrd && startDecrypt) {
            let r = parseInt(encryptedSVG[g], 10) - parseInt(key[h], 10);
            if (r < 0) r += 10;
            decrypted += digitChr[r];
            h = (h + 1) % e;
        } else {
            decrypted += encryptedSVG[g];
            if (encryptedSVG[g] === ">") startDecrypt = true;
        }
    }
    return decrypted;
}

async function fetchPage(bookId, pageNumber) {
    let attempts = 0;
    const maxAttempts = 25;

    while (attempts < maxAttempts) {
        try {
            let page = await requestPage(pageNumber, bookId);
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(page, "text/xml");
            let bookpageElement = xmlDoc.querySelector("bookpage");

            if (!bookpageElement || !bookpageElement.textContent.trim()) {
                throw new Error("SVG не найден");
            }

            let rawSVG = bookpageElement.textContent.trim();
            return rawSVG;
        } catch (error) {
            console.log(`Ошибка при загрузке страницы ${pageNumber}, попытка ${attempts + 1}/${maxAttempts}:`, error);
            attempts++;
            if (attempts >= maxAttempts) {
		alert(`Не удалось загрузить страницу ${pageNumber} после ${maxAttempts} попыток`);
        	setError(`Не удалось загрузить страницу ${pageNumber} после ${maxAttempts} попыток`);
            }
            await new Promise(resolve => setTimeout(resolve, 2500));
        }
    }
}

async function startDownload(startPage, endPage) {
    await loadPDFKit();
    const blobStream = await loadBlobStream();
    const bookNumber = getBookIdFromURL();
    if (!bookNumber) {
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
            let pageData = await fetchPage(bookNumber, page);
            pagesData.push({
                pageNumber: page,
                svgData: pageData,
                key: decryptionKey
            });
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
	    return
        }
    }

    processPages(pagesData, bookNumber, blobStream);
}

async function processPages(pagesData, bookNumber, blobStream) {
    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = doc.pipe(blobStream());
    let totalPages = pagesData.length;
    let processedPages = 0;
    try {
        for (let i = 0; i < pagesData.length; i++) {
            const { svgData, key, pageNumber } = pagesData[i];
            let decryptedSVG = decryptSVG(svgData, key);
            let tempDiv = document.createElement("div");
            tempDiv.innerHTML = decryptedSVG.trim();
            let svgElement = tempDiv.firstChild;
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
        const book_name = document.querySelector('p.book__name a').textContent;
        link.download = `${book_name}.pdf`;
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