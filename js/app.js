/**
 * Vue 3 主应用
 * 页面切换 + 留言板逻辑
 * 功能：敏感词过滤 / 管理员热区登录 / 权限控制 / 双重确认
 */

// ========================================
// 1. 敏感词库
// ========================================
var SENSITIVE_WORDS = [
    '妈的', '操你', '傻逼', '白痴', '脑残', '废物', '垃圾', '去死',
    'SB', 'sb', '操', '干你', '贱人', '臭婊', '色情', '赌博',
    '你妈', '我操', '傻X', '脑瘫', '尼玛', '特么', '卧槽', '我草',
    '狗逼', '畜生', '草泥马', '日你', '日你妈', 'cnm', 'nmsl'
];

// ========================================
// 2. 管理员配置
// ========================================
var ADMIN_PASSWORD = 'AR-26710';  // 流萤机甲编号
var CLICK_TIMEOUT = 500;          // 毫秒内连续点击3下触发
var HOTSPOT_RADIUS = 40;          // 热区半径（像素）

var app = Vue.createApp({
    data: function() {
        return {
            page: 'home',
            nickname: '',
            content: '',
            messages: [],
            isAdmin: false,                // 管理员状态
            clickCount: 0,                 // 热区点击计数
            clickTimer: null,              // 点击计时器
            hotspotRegistered: false       // 是否已注册热区监听
        };
    },
    methods: {

        // ── 存储 ──
        loadMsgs: function() {
            try {
                var d = localStorage.getItem('firefly_msgs');
                this.messages = d ? JSON.parse(d) : [];
            } catch (e) {
                this.messages = [];
            }
        },
        saveMsgs: function() {
            localStorage.setItem('firefly_msgs', JSON.stringify(this.messages));
        },

        // ── 敏感词检测 ──
        containsSensitive: function(text) {
            if (!text) return false;
            var lower = text.toLowerCase();
            return SENSITIVE_WORDS.some(function(word) {
                return lower.indexOf(word.toLowerCase()) !== -1;
            });
        },

        // ── 权限判断 ──
        canDelete: function(msg) {
            if (this.isAdmin) return true;
            var currentName = this.nickname.trim() || '';
            return msg.nickname === currentName;
        },

        // ── 热区点击处理 ──
        handleHotspotClick: function(e) {
            // 只在首页生效
            if (this.page !== 'home') return;

            // 获取"毁灭命途"标签
            var tags = document.querySelectorAll('.hero .tags span');
            if (tags.length < 3) return;
            var target = tags[2];  // 第三个标签是"毁灭命途"

            var rect = target.getBoundingClientRect();
            // 热区中心：标签右侧 40px，垂直居中
            var cx = rect.right + 20;
            var cy = rect.top + rect.height / 2;

            var dx = e.clientX - cx;
            var dy = e.clientY - cy;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > HOTSPOT_RADIUS) return;

            // 连续点击计数
            this.clickCount++;
            clearTimeout(this.clickTimer);

            if (this.clickCount >= 3) {
                this.clickCount = 0;
                this.showAdminLogin();
            } else {
                this.clickTimer = setTimeout(function() {
                    this.clickCount = 0;
                }.bind(this), CLICK_TIMEOUT);
            }
        },

        // ── 管理员登录弹窗 ──
        showAdminLogin: function() {
            var pwd = prompt('请输入管理员密码：');
            if (pwd === null) return;  // 用户取消
            if (pwd === ADMIN_PASSWORD) {
                this.isAdmin = true;
                alert('✅ 管理员模式已开启（仅本次浏览有效，刷新后自动退出）');
            } else if (pwd !== '') {
                alert('❌ 密码错误');
            }
        },

        // ── 退出管理员 ──
        logoutAdmin: function() {
            if (!this.isAdmin) return;
            if (confirm('确定退出管理员模式吗？')) {
                this.isAdmin = false;
            }
        },

        // ── 添加留言 ──
        addMsg: function() {
            var name = this.nickname.trim();
            var text = this.content.trim();

            if (!text) {
                alert('请写下你想说的话 ✦');
                return;
            }

            // 敏感词检测：昵称（非空时才检测）
            if (name && this.containsSensitive(name)) {
                alert('❌ 昵称包含敏感词，请修改');
                return;
            }

            // 敏感词检测：留言内容
            if (this.containsSensitive(text)) {
                alert('❌ 留言内容包含敏感词，请修改');
                return;
            }

            this.messages.unshift({
                id: Date.now(),
                nickname: name,
                content: text,
                time: new Date().toLocaleString('zh-CN')
            });
            this.saveMsgs();
            this.nickname = '';
            this.content = '';
        },

        // ── 删除留言 ──
        delMsg: function(i) {
            var msg = this.messages[i];
            if (!msg) return;

            // 权限检查
            if (!this.canDelete(msg)) {
                alert('❌ 你只能删除自己的留言');
                return;
            }

            var displayName = msg.nickname || '匿名开拓者';
            if (confirm('删除「' + displayName + '」的留言？')) {
                this.messages.splice(i, 1);
                this.saveMsgs();
            }
        },

        // ── 清空所有留言（仅管理员） ──
        clearAll: function() {
            if (!this.isAdmin) {
                alert('❌ 只有管理员可以清空所有留言');
                return;
            }
            if (this.messages.length === 0) return;
            if (confirm('⚠️ 清空全部 ' + this.messages.length + ' 条留言？')) {
                this.messages = [];
                this.saveMsgs();
            }
        },

        // ── 获取显示昵称 ──
        getDisplayName: function(msg) {
            return msg.nickname || '匿名开拓者';
        }
    },

    watch: {
        messages: {
            handler: function() {
                this.saveMsgs();
            },
            deep: true
        }
    },

    mounted: function() {
        this.loadMsgs();

        // 注册热区点击监听（全局，通过事件委托判断）
        document.addEventListener('click', function(e) {
            this.handleHotspotClick(e);
        }.bind(this));
    }
});

app.mount('#app');