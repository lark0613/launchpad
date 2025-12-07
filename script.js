// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 分类行渐入动画
    const categoryRows = document.querySelectorAll('.category-row');
    categoryRows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.5s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });

    // 卡片点击反馈效果
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'scale(1.05)';
            }, 100);
        });
    });
});