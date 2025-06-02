// netlify/functions/get-dev-articles.js

// Netlify Functions 環境通常會自動提供 fetch API，類似於瀏覽器，所以不需要額外安裝 node-fetch
// 但如果你的 Node.js 環境較舊或有特殊配置，可能需要手動引入：
// const fetch = require('node-fetch'); // 如果你的環境需要，請取消這行註釋

exports.handler = async function (event, context) {
    // 從 Netlify 環境變數中獲取 Dev.to API Key。
    // 這個 Key 不會顯示在你的前端程式碼中，非常安全。
    const DEV_TO_API_KEY = process.env.DEV_TO_API_KEY;

    // 這是你的 Dev.to 用戶名
    const USERNAME = 'ian_chen_8bfda2699e7263dc';
    // 每頁獲取文章的數量
    const PER_PAGE = 10;

    // 檢查 API Key 是否已設定
    if (!DEV_TO_API_KEY) {
        console.error('DEV_TO_API_KEY environment variable is not set!');
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Server configuration error: Dev.to API Key is missing.' }),
        };
    }

    try {
        // 向 Dev.to API 發送請求，並在 headers 中包含 api-key
        // 這是在後端發送請求，所以不受瀏覽器 CORS 限制
        const response = await fetch(`https://dev.to/api/articles?username=${USERNAME}&per_page=${PER_PAGE}`, {
            method: 'GET',
            headers: {
                'api-key': DEV_TO_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        // 檢查 Dev.to API 的響應狀態碼
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error from Dev.to API: ${response.status} - ${errorText}`);
            return {
                statusCode: response.status,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: `Failed to fetch articles from Dev.to API. Status: ${response.status}.`,
                    details: errorText
                }),
            };
        }

        // 解析 Dev.to API 返回的 JSON 數據
        const articles = await response.json();

        // 將數據返回給前端瀏覽器
        return {
            statusCode: 200,
            headers: {
                // 這是最重要的 CORS 設定：允許你的前端頁面訪問這個函數。
                // '*' 表示允許所有來源，為了更安全，你可以改成你的 Netlify 網域或 GitHub Pages 網域。
                // 例如：'https://flourishing-monstera-16714f.netlify.app'
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET', // 允許 GET 請求
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(articles),
        };

    } catch (error) {
        // 捕獲任何網路或處理錯誤
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal Server Error. Could not process request.', details: error.message }),
        };
    }
};