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

async function startDownload(compressionQuality, deleteRecords, startPage, endPage) {
    const offset = document.getElementById('hiddenData').value;
    await loadPDFKit();
    const blobStream = await loadBlobStream();
    const bookNumber = getBookIdFromURL();
    if (!bookNumber) {
        alert('Номер книги не найден в ссылке.');
        setError('Номер книги не найден в ссылке.')
        return;
    }
    let request = indexedDB.open('reader2viewer');
    request.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['page'], 'readonly');
        let objectStore = transaction.objectStore('page');
        let cursorRequest = objectStore.openCursor();
        const pagesData = [];
        let totalProcessedPages = 0;
        let totalExpectedPages = endPage - startPage + 1;
        cursorRequest.onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                let key = cursor.key;
                let record = cursor.value;
                let pageNumber = parseInt(key.split(':')[1], 10) - offset;
                if (key.startsWith(`${bookNumber}:`) && (pageNumber >= startPage && pageNumber <= endPage)) {
                    pagesData.push({ pageNumber, slices: record.slices});
                    totalProcessedPages++;
                    const progressPercentage = Math.round(((totalProcessedPages) / totalExpectedPages) * 100);
                    updateProgress(progressPercentage, 1);
                }
                cursor.continue();
            } else {
                if (totalProcessedPages < totalExpectedPages) {
                    updateProgress()
                    alert('Некоторые страницы книги не загружены. Перезагрузите страницу или попробуйте скачать книгу заново');
                    setError('Некоторые страницы книги не загружены. Перезагрузите страницу или попробуйте скачать книгу заново')
                    return;
                }
                pagesData.sort((a, b) => a.pageNumber - b.pageNumber);
                processPages(pagesData, db, bookNumber, blobStream, offset, [compressionQuality, startPage, endPage, deleteRecords]);
            }
        };
        cursorRequest.onerror = function() {
            console.log('Error opening cursor:', cursorRequest.error);
            updateProgress()
            alert('Ошибка при работе с базой данных')
            setError('Ошибка при работе с базой данных')
        };
    };
}

async function processPages(pagesData, db, bookNumber, blobStream, offset, settings) {
    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = doc.pipe(blobStream());
    try {
        for (let i = 0; i < pagesData.length; i++) {
            const pageData = pagesData[i];
            const { slices } = pageData;
            if (slices.length > 0) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const validSlices = slices.filter(slice => slice !== null);
                const firstImg = await loadImage(validSlices[0]);
                canvas.width = firstImg.width;
                let totalHeight = 0;
                const sliceHeights = [];
                for (const slice of validSlices) {
                    const img = await loadImage(slice);
                    totalHeight += img.height;
                    sliceHeights.push(img.height);
                }
                canvas.height = totalHeight;
                let y = 0;
                for (let j = 0; j < validSlices.length; j++) {
                    const img = await loadImage(validSlices[j]);
                    ctx.drawImage(img, 0, y);
                    y += sliceHeights[j];
                }
                let imgData = canvas.toDataURL('image/jpeg', settings[0]);
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                doc.addPage({ size: [imgWidth, imgHeight] });
                doc.image(imgData, 0, 0, { width: imgWidth, height: imgHeight });
              }
              const progressPercentage = Math.round(((i + 1) / pagesData.length) * 100);
            updateProgress(progressPercentage, 2);
        }
    } catch (saveError) {
        updateProgress()
        alert('Произошла ошибка при сохранении PDF-файла. Попробуйте уменьшить качество');
        setError('Произошла ошибка при сохранении PDF-файла. Попробуйте уменьшить качество');
        console.error(saveError);
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
    if (settings[3] === 1) {
        deleteBookRecords(db, bookNumber);
    } else if (settings[3] === 2) {
        deleteBookRecords(db, bookNumber, settings[1], settings[2], offset);
    }
}

function deleteBookRecords(db, bookNumber, startPage, endPage, offset){
    let transaction = db.transaction(['page'], 'readwrite');
    let objectStore = transaction.objectStore('page');
    let cursorRequest = objectStore.openCursor();
    cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let key = cursor.key;
            let status = false
            if (bookNumber !== undefined && startPage !== undefined && offset !== undefined) {
                let pageNumber = parseInt(key.split(':')[1], 10) - offset;
                status = pageNumber >= startPage && pageNumber <= endPage
            } else {
                status = true
            }
            if (key.startsWith(`${bookNumber}:`) && status) {
                objectStore.delete(key).onsuccess = function () {
                    console.log(`Record ${key} deleted.`);
                };
            }
            cursor.continue()
        }
        cursorRequest.onerror = function () {
            console.log(cursorRequest.error);
            alert('Ошибка при удалении книги');
            setError('Ошибка при удалении книги')
        };
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('loadImage'));
    });
}

function getBookIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function updateProgress(percentage, stage) {
    chrome.runtime.sendMessage({ action: 'updateProgress', percentage, stage });
}

function setError(text) {
    chrome.runtime.sendMessage({ action: 'setError', text})
}

window.startDownload = startDownload;
