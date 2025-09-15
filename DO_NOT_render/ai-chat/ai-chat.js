const file_addr = '/DO_NOT_render/ai-chat/'

// 全局变量用于跟踪用户是否正在滚动
let userIsScrolling = false;
// 全局变量用于跟踪是否正在流式输出
let isStreaming = false;

function ChatBox(titleText) {
    // 重置全局状态
    userIsScrolling = false;
    isStreaming = false;

    // 1. 如果已有旧弹窗，先移除
    var old = document.getElementById('ChatBox');
    if (old) old.remove();

    // 2. 加载CSS样式
    loadCSS(file_addr+'ai-chat.css');

    // 3. 加载并插入HTML模板
    fetch(file_addr+'ai-chat.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);

            // 设置标题
            const titleElement = document.querySelector('#ChatBox .cb-title');
            if (titleElement && titleText) {
                titleElement.textContent = titleText;
            }

            // 初始化事件监听
            initEventListeners();

            // 加载历史记录
            loadChatHistory();

            // 如果没有历史记录，显示欢迎消息
            const msgs = document.getElementById('cbMessages');
            if (msgs.children.length === 0) {
                addMsg('你好！我是AI助手，有什么可以帮助你的吗？', false);
            }
        })
        .catch(error => console.error('加载聊天框模板失败:', error));
}

// 加载CSS文件的辅助函数
function loadCSS(href) {
    // 检查样式是否已加载
    if (document.querySelector(`link[href="${href}"]`)) {
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// 初始化事件监听
function initEventListeners() {
    var overlay = document.getElementById('ChatBox');
    var input   = document.getElementById('cbInput');
    var sendBtn = document.getElementById('cbSend');
    var clearBtn = document.getElementById('cbClear');
    var msgs    = document.getElementById('cbMessages');

    // 保存DOM元素引用
    window.chatElements = {
        overlay,
        input,
        sendBtn,
        clearBtn,
        msgs
    };

    // 阻止背景页面滚动
    document.body.style.overflow = 'hidden';

    // 捕获滚动事件，防止传递到背景页面
    overlay.addEventListener('wheel', function(e) {
        e.stopPropagation();
    }, { capture: true });

    // 监听消息区域滚动，检测用户是否正在滚动
    msgs.addEventListener('scroll', function() {
        // 只有在流式输出时才检测用户滚动
        if (isStreaming) {
            // 计算滚动到底部的距离
            const scrollBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight;
            // 如果用户滚动了一定距离（超过50px），认为用户正在查看历史消息
            userIsScrolling = scrollBottom > 50;
        }
    });

    // 发送消息
    sendBtn.onclick = send;
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    });

    // 清空聊天记录
    clearBtn.onclick = clearChatHistory;

    // 点击背景关闭
    overlay.addEventListener('click', e => {
        if (e.target === overlay) ChatBoxClose();
    });
}

// 添加消息函数 - 带头像
function addMsg(text, isUser) {
    const msgs = document.getElementById('cbMessages');
    if (!msgs) return;

    // 创建消息容器
    const container = document.createElement('div');
    container.className = `msg-container ${isUser ? 'user' : 'bot'}`;

    // 创建头像
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    // 使用不同的头像图片区分用户和AI
    avatar.style.backgroundImage = isUser
        ? "url('https://cdn.gallery.uuanqin.top/img/avatar.webp')"
        : "url('https://cdn.gallery.uuanqin.top/img/aicat1111.webp')";

    // 创建消息气泡
    const msgElement = document.createElement('div');
    msgElement.className = `cb-msg ${isUser ? 'cb-msg-user' : 'cb-msg-bot'}`;
    msgElement.textContent = text;

    container.appendChild(avatar);
    container.appendChild(msgElement);
    msgs.appendChild(container);

    // 只有在非流式输出或用户没有滚动时才滚动到底部
    if (!isStreaming || !userIsScrolling) {
        scrollToBottom();
    }

    // 返回创建的消息元素
    return { container, msgElement };
}

// 流式输出文本
function streamText(element, text, speed = 50) {
    return new Promise((resolve) => {
        let index = 0;
        element.textContent = '';
        element.setAttribute('data-streaming', 'true');
        isStreaming = true;
        userIsScrolling = false; // 重置滚动状态

        function type() {
            if (index < text.length) {
                // 随机调整打字速度，让效果更自然
                const randomSpeed = speed + Math.random() * 30 - 15;
                element.textContent += text.charAt(index);
                index++;

                // 只有当用户没有主动滚动时才自动滚动到底部
                if (!userIsScrolling) {
                    scrollToBottom();
                }

                setTimeout(type, randomSpeed);
            } else {
                element.removeAttribute('data-streaming');
                isStreaming = false;
                userIsScrolling = false;
                resolve();
            }
        }

        type();
    });
}

// 生成AI回复
function generateAIResponse(userMessage) {
    // 根据用户消息生成不同的回复
    const responses = [
        `你说的是"${userMessage}"吗？我理解了。这是一个很有趣的话题。`,
        `关于"${userMessage}"，我可以为你提供更多相关信息。需要我详细解释一下吗？`,
        `我明白了，你提到了"${userMessage}"。这确实是一个值得探讨的问题。`,
        `对于"${userMessage}"这个问题，我的看法是这样的...`,
        `感谢你的分享！关于"${userMessage}"，我有一些想法想和你交流。`
    ];

    // 随机选择一个回复
    return responses[Math.floor(Math.random() * responses.length)];
}

// 发送消息
async function send() {
    const { input, sendBtn } = window.chatElements;
    if (!input || !sendBtn) return;

    var text = input.value.trim();
    if (!text) return;

    // 添加用户消息
    addMsg(text, true);
    input.value = '';
    input.focus();

    // 保存聊天记录
    saveChatHistory();

    // 禁用发送按钮和输入框，防止重复发送
    sendBtn.disabled = true;
    input.disabled = true;

    try {
        // 模拟思考延迟
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

        // 生成AI回复
        const aiResponse = generateAIResponse(text);

        // 添加AI消息并流式输出
        const { msgElement } = addMsg('', false);
        await streamText(msgElement, aiResponse);

        // 保存聊天记录
        saveChatHistory();
    } finally {
        // 恢复发送按钮和输入框
        sendBtn.disabled = false;
        input.disabled = false;
    }
}

// 滚动到底部
function scrollToBottom() {
    const msgs = document.getElementById('cbMessages');
    if (msgs) {
        msgs.scrollTop = msgs.scrollHeight;
    }
}

// 保存聊天记录到本地存储
function saveChatHistory() {
    const msgs = document.getElementById('cbMessages');
    if (!msgs) return;

    const history = [];
    // 遍历所有消息容器
    Array.from(msgs.getElementsByClassName('msg-container')).forEach(container => {
        const isUser = container.classList.contains('user');
        const msgElement = container.querySelector('.cb-msg');
        if (msgElement) {
            history.push({
                text: msgElement.textContent,
                isUser: isUser
            });
        }
    });

    // 保存到localStorage
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

// 从本地存储加载聊天记录
function loadChatHistory() {
    const msgs = document.getElementById('cbMessages');
    if (!msgs) return;

    // 清空现有消息
    msgs.innerHTML = '';

    // 从localStorage获取记录
    const historyStr = localStorage.getItem('chatHistory');
    if (!historyStr) return;

    try {
        const history = JSON.parse(historyStr);
        // 逐条添加消息
        history.forEach(msg => {
            addMsg(msg.text, msg.isUser);
        });
    } catch (e) {
        console.error('加载聊天记录失败:', e);
        // 清除损坏的记录
        localStorage.removeItem('chatHistory');
    }
}

// 清空聊天记录
function clearChatHistory() {
    const msgs = document.getElementById('cbMessages');
    if (msgs) {
        msgs.innerHTML = '';
        // 添加欢迎消息
        addMsg('你好！我是AI助手，有什么可以帮助你的吗？', false);
        // 保存清空后的状态
        saveChatHistory();
    }
}

// 关闭函数供模板按钮与外部调用
function ChatBoxClose() {
    var box = document.getElementById('ChatBox');
    if (!box) return;

    // 恢复背景页面滚动
    document.body.style.overflow = '';

    box.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => box.remove(), 300);
}

// 将关键函数绑定到window对象，确保全局可访问
window.ChatBox = ChatBox;
window.ChatBoxClose = ChatBoxClose;
window.addMsg = addMsg;
window.loadChatHistory = loadChatHistory;
window.saveChatHistory = saveChatHistory;
window.clearChatHistory = clearChatHistory;
