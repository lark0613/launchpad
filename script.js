// 获取DOM元素
const searchInput = document.getElementById('search-input');
const engineIcon = document.getElementById('engine-icon');
const enginePanel = document.getElementById('engine-panel');
const engineItems = document.querySelectorAll('.engine-item');
const shortcutTip = document.getElementById('shortcut-tip');

// 当前选中的搜索引擎
let currentEngine = {
    name: 'baidu',
    icon: 'iconfont icon-baidu',
    url: 'https://www.baidu.com/s?wd='
};

// 面板关闭定时器
let panelCloseTimer = null;

// 初始化
function init() {
    // 设置初始引擎图标
    engineIcon.className = currentEngine.icon;
    // 默认聚焦搜索框
    focusSearchInput();
    // 绑定事件
    bindEvents();
}

// 聚焦搜索框（增强版）
function focusSearchInput() {
    if (searchInput) {
        // 强制聚焦
        searchInput.focus();
        // 选中输入框内容（可选）
        searchInput.select();
        // 确保光标在文本末尾
        const value = searchInput.value;
        searchInput.value = value;
    }
}

// 绑定所有事件
function bindEvents() {
    // 引擎图标点击事件 - 切换面板显示
    engineIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        clearTimeout(panelCloseTimer);
        
        const isVisible = enginePanel.style.visibility === 'visible';
        
        if (isVisible) {
            // 隐藏面板
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
            // 重新聚焦搜索框
            focusSearchInput();
        } else {
            // 显示面板
            enginePanel.style.opacity = '1';
            enginePanel.style.visibility = 'visible';
            enginePanel.style.pointerEvents = 'auto';
        }
    });

    // 引擎项点击事件
    engineItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            clearTimeout(panelCloseTimer);

            // 移除所有选中状态
            engineItems.forEach(ele => ele.classList.remove('active'));
            // 标记当前选中
            this.classList.add('active');

            // 更新引擎配置
            currentEngine = {
                name: this.dataset.engine,
                icon: this.dataset.icon,
                url: this.dataset.url
            };

            // 更新引擎图标和颜色
            engineIcon.className = currentEngine.icon;
            engineIcon.style.color = getComputedStyle(this.querySelector('i')).color;

            // 增强版焦点锁定 - 解决Chrome焦点丢失问题
            const focusAttempts = [0, 50, 100, 200]; // 多时间点尝试聚焦
            focusAttempts.forEach(delay => {
                setTimeout(() => {
                    focusSearchInput();
                    // 强制检查并设置焦点
                    if (document.activeElement !== searchInput) {
                        searchInput.focus();
                        searchInput.dispatchEvent(new Event('focus', { bubbles: true }));
                    }
                }, delay);
            });

            // 关闭引擎面板
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
        });
    });

    // 点击页面空白处关闭面板
    document.addEventListener('click', function () {
        clearTimeout(panelCloseTimer);
        panelCloseTimer = setTimeout(() => {
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
            // 重新聚焦搜索框
            focusSearchInput();
        }, 100);
    });

    // 搜索框键盘事件
    searchInput.addEventListener('keydown', function (e) {
        // Enter键搜索
        if (e.key === 'Enter') {
            e.preventDefault();
            search();
        }
        // ESC键清空并聚焦
        if (e.key === 'Escape') {
            this.value = '';
            focusSearchInput();
        }
        // 关闭快捷键提示
        shortcutTip.style.opacity = '0';
    });

    // 搜索框获得焦点时关闭提示
    searchInput.addEventListener('focus', function () {
        shortcutTip.style.opacity = '0';
    });

    // 页面点击时关闭提示
    document.addEventListener('click', function () {
        shortcutTip.style.opacity = '0';
    });

    // 页面加载完成后显示快捷键提示
    window.addEventListener('load', function () {
        setTimeout(() => {
            shortcutTip.style.opacity = '1';
        }, 1000);
    });

    // 阻止面板内点击事件冒泡
    enginePanel.addEventListener('click', function (e) {
        e.stopPropagation();
    });
}

// 执行搜索
function search() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
        focusSearchInput();
        shortcutTip.style.opacity = '1';
        return;
    }
    // 构建搜索URL并跳转
    const searchUrl = currentEngine.url + encodeURIComponent(keyword);
    window.open(searchUrl, '_blank');
}

// 初始化页面
window.addEventListener('DOMContentLoaded', init);

// 窗口失去焦点后重新获得焦点时，重新聚焦搜索框
window.addEventListener('focus', function () {
    setTimeout(focusSearchInput, 100);
});