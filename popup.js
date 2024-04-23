const summaryButton = document.getElementById('summaryButton');
const content = document.getElementById('content');

let isSummary = false;
let cacheKey = '';

async function genCacheKey() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    cacheKey = tab.url + '__summary';
}


async function showCacheData() {
    chrome.storage.session.get(cacheKey).then((result) => {
        if (result[cacheKey]) {
            content.innerText = result[cacheKey];
        }
    });
}

async function init() {
    await genCacheKey();
    await showCacheData();
}

init();

if (summaryButton) {
    summaryButton.addEventListener('click', () => {
        summaryButton.disabled = true;
        summaryButton.innerText = '提取中...';
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            let message = {
                actionType: 'summary'
            }
            chrome.tabs.sendMessage(tabs[0].id, message, res => {
                const { success, data, error } = res || {};
                summaryButton.disabled = false;
                summaryButton.innerText = '提取摘要';
                if (success) {
                    content.innerText = data;
                    chrome.storage.session.set({
                        [cacheKey]: data,
                    });
                } else {
                    content.innerText = error ? `Oops,出错了,${error}` : 'Oops,出错了,请确认当前页面是微信公众号网页';
                }
            })
        })
    });
}