// 工具函数模块
const ANALYTICS_EVENT_TYPES = [
    'click',
    'input',
    'change',
    'submit',
    'page_view',
    'route_change',
    'scroll_depth',
    'page_visible',
    'page_hidden',
    'js_error',
    'resource_error',
    'unhandled_rejection',
    'page_performance'
];

const ANALYTICS_EVENT_MAP = {
    user_login: { event: 'submit', module: 'auth' },
    user_logout: { event: 'click', module: 'auth' },
    profile_updated: { event: 'change', module: 'profile' },
    privacy_agreement_accepted: { event: 'submit', module: 'privacy' }
};
window.Utils = {
    // 获取元素
    $: function(selector) {
        return document.querySelector(selector);
    },
    
    $$: function(selector) {
        return document.querySelectorAll(selector);
    },
    
    // 创建元素
    createElement: function(tag, className, innerHTML) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    
    // 显示/隐藏元素
    showElement: function(element) {
        if (element) element.style.display = 'block';
    },
    
    hideElement: function(element) {
        if (element) element.style.display = 'none';
    },
    
    // 格式化日期
    formatDate: function(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // 格式化时间
    formatTime: function(date) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    
    // 显示通知
    showNotification: function(message, type = 'info') {
        const notification = document.getElementById('taskNotification');
        if (!notification) {
            console.warn('Notification element not found');
            return;
        }
        
        notification.textContent = message;
        notification.className = `task-notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    },
    
    // 显示加载动画
    showLoading: function(element) {
        if (!element) return;
        const spinner = this.createElement('div', 'loading-spinner');
        element.innerHTML = '';
        element.appendChild(spinner);
    },
    
    // 移除加载动画
    hideLoading: function(element, content) {
        if (!element) return;
        element.innerHTML = content || '';
    },
    
    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 深拷贝
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // 验证邮箱
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // 验证手机号
    isValidPhone: function(phone) {
        const re = /^1[3-9]\d{9}$/;
        return re.test(phone);
    },
    
    // 生成随机ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // 获取URL参数
    getUrlParam: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    // 设置URL参数
    setUrlParam: function(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    },
    
    // 移除URL参数
    removeUrlParam: function(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    },
    
    // 复制到剪贴板
    copyToClipboard: function(text) {
        return navigator.clipboard.writeText(text);
    },
    
    // 检查密码强度
    checkPasswordStrength: function(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    },
    
    // 存储数据到本地存储
    saveToStorage: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存到本地存储失败:', error);
            return false;
        }
    },
    
    // 从本地存储读取数据
    getFromStorage: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('从本地存储读取失败:', error);
            return null;
        }
    },
    
    // 从本地存储移除数据
    removeFromStorage: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('从本地存储移除失败:', error);
            return false;
        }
    },
    
    // 清空所有本地存储
    clearStorage: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空本地存储失败:', error);
            return false;
        }
    },
    
    // ================ 隐私相关功能 ================
    
    // 检查隐私协议是否已同意
    isPrivacyAgreed: function() {
        const privacyData = this.getFromStorage('privacy_agreed');
        return !!(privacyData && privacyData.agreed);
    },
    
    // 获取隐私协议同意时间
    getPrivacyAgreementTime: function() {
        const privacyData = this.getFromStorage('privacy_agreed');
        return privacyData ? privacyData.agreedAt : null;
    },
    
    // 获取隐私协议版本
    getPrivacyVersion: function() {
        const privacyData = this.getFromStorage('privacy_agreed');
        return privacyData ? privacyData.version : null;
    },
    
    // 撤回隐私协议同意
    withdrawPrivacyAgreement: function() {
        try {
            // 保留用户ID但标记为撤回同意
            const privacyData = this.getFromStorage('privacy_agreed') || {};
            const updatedData = {
                ...privacyData,
                agreed: false,
                withdrawnAt: new Date().toISOString(),
                previousAgreement: privacyData.agreedAt
            };
            
            this.saveToStorage('privacy_agreed', updatedData);
            
            // 触发存储事件，让其他页面知道
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'privacy_agreed',
                newValue: JSON.stringify(updatedData)
            }));
            
            console.log('[隐私] 隐私协议同意已撤回');
            return true;
        } catch (error) {
            console.error('[隐私] 撤回隐私协议同意失败:', error);
            return false;
        }
    },
    
    // 导出用户数据
    exportUserData: function() {
        try {
            const userData = {
                userInfo: this.getFromStorage(AppConfig.STORAGE_KEYS.USER_INFO),
                clubsData: this.getFromStorage(AppConfig.STORAGE_KEYS.CLUBS_CACHE),
                tasksData: this.getFromStorage(AppConfig.STORAGE_KEYS.TASKS_CACHE),
                privacyData: this.getFromStorage('privacy_agreed'),
                exportDate: new Date().toISOString()
            };
            
            // 转换为JSON字符串
            const jsonData = JSON.stringify(userData, null, 2);
            
            // 创建下载链接
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teacher-video-club-data-${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[隐私] 用户数据导出成功');
            return true;
        } catch (error) {
            console.error('[隐私] 导出用户数据失败:', error);
            return false;
        }
    },
    
    // 删除用户数据
    deleteUserData: function() {
        if (!confirm('确定要删除所有本地用户数据吗？此操作不可撤销。')) {
            return false;
        }
        
        try {
            // 清除所有用户相关数据
            this.removeFromStorage(AppConfig.STORAGE_KEYS.USER_TOKEN);
            this.removeFromStorage(AppConfig.STORAGE_KEYS.USER_INFO);
            this.removeFromStorage(AppConfig.STORAGE_KEYS.CLUBS_CACHE);
            this.removeFromStorage(AppConfig.STORAGE_KEYS.TASKS_CACHE);
            
            // 保留隐私协议记录但标记为已删除
            const privacyData = this.getFromStorage('privacy_agreed') || {};
            const updatedPrivacyData = {
                ...privacyData,
                dataDeletedAt: new Date().toISOString(),
                dataDeleted: true
            };
            this.saveToStorage('privacy_agreed', updatedPrivacyData);
            
            // 触发存储事件
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'privacy_agreed',
                newValue: JSON.stringify(updatedPrivacyData)
            }));
            
            console.log('[隐私] 用户数据已删除');
            return true;
        } catch (error) {
            console.error('[隐私] 删除用户数据失败:', error);
            return false;
        }
    },
    
    // 发送隐私事件到服务器（埋点）
    sendPrivacyEvent: function(eventName, eventData = {}) {
        if (!this.isPrivacyAgreed()) {
            console.log('[埋点] 隐私协议未同意，不发送事件');
            return;
        }

        const payload = this.buildAnalyticsPayload(eventName, eventData);
        if (!payload) return;

        console.log('[埋点] 隐私事件:', payload);

        // 在实际应用中，这里应该发送到分析服务器
        if (window.AppConfig.ANALYTICS_ENABLED) {
            fetch(window.AppConfig.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }).catch(error => {
                console.error('[埋点] 发送隐私事件失败:', error);
            });
        }
    },

    // 将自定义事件名映射到后端允许的枚举
    normalizeAnalyticsEvent: function(eventName, eventData = {}) {
        const name = String(eventName || '').trim();
        if (!name) {
            return { event: 'click' };
        }
        if (ANALYTICS_EVENT_TYPES.includes(name)) {
            return {
                event: name,
                subEvent: eventData.sub_event || eventData.subEvent || undefined,
                module: eventData.module || undefined
            };
        }

        const mapped = ANALYTICS_EVENT_MAP[name];
        return {
            event: mapped ? mapped.event : 'click',
            subEvent: mapped?.subEvent || name,
            module: mapped?.module
        };
    },

    // 构建符合后端 DTO 的埋点 payload（snake_case）
    buildAnalyticsPayload: function(eventName, eventData = {}) {
        const normalized = this.normalizeAnalyticsEvent(eventName, eventData);
        const user = window.Auth ? window.Auth.getUser() : null;
        const fallbackUserId = eventData.user_id ?? eventData.userId;
        const fallbackUserName = eventData.user_name ?? eventData.userName ?? eventData.username;
        const fallbackUserTrueName = eventData.user_true_name ?? eventData.userTrueName;
        const appState = window.App && window.App.state ? window.App.state : null;
        const clubId = eventData.club_id ?? eventData.clubId ?? appState?.currentClubId;
        const pageValue = eventData.page || (window.location.hash || window.location.pathname);
        const resolvedUserId = user ? user.userId : fallbackUserId;
        const resolvedUserName = user?.username || user?.name || fallbackUserName;
        const resolvedUserTrueName = user?.profile?.realname || user?.profile?.realName || fallbackUserTrueName;

        let targetObject;
        try {
            if (eventData && Object.keys(eventData).length) {
                targetObject = JSON.stringify(eventData);
            }
        } catch (error) {
            targetObject = String(eventData);
        }

        const payload = {
            event: normalized.event,
            sub_event: normalized.subEvent,
            event_time: Date.now(),
            user_id: resolvedUserId !== undefined && resolvedUserId !== null ? Number(resolvedUserId) : undefined,
            user_name: resolvedUserName,
            user_true_name: resolvedUserTrueName,
            club_id: clubId !== undefined && clubId !== null ? Number(clubId) : undefined,
            page: pageValue,
            module: normalized.module || eventData.module,
            target_object: targetObject
        };

        return payload;
    },

    // 生成会话ID
    getSessionId: function() {
        let sessionId = this.getFromStorage('session_id');
        if (!sessionId) {
            sessionId = this.generateId();
            this.saveToStorage('session_id', sessionId);
        }
        return sessionId;
    }
};
