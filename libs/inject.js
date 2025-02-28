(function () {
    console.log('injected');

    window.addEventListener("message", (event) => {
        if (event.source !== window || event.data.action !== "getJwt") return;

        try {
            let jwt = window.readercontrols?.reader?.reader?.makeAuthorizationKey(event.data.pageNumber, 0);
            if (jwt) {
                window.postMessage({ action: "jwtResponse", jwt }, "*");
            } else {
                window.postMessage({ action: "jwtError", error: "makeAuthorizationKey вернул null" }, "*");
            }
        } catch (error) {
            window.postMessage({ action: "jwtError", error: error.message }, "*");
        }
    });
})();