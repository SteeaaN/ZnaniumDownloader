(function () {
    console.log('injected')
    let firstReadAction = null;
    let offset = 0;
    const originalGet = IDBObjectStore.prototype.get;
    IDBObjectStore.prototype.get = function (...args) {
        if (firstReadAction === null) {
            firstReadAction = { type: 'get', args };
            offset = parseInt(args[0].split(':')[1], 10) - 1
        }
        return originalGet.apply(this, args);
    };
    function checkPageAndOffset() {
        const interval = setInterval(() => {
            if (document.readyState === 'complete' && offset !== null) {
                clearInterval(interval);
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.id = 'hiddenData';
                hiddenInput.value = offset;
                document.body.appendChild(hiddenInput);
            }
        }, 100);
    }
    checkPageAndOffset();
})();