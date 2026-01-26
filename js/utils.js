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
        if (!this.isPrivacyAgreed()) {
            console.log('[埋点] 隐私协议未同意，不发送事件');
            return;
        }
        
        const user = window.Auth ? window.Auth.getUser() : null;
        
        const eventPayload = {
            event: eventName,
            timestamp: new Date().toISOString(),
            userId: user ? user.userId : 'anonymous',
            sessionId: this.getSessionId(),
            data: eventData
        };
        
        console.log('[埋点] 隐私事件:', eventPayload);
        
        // 在实际应用中，这里应该发送到分析服务器
        /*
        if (window.AppConfig.ANALYTICS_ENABLED) {
            fetch(window.AppConfig.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventPayload)
            }).catch(error => {
                console.error('[埋点] 发送隐私事件失败:', error);
            });
        }
        */
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
// Global interaction tracker (auto collection + manual track)
window.Tracker = (function() {
    const DEFAULTS = {
        ENABLED: true,
        ENDPOINT: '/analytics/events',
        SAMPLE_RATE: 1,
        FLUSH_INTERVAL: 5000,
        FLUSH_SIZE: 10,
        MAX_QUEUE: 200,
        DEBUG: false
    };

    const STORAGE_KEY = 'analytics_event_queue';

    const state = {
        initialized: false,
        enabled: true,
        config: { ...DEFAULTS },
        queue: [],
        lastRoute: null,
        scrollMarks: new Set(),
        flushTimer: null
    };

    function log(...args) {
        if (state.config.DEBUG) {
            console.log('[Tracker]', ...args);
        }
    }

    function safeGetStorage(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function safeSetStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (_) {}
    }

    function generateId() {
        if (window.Utils && Utils.generateId) return Utils.generateId();
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function getUserInfo() {
        if (window.Auth && Auth.getUser) {
            const user = Auth.getUser();
            if (user) {
                return {
                    user_id: user.userId || user.id || null,
                    user_name: user.username || user.name || null,
                    user_true_name: user.realname || user.realName || user.trueName || null
                };
            }
        }
        return { user_id: null, user_name: null, user_true_name: null };
    }

    function getClubId() {
        if (window.App && App.state && App.state.currentClubId) {
            return parseInt(App.state.currentClubId);
        }
        if (window.Clubs && Clubs.getCurrentClub) {
            const club = Clubs.getCurrentClub();
            if (club) return parseInt(club.id || club.clubId);
        }
        const hash = window.location.hash || '';
        if (hash.includes('?')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            const clubId = params.get('clubId');
            if (clubId) return parseInt(clubId);
        }
        if (window.Utils) {
            const saved = Utils.getFromStorage('current_club');
            if (saved) return parseInt(saved.id || saved.clubId);
        }
        return null;
    }

    function getPageName() {
        const hash = window.location.hash || '';
        if (hash.startsWith('#')) {
            const page = hash.slice(1).split('?')[0];
            if (page) return page;
        }
        const path = window.location.pathname || '';
        return path === '/' ? 'index' : path.split('/').pop();
    }

    function getEndpoint() {
        const endpoint = state.config.ENDPOINT || DEFAULTS.ENDPOINT;
        if (/^https?:\/\//i.test(endpoint) || endpoint.startsWith('//')) return endpoint;
        const base = (window.AppConfig && AppConfig.API_BASE_URL) ? AppConfig.API_BASE_URL : window.location.origin;
        const normalizedBase = base.replace(/\/$/, '');
        return `${normalizedBase}${endpoint}`;
    }

    function getAuthHeader() {
        try {
            const token = window.Utils ? Utils.getFromStorage(AppConfig.STORAGE_KEYS.USER_TOKEN) : null;
            return token ? { Authorization: `Bearer ${token}` } : {};
        } catch (_) {
            return {};
        }
    }

    function isIgnored(el) {
        if (!el) return true;
        return !!el.closest('[data-track="ignore"], [data-no-track="true"]');
    }

    function buildSelector(el) {
        if (!el || !el.tagName) return '';
        if (el.id) return `#${el.id}`;
        const tag = el.tagName.toLowerCase();
        const className = typeof el.className === 'string' ? el.className.trim() : '';
        if (!className) return tag;
        const classes = className.split(/\s+/).slice(0, 3).join('.');
        return `${tag}.${classes}`;
    }

    function elementInfo(el) {
        if (!el) return null;
        const tag = (el.tagName || '').toLowerCase();
        const info = { tag };
        if (el.id) info.id = el.id;
        if (typeof el.className === 'string' && el.className.trim()) {
            info.class = el.className.trim().split(/\s+/).slice(0, 3).join(' ');
        }
        const label = el.getAttribute('data-track-label') ||
            el.getAttribute('aria-label') ||
            el.getAttribute('title');
        if (label) info.label = String(label).slice(0, 64);
        const text = (el.textContent || '').trim();
        if (text && text.length <= 64 && tag !== 'input' && tag !== 'textarea') {
            info.text = text.slice(0, 64);
        }
        info.selector = buildSelector(el);
        info.module = el.getAttribute('data-track-module') || '';
        info.subEvent = el.getAttribute('data-track-event') || el.getAttribute('data-track') || '';
        return info;
    }

    function sanitizeInput(el) {
        if (!el) return null;
        const tag = (el.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') return null;
        const type = (el.getAttribute('type') || '').toLowerCase();
        const name = (el.getAttribute('name') || '').toLowerCase();
        if (type === 'password' || name.includes('password') || name.includes('token') || name.includes('secret')) {
            return { tag, type, name, ignored: true };
        }
        let valueLength = null;
        if (typeof el.value === 'string') valueLength = el.value.length;
        return { tag, type, name, value_length: valueLength };
    }

    function resolveSubEvent(info) {
        if (!info) return '';
        return info.subEvent || info.label || info.id || info.text || '';
    }

    function resolveTarget(info) {
        if (!info) return '';
        return info.selector || info.id || info.tag || '';
    }

    function buildBaseEvent(eventName, options = {}) {
        const userInfo = getUserInfo();
        const page = options.page || getPageName();
        const moduleName = options.module || getPageName();
        return {
            event_id: generateId(),
            user_id: userInfo.user_id,
            club_id: getClubId(),
            event_time: Date.now(),
            user_name: userInfo.user_name,
            user_true_name: userInfo.user_true_name,
            page: page,
            module: moduleName,
            event: eventName,
            sub_event: options.sub_event || null,
            target_object: options.target_object || null
        };
    }

    function persistQueue() {
        safeSetStorage(STORAGE_KEY, state.queue.slice(-state.config.MAX_QUEUE));
    }

    function loadQueue() {
        const saved = safeGetStorage(STORAGE_KEY);
        if (Array.isArray(saved)) {
            state.queue = saved.slice(-state.config.MAX_QUEUE);
        }
    }

    function enqueue(event) {
        if (!state.enabled) return;
        state.queue.push(event);
        if (state.queue.length > state.config.MAX_QUEUE) {
            state.queue = state.queue.slice(-state.config.MAX_QUEUE);
        }
        persistQueue();
        if (state.queue.length >= state.config.FLUSH_SIZE) {
            flush();
        }
    }

    function track(eventName, options) {
        if (!state.enabled) return;
        enqueue(buildBaseEvent(eventName, options || {}));
    }

    async function flush(useBeacon = false) {
        if (!state.enabled || state.queue.length === 0) return;
        const batch = state.queue.slice(0, state.config.FLUSH_SIZE);
        const payload = JSON.stringify({ events: batch });

        if (useBeacon && navigator.sendBeacon) {
            const ok = navigator.sendBeacon(getEndpoint(), payload);
            if (ok) {
                state.queue = state.queue.slice(batch.length);
                persistQueue();
            }
            return;
        }

        try {
            const res = await fetch(getEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: payload,
                keepalive: true
            });
            if (res && res.ok) {
                state.queue = state.queue.slice(batch.length);
                persistQueue();
            }
        } catch (error) {
            log('flush failed', error);
        }
    }

    function throttle(fn, wait) {
        let inThrottle = false;
        return function(...args) {
            if (inThrottle) return;
            inThrottle = true;
            fn.apply(this, args);
            setTimeout(() => { inThrottle = false; }, wait);
        };
    }

    function handleClick(e) {
        const target = e.target && e.target.closest
            ? e.target.closest('button, a, input, textarea, select, [data-track], [role="button"]')
            : e.target;
        if (!target || isIgnored(target)) return;
        const info = elementInfo(target);
        track('click', {
            module: info && info.module ? info.module : undefined,
            sub_event: resolveSubEvent(info),
            target_object: resolveTarget(info)
        });
    }

    function handleInput(e) {
        const target = e.target;
        if (!target || isIgnored(target)) return;
        const inputInfo = sanitizeInput(target);
        if (!inputInfo || inputInfo.ignored) return;
        const info = elementInfo(target);
        track('input', {
            module: info && info.module ? info.module : undefined,
            sub_event: resolveSubEvent(info),
            target_object: resolveTarget(info)
        });
    }

    function handleChange(e) {
        const target = e.target;
        if (!target || isIgnored(target)) return;
        const inputInfo = sanitizeInput(target);
        if (!inputInfo || inputInfo.ignored) return;
        const info = elementInfo(target);
        track('change', {
            module: info && info.module ? info.module : undefined,
            sub_event: resolveSubEvent(info),
            target_object: resolveTarget(info)
        });
    }

    function handleSubmit(e) {
        const form = e.target;
        if (!form || isIgnored(form)) return;
        const info = elementInfo(form);
        track('submit', {
            module: info && info.module ? info.module : undefined,
            sub_event: resolveSubEvent(info),
            target_object: resolveTarget(info)
        });
    }

    function handleScroll() {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
        const scrollHeight = doc.scrollHeight || document.body.scrollHeight || 1;
        const clientHeight = doc.clientHeight || window.innerHeight || 1;
        const percent = Math.min(100, Math.round((scrollTop + clientHeight) / scrollHeight * 100));
        const marks = [25, 50, 75, 100];
        marks.forEach(m => {
            if (percent >= m && !state.scrollMarks.has(m)) {
                state.scrollMarks.add(m);
                track('scroll_depth', {
                    sub_event: String(m),
                    target_object: 'scroll'
                });
            }
        });
    }

    function handleVisibility() {
        track(document.hidden ? 'page_hidden' : 'page_visible');
    }

    function handleHashChange() {
        const to = window.location.hash || '';
        const from = state.lastRoute;
        state.lastRoute = to;
        track('route_change', {
            sub_event: to || '',
            target_object: from || ''
        });
    }

    function handlePopState() {
        const to = window.location.href;
        const from = state.lastRoute;
        state.lastRoute = to;
        track('route_change', {
            sub_event: to || '',
            target_object: from || ''
        });
    }

    function handleError(event) {
        if (event && event.target && event.target !== window) {
            const target = event.target;
            track('resource_error', {
                sub_event: target.tagName || '',
                target_object: target.src || target.href || ''
            });
            return;
        }
        track('js_error', {
            sub_event: event.message || 'unknown',
            target_object: event.filename || ''
        });
    }

    function handleRejection(event) {
        let message = '';
        if (event && event.reason) {
            message = event.reason.message || String(event.reason);
        }
        track('unhandled_rejection', { sub_event: String(message).slice(0, 200) });
    }

    function trackPerformance() {
        if (!('performance' in window)) return;
        const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
        if (navEntries && navEntries.length) {
            const nav = navEntries[0];
            track('page_performance', {
                sub_event: nav.type || '',
                target_object: `duration:${Math.round(nav.duration)}`
            });
        }
    }

    function init(config) {
        if (state.initialized) return;
        const externalConfig = (window.AppConfig && AppConfig.ANALYTICS) ? AppConfig.ANALYTICS : {};
        state.config = { ...DEFAULTS, ...externalConfig, ...(config || {}) };

        if (!state.config.ENABLED) {
            state.enabled = false;
            return;
        }

        if (state.config.SAMPLE_RATE < 1 && Math.random() > state.config.SAMPLE_RATE) {
            state.enabled = false;
            return;
        }

        state.enabled = true;
        state.initialized = true;
        state.lastRoute = window.location.hash || window.location.href;
        loadQueue();

        document.addEventListener('click', handleClick, true);
        document.addEventListener('input', handleInput, true);
        document.addEventListener('change', handleChange, true);
        document.addEventListener('submit', handleSubmit, true);
        window.addEventListener('scroll', throttle(handleScroll, 500), { passive: true });
        document.addEventListener('visibilitychange', handleVisibility, true);
        window.addEventListener('hashchange', handleHashChange, true);
        window.addEventListener('popstate', handlePopState, true);
        window.addEventListener('error', handleError, true);
        window.addEventListener('unhandledrejection', handleRejection, true);
        window.addEventListener('beforeunload', () => flush(true));
        window.addEventListener('pagehide', () => flush(true));

        track('page_view', { sub_event: document.title });
        trackPerformance();

        state.flushTimer = setInterval(() => {
            flush();
        }, state.config.FLUSH_INTERVAL);

        log('initialized');
    }

    return {
        init,
        track,
        flush
    };
})();
