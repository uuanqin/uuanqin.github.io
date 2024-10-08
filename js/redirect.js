// 函数用于执行重定向，解决waline评论区数据不一致问题，解决百度、Bing跳转链接带index.html的问题
function redirectToNewUrl() {
    const currentUrl = window.location.href;  // 获取当前 URL
    const indexPagePattern = /\/p\/(.*?)\/index\.html$/;  // 正则表达式匹配 /p/xxxxx/index.html

    // 检查 URL 是否符合模式
    const match = currentUrl.match(indexPagePattern);
    if (match) {
        // 提取 xxxxx 部分
        const dynamicPart = match[1];
        // 获取基础 URL
        const baseUrl = window.location.origin + '/p/';
        // 构建新的 URL
        const newUrl = baseUrl + dynamicPart + '/';
        // 重定向到新 URL
        window.location.replace(newUrl);
    }
}

// 页面加载完成后执行重定向
window.onload = redirectToNewUrl;