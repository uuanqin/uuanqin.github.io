console.log("\n %c Spark Lite 文章摘要AI生成 %c https://uuanqin.top \n", "color: #fadfa3; background: #030307; padding:5px 0;", "background: #fadfa3; padding:5px 0;")

// --- 其他配置 (根据需要调整) ---
const sparkLite_postSelector = "#article-container"; // 文章内容容器的选择器，例如 #article-container, .post-content
const sparkLite_wordLimit = 1000;             // 提交给 API 的最大字数限制
const sparkLite_typingAnimate = true;         // 是否启用打字机效果
// 指定博客文章URL类型，只在这样的界面上生成ai摘要
const sparkLite_postURLs = [
    "https://*.uuanqin.top/p/*",
    "http://localhost:*/p/*"
];
const MILLISECONDS_OF_A_WEEK = 7 * 24 * 60 * 60 * 1000;

const sparkLite_localCacheTime = MILLISECONDS_OF_A_WEEK;

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SparkLiteDB', 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('summaries')) {
                const store = db.createObjectStore('summaries', {keyPath: 'url'});
                store.createIndex('timestamp', 'timestamp', {unique: false});
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

var sparkLiteIsRunning = false; // 重命名

// --- insertAIDiv 函数 ---
function insertAIDiv(selector) {
    // 首先移除现有的 "post-SparkLite" 类元素（如果有的话）
    removeExistingAIDiv(); // 需要同步修改 removeExistingAIDiv 函数选择器

    // 获取目标元素
    const targetElement = document.querySelector(selector);

    // 如果没有找到目标元素，不执行任何操作
    if (!targetElement) {
        return;
    }

    // 创建要插入的HTML元素
    const aiDiv = document.createElement('div');
    aiDiv.className = 'post-SparkLite'; // 修改类名

    const aiTitleDiv = document.createElement('div');
    aiTitleDiv.className = 'sparkLite-title'; // 修改类名
    aiDiv.appendChild(aiTitleDiv);

    const aiIcon = document.createElement('i');
    aiIcon.className = 'sparkLite-title-icon'; // 修改类名
    aiTitleDiv.appendChild(aiIcon);

    // 插入 SVG 图标 (保持不变或替换)
    aiIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="48px" height="48px" viewBox="0 0 48 48">
  <title>机器人</title>
  <g id="机器人" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <path d="M34.717885,5.03561087 C36.12744,5.27055371 37.079755,6.60373651 36.84481,8.0132786 L35.7944,14.3153359 L38.375,14.3153359 C43.138415,14.3153359 47,18.1768855 47,22.9402569 L47,34.4401516 C47,39.203523 43.138415,43.0650727 38.375,43.0650727 L9.625,43.0650727 C4.861585,43.0650727 1,39.203523 1,34.4401516 L1,22.9402569 C1,18.1768855 4.861585,14.3153359 9.625,14.3153359 L12.2056,14.3153359 L11.15519,8.0132786 C10.920245,6.60373651 11.87256,5.27055371 13.282115,5.03561087 C14.69167,4.80066802 16.024865,5.7529743 16.25981,7.16251639 L17.40981,14.0624532 C17.423955,14.1470924 17.43373,14.2315017 17.43948,14.3153359 L30.56052,14.3153359 C30.56627,14.2313867 30.576045,14.1470924 30.59019,14.0624532 L31.74019,7.16251639 C31.975135,5.7529743 33.30833,4.80066802 34.717885,5.03561087 Z M38.375,19.4902885 L9.625,19.4902885 C7.719565,19.4902885 6.175,21.0348394 6.175,22.9402569 L6.175,34.4401516 C6.175,36.3455692 7.719565,37.89012 9.625,37.89012 L38.375,37.89012 C40.280435,37.89012 41.825,36.3455692 41.825,34.4401516 L41.825,22.9402569 C41.825,21.0348394 40.280435,19.4902885 38.375,19.4902885 Z M14.8575,23.802749 C16.28649,23.802749 17.445,24.9612484 17.445,26.3902253 L17.445,28.6902043 C17.445,30.1191812 16.28649,31.2776806 14.8575,31.2776806 C13.42851,31.2776806 12.27,30.1191812 12.27,28.6902043 L12.27,26.3902253 C12.27,24.9612484 13.42851,23.802749 14.8575,23.802749 Z M33.1425,23.802749 C34.57149,23.802749 35.73,24.9612484 35.73,26.3902253 L35.73,28.6902043 C35.73,30.1191812 34.57149,31.2776806 33.1425,31.2776806 C31.71351,31.2776806 30.555,30.1191812 30.555,28.6902043 L30.555,26.3902253 C30.555,24.9612484 31.71351,23.802749 33.1425,23.802749 Z" id="形状结合" fill="#444444" fill-rule="nonzero"></path>
  </g>
  </svg>`;

    const aiTitleTextDiv = document.createElement('div');
    aiTitleTextDiv.className = 'sparkLite-title-text'; // 修改类名
    aiTitleTextDiv.textContent = 'AI摘要';
    aiTitleDiv.appendChild(aiTitleTextDiv);

    const aiTagDiv = document.createElement('div');
    aiTagDiv.className = 'sparkLite-tag'; // 修改类名
    aiTagDiv.id = 'sparkLite-tag'; // 修改 ID
    aiTagDiv.textContent = 'Spark Lite'; // 修改显示文本
    aiTitleDiv.appendChild(aiTagDiv);

    const aiExplanationDiv = document.createElement('div');
    aiExplanationDiv.className = 'sparkLite-explanation'; // 修改类名
    aiExplanationDiv.innerHTML = '生成中...' + '<span class="blinking-cursor"></span>';
    aiDiv.appendChild(aiExplanationDiv);

    // 将创建的元素插入到目标元素的顶部
    targetElement.insertBefore(aiDiv, targetElement.firstChild);
}

// --- removeExistingAIDiv 函数 ---
function removeExistingAIDiv() {
    // 查找具有 "post-SparkLite" 类的元素
    const existingAIDiv = document.querySelector(".post-SparkLite"); // 修改选择器

    // 如果找到了这个元素，就从其父元素中删除它
    if (existingAIDiv) {
        existingAIDiv.parentElement.removeChild(existingAIDiv);
    }
}


// --- 主要逻辑对象 ---
var sparkLite = { // 重命名对象
    // --- getTitleAndContent 函数 (保持不变) ---
    getTitleAndContent: function () {
        try {
            const title = document.title;
            const container = document.querySelector(sparkLite_postSelector); // 假设您也重命名了配置变量
            if (!container) {
                console.warn('Spark Lite：找不到文章容器...');
                return '';
            }
            const paragraphs = container.getElementsByTagName('p');
            const headings = container.querySelectorAll('h1, h2, h3, h4, h5');
            let content = '';

            for (let h of headings) {
                content += h.innerText + ' ';
            }

            for (let p of paragraphs) {
                // 移除包含'http'的链接
                const filteredText = p.innerText.replace(/https?:\/\/[^\s]+/g, '');
                content += filteredText;
            }

            const combinedText = title + ' ' + content;
            let wordLimit = 1000;
            if (typeof sparkLite_wordLimit !== "undefined") { // 假设您也重命名了配置变量
                wordLimit = sparkLite_wordLimit;
            }
            const truncatedText = combinedText.slice(0, wordLimit);
            return truncatedText;
        } catch (e) {
            console.error('Spark Lite 错误：...', e);
            return '';
        }
    },

    // --- fetchSparkLiteSummary 函数 (核心修改) ---
    fetchSparkLiteSummary: async function (content) {
        const title = document.title;
        const url = window.location.href;

        // 先尝试从IndexedDB读取
        try {
            const db = await initDB();
            const tx = db.transaction('summaries', 'readonly');
            const store = tx.objectStore('summaries');
            const request = store.get(url);

            const cachedData = await new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });

            if (cachedData?.summary) {
                // 检查缓存是否过期（7天有效期）

                const isExpired = Date.now() - cachedData.timestamp > sparkLite_localCacheTime;
                if (!isExpired) {
                    return cachedData.summary;
                }
            }
        } catch (e) {
            console.log('读取IndexedDB缓存失败', e);
        }

        const proxyApiUrl = "https://ai-summary.uuanqin.top/api/ai-summary/spark-lite";
        const requestDataToProxy = {content: content, title: title};
        const timeout = 30000;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(proxyApiUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestDataToProxy),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok) {
                // 成功获取摘要后存入IndexedDB
                try {
                    const db = await initDB();
                    const tx = db.transaction('summaries', 'readwrite');
                    tx.objectStore('summaries').put({
                        url: url,
                        summary: data.summary,
                        timestamp: Date.now()
                    });
                } catch (e) {
                    console.log('IndexedDB写入失败', e);
                }
                return data.summary;
            } else {
                console.error(`代理或 API 错误: ${data.error || response.statusText}`);
                return `获取摘要失败: ${data.error || `HTTP 状态码: ${response.status}`}`;
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Spark Lite 请求超时 (通过代理)');
                return '获取文章摘要超时，请稍后刷新重试。';
            } else {
                console.error('Spark Lite 请求失败 (通过代理)：', error);
                if (error instanceof SyntaxError) {
                    return '获取文章摘要失败：代理服务器响应格式错误。';
                }
                return '获取文章摘要失败，请检查网络连接或代理服务器状态。';
            }
        }
    },

    // --- aiShowAnimation 函数 ---
    // 可以修改 console.error 和 element.innerHTML 中的 "TianliGPT" 为 "Spark Lite"
    aiShowAnimation: function (text) {
        const element = document.querySelector(".sparkLite-explanation"); // 修改选择器
        if (!element) {
            return;
        }

        if (sparkLiteIsRunning) { // 修改变量名
            return;
        }

        // 检查用户是否已定义 sparkLite_typingAnimate
        if (typeof sparkLite_typingAnimate !== "undefined" && !sparkLite_typingAnimate) { // 修改变量名
            element.innerHTML = text;
            return;
        }

        sparkLiteIsRunning = true; // 修改变量名
        const typingDelay = 25;
        const waitingTime = 1000;
        const punctuationDelayMultiplier = 6;

        element.style.display = "block";
        element.innerHTML = "生成中..." + '<span class="blinking-cursor"></span>';

        let animationRunning = true;
        let currentIndex = 0;
        let initialAnimation = true;
        let lastUpdateTime = performance.now();

        const animate = () => {
            if (currentIndex < text.length && animationRunning) {
                const currentTime = performance.now();
                const timeDiff = currentTime - lastUpdateTime;

                const letter = text.slice(currentIndex, currentIndex + 1);
                const isPunctuation = /[，。！、？,.!?]/.test(letter);
                const delay = isPunctuation ? typingDelay * punctuationDelayMultiplier : typingDelay;

                if (timeDiff >= delay) {
                    element.innerText = text.slice(0, currentIndex + 1);
                    lastUpdateTime = currentTime;
                    currentIndex++;

                    if (currentIndex < text.length) {
                        element.innerHTML =
                            text.slice(0, currentIndex) +
                            '<span class="blinking-cursor"></span>';
                    } else {
                        element.innerHTML = text;
                        element.style.display = "block";
                        sparkLiteIsRunning = false; // 修改变量名
                        observer.disconnect();// 暂停监听
                    }
                }
                requestAnimationFrame(animate);
            }
        }

        // 使用IntersectionObserver对象优化ai离开视口后暂停的业务逻辑，提高性能
        const observer = new IntersectionObserver((entries) => {
            animationRunning = entries[0].isIntersecting; // 标志变量更新
            if (animationRunning && initialAnimation) {
                setTimeout(() => {
                    requestAnimationFrame(animate);
                }, 200);
            }
        }, {threshold: 0});
        let post_ai = document.querySelector('.post-SparkLite'); // 修改选择器
        observer.observe(post_ai);//启动新监听
    },
}

// --- runSparkLite 函数 (保持不变) ---
function runSparkLite() { // 重命名函数
    // 确保在运行前移除可能存在的旧div，防止重复添加
    removeExistingAIDiv();
    // 插入新的占位符
    insertAIDiv(sparkLite_postSelector);
    const content = sparkLite.getTitleAndContent(); // 调用重命名后的对象和方法
    if (content) {
        // console.log('Spark Lite 本次提交的内容为：' + content); // 修改日志文本
    } else {
        // 如果没有获取到内容，可能需要移除占位符或显示错误
        const aiExplanationDiv = document.querySelector(".sparkLite-explanation");
        if (aiExplanationDiv) {
            aiExplanationDiv.textContent = '未能获取到文章内容，无法生成摘要。';
        }
        return; // 提前退出，不进行 fetch
    }
    sparkLite.fetchSparkLiteSummary(content).then(summary => { // 调用重命名后的方法
        sparkLite.aiShowAnimation(summary); // 调用重命名后的方法
    });
}

// --- checkURLAndRun 函数 (稍微调整，主要负责URL检查) ---
function checkURLAndRun() {
    // 检查 AI 是否已在运行，防止重复启动动画等
    if (sparkLiteIsRunning) {
        return false; // 返回 false 表示不应继续执行
    }
    // 检查 AI 容器是否已存在 (如果存在，理论上不应再次运行完整流程，除非是内容更新)
    // 为简化逻辑，我们允许它继续，runSparkLite内部会处理移除和重新插入
    // if (document.querySelector(".post-SparkLite")) {
    //     return false;
    // }

    // URL 检查逻辑
    if (typeof sparkLite_postURLs === "undefined") {
        console.log("Spark Lite: 没有设置页面链接模板，所以我为每个页面都生成ai摘要.");
        return true; // 返回 true 表示检查通过，可以运行
    }

    try {
        const regExpEscape = (s) => {
            return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        };
        const wildcardToRegExp = (s) => {
            return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
        };

        const currentURL = window.location.href;

        const urlPattern = sparkLite_postURLs.map(wildcardToRegExp);

        // 测试某个 URL 是否匹配任意一个规则
        const testURL = (url) => {
            return urlPattern.some(re => re.test(url));
        };

        if (testURL(currentURL)) {
            console.log("Spark Lite: 匹配到了页面URL，将在此页面生成摘要");
            return true; // URL匹配，检查通过
        } else {
            console.log("Spark Lite:因为不符合自定义的链接规则，我决定不执行摘要功能。");
            removeExistingAIDiv(); // 如果URL不匹配了，移除可能存在的旧AI框
            return false; // URL不匹配，检查不通过
        }
    } catch (error) {
        console.error("Spark Lite：我没有看懂你编写的自定义链接规则...", error);
        return false; // 出错，检查不通过
    }
}

// --- 新增：统一的初始化入口函数 ---
function initializeSparkLite() {
    // 1. 检查文章容器是否存在
    const targetElement = document.querySelector(sparkLite_postSelector);
    if (!targetElement) {
        // console.log("Spark Lite: Target post selector not found.");
        removeExistingAIDiv(); // 确保目标容器不在时，AI框也被移除
        return;
    }

    // 2. 执行URL和运行状态检查
    if (checkURLAndRun()) {
        // 3. 如果检查通过，执行核心逻辑
        // console.log("Spark Lite: Initialization checks passed, running...");
        runSparkLite();
    } else {
        // console.log("Spark Lite: Initialization checks failed (URL mismatch or already running).");
    }
}


// --- Event Listeners (使用新的初始化函数) ---

// 确保在移除旧监听器（如果可能）后添加新的
// （在简单脚本场景下通常不需要移除，但这是良好实践）

// --- 增强路由变化监听 ---

// 保存原始的 pushState 和 replaceState 方法
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

// 包装 pushState
history.pushState = function () {
    // 调用原始方法
    const result = originalPushState.apply(this, arguments);
    // 创建并触发自定义事件，表明 URL 可能已更改
    window.dispatchEvent(new Event('pushstate'));
    // 触发我们的初始化函数
    // 使用 setTimeout 确保在 DOM 更新后执行
    setTimeout(initializeSparkLite, 100);
    return result;
};

// 包装 replaceState
history.replaceState = function () {
    // 调用原始方法
    const result = originalReplaceState.apply(this, arguments);
    // 创建并触发自定义事件，表明 URL 可能已更改
    window.dispatchEvent(new Event('replacestate'));
    // 触发我们的初始化函数
    // 使用 setTimeout 确保在 DOM 更新后执行
    setTimeout(initializeSparkLite, 100);
    return result;
};

// 监听 popstate 事件 (浏览器前进/后退按钮)
window.addEventListener('popstate', () => {
    // 触发我们的初始化函数
    // 使用 setTimeout 确保在 DOM 更新后执行
    setTimeout(initializeSparkLite, 100);
});

// --- (确保之前的事件监听器仍然存在) ---
// 初始加载
document.removeEventListener("DOMContentLoaded", initializeSparkLite); // 避免重复添加
document.addEventListener("DOMContentLoaded", initializeSparkLite);


