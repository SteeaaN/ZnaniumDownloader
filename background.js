async function requestWakeLock() {
    try {
        chrome.power.requestKeepAwake("system");
        chrome.power.requestKeepAwake("display");
    } catch (err) {
        console.log("[Chrome Power] Ошибка:", err);
    }
}

async function releaseWakeLock() {
    try {
        chrome.power.releaseKeepAwake();
    } catch (err) {
        console.log("[Chrome Power] Ошибка:", err);
    }
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action === "updateProgress") {
        if (request.percentage < 100) {
            chrome.action.setBadgeText({
                text: request.percentage + "%",
                tabId: sender.tab.id
            });
        } else {
            chrome.action.setBadgeText({
                text: "",
                tabId: sender.tab.id
            });
        }
        return;
    }
    if (request.action === "startDownload") {
        requestWakeLock();
    }
    if (request.action === "stopDownload") {
        releaseWakeLock();
    }
});
