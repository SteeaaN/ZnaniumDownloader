(function () {
    console.log('injected');
    window.addEventListener("message", (event) => {
        if (event.source !== window || event.data.action !== "getPage") return;
        try {
            let jwt = window.readercontrols.reader.reader.makeAuthorizationKey(event.data.pageNumber, true);
            let url;
            if (event.data.format === "epub") {
                url = `https://znanium.ru/read/page?doc=${event.data.bookId}&page=${event.data.pageNumber}&current=1&text=1&q=`;
            } else {
                url = `https://znanium.ru/read/page?doc=${event.data.bookId}&page=${event.data.pageNumber}&current=1&d=&t=svg`;
            }
            const b = function(response) {
                const xmlString = new XMLSerializer().serializeToString(response);
                window.postMessage({ action: "pageResponse", page: xmlString }, "*");
            };
            const k = function(jqXHR, textStatus, errorThrown) {
                window.postMessage({ action: "pageError", error: `Ошибка загрузки страницы ${event.data.pageNumber}: ${textStatus} - ${errorThrown}` }, "*");
            };
            $.ajax({
                method: "GET",
                dataType: "xml",
                url: url,
                async: true,
                crossDomain: true,
                xhrFields: { withCredentials: true },
                beforeSend: function (e) {
                    e.setRequestHeader("Authorization", "Bearer " + jwt);
                },
                success: b,
                error: k
            });
        } catch (error) {
            window.postMessage({ action: "pageError", error: error.message }, "*");
        }
    });
})();