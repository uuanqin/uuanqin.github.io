// 由张洪 Heo 的代码改动而来
function randomPost() {
    fetch('/baidusitemap.xml')
        .then(res => res.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            let ls = data.querySelectorAll('url loc');
            while (true) {
                let url = ls[Math.floor(Math.random() * ls.length)].innerHTML;
                let path = new URL(url).pathname; // 提取路径部分
                if (location.pathname === path) continue;
                location.pathname = path;
                return;
            }
        })
}