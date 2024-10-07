chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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
    }
});