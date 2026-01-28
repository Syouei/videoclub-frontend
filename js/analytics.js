// 埋点模块 - 按照后端API文档格式发送埋点数据
window.Analytics = {
    // 埋点接口地址
    ANALYTICS_ENDPOINT: '/analytics/events',

    /**
     * 发送埋点数据到后端
     * @param {object} eventData - 埋点数据，符合后端API文档格式
     */
    sendEvent: async function(eventData) {
        try {
            // 检查隐私协议是否已同意

            // 获取用户信息
            const user = window.Auth ? window.Auth.getUser() : null;
            const userInfo = user ? {
                user_id: user.userId,
                user_name: user.username,
                user_true_name: user.realname || user.username
            } : {};

            // 获取当前俱乐部ID
            const currentClubId = window.App ? window.App.state.currentClubId : null;

            // 构建完整的埋点数据（符合后端API文档格式）
            const payload = {
                ...eventData,
                ...userInfo,
                club_id: eventData.club_id || currentClubId,
                event_time: eventData.event_time || Date.now(),
                page: eventData.page || window.location.hash.substring(1) || window.location.pathname
            };

            console.log('[埋点] 发送事件:', payload);

            // 发送到后端API
            const response = await fetch(window.AppConfig.API_BASE_URL + this.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.code === 0) {
                    console.log('[埋点] 事件发送成功, eventId:', result.data?.eventId);
                } else {
                    console.warn('[埋点] 事件发送失败:', result.msg);
                }
            } else {
                console.warn('[埋点] 事件发送失败, HTTP状态:', response.status);
            }
        } catch (error) {
            console.error('[埋点] 发送事件异常:', error);
            // 埋点失败不应影响用户体验
        }
    },

    /**
     * 按钮点击埋点
     * @param {string} subEvent - 子事件类型，如 'login', 'register', 'join_club' 等
     * @param {object} data - 附加数据，如 target_object 等
     */
    trackButtonClick: function(subEvent, data = {}) {
        this.sendEvent({
            event: 'click',
            sub_event: subEvent,
            module: data.module || 'button',
            target_object: data.target_object
        });
    },

    /**
     * 表单提交埋点
     * @param {string} subEvent - 子事件类型，如 'login', 'register' 等
     * @param {object} data - 附加数据
     */
    trackFormSubmit: function(subEvent, data = {}) {
        this.sendEvent({
            event: 'submit',
            sub_event: subEvent,
            module: data.module || 'form',
            target_object: data.target_object
        });
    },

    /**
     * 输入事件埋点
     * @param {string} subEvent - 子事件类型
     * @param {object} data - 附加数据
     */
    trackInput: function(subEvent, data = {}) {
        this.sendEvent({
            event: 'input',
            sub_event: subEvent,
            module: data.module || 'input',
            target_object: data.target_object
        });
    },

    /**
     * 页面访问埋点
     * @param {string} page - 页面路径
     */
    trackPageView: function(page) {
        this.sendEvent({
            event: 'page_view',
            page: page || window.location.hash.substring(1) || window.location.pathname
        });
    },

    /**
     * 路由变化埋点
     * @param {string} from - 来源页面
     * @param {string} to - 目标页面
     */
    trackRouteChange: function(from, to) {
        this.sendEvent({
            event: 'route_change',
            sub_event: 'navigation',
            target_object: `${from} -> ${to}`
        });
    },

    /**
     * 页面可见性变化埋点
     * @param {string} state - 'visible' 或 'hidden'
     */
    trackPageVisibility: function(state) {
        this.sendEvent({
            event: state === 'visible' ? 'page_visible' : 'page_hidden',
            sub_event: 'visibility_change',
            target_object: window.location.hash.substring(1) || window.location.pathname
        });
    }
};

// 初始化埋点模块
document.addEventListener('DOMContentLoaded', function() {
    console.log('[埋点] 模块初始化');

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', function() {
        if (window.Analytics) {
            window.Analytics.trackPageVisibility(document.visibilityState);
        }
    });

    // 监听路由变化（hashchange）
    window.addEventListener('hashchange', function(e) {
        if (window.Analytics) {
            const newUrl = new URL(e.newURL);
            const oldUrl = new URL(e.oldURL);
            window.Analytics.trackRouteChange(oldUrl.hash, newUrl.hash);
            window.Analytics.trackPageView(newUrl.hash.substring(1) || '/');
        }
    });

    // 记录初始页面访问
    if (window.Analytics) {
        window.Analytics.trackPageView(window.location.hash.substring(1) || '/');
    }
});
