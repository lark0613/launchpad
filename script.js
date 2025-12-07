document.addEventListener('DOMContentLoaded', function () {
    // 核心元素获取
    const searchWrapper = document.getElementById('searchWrapper');
    const searchPlaceholder = document.getElementById('searchPlaceholder');
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const engineTrigger = document.getElementById('engineTrigger');
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

    // 面板关闭延迟定时器
    let panelCloseTimer = null;
    const PANEL_DELAY = 300;
    
    // 焦点状态跟踪
    let isFocusLocked = false;

    // ========== 初始化 ==========
    engineItems.forEach(item => {
        if (item.dataset.engine === currentEngine.name) {
            item.classList.add('active');
        }
    });

    // ========== 面板显隐逻辑 ==========
    function showEnginePanel() {
        clearTimeout(panelCloseTimer);
        enginePanel.style.opacity = '1';
        enginePanel.style.visibility = 'visible';
        enginePanel.style.pointerEvents = 'auto';
    }

    function hideEnginePanel() {
        panelCloseTimer = setTimeout(() => {
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
        }, PANEL_DELAY);
    }

    // 绑定面板显隐事件
    engineTrigger.addEventListener('mouseenter', showEnginePanel);
    engineTrigger.addEventListener('mouseleave', hideEnginePanel);
    enginePanel.addEventListener('mouseenter', showEnginePanel);
    enginePanel.addEventListener('mouseleave', hideEnginePanel);

    // ========== 搜索框激活/失焦逻辑 ==========
    // 点击默认面板激活搜索框
    searchPlaceholder.addEventListener('click', function () {
        searchWrapper.classList.add('active');
        focusSearchInput();
    });

    // 输入框失焦且无内容时，恢复默认面板
    searchInput.addEventListener('blur', function () {
        if (!isFocusLocked && !searchInput.value.trim()) {
            setTimeout(() => {
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
            clearTimeout(panelCloseTimer);
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
            isFocusLocked = false;
        }
    });

    // ========== 核心：强制聚焦搜索框 ==========
    function focusSearchInput() {
        // 解除焦点锁定，允许正常聚焦
        isFocusLocked = false;
        
        // 多重保障确保焦点锁定
        setTimeout(() => {
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }, 10);
        
        // 额外触发事件确保浏览器响应
        setTimeout(() => {
            searchInput.dispatchEvent(new Event('focus', { bubbles: true }));
        }, 20);
    }

    // ========== 引擎切换逻辑（完全重构） ==========
    engineItems.forEach(item => {
        item.addEventListener('mousedown', function (e) {
            // 在鼠标按下时就阻止默认行为，防止焦点转移
            e.preventDefault();
            e.stopPropagation();
        });

        item.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // 设置焦点锁定状态，防止失焦
            isFocusLocked = true;

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
            engineIcon.style.color = getComputedStyle(this.querySelector('i')).color;

            // **关键修复：立即强制重新聚焦搜索框**
            
            // 第一步：立即尝试聚焦
            searchInput.focus();
            
            // 第二步：使用requestAnimationFrame确保在下一帧执行
            requestAnimationFrame(() => {
                // 再次尝试聚焦
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                
                // 第三步：使用setTimeout作为后备
                setTimeout(() => {
                    // 检查焦点是否还在搜索框
                    if (document.activeElement !== searchInput) {
                        searchInput.focus();
                        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                    }
                    
                    // 触发事件确保浏览器响应
                    searchInput.dispatchEvent(new Event('focus', { bubbles: true }));
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // 强制浏览器重新布局（Chrome特殊需要）
                    void searchInput.offsetWidth;
                }, 0);
            });

            // 第四步：额外延迟执行，确保所有浏览器都响应
            setTimeout(() => {
                if (document.activeElement !== searchInput) {
                    searchInput.focus();
                    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                }
                // 解除焦点锁定
                isFocusLocked = false;
            }, 50);

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
            searchInput.value = '';
            // 搜索后重新聚焦
            setTimeout(focusSearchInput, 100);
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

    // ========== 新增：监控焦点变化 ==========
    document.addEventListener('focusin', function (e) {
        // 如果焦点试图移动到引擎面板内的元素，重定向到搜索框
        if (e.target && 
            (e.target.closest('.engine-panel') || 
             e.target.closest('.engine-icon-wrapper') ||
             e.target.classList.contains('engine-item'))) {
            
            // 阻止焦点移动
            e.preventDefault();
            e.stopImmediatePropagation();
            
            // 立即将焦点移回搜索框
            setTimeout(() => {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }, 0);
        }
    });

    // ========== 新增：防止引擎面板内元素获得焦点 ==========
    const panelElements = enginePanel.querySelectorAll('*');
    panelElements.forEach(el => {
        el.setAttribute('tabindex', '-1');
        
        el.addEventListener('focus', function(e) {
            e.preventDefault();
            e.stopPropagation();
            searchInput.focus();
        });
    });

    // ========== 卡片动画 ==========
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

    // ========== 新增：Chrome特定修复 ==========
    // 检测Chrome浏览器
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    if (isChrome) {
        // Chrome专用：监听可能引起焦点丢失的事件
        searchInput.addEventListener('pointerdown', function() {
            isFocusLocked = true;
        });
        
        searchInput.addEventListener('pointerup', function() {
            setTimeout(() => {
                isFocusLocked = false;
            }, 100);
        });
        
        // 额外的焦点保护
        setInterval(() => {
            if (searchWrapper.classList.contains('active') && 
                document.activeElement !== searchInput && 
                !isFocusLocked) {
                searchInput.focus();
            }
        }, 100);
    }
});