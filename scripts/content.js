const text = document.getElementById("img-content")?.innerText || document.body.innerText;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.actionType === "summary") {
        summaryPage(sendResponse);
        return true;
    }
})

function summaryPage(cb) {
    chrome.runtime.sendMessage({
        action: "genSummary",
        data: {
            articleContent: text,
        }
    }, function (response) {
        cb?.(response);
    });
}
