document.addEventListener('DOMContentLoaded', function() {
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
    const PANEL_DELAY = 150; // 平衡Chrome/Safari的延迟时间

    // ========== 初始化 ==========
    engineItems.forEach(item => {
        if (item.dataset.engine === currentEngine.name) {
            item.classList.add('active');
        }
    });

    // ========== 引擎面板显隐逻辑 ==========
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

    engineTrigger.addEventListener('mouseenter', showEnginePanel);
    engineTrigger.addEventListener('mouseleave', hideEnginePanel);
    enginePanel.addEventListener('mouseenter', showEnginePanel);
    enginePanel.addEventListener('mouseleave', hideEnginePanel);

    // ========== 搜索框激活/失焦逻辑 ==========
    searchPlaceholder.addEventListener('click', function() {
        searchWrapper.classList.add('active');
        focusSearchInput();
    });

    searchInput.addEventListener('blur', function() {
        if (!searchInput.value.trim()) {
            setTimeout(() => {
                if (!enginePanel.matches(':hover') && !engineTrigger.matches(':hover')) {
                    searchWrapper.classList.remove('active');
                }
            }, 200);
        }
    });

    document.addEventListener('click', function(e) {
        const isClickInside = searchWrapper.contains(e.target);
        if (!isClickInside && !searchInput.value.trim()) {
            searchWrapper.classList.remove('active');
            clearTimeout(panelCloseTimer);
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
        }
    });

    // ========== 核心：Chrome焦点修复函数（多重保障） ==========
    function focusSearchInput() {
        // 1. 基础聚焦
        searchInput.focus();
        
        // 2. Chrome专属：延迟避开动画阻塞
        setTimeout(() => {
            searchInput.focus();
            // 强制设置光标位置
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            
            // 3. 手动触发focus事件
            const focusEvent = new Event('focus', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            searchInput.dispatchEvent(focusEvent);
        }, 10);
    }

    // ========== 引擎切换逻辑（Chrome焦点保障） ==========
    engineItems.forEach(item => {
        item.addEventListener('click', function() {
            clearTimeout(panelCloseTimer);
            
            // 移除所有选中状态
            engineItems.forEach(ele => ele.classList.remove('active'));
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

            // 关闭面板
            enginePanel.style.opacity = '0';
            enginePanel.style.visibility = 'hidden';
            enginePanel.style.pointerEvents = 'none';
            
            // 延迟聚焦（Chrome修复）
            setTimeout(() => {
                focusSearchInput();
            }, 50);
        });
    });

    // ========== 搜索功能 ==========
    function doSearch() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            const searchUrl = currentEngine.url + encodeURIComponent(keyword);
            window.open(searchUrl, '_blank');
            searchInput.value = '';
            focusSearchInput();
        }
    }

    searchBtn.addEventListener('click', doSearch);

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            doSearch();
        }
    });

    // ========== 卡片动画（保留） ==========
    const categoryRows = document.querySelectorAll('.category-row');
    categoryRows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        setTimeout(function() {
            row.style.transition = 'all 0.5s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });

    const cards = document.querySelectorAll('.card');
    cards.forEach(function(card) {
        card.addEventListener('click', function() {
            card.style.transform = 'scale(0.95)';
            setTimeout(function() {
                card.style.transform = 'scale(1.05)';
            }, 100);
        });
    });
});