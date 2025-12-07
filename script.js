// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // ========== 核心变量 ==========
    const searchWrapper = document.getElementById('searchWrapper');
    const searchPlaceholder = document.getElementById('searchPlaceholder');
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const engineTrigger = document.getElementById('engineTrigger');
    const engineSwitch = document.getElementById('engineSwitch');
    const enginePanel = document.getElementById('enginePanel');
    const engineIcon = document.getElementById('engineIcon');
    const engineItems = document.querySelectorAll('.engine-item');
    const searchBtn = document.getElementById('searchBtn');

    // 初始引擎配置
    let currentEngine = {
        name: 'google',
        icon: 'fab fa-google',
        color: '#4285f4',
        url: 'https://www.google.com/search?q='
    };

    // 面板控制变量
    let panelCloseTimer = null;
    const PANEL_DELAY = 300; // 鼠标离开触发区的延迟关闭时间

    // ========== 初始化 ==========
    // 标记初始选中的引擎
    engineItems.forEach(function(item) {
        if (item.dataset.engine === currentEngine.name) {
            item.classList.add('active');
        }
    });

    // 确保搜索框初始可聚焦
    searchInput.removeAttribute('disabled');
    searchInput.setAttribute('tabindex', '1');

    // ========== 搜索框激活/失焦逻辑（保留失焦恢复） ==========
    // 点击透明框激活
    searchPlaceholder.addEventListener('click', function() {
        searchWrapper.classList.add('active');
        focusSearchInput(); // 调用通用聚焦函数
    });

    // 输入框聚焦
    searchInput.addEventListener('focus', function() {
        searchWrapper.classList.add('active');
    });

    // 输入框失焦 - 恢复默认搜索框（保留）
    searchInput.addEventListener('blur', function() {
        if (!searchInput.value.trim()) {
            setTimeout(() => {
                // 仅当面板未激活时才恢复默认
                if (!enginePanel.classList.contains('active')) {
                    searchWrapper.classList.remove('active');
                }
            }, 100);
        }
    });

    // ========== 通用聚焦函数（核心修复） ==========
    function focusSearchInput() {
        // 方案1：基础聚焦
        searchInput.focus();
        
        // 方案2：强制激活（解决部分浏览器聚焦失效）
        if (document.activeElement !== searchInput) {
            // 先失焦再聚焦，重置焦点状态
            searchInput.blur();
            setTimeout(() => {
                searchInput.focus();
            }, 0);
        }

        // 方案3：通过原生DOM方法强制聚焦（终极方案）
        try {
            searchInput.dispatchEvent(new Event('focus', { 
                bubbles: true, 
                cancelable: true 
            }));
        } catch (e) {
            console.log('聚焦事件触发失败:', e);
        }

        // 可视化确认：添加聚焦样式（可选）
        searchInput.classList.add('focused');
        setTimeout(() => {
            searchInput.classList.remove('focused');
        }, 200);
    }

    // ========== 引擎面板控制 ==========
    // 显示面板
    function showPanel() {
        clearTimeout(panelCloseTimer);
        enginePanel.classList.add('active');
    }

    // 立即关闭面板
    function closePanel() {
        clearTimeout(panelCloseTimer);
        enginePanel.classList.remove('active');
        // 关闭面板后立即聚焦搜索框（双重保障）
        setTimeout(() => {
            focusSearchInput();
        }, 50);
    }

    // 延迟关闭面板（仅鼠标离开时触发）
    function hidePanel() {
        panelCloseTimer = setTimeout(() => {
            enginePanel.classList.remove('active');
            // 面板关闭后，若输入框无内容且失焦，恢复默认搜索框
            if (!searchInput.value.trim() && document.activeElement !== searchInput) {
                searchWrapper.classList.remove('active');
            }
        }, PANEL_DELAY);
    }

    // 触发容器鼠标进入 - 显示面板
    engineTrigger.addEventListener('mouseenter', showPanel);
    // 触发容器鼠标离开 - 延迟关闭面板
    engineTrigger.addEventListener('mouseleave', hidePanel);
    // 面板内部鼠标进入 - 取消延迟关闭
    enginePanel.addEventListener('mouseenter', showPanel);
    // 面板内部鼠标离开 - 延迟关闭面板
    enginePanel.addEventListener('mouseleave', hidePanel);

    // ========== 引擎选择逻辑（核心优化） ==========
    // 点击引擎项选择引擎 - 立即关面板+强制聚焦搜索框
    engineItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault(); // 阻止默认行为，避免焦点丢失
            
            // 1. 移除所有选中样式
            engineItems.forEach(function(i) {
                i.classList.remove('active');
            });

            // 2. 标记当前选中项
            item.classList.add('active');

            // 3. 更新引擎配置
            currentEngine = {
                name: item.dataset.engine,
                icon: item.dataset.icon,
                color: getEngineColor(item.dataset.icon),
                url: item.dataset.url
            };

            // 4. 更新按钮图标
            engineIcon.className = currentEngine.icon;
            engineIcon.style.color = currentEngine.color;

            // 5. 立即关闭引擎面板
            closePanel();

            // 6. 第一时间强制聚焦搜索框（核心修复）
            focusSearchInput();
        });
    });

    // ========== 引擎颜色映射 ==========
    function getEngineColor(iconClass) {
        const colorMap = {
            'fab fa-google': '#4285f4',
            'fas fa-search': '#0066cc',
            'fas fa-paw': '#2319dc',
            'fab fa-yandex': '#ff0000',
            'fas fa-dragon': '#ee3424',
            'fab fa-bilibili': '#fb7299',
            'fab fa-youtube': '#ff0000',
            'fab fa-github': '#171515',
            'fab fa-zhihu': '#0084ff',
            'fab fa-taobao': '#ff4400'
        };
        return colorMap[iconClass] || '#4285f4';
    }

    // ========== 搜索功能 ==========
    function doSearch() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            const searchUrl = currentEngine.url + encodeURIComponent(keyword);
            window.open(searchUrl, '_blank');
            // 清空内容但保持搜索框激活状态
            searchInput.value = '';
            focusSearchInput(); // 搜索后重新聚焦
        }
    }

    // 搜索按钮点击
    searchBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        doSearch();
    });

    // 回车搜索
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            doSearch();
        }
    });

    // ========== 卡片动画 ==========
    const categoryRows = document.querySelectorAll('.category-row');
    categoryRows.forEach(function(row, index) {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        setTimeout(function() {
            row.style.transition = 'all 0.5s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });

    // 卡片点击反馈
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