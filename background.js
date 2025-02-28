chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'updateProgress') {
        if (request.percentage < 100) {
            chrome.action.setBadgeText({
                text: request.percentage + '%',
                tabId: sender.tab.id
            });
        } else {
            chrome.action.setBadgeText({
                text: '',
                tabId: sender.tab.id
            });
        }
        return;
    }

    if (request.action === "fetchPage") {
        const url = `https://znanium.ru/read/page?doc=${request.bookId}&page=${request.pageNumber}&current=${request.pageNumber}&d=&t=svg`;
        fetch(url, {
            method: "GET",
            headers: { "Authorization": `Bearer ${request.jwt}` }
        })
        .then(response => response.text())
        .then(text => {
            sendResponse({ success: true, data: text });
        })
        .catch(error => {
            sendResponse({ success: false, error: error.message });
        });

        return true;
    }
})