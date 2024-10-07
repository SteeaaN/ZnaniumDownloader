document.getElementById('compression').addEventListener('input', function() {
    document.getElementById('quality-value').textContent = this.value + '%';
});

document.getElementById('start-download').addEventListener('click', function () {
    const compression = parseFloat(document.getElementById('compression').value) / 100;
    const deleteOption = document.querySelector('input[name="delete-option"]:checked').value;
    const startPage = parseInt(document.getElementById('start-page').value);
    let endPage = parseInt(document.getElementById('end-page').value);

    const totalPagesElement = document.querySelector('p.number-all-page');
    const totalPages = totalPagesElement ? parseInt(totalPagesElement.textContent) : 0;

    if (isNaN(endPage) || endPage < startPage) {
        endPage = totalPages;
    }

    resetProgress();
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: startDownloadFromContent,
                args: [compression, deleteOption, startPage, endPage]
            });
            document.getElementById('progress-container').style.display = 'flex';
            document.getElementById('start-download').disabled = true;
        });
    } catch(error) {
        console.error(error);
    }
});

function startDownloadFromContent(compression, deleteOption, startPage, endPage) {
    if (typeof window.startDownload !== 'function') {
        alert("Перезагрузите страницу.");
        return;
    }

    if (deleteOption === 'range') {
        window.startDownload(compression, 2, startPage, endPage);
    } else if (deleteOption === 'all') {
        window.startDownload(compression, 1, startPage, endPage);
    } else {
        window.startDownload(compression, 0, startPage, endPage);
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateProgress') {
        const progress = request.percentage;
        const stage = request.stage
        setProgress(progress, stage);
        if (progress >= 100 && stage !== 1) {
            document.getElementById('progress-text').textContent = 'Загрузка завершена';
            document.getElementById('start-download').disabled = false;
        }   
    }
});

window.onload = function() {
    chrome.storage.local.get(['compression', 'deleteOption'], function(data) {
        if (data.compression !== undefined) {
            document.getElementById('compression').value = data.compression * 100;
            document.getElementById('quality-value').textContent = data.compression * 100 + '%';
        }
        if (data.deleteOption !== undefined) {
            const selectedRadio = document.querySelector(`input[name="delete-option"][value="${data.deleteOption}"]`);
            if (selectedRadio) {
                selectedRadio.checked = true;
            }
        } else {
            document.getElementById('delete-none').checked = true;
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

                isDataLoaded = true;
                validatePageRange();
            });
        });
    } catch(error) {
        console.error(error)
    }
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

let isDataLoaded = false;

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
document.getElementById('compression').addEventListener('change', function() {
  chrome.storage.local.set({ compression: parseFloat(this.value) / 100 });
});
document.querySelectorAll('input[name="delete-option"]').forEach((radio) => {
    radio.addEventListener('change', function() {
        if (this.checked) {
            chrome.storage.local.set({ deleteOption: this.value });
        }
    });
});