let isDataLoaded = false;
let totalPages;
let ongoingDownloadState = null;

const startButton = document.getElementById('start-download');
const startPageInput = document.getElementById('start-page');
const endPageInput = document.getElementById('end-page');
const progressContainer = document.getElementById('progress-container');
const progressText = document.getElementById('progress-text');
const formatRadios = Array.from(document.querySelectorAll('input[name="format-selector"]'));
const formatSelectorContainer = document.getElementById('format-selector-container');
let isFormatLocked = false;

startButton.disabled = true;

const CHECK_INTERVAL = 60 * 60 * 1000;
const GITHUB_API_URL = 'https://api.github.com/repos/SteeaaN/ZnaniumDownloader/releases/latest';
const RELEASE_URL = 'https://github.com/SteeaaN/ZnaniumDownloader/releases/latest';

function parseProgressFromBadge(badgeText, fallback = 0) {
    if (typeof badgeText !== 'string') {
        return fallback;
    }
    const numeric = parseInt(badgeText.replace(/\D/g, ''), 10);
    return Number.isNaN(numeric) ? fallback : numeric;
}

function setFormatDownloadLock(isLocked) {
    isFormatLocked = !!isLocked;
    if (formatSelectorContainer) {
        formatSelectorContainer.classList.toggle('format-locked', isFormatLocked);
    }
}

function preventFormatInteractionWhenLocked(event) {
    if (!isFormatLocked) return;
    event.preventDefault();
    event.stopImmediatePropagation();
}

['click', 'keydown'].forEach((eventName) => {
    formatRadios.forEach((radio) => {
        radio.addEventListener(eventName, preventFormatInteractionWhenLocked, true);
    });
});

function applyOngoingDownloadState(state) {
    if (!state?.isDownloading) return;

    ongoingDownloadState = state;

    if (typeof state.startPage === 'number') {
        startPageInput.value = state.startPage;
    }
    if (typeof state.endPage === 'number') {
        endPageInput.value = state.endPage;
    }
    if (state.format) {
        const formatRadio = document.querySelector(`input[name="format-selector"][value="${state.format}"]`);
        if (formatRadio) {
            formatRadio.checked = true;
        }
    }

    startButton.disabled = true;
    startPageInput.disabled = true;
    endPageInput.disabled = true;
    progressContainer.style.display = 'flex';
    progressText.style.width = '';
    setFormatDownloadLock(true);

    const progressValue = parseProgressFromBadge(state.badgeText, state.lastProgress ?? 0);
    setProgress(progressValue);
}

function resetOngoingDownloadState() {
    ongoingDownloadState = null;
    progressContainer.style.display = 'none';
    startPageInput.disabled = false;
    endPageInput.disabled = false;
    setFormatDownloadLock(false);
    resetProgress();
    progressText.style.width = '';
    progressText.textContent = '0%';
    if (isDataLoaded) {
        validatePageRange();
    } else {
        startButton.disabled = false;
    }
}

function getCurrentDownloadState() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getCurrentDownloadState' }, (response) => {
            if (chrome.runtime.lastError) {
                resolve(null);
                return;
            }
            resolve(response || { isDownloading: false });
        });
    });
}

async function hydrateOngoingDownloadState(stateOverride) {
    const state = stateOverride ?? await getCurrentDownloadState();
    if (state === null) {
        return;
    }
    if (state?.isDownloading) {
        applyOngoingDownloadState(state);
    } else {
        resetOngoingDownloadState();
    }
}

function attemptStartDownload(tabId, startPage, endPage, format) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            action: 'attemptStartDownload',
            tabId,
            startPage,
            endPage,
            format
        }, (response) => {
            if (chrome.runtime.lastError) {
                resolve({ success: false, reason: 'runtime_error' });
                return;
            }
            resolve(response || { success: false });
        });
    });
}

document.getElementById('start-download').addEventListener('click', async function () {
    const format = document.querySelector('input[name="format-selector"]:checked').value;
    const startPage = parseInt(document.getElementById('start-page').value);
    const endPage = parseInt(document.getElementById('end-page').value);
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
            const targetTabId = tabs[0]?.id;
            if (typeof targetTabId !== 'number') {
                console.error('Tab Id не найден');
                return;
            }

            const attemptResult = await attemptStartDownload(targetTabId, startPage, endPage, format);
            if (!attemptResult?.success) {
                await hydrateOngoingDownloadState();
                alert('Уже выполняется другая загрузка. Дождитесь завершения.');
                return;
            }

            resetProgress();
            chrome.scripting.executeScript({
                target: { tabId: targetTabId },
                func: startDownloadFromContent,
                args: [startPage, endPage, format]
            });
            progressContainer.style.display = 'flex';
            startButton.disabled = true;
            startPageInput.disabled = true;
            endPageInput.disabled = true;
            setFormatDownloadLock(true);
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
    chrome.runtime.sendMessage({ action: "startDownload", startPage, endPage, format });
    window.startDownload(startPage, endPage, format);
}

chrome.runtime.onMessage.addListener(function(request) {
    if (request.action === 'updateProgress') {
        const progress = request.percentage;
        setProgress(progress);
        if (progress >= 100) {
            ongoingDownloadState = null;
            progressText.textContent = 'Загрузка завершена';
            document.getElementById('start-download').disabled = false;
            document.getElementById('start-page').disabled = false;
            document.getElementById('end-page').disabled = false;
            setFormatDownloadLock(false);
        }
    } else if (request.action === 'setError') {
        ongoingDownloadState = null;
        document.getElementById('progress-ring').style.display = 'none';
        progressText.style.width = '200%';
        progressText.textContent = request.text;
        setFormatDownloadLock(false);
    }
});

window.onload = async function () {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !isZnaniumReader(tab.url)) {
        document.body.innerHTML = `
        <div style="padding:12px;font-family:sans-serif;">
            Расширение работает только в читалке Знаниума:
            <br><code>https://znanium.ru/read?id=...</code>
        </div>`;
        return;
    }

    await hydrateOngoingDownloadState();

    chrome.storage.local.get(['format'], function(data) {
        if (ongoingDownloadState) return;
        if (data.format !== undefined) {
            document.querySelector(`input[name="format-selector"][value="${data.format}"]`).checked = true;
        }
    });

    try {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getLastPageNumber,
        }, (results) => {
            const lastPage = results?.[0]?.result ?? 1;
            totalPages = lastPage;
            if (!ongoingDownloadState) {
                document.getElementById('end-page').value = totalPages;
            }
            document.getElementById('end-page').setAttribute('max', totalPages);
            validatePageRange();
        });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: checkEpubAvailability,
        }, (results) => {
            const epubAvailable = results?.[0]?.result;
            const epubOption = document.querySelector(`input[name="format-selector"][value="epub"]`);
            const pdfOption = document.querySelector(`input[name="format-selector"][value="pdf"]`);
            
            if (!epubAvailable) {
                epubOption.disabled = true;
                pdfOption.checked = true;
            } else {
                epubOption.disabled = false;
            }
        });
    } catch (error) {
        console.error(error)
    }
    isDataLoaded = true;
};

function isZnaniumReader(url) {
  try {
    const u = new URL(url);
    return (
      u.hostname === 'znanium.ru' &&
      u.pathname === '/read' &&
      u.searchParams.has('id')
    );
  } catch {
    return false;
  }
}

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

function setProgress(percentage) {
    const progressCircle = document.getElementById('progress-ring-circle');
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
    progressText.innerHTML = `${percentage}%`;
}

function validatePageRange() {
    if (!isDataLoaded) return;
    if (ongoingDownloadState) {
        startButton.disabled = true;
        return;
    }
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

document.addEventListener('DOMContentLoaded', () => {
    const updateWrapper = document.querySelector('.update-indicator-wrapper');
    const updateIndicator = updateWrapper?.querySelector('#update-indicator');
    if (!updateIndicator) return;

    const attachClick = () => {
        if (updateIndicator.dataset.clickBound) return;
        updateIndicator.dataset.clickBound = '1';

        updateIndicator.addEventListener('click', () => {
            if (chrome?.tabs) {
                chrome.tabs.create({ url: RELEASE_URL });
            } else {
                window.open(RELEASE_URL, '_blank');
            }
        });
    };

    const renderIndicator = (hasUpdate) => {
        if (hasUpdate) {
            updateWrapper.classList.add('visible');
            updateIndicator.title = 'Доступна новая версия расширения, нажмите чтобы перейти';
            attachClick();
        } else {
            updateWrapper.classList.remove('visible');
        }
    };

    (async () => {
        const manifest = chrome.runtime.getManifest();
        const currentVersion = manifest.version;

        chrome.storage.local.get(
            ['lastUpdateCheck', 'hasUpdate', 'manifestVersion'],
            async (data) => {
                const now = Date.now();
                const lastCheck = data.lastUpdateCheck || 0;
                const cachedHasUpdate = typeof data.hasUpdate === 'boolean' ? data.hasUpdate : null;
                const storedVersion = data.manifestVersion;

                const versionChanged = storedVersion && storedVersion !== currentVersion;

                chrome.storage.local.set({ manifestVersion: currentVersion });

                if (versionChanged) {
                    try {
                        const hasUpdate = await checkForUpdate();
                        chrome.storage.local.set({
                            lastUpdateCheck: Date.now(),
                            hasUpdate
                        });
                        renderIndicator(hasUpdate);
                    } catch (e) {
                        console.error('Ошибка при проверке обновлений после смены версии:', e);
                        renderIndicator(false);
                    }
                    return;
                }

                if (cachedHasUpdate !== null && (now - lastCheck) < CHECK_INTERVAL) {
                    renderIndicator(cachedHasUpdate);
                    return;
                }

                try {
                    const hasUpdate = await checkForUpdate();
                    chrome.storage.local.set({
                        lastUpdateCheck: Date.now(),
                        hasUpdate
                    });
                    renderIndicator(hasUpdate);
                } catch (e) {
                    console.error('Ошибка при проверке обновлений:', e);
                    renderIndicator(false);
                }
            }
        );
    })();
});

async function checkForUpdate() {
    console.log('123')
    const manifest = chrome.runtime.getManifest();
    const currentVersion = manifest.version;
  
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error('GitHub API error: ' + response.status);
  
    const data = await response.json();
    const latestVersion = (data.tag_name || '').slice(1).trim();
  
    return isNewerVersion(latestVersion, currentVersion);
}

function isNewerVersion(latest, current) {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);
    const len = Math.max(latestParts.length, currentParts.length);
  
    for (let i = 0; i < len; i++) {
        const l = latestParts[i] || 0;
        const c = currentParts[i] || 0;
        if (l > c) return true;
        if (l < c) return false;
    }
    return false;
}
