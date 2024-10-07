function loadJSPDF() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('libs/jspdf.min.js');
    script.onload = () => resolve(window.jsPDF);
    script.onerror = () => reject(new Error('Ошибка загрузки jsPDF'));
    document.body.appendChild(script);
  });
}

async function startDownload(compressionQuality, deleteRecords, startPage, endPage) {
  const jsPDF = await loadJSPDF();
  const bookNumber = getBookIdFromURL();
  if (!bookNumber) {
    console.error('Book ID not found in URL');
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
        let pageNumber = parseInt(key.split(':')[1], 10) - 1;
        if (key.startsWith(`${bookNumber}:`) && pageNumber >= startPage && pageNumber <= endPage) {
          pagesData.push({ pageNumber, slices: record.slices, key });
          totalProcessedPages++;
        }
        cursor.continue();
      } else {
        if (totalProcessedPages < totalExpectedPages) {
          alert('Некоторые страницы книги не загружены. Загрузите их или перезагрузите страницу.');
          return;
        }
        pagesData.sort((a, b) => a.pageNumber - b.pageNumber);
        processPages(pagesData, compressionQuality, deleteRecords, db, bookNumber);
      }
    };

    cursorRequest.onerror = function() {
      console.log(cursorRequest.error);
    };
  };
  async function processPages(pagesData, compressionQuality, deleteRecords, db, bookNumber) {
    const pdf = new jsPDF();
    for (let i = 0; i < pagesData.length; i++) {
      const pageData = pagesData[i];
      const { slices, pageNumber, key } = pageData;
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
        let imgData = canvas.toDataURL('image/jpeg', compressionQuality);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, canvas.height * (210 / canvas.width));
      }
      const progressPercentage = Math.round(((i + 1) / pagesData.length) * 100);
      updateProgress(progressPercentage);
    }
    pdf.save(`${bookNumber}.pdf`);
    if (deleteRecords === 1) {
      deleteAllBookRecords(db, bookNumber);
    } else if (deleteRecords === 2) {
      deleteRangeRecords(db, bookNumber, startPage, endPage);
    }
  }
  function deleteAllBookRecords(db, bookNumber) {
    let transaction = db.transaction(['page'], 'readwrite');
    let objectStore = transaction.objectStore('page');
    let cursorRequest = objectStore.openCursor();
    cursorRequest.onsuccess = function(event) {
      let cursor = event.target.result;
      if (cursor) {
        let key = cursor.key;
        if (key.startsWith(`${bookNumber}:`)) {
          objectStore.delete(key).onsuccess = function() {
            console.log(`Record ${key} deleted.`);
          };
        }
        cursor.continue();
      }
    };
    cursorRequest.onerror = function() {
      console.log(cursorRequest.error);
    };
  }
  function deleteRangeRecords(db, bookNumber, startPage, endPage) {
    let transaction = db.transaction(['page'], 'readwrite');
    let objectStore = transaction.objectStore('page');
    let cursorRequest = objectStore.openCursor();
    cursorRequest.onsuccess = function(event) {
      let cursor = event.target.result;
      if (cursor) {
        let key = cursor.key;
        let pageNumber = parseInt(key.split(':')[1], 10) - 1;
        if (key.startsWith(`${bookNumber}:`) && pageNumber >= startPage && pageNumber <= endPage) {
          objectStore.delete(key).onsuccess = function() {
            console.log(`Record ${key} deleted.`);
          };
        }
        cursor.continue();
      }
    };
    cursorRequest.onerror = function() {
      console.log('Error opening cursor for deletion:', cursorRequest.error);
    };
  }
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load error'));
    });
  }
}

function getBookIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function updateProgress(percentage) {
  chrome.runtime.sendMessage({ action: 'updateProgress', percentage });
}

window.startDownload = startDownload;