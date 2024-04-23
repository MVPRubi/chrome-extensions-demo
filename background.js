const AK = 'HqKrfvSd1PNsObXPv8p7oF3Q';
const SK = 'kqUn1GvE4PQtEFjDGDb6m7dpXB2LhoLX';

const AUTH_BASE_URL = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials';
const CHAT_BASE_URL = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?';

const buildURL = (baseURL, params = {}) => {
    const url = new URLSearchParams(baseURL);
    for (const [k, v] of Object.entries(params)) {
        url.append(k, v);
    }

    return decodeURIComponent(url.toString());
}

const DEFAULT_CHAT_HEADERS = {
    'Content-Type': 'application/json'
}

const DEFAULT_CHAT_PARAMS = {
    temperature: 0.95,
    top_p: 0.8,
    penalty_score: 1,
    disable_search: false,
    enable_citation: false,
    response_format: "text"
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "genSummary") {
        fetch(buildURL(AUTH_BASE_URL, {
            client_id: AK,
            client_secret: SK,
        }), {
            method: 'POST',
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                fetch(buildURL(CHAT_BASE_URL, { access_token: data.access_token }), {
                    method: 'POST',
                    headers: DEFAULT_CHAT_HEADERS,
                    body: JSON.stringify({
                        "messages": [
                            {
                                "role": "user",
                                "content": `
                                    规则: 摘要尽量不超过 300 字
                                    按规则总结下文摘要:
                                    ${request.data.articleContent}
                                `
                            },
                        ],
                        ...DEFAULT_CHAT_PARAMS,
                    })
                }).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    const { error_code, error_msg, result } = data || {};
                    if (error_code) {
                        sendResponse({ success: false, error: error_msg });
                    } else {
                        sendResponse({ success: true, data: result });
                    }
                })
            })
            .catch(function (error) {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
});

