document.addEventListener('DOMContentLoaded', function () {
    // 核心元素获取
    const searchWrapper = document.getElementById('searchWrapper');
    const searchPlaceholder = document.getElementById('searchPlaceholder');
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const engineTrigger = document.getElementById('engineTrigger'); // 新增父容器
    const engineIconWrapper = document.getElementById('engineIconWrapper');
    const engineIcon = document.getElementById('engineIcon');
    const enginePanel = document.getElementById('enginePanel');
    const engineItems = document.querySelectorAll('.engine-item');
    const searchBtn = document.getElementById('searchBtn');

    // 初始引擎配置
    let currentEngine = {
        name: 'google',
        icon: 'fab fa-google',
        url: 'https://www.google.com/search?q='
    };

    // 新增：面板关闭延迟定时器
    let panelCloseTimer = null;
    const PANEL_DELAY = 300; // 300ms 延迟，给鼠标移动留时间

    // ========== 初始化 ==========
    // 标记初始选中引擎
    engineItems.forEach(item => {
        if (item.dataset.engine === currentEngine.name) {
            item.classList.add('active');
        }
    });

    // ========== 新增：引擎面板延迟关闭逻辑 ==========
    // 鼠标进入触发容器/面板：清除延迟，显示面板
    function showEnginePanel() {
        clearTimeout(panelCloseTimer);
        enginePanel.style.opacity = '1';
        enginePanel.style.visibility = 'visible';
        enginePanel.style.pointerEvents = 'auto';
    }

    // 鼠标离开触发容器/面板：延迟关闭面板
    function hideEnginePanel() {
        panelCloseTimer = setTimeout(() => {
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
        }, PANEL_DELAY);
    }

    // 绑定面板显隐事件（核心修复）
    engineTrigger.addEventListener('mouseenter', showEnginePanel);
    engineTrigger.addEventListener('mouseleave', hideEnginePanel);
    enginePanel.addEventListener('mouseenter', showEnginePanel); // 鼠标进入面板也保持显示
    enginePanel.addEventListener('mouseleave', hideEnginePanel);

    // ========== 搜索框激活/失焦逻辑 ==========
    // 点击默认面板激活搜索框
    searchPlaceholder.addEventListener('click', function () {
        searchWrapper.classList.add('active');
        focusSearchInput(); // 强制聚焦
    });

    // 输入框失焦且无内容时，恢复默认面板
    searchInput.addEventListener('blur', function () {
        if (!searchInput.value.trim()) {
            setTimeout(() => {
                // 确保鼠标不在引擎面板上
                if (!enginePanel.matches(':hover') && !engineTrigger.matches(':hover')) {
                    searchWrapper.classList.remove('active');
                }
            }, 200);
        }
    });

    // 点击页面其他区域关闭搜索框
    document.addEventListener('click', function (e) {
        const isClickInside = searchWrapper.contains(e.target);
        if (!isClickInside && !searchInput.value.trim()) {
            searchWrapper.classList.remove('active');
            // 同时关闭引擎面板
            clearTimeout(panelCloseTimer);
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
        }
    });

    // ========== 核心：强制聚焦搜索框（保证输入法焦点） ==========
    function focusSearchInput() {
        // 多重保障确保焦点锁定
        searchInput.focus();
        // 强制设置光标位置（解决部分浏览器聚焦但光标不显示问题）
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        // 主动触发聚焦事件
        searchInput.dispatchEvent(new Event('focus', { bubbles: true }));
        // 触发input事件帮助Chrome激活输入法
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // ========== 引擎切换逻辑（切换后保持焦点）- 修复Chrome焦点问题 ==========
    engineItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault(); // 阻止默认行为
            e.stopPropagation(); // 阻止事件冒泡

            // 清除面板关闭定时器
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

            // 更新引擎图标
            engineIcon.className = currentEngine.icon;
            // 匹配图标颜色
            engineIcon.style.color = getComputedStyle(this.querySelector('i')).color;

            // **核心修复：在Chrome中强制保持焦点**
            // 先保存当前焦点状态
            const wasFocused = document.activeElement === searchInput;
            const hadValue = searchInput.value.trim().length > 0;
            
            // 立即请求动画帧来确保DOM更新后执行
            requestAnimationFrame(() => {
                // 如果之前是聚焦状态，或者搜索框有内容，强制重新聚焦
                if (wasFocused || hadValue) {
                    // 使用setTimeout确保在浏览器事件循环的下一个周期执行
                    setTimeout(() => {
                        focusSearchInput();
                        // 双重保障：如果焦点不在搜索框，再次尝试
                        if (document.activeElement !== searchInput) {
                            searchInput.focus();
                            // 再次触发事件确保输入法状态
                            setTimeout(() => {
                                searchInput.dispatchEvent(new Event('focus', { bubbles: true }));
                                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }, 20);
                        }
                    }, 10);
                } else {
                    // 如果没有焦点也没有内容，也要确保搜索框可聚焦
                    setTimeout(() => {
                        searchInput.focus();
                    }, 10);
                }
            });

            // 关闭引擎面板
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
        });
    });

    // ========== 搜索功能 ==========
    function doSearch() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            const searchUrl = currentEngine.url + encodeURIComponent(keyword);
            window.open(searchUrl, '_blank');
            // 清空内容但保持焦点
            searchInput.value = '';
            setTimeout(focusSearchInput, 50);
        }
    }

    // 点击搜索按钮
    searchBtn.addEventListener('click', doSearch);

    // 回车搜索
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            doSearch();
        }
    });

    // ========== 添加全局焦点检查 ==========
    // 页面可见性变化时检查焦点
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && searchWrapper.classList.contains('active')) {
            setTimeout(focusSearchInput, 100);
        }
    });

    // 页面获得焦点时的检查
    window.addEventListener('focus', function() {
        if (searchWrapper.classList.contains('active')) {
            setTimeout(focusSearchInput, 50);
        }
    });

    // ========== 卡片动画（完全保留） ==========
    const categoryRows = document.querySelectorAll('.category-row');
    categoryRows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';

        setTimeout(function () {
            row.style.transition = 'all 0.5s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });

    // 卡片点击反馈
    const cards = document.querySelectorAll('.card');
    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            card.style.transform = 'scale(0.95)';
            setTimeout(function () {
                card.style.transform = 'scale(1.05)';
            }, 100);
        });
    });
});