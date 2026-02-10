// 工具函数模块
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
        this.sendAnalyticsEvent(eventName, {
            category: 'session',
            target_object: eventData
        });
    },

    // ================ 统计埋点（科研方案） ================

    getCurrentPage: function() {
        if (window.App && window.App.state && window.App.state.currentPage) {
            return window.App.state.currentPage;
        }
        const hash = window.location.hash || '';
        const raw = hash.startsWith('#') ? hash.slice(1) : hash;
        const page = raw.split('?')[0];
        return page || 'unknown';
    },

    getAnalyticsEndpoint: function() {
        const config = window.AppConfig || {};
        const endpoint = config.ANALYTICS_ENDPOINT || '/analytics/events';
        if (endpoint.startsWith('http')) return endpoint;
        const base = (config.API_BASE_URL || '').replace(/\/$/, '');
        return `${base}${endpoint}`;
    },

    isAnalyticsCategoryEnabled: function(category) {
        const config = window.AppConfig || {};
        const defaults = {
            LEARNING: true,
            TEACHING: true,
            INTERACTION: true,
            SESSION: true,
            SYSTEM: false
        };
        const categoryMap = {
            learning: 'LEARNING',
            teaching: 'TEACHING',
            interaction: 'INTERACTION',
            session: 'SESSION',
            system: 'SYSTEM'
        };
        const key = categoryMap[category] || category?.toUpperCase?.() || 'LEARNING';
        if (!config.ANALYTICS_CATEGORY) {
            return defaults[key] !== false;
        }
        if (config.ANALYTICS_CATEGORY[key] === undefined) {
            return defaults[key] !== false;
        }
        return config.ANALYTICS_CATEGORY[key] === true;
    },

    sendAnalyticsEvent: function(eventName, options = {}) {
        const config = window.AppConfig || {};
        if (!config.ANALYTICS_ENABLED) return;

        const category = options.category || 'learning';
        if (!this.isAnalyticsCategoryEnabled(category)) return;

        if (!this.isPrivacyAgreed() && eventName !== 'privacy_agreement_accepted') {
            console.log('[埋点] 隐私协议未同意，不发送事件');
            return;
        }

        const user = window.Auth ? window.Auth.getUser() : null;
        const realname = window.Profile && window.Profile.currentProfile ? window.Profile.currentProfile.realname : undefined;

        const targetObject = options.target_object || options.targetObject;
        const targetObjectValue = targetObject
            ? (typeof targetObject === 'string' ? targetObject : JSON.stringify(targetObject))
            : undefined;

        const payload = {
            user_id: options.user_id ?? (user ? user.userId : undefined),
            club_id: options.club_id,
            event_time: Date.now(),
            user_name: options.user_name ?? (user ? (user.username || user.name) : undefined),
            user_true_name: options.user_true_name ?? realname,
            page: options.page ?? this.getCurrentPage(),
            event: eventName,
            sub_event: options.sub_event,
            target_type: options.target_type,
            target_id: options.target_id !== undefined && options.target_id !== null ? String(options.target_id) : undefined,
            video_time: typeof options.video_time === 'number' ? options.video_time : undefined,
            target_object: targetObjectValue
        };

        // 清理空字段
        const cleaned = {};
        Object.keys(payload).forEach(key => {
            if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
                cleaned[key] = payload[key];
            }
        });

        if (config.DEBUG_MODE) {
            console.log('[埋点] 发送事件:', cleaned);
        }

        const headers = { 'Content-Type': 'application/json' };
        const token = this.getFromStorage(config.STORAGE_KEYS.USER_TOKEN);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(this.getAnalyticsEndpoint(), {
            method: 'POST',
            headers,
            body: JSON.stringify(cleaned)
        }).catch(error => {
            console.error('[埋点] 发送事件失败:', error);
        });
    },

    // 系统通用事件（默认不采集）
    sendSystemEvent: function(eventName, options = {}) {
        return this.sendAnalyticsEvent(eventName, {
            ...options,
            category: 'system'
        });
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
