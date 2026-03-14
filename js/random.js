// 灵感：https://immmmm.com/randompost-by-sitemap/
// DeepSeek 生成
function randomPost() {
    fetch('/sitemap.txt')
        .then(res => res.text())
        .then(txt => {
            // 按行分割，过滤掉空行
            const urls = txt.split('\n')
                .filter(line => line.trim() !== '')
                .filter(url => {
                    // 只保留包含 /p/ 路径的URL
                    const path = new URL(url).pathname;
                    return path.includes('/p/');
                });

            if (urls.length === 0) {
                console.error('随机文章：没有找到符合条件的文章');
                return;
            }

            while (true) {
                // 随机选择一个URL
                const randomUrl = urls[Math.floor(Math.random() * urls.length)];
                const randomPath = new URL(randomUrl).pathname;

                // 如果跳转到当前页面，则重新选择
                if (location.pathname === randomPath) continue;

                // 跳转到随机选择的文章
                location.pathname = randomPath;
                return;
            }
        })
        .catch(err => {
            console.error('随机文章：读取sitemap.txt失败:', err);
        });
}