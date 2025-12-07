/**
 * 启动页功能脚本
 * 主要功能：搜索引擎切换、搜索功能、卡片交互
 * 特别注意：修复了Chrome浏览器切换搜索引擎后焦点丢失的问题
 */

document.addEventListener('DOMContentLoaded', function () {
    // ========== DOM元素获取 ==========
    // 所有需要操作的核心DOM元素
    const searchWrapper = document.getElementById('searchWrapper');        // 搜索框外层容器
    const searchPlaceholder = document.getElementById('searchPlaceholder'); // 默认搜索面板
    const searchContainer = document.getElementById('searchContainer');    // 完整搜索框容器
    const searchInput = document.getElementById('searchInput');            // 搜索输入框
    const engineTrigger = document.getElementById('engineTrigger');        // 引擎切换触发区域
    const engineIcon = document.getElementById('engineIcon');              // 当前引擎图标
    const enginePanel = document.getElementById('enginePanel');           // 引擎下拉面板
    const engineItems = document.querySelectorAll('.engine-item');        // 所有引擎选项
    const searchBtn = document.getElementById('searchBtn');               // 搜索按钮

    // ========== 全局状态变量 ==========
    // 当前搜索引擎配置
    let currentEngine = {
        name: 'google',                              // 引擎名称
        icon: 'fab fa-google',                       // 图标类名
        url: 'https://www.google.com/search?q='      // 搜索URL模板
    };

    // 面板关闭延迟定时器（用于实现平滑的鼠标移出效果）
    let panelCloseTimer = null;
    const PANEL_DELAY = 300;                         // 面板关闭延迟时间（毫秒）
    
    // 焦点锁定状态（防止焦点意外丢失）
    let isFocusLocked = false;

    // ========== 初始化函数 ==========
    /**
     * 初始化搜索引擎选项
     * 标记当前选中的搜索引擎
     */
    function initEngineItems() {
        engineItems.forEach(item => {
            if (item.dataset.engine === currentEngine.name) {
                item.classList.add('active');
                item.setAttribute('aria-checked', 'true');
            } else {
                item.setAttribute('aria-checked', 'false');
            }
        });
    }

    // 执行初始化
    initEngineItems();

    // ========== 引擎面板显示/隐藏逻辑 ==========
    /**
     * 显示引擎下拉面板
     */
    function showEnginePanel() {
        clearTimeout(panelCloseTimer);                  // 清除关闭定时器
        enginePanel.style.opacity = '1';                // 设置完全透明
        enginePanel.style.visibility = 'visible';       // 设置为可见
        enginePanel.style.pointerEvents = 'auto';       // 允许鼠标交互
        engineTrigger.setAttribute('aria-expanded', 'true'); // 更新ARIA状态
    }

    /**
     * 隐藏引擎下拉面板（带延迟效果）
     */
    function hideEnginePanel() {
        panelCloseTimer = setTimeout(() => {
            enginePanel.style.opacity = '0';            // 设置完全透明
            enginePanel.style.visibility = 'hidden';    // 设置为隐藏
            enginePanel.style.pointerEvents = 'none';   // 禁止鼠标交互
            engineTrigger.setAttribute('aria-expanded', 'false'); // 更新ARIA状态
        }, PANEL_DELAY);
    }

    // 绑定鼠标事件到引擎触发区域
    engineTrigger.addEventListener('mouseenter', showEnginePanel);
    engineTrigger.addEventListener('mouseleave', hideEnginePanel);
    enginePanel.addEventListener('mouseenter', showEnginePanel);
    enginePanel.addEventListener('mouseleave', hideEnginePanel);

    // ========== 搜索框状态管理 ==========
    /**
     * 激活搜索框（从默认面板切换到完整搜索框）
     */
    function activateSearch() {
        searchWrapper.classList.add('active');          // 添加激活类
        focusSearchInput();                             // 聚焦到输入框
    }

    /**
     * 失活搜索框（返回默认面板）
     */
    function deactivateSearch() {
        if (!searchInput.value.trim()) {                // 只有输入框为空时才失活
            searchWrapper.classList.remove('active');   // 移除激活类
        }
    }

    // 点击默认面板激活搜索框
    searchPlaceholder.addEventListener('click', activateSearch);

    // 输入框失焦时检查是否需要失活
    searchInput.addEventListener('blur', function () {
        if (!isFocusLocked && !searchInput.value.trim()) {
            // 延迟检查，避免与面板显示冲突
            setTimeout(() => {
                if (!enginePanel.matches(':hover') && !engineTrigger.matches(':hover')) {
                    deactivateSearch();
                }
            }, 200);
        }
    });

    // 点击页面其他区域关闭搜索框
    document.addEventListener('click', function (e) {
        const isClickInside = searchWrapper.contains(e.target);
        if (!isClickInside && !searchInput.value.trim()) {
            deactivateSearch();
            // 同时关闭引擎面板
            clearTimeout(panelCloseTimer);
            hideEnginePanel();
            isFocusLocked = false;
        }
    });

    // ========== 核心：焦点管理函数 ==========
    /**
     * 强制聚焦到搜索输入框（解决浏览器兼容性问题）
     */
    function focusSearchInput() {
        isFocusLocked = false;  // 解除锁定状态
        
        // 使用多种方法确保焦点设置成功
        setTimeout(() => {
            searchInput.focus();  // 标准聚焦方法
            // 设置光标到文本末尾
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }, 10);
        
        // 触发focus事件确保浏览器正确处理
        setTimeout(() => {
            searchInput.dispatchEvent(new Event('focus', { bubbles: true }));
        }, 20);
    }

    // ========== 搜索引擎切换逻辑 ==========
    /**
     * 切换搜索引擎
     * @param {HTMLElement} selectedItem - 被选中的引擎选项元素
     */
    function switchEngine(selectedItem) {
        // 设置焦点锁定，防止切换过程中焦点丢失
        isFocusLocked = true;

        // 清除面板关闭定时器
        clearTimeout(panelCloseTimer);

        // 更新选中状态
        engineItems.forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-checked', 'false');
        });
        selectedItem.classList.add('active');
        selectedItem.setAttribute('aria-checked', 'true');

        // 更新引擎配置
        currentEngine = {
            name: selectedItem.dataset.engine,
            icon: selectedItem.dataset.icon,
            url: selectedItem.dataset.url
        };

        // 更新引擎图标
        engineIcon.className = currentEngine.icon;
        engineIcon.style.color = getComputedStyle(selectedItem.querySelector('i')).color;

        // ========== 核心修复：保持焦点在搜索框 ==========
        // 使用多层级的焦点恢复策略，确保在所有浏览器中都能正常工作
        
        // 第1层：立即尝试聚焦
        searchInput.focus();
        
        // 第2层：在下一动画帧再次尝试（解决重绘问题）
        requestAnimationFrame(() => {
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            
            // 第3层：在事件循环下一个周期检查并修复
            setTimeout(() => {
                if (document.activeElement !== searchInput) {
                    searchInput.focus();
                    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                }
                
                // 触发相关事件确保浏览器状态更新
                searchInput.dispatchEvent(new Event('focus', { bubbles: true }));
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                // 强制浏览器重新布局（Chrome特殊需求）
                void searchInput.offsetWidth;
            }, 0);
        });

        // 第4层：最终检查并解除锁定
        setTimeout(() => {
            if (document.activeElement !== searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }
            isFocusLocked = false;  // 解除焦点锁定
        }, 50);

        // 关闭引擎面板
        hideEnginePanel();
    }

    // 为每个引擎选项绑定事件
    engineItems.forEach(item => {
        // 阻止mousedown事件的默认行为，防止焦点转移
        item.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        // 点击切换引擎
        item.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            switchEngine(this);
        });
    });

    // ========== 搜索功能 ==========
    /**
     * 执行搜索操作
     */
    function performSearch() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            // 构建搜索URL
            const searchUrl = currentEngine.url + encodeURIComponent(keyword);
            // 在新标签页中打开搜索结果
            window.open(searchUrl, '_blank', 'noopener,noreferrer');
            // 清空输入框但保持焦点
            searchInput.value = '';
            // 搜索后重新聚焦
            setTimeout(focusSearchInput, 100);
        }
    }

    // 绑定搜索按钮点击事件
    searchBtn.addEventListener('click', performSearch);

    // 绑定回车键搜索
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // ========== 焦点保护机制 ==========
    /**
     * 防止焦点意外转移到引擎面板内元素
     */
    document.addEventListener('focusin', function (e) {
        // 检查焦点是否试图移动到引擎相关元素
        if (e.target && 
            (e.target.closest('.engine-panel') || 
             e.target.closest('.engine-icon-wrapper') ||
             e.target.classList.contains('engine-item'))) {
            
            // 阻止焦点转移
            e.preventDefault();
            e.stopImmediatePropagation();
            
            // 立即将焦点移回搜索框
            setTimeout(() => {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }, 0);
        }
    });

    // 禁用引擎面板内所有元素的焦点获取
    const panelElements = enginePanel.querySelectorAll('*');
    panelElements.forEach(el => {
        el.setAttribute('tabindex', '-1');  // 禁止通过Tab键聚焦
        
        el.addEventListener('focus', function(e) {
            e.preventDefault();
            e.stopPropagation();
            searchInput.focus();  // 焦点重定向到搜索框
        });
    });

    // ========== 卡片区域动画效果 ==========
    /**
     * 初始化卡片入场动画
     */
    function initCardAnimations() {
        const categoryRows = document.querySelectorAll('.category-row');
        
        categoryRows.forEach((row, index) => {
            // 初始状态：隐藏并下移
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';

            // 延迟显示，创建错落有致的入场效果
            setTimeout(function () {
                row.style.transition = 'all 0.5s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 200 * (index + 1));  // 每行延迟200ms
        });

        // 卡片点击反馈效果
        const cards = document.querySelectorAll('.card');
        cards.forEach(function (card) {
            card.addEventListener('click', function () {
                // 点击时缩小
                card.style.transform = 'scale(0.95)';
                // 然后放大（创建反弹效果）
                setTimeout(function () {
                    card.style.transform = 'scale(1.05)';
                }, 100);
            });
        });
    }

    // 执行卡片动画初始化
    initCardAnimations();

    // ========== 浏览器兼容性修复 ==========
    /**
     * Chrome浏览器特定修复
     * Chrome在处理焦点时有一些特殊行为，需要额外处理
     */
    function applyChromeSpecificFixes() {
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        
        if (isChrome) {
            console.log('应用Chrome浏览器特定优化');
            
            // 监听可能引起焦点丢失的指针事件
            searchInput.addEventListener('pointerdown', function() {
                isFocusLocked = true;
            });
            
            searchInput.addEventListener('pointerup', function() {
                setTimeout(() => {
                    isFocusLocked = false;
                }, 100);
            });
            
            // 定期检查焦点状态，确保焦点不会意外丢失
            setInterval(() => {
                if (searchWrapper.classList.contains('active') && 
                    document.activeElement !== searchInput && 
                    !isFocusLocked) {
                    searchInput.focus();
                }
            }, 100);
        }
    }

    // 应用Chrome特定修复
    applyChromeSpecificFixes();

    // ========== 辅助功能优化 ==========
    /**
     * 初始化键盘导航支持
     */
    function initKeyboardNavigation() {
        // 搜索框获得焦点时，按ESC键可以关闭
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !searchInput.value.trim()) {
                deactivateSearch();
                hideEnginePanel();
            }
        });

        // 引擎面板键盘导航（可选功能）
        enginePanel.addEventListener('keydown', function(e) {
            const activeItem = document.querySelector('.engine-item.active');
            const items = Array.from(engineItems);
            const currentIndex = items.indexOf(activeItem);
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % items.length;
                    items[nextIndex].click();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + items.length) % items.length;
                    items[prevIndex].click();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    activeItem.click();
                    break;
            }
        });
    }

    // 初始化键盘导航
    initKeyboardNavigation();
});