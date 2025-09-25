function injectScript(filePath) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(filePath);
    (document.head || document.documentElement).appendChild(script);
    script.onload = function () {
        script.remove();
    };
}

injectScript('inject.js');