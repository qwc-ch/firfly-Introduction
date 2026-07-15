/**
 * CSS 萤火虫粒子（纯CSS，不卡顿）
 */
(function() {
    var container = document.getElementById('cssParticles');
    if (!container) {
        console.warn('⚠️ cssParticles 容器不存在');
        return;
    }

    var count = 35;
    for (var i = 0; i < count; i++) {
        var el = document.createElement('div');
        el.className = 'particle';
        
        var x = 5 + Math.random() * 90;
        var y = 5 + Math.random() * 90;
        var size = 4 + Math.random() * 10;
        var delay = Math.random() * 20;
        var duration = 12 + Math.random() * 16;
        
        el.style.left = x + '%';
        el.style.top = y + '%';
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.animationDelay = delay + 's';
        el.style.animationDuration = duration + 's';
        
        container.appendChild(el);
    }
    
    console.log('✅ CSS 萤火虫粒子已启动，数量: ' + count);
})();