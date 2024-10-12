// 函数用于执行重定向，解决waline评论区数据不一致问题，解决百度、Bing跳转链接带index.html的问题
function redirectToNewUrl() {
    const currentUrl = window.location.href;  // 获取当前 URL
    // 正则表达式匹配 /p/xxxxx/index.html
    const indexPagePattern1 = /\/p\/([a-fA-F0-9]*?)\/index\.html(#[^"]+)?$/;
    // 正则表达式匹配 /p/xxxxx
    const indexPagePattern2 = /\/p\/([a-fA-F0-9]*?)(#[^"]+)?$/;

    // 检查 URL 是否符合模式
    const match1 = currentUrl.match(indexPagePattern1);
    const match2 = currentUrl.match(indexPagePattern2);
    if (match1||match2) {
        const match = match1 === undefined ? match2  :match1;

        // 提取 xxxxx 部分
        const dynamicPart = match[1];
        // 获取基础 URL
        const baseUrl = window.location.origin + '/p/';

        // 构建新的 URL
        let newUrl = baseUrl + dynamicPart + '/';

        const hashtagPart = match[2];
        // hashtagPart 里面的内容补充
        if(hashtagPart!==undefined){
            newUrl = newUrl + hashtagPart;
        }

        // 重定向到新 URL
        window.location.replace(newUrl);
    }
}

// 页面加载完成后执行重定向
window.onload = redirectToNewUrl;