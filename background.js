chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchArsenalMatches" ||
        request.action === "fetchArsenalStats" ||
        request.action === "fetchArsenalPlayers" ||
        request.action === "fetchF1Races") {

        fetch(request.url, {
            headers: { 'x-apisports-key': request.apiKey }
        })
            .then(response => response.json())
            .then(data => sendResponse({ data: data }))
            .catch(error => sendResponse({ error: error.message }));

        return true;  // Indicates we wish to send a response asynchronously
    }
});