document.getElementById('start-download').addEventListener('click', function () {
    const startPage = parseInt(document.getElementById('start-page').value);
    const endPage = parseInt(document.getElementById('end-page').value);
    resetProgress();
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: startDownloadFromContent,
                args: [startPage, endPage]
            });
            document.getElementById('progress-container').style.display = 'flex';
            document.getElementById('start-download').disabled = true;
	    document.getElementById('start-page').disabled = true;
    	    document.getElementById('end-page').disabled = true;
        });
    } catch(error) {
        console.error(error);
    }
});

function startDownloadFromContent(startPage, endPage) {
    if (typeof window.startDownload !== 'function') {
        alert("Перезагрузите страницу");
        chrome.runtime.sendMessage({ action: 'setError', text: "Перезагрузите страницу Знаниума" });
        return;
    }
    window.startDownload(startPage, endPage);
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

function resetProgress() {
    const progressCircle = document.getElementById('progress-ring-circle');
    progressCircle.style.strokeDashoffset = 408;
}

function setProgress(percentage, stage) {
    const progressCircle = document.getElementById('progress-ring-circle');
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
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

let isDataLoaded = false;
let totalPages;