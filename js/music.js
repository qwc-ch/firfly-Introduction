/**
 * 背景音乐控制 - 事件委托版
 */
(function() {
    var audio = document.getElementById('bgMusic');
    if (!audio) {
        console.error('audio 元素不存在');
        return;
    }

    var playing = false;
    audio.volume = 0.3;

    function getBtn() {
        return document.getElementById('musicBtn');
    }
    function getIcon() {
        return document.getElementById('musicIcon');
    }

    function updateUI() {
        var btn = getBtn();
        var icon = getIcon();
        if (!btn || !icon) return;
        if (playing) {
            btn.className = 'music-btn playing';
            icon.textContent = '🔊';
            btn.title = '暂停背景音乐';
        } else {
            btn.className = 'music-btn paused';
            icon.textContent = '🔇';
            btn.title = '播放背景音乐';
        }
    }

    // 事件委托：在 document 上监听点击，判断目标是不是按钮
    document.addEventListener('click', function(e) {
        var btn = getBtn();
        if (!btn) return;
        // 检查点击的是否是按钮本身或其子元素
        if (btn === e.target || btn.contains(e.target)) {
            console.log('按钮被点击');
            e.preventDefault();

            if (playing) {
                audio.pause();
                playing = false;
                updateUI();
            } else {
                audio.play()
                    .then(function() {
                        playing = true;
                        updateUI();
                    })
                    .catch(function(err) {
                        console.warn('播放失败:', err);
                    });
            }
        }
    });

    // 页面首次交互自动播放
    var events = ['click', 'touchstart'];
    function onInteract() {
        if (playing) return;
        audio.play()
            .then(function() {
                playing = true;
                updateUI();
            })
            .catch(function() {});
        events.forEach(function(e) {
            document.removeEventListener(e, onInteract);
        });
    }
    events.forEach(function(e) {
        document.addEventListener(e, onInteract, { once: true });
    });

    updateUI();
    console.log('音乐控制已加载 (事件委托版)');
})();