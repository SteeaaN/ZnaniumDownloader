document.getElementById('start-download').addEventListener('click', function () {
    const format = document.querySelector('input[name="format-selector"]:checked').value;
    const startPage = parseInt(document.getElementById('start-page').value);
    const endPage = parseInt(document.getElementById('end-page').value);
    resetProgress();
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: startDownloadFromContent,
                args: [startPage, endPage, format]
            });
            document.getElementById('progress-container').style.display = 'flex';
            document.getElementById('start-download').disabled = true;
            document.getElementById('start-page').disabled = true;
            document.getElementById('end-page').disabled = true;
        });
    } catch (error) {
        console.error(error);
    }
});

function startDownloadFromContent(startPage, endPage, format) {
    if (typeof window.startDownload !== 'function') {
        alert("Перезагрузите страницу");
        chrome.runtime.sendMessage({ action: 'setError', text: "Перезагрузите страницу Знаниума" });
        return;
    }
    chrome.runtime.sendMessage({ action: "startDownload" });
    window.startDownload(startPage, endPage, format);
}

chrome.runtime.onMessage.addListener(function(request) {
    if (request.action === 'updateProgress') {
        const progress = request.percentage;
        const stage = request.stage;
        setProgress(progress, stage);
        if (progress >= 100 && stage === 2) {
            document.getElementById('progress-text').textContent = 'Загрузка завершена';
            document.getElementById('start-download').disabled = false;
            document.getElementById('start-page').disabled = false;
            document.getElementById('end-page').disabled = false;
        }
    } else if (request.action === 'setError') {
        document.getElementById('progress-ring').style.display = 'none';
        document.getElementById('progress-text').style.width = '200%';
        document.getElementById('progress-text').textContent = request.text;
    }
});

window.onload = function () {
    chrome.storage.local.get(['format'], function(data) {
        if (data.format !== undefined) {
            document.querySelector(`input[name="format-selector"][value="${data.format}"]`).checked = true;
        }
    });

    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: getLastPageNumber,
            }, (results) => {
                totalPages = results[0].result;
                document.getElementById('end-page').value = totalPages;
                document.getElementById('end-page').setAttribute('max', totalPages);
            });

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: checkEpubAvailability,
            }, (results) => {
                const epubAvailable = results[0].result;
                const epubOption = document.querySelector(`input[name="format-selector"][value="epub"]`);
                const pdfOption = document.querySelector(`input[name="format-selector"][value="pdf"]`);
                
                if (!epubAvailable) {
                    epubOption.disabled = true;
                    pdfOption.checked = true;
                } else {
                    epubOption.disabled = false;
                }
            });

        });
    } catch (error) {
        console.error(error)
    }
    isDataLoaded = true;
};

function getLastPageNumber() {
    const lastPageElement = document.querySelector('.dark-text.number-all-page');
    return lastPageElement ? parseInt(lastPageElement.textContent) : 1;
}

function checkEpubAvailability() {
    return document.querySelector('div[data-open-modal="text"]') !== null;
}

function resetProgress() {
    const progressCircle = document.getElementById('progress-ring-circle');
    progressCircle.style.strokeDashoffset = 408;
}

function setProgress(percentage, stage) {
    const progressCircle = document.getElementById('progress-ring-circle');
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
    document.getElementById('progress-text').innerHTML = `${percentage}%<br>${stage}/2`;
}

function validatePageRange() {
    if (!isDataLoaded) return;
    const startPage = parseInt(document.getElementById('start-page').value);
    const endPage = parseInt(document.getElementById('end-page').value);
    let isValid = true;

    if (isNaN(startPage) || startPage < 1 || startPage > totalPages || startPage > endPage) {
        isValid = false;
        document.getElementById('start-page').style.borderColor = 'red';
    } else {
        document.getElementById('start-page').style.borderColor = '';
    }

    if (isNaN(endPage) || endPage < 1 || endPage > totalPages) {
        isValid = false;
        document.getElementById('end-page').style.borderColor = 'red';
    } else {
        document.getElementById('end-page').style.borderColor = '';
    }
    document.getElementById('start-download').disabled = !isValid;
}

document.getElementById('start-page').addEventListener('input', validatePageRange);
document.getElementById('end-page').addEventListener('input', validatePageRange);
document.querySelectorAll('input[name="format-selector"]').forEach((radio) => {
    radio.addEventListener('change', function() {
        if (this.checked) {
            chrome.storage.local.set({ format: this.value });
        }
    });
});

const container = document.querySelector('.container');
const themeSwitch = document.getElementById('theme-switch');

chrome.storage.local.get(['theme'], (data) => {
  if (data.theme === 'dark') {
    container.classList.add('dark-theme');
    document.body.classList.add('dark');
    themeSwitch.checked = true;
  }
});

themeSwitch.addEventListener('change', () => {
  if (themeSwitch.checked) {
    container.classList.add('dark-theme');
    document.body.classList.add('dark');
    chrome.storage.local.set({ theme: 'dark' });
  } else {
    container.classList.remove('dark-theme');
    document.body.classList.remove('dark');
    chrome.storage.local.set({ theme: 'light' });
  }
});

let isDataLoaded = false;
let totalPages;
