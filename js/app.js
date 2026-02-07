// 主应用模块
window.App = {
    // 应用状态
    state: {
        currentPage: 'login',
        isLoading: false,
        currentClubId: null,
        privacyAgreed: false,
        unreadNotificationCount: 0  // 添加未读通知计数
    },
    
    // 初始化应用
    init: function() {
        console.log('教师视频俱乐部平台初始化...');
        
        // 初始化各模块
        Auth.init();
        Clubs.init();
        Tasks.init();
        Profile.init(); // 新增：初始化个人资料模块
        Notifications.init(); // 新增：初始化通知模块
        
        // 检查URL路由
        this.handleRouting();
        
        // 绑定事件
        this.bindEvents();
        
        // 检查是否已登录
        this.checkAutoLogin();
        
        // 检查隐私协议同意状态
        this.checkPrivacyAgreement();
        
        console.log('应用初始化完成');
        return this;
    },
    
    // 检查隐私协议同意状态
    checkPrivacyAgreement: function() {
        if (window.Utils) {
            const privacyData = Utils.getFromStorage('privacy_agreed');
            this.state.privacyAgreed = !!(privacyData && privacyData.agreed);
            
            if (this.state.privacyAgreed) {
                console.log('[隐私] 用户已同意隐私政策');
            } else {
                console.log('[隐私] 用户未同意隐私政策');
            }
        }
    },
    
    // 应用完整性检查
    initializeApp: function() {
        console.log('初始化应用完整性检查...');
        
        // 确保全局对象存在
        if (!window.Utils) {
            console.error('Utils 未加载');
            return false;
        }
        
        if (!window.API) {
            console.error('API 未加载');
            return false;
        }
        
        if (!window.Auth) {
            console.error('Auth 未加载');
            return false;
        }
        
        if (!window.Clubs) {
            console.error('Clubs 未加载');
            return false;
        }
        
        if (!window.Tasks) {
            console.error('Tasks 未加载');
            return false;
        }
        
        console.log('所有模块加载成功');
        return true;
    },
    
    // 处理路由
    handleRouting: function() {
        const hash = window.location.hash.substring(1);
        
        console.log('当前hash:', hash);
        
        if (hash) {
            // 解析hash，分离页面名和参数
            const [pageName, queryString] = hash.split('?');
            
            if (pageName) {
                this.state.currentPage = pageName;
                this.loadPage(pageName);
                this.updatePageDisplay();
            }
        } else {
            // 默认显示登录页
            this.state.currentPage = 'login';
            window.location.hash = 'login';
            this.loadPage('login');
            this.updatePageDisplay();
        }
    },
    
    // 绑定事件
    bindEvents: function() {
        // 监听hash变化（用于路由）
        window.addEventListener('hashchange', () => {
            this.handleRouting();
        });
        
        // 监听页面加载完成
        window.addEventListener('load', () => {
            // 确保页面正确显示
            this.updatePageDisplay();
        });
        
        // 监听回车键提交表单
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.tagName === 'INPUT') {
                    const form = activeElement.closest('form');
                    if (form) {
                        e.preventDefault();
                        this.handleFormSubmit(form);
                    }
                }
            }
        });
        
        // 监听隐私协议变化
        window.addEventListener('storage', (e) => {
            if (e.key === 'privacy_agreed') {
                this.checkPrivacyAgreement();
            }
        });
    },
    
    // 检查自动登录
    checkAutoLogin: function() {
        if (Auth.isLoggedIn()) {
            console.log('检测到已登录用户:', Auth.getUser().name);
            // 可以在这里自动跳转到首页
            // this.navigateTo('home');
        }
    },
    
    // ================ 页面导航 ================
    
    // 导航到指定页面
    navigateTo: function(pageName) {
        console.log('导航到页面:', pageName);
        
        this.state.currentPage = pageName;
        window.location.hash = pageName;
    },
    
    // 带参数的导航
    navigateToWithParams: function(pageName, params = {}) {
        console.log('带参数导航到页面:', pageName, params);
        
        this.state.currentPage = pageName;
        
        // 构建带参数的URL
        const queryString = new URLSearchParams(params).toString();
        const hash = queryString ? `${pageName}?${queryString}` : pageName;
        
        window.location.hash = hash;
    },
    
    // 加载页面
    loadPage: async function(pageName) {
        const container = document.getElementById('page-container');
        if (!container) return;

        // 清理之前页面添加的样式
        this.clearPageStyles();

        // 显示加载状态
        this.state.isLoading = true;
        Utils.showLoading(container);
        
        try {
            const pagePath = AppConfig.PAGE_PATHS[pageName.toUpperCase()];
            if (!pagePath) {
                throw new Error(`页面 ${pageName} 的路径未定义`);
            }
            
            // 加载页面HTML
            const response = await fetch(pagePath);
            if (!response.ok) {
                throw new Error(`加载页面失败: ${response.status}`);
            }
            
            const html = await response.text();
            
            // 解析HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 提取body内容
            const pageContent = doc.body.innerHTML;
            
            // 更新页面容器
            container.innerHTML = pageContent;

            // 执行页面特定的样式
            this.executePageStyles(doc);

            // 执行页面特定的脚本
            this.executePageScripts(doc);
            
            // 如果是首页，加载俱乐部数据
            if (pageName === 'home') {
                await this.renderHome();
            }
            
            // 更新用户显示
            if (Auth.isLoggedIn()) {
                Auth.updateUserDisplay();
            }
            
        } catch (error) {
            console.error('加载页面失败:', error);
            container.innerHTML = `
                <div class="error-page">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h1>页面加载失败</h1>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="App.navigateTo('login')">
                        <i class="fas fa-home"></i> 返回首页
                    </button>
                </div>
            `;
        } finally {
            this.state.isLoading = false;
        }
    },
    
    // 执行页面脚本
    executePageScripts: function(doc) {
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                // 外部脚本
                const newScript = document.createElement('script');
                newScript.src = script.src;
                document.head.appendChild(newScript);
            } else {
                // 内联脚本
                try {
                    eval(script.textContent);
                } catch (error) {
                    console.error('执行页面脚本失败:', error);
                }
            }
        });
    },

    // 执行页面样式
    executePageStyles: function(doc) {
        const styles = doc.querySelectorAll('style');
        styles.forEach(style => {
            const newStyle = document.createElement('style');
            newStyle.textContent = style.textContent;
            newStyle.setAttribute('data-page-style', 'true');
            document.head.appendChild(newStyle);
        });
    },

    // 清理页面样式
    clearPageStyles: function() {
        const pageStyles = document.querySelectorAll('style[data-page-style="true"]');
        pageStyles.forEach(style => style.remove());
    },
    
    // 更新页面显示
    updatePageDisplay: function() {
        // 更新页面标题
        const pageTitles = {
            'login': '登录 - 教师视频俱乐部',
            'register': '注册 - 教师视频俱乐部',
            'home': '我的俱乐部 - 教师视频俱乐部',
            'tasks': '任务管理 - 教师视频俱乐部'
        };
        
        if (pageTitles[this.state.currentPage]) {
            document.title = pageTitles[this.state.currentPage];
        }
    },
    
    // ================ 登录注册功能 ================
    
    // 验证登录表单
    validateLoginForm: function() {
        const name = document.getElementById('login-name')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();
        const privacyAgree = document.getElementById('privacy-agree')?.checked;
        
        let isValid = true;
        
        // 重置错误信息
        const nameError = document.getElementById('login-name-error');
        const passwordError = document.getElementById('login-password-error');
        const privacyError = document.getElementById('privacy-error');
        
        if (nameError) nameError.style.display = 'none';
        if (passwordError) passwordError.style.display = 'none';
        if (privacyError) privacyError.style.display = 'none';
        
        if (!name) {
            if (nameError) nameError.style.display = 'flex';
            isValid = false;
        }
        
        if (!password) {
            if (passwordError) passwordError.style.display = 'flex';
            isValid = false;
        }
        
        // 验证隐私协议
        if (!privacyAgree) {
            if (privacyError) privacyError.style.display = 'flex';
            isValid = false;
        }
        
        return { isValid, name, password, privacyAgree };
    },
    
    // 登录
    login: async function() {
        const { isValid, name, password, privacyAgree } = this.validateLoginForm();
        
        if (!isValid) {
            if (!privacyAgree) {
                Utils.showNotification('请同意隐私和数据使用说明', 'error');
            } else {
                Utils.showNotification('请填写完整的登录信息', 'error');
            }
            return;
        }
        
        try {
            // 显示加载状态
            this.state.isLoading = true;
            
            // 调用API登录（严格按照API文档格式）
            const result = await API.login({
                username: name,
                password: password
            });
            
            console.log('登录API响应:', result);
            
            if (result.code === 0) {
                // API文档格式：data中有accessToken和userInfo
                const { accessToken, userInfo } = result.data;
                
                if (!accessToken || !userInfo) {
                    throw new Error('API响应缺少必要的用户信息');
                }
                
                // 记录隐私协议同意状态（用于埋点）
                this.recordPrivacyAgreement(userInfo.userId);
                
                // 使用Auth模块处理登录成功
                const success = Auth.handleLoginSuccess(result);
                
                if (success) {
                    
                    // 显示成功消息
                    Utils.showNotification(`欢迎回来，${userInfo.username}！`, 'success');
                    
                    // 跳转到首页
                    setTimeout(() => {
                        this.navigateTo('home');
                    }, 500);
                } else {
                    Utils.showNotification('登录信息处理失败', 'error');
                }
            } else {
                Utils.showNotification(result.msg || '登录失败', 'error');
            }
            
        } catch (error) {
            console.error('登录失败:', error);
            Utils.showNotification(error.message || '登录失败', 'error');
        } finally {
            this.state.isLoading = false;
        }
    },
    
    // 记录隐私协议同意（用于埋点）
    recordPrivacyAgreement: function(userId) {
        if (!userId) return;
        
        try {
            // 记录用户同意隐私协议的事件
            const privacyData = Utils.getFromStorage('privacy_agreed') || {};
            
            // 更新同意记录
            const updatedData = {
                ...privacyData,
                userId: userId,
                agreedAt: new Date().toISOString(),
                version: '2026-01',
                // 埋点数据
                analytics: {
                    platform: 'web',
                    userAgent: navigator.userAgent,
                    screenResolution: `${window.screen.width}x${window.screen.height}`,
                    language: navigator.language
                }
            };
            
            Utils.saveToStorage('privacy_agreed', updatedData);
            
            // 这里可以发送埋点数据到服务器
            Utils.sendAnalyticsEvent('privacy_agreement_accepted', {
                category: 'session',
                user_id: userId,
                page: 'login',
                target_object: {
                    version: updatedData.version
                }
            });
            this.sendPrivacyAnalytics(userId, updatedData);
            
            console.log('[隐私] 隐私协议同意记录已更新');
            
        } catch (error) {
            console.error('[隐私] 记录隐私协议同意失败:', error);
        }
    },
    
    // 发送隐私分析数据（埋点）
    sendPrivacyAnalytics: function(userId, privacyData) {
        // 模拟发送埋点数据
        // 在实际应用中，这里应该发送到分析服务器
        console.log('[埋点] 发送隐私协议同意事件:', {
            event: 'privacy_agreement_accepted',
            userId: userId,
            timestamp: new Date().toISOString(),
            data: {
                agreedAt: privacyData.agreedAt,
                version: privacyData.version,
                deviceInfo: privacyData.analytics
            }
        });
        
        // 在实际应用中，可以这样发送：
        /*
        if (window.AppConfig.ANALYTICS_ENABLED) {
            fetch(AppConfig.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: 'privacy_agreement_accepted',
                    userId: userId,
                    timestamp: new Date().toISOString(),
                    data: privacyData
                })
            }).catch(error => {
                console.error('[埋点] 发送分析数据失败:', error);
            });
        }
        */
    },
    
    // 验证注册表单
    validateRegisterForm: function() {
        const username = document.getElementById('register-name')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-password-confirm')?.value;
        
        return {
            isValid: !!(username && password && confirmPassword && password === confirmPassword && password.length >= 6),
            username: username,
            password: password,
            role: 'user'  // 固定角色
        };
    },
    
    // 显示注册错误
    showRegisterError: function(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            const textElement = element.querySelector('span');
            if (textElement) {
                textElement.textContent = message;
            }
            element.style.display = 'flex';
        }
    },
    
    // 隐藏注册错误
    hideRegisterError: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },
    
    // 显示注册成功
    showRegisterSuccess: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'flex';
        }
    },
    
    // 隐藏注册成功
    hideRegisterSuccess: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },
    
    // 检查注册姓名
    checkRegisterName: function() {
        const name = document.getElementById('register-name')?.value.trim();
        if (!name) {
            this.showRegisterError('register-name-error', '姓名不能为空');
            this.hideRegisterSuccess('register-name-success');
            return false;
        }
        
        // 这里可以添加检查用户名是否已存在的逻辑
        // 暂时假设所有用户名都可用
        this.hideRegisterError('register-name-error');
        this.showRegisterSuccess('register-name-success');
        return true;
    },
    
    // 检查密码强度
    checkPasswordStrength: function() {
        const password = document.getElementById('register-password')?.value;
        const strengthBar = document.getElementById('password-strength-bar');
        const passwordError = document.getElementById('register-password-error');
        
        if (!password) {
            if (strengthBar) strengthBar.style.width = '0';
            if (passwordError) passwordError.style.display = 'none';
            return false;
        }
        
        // 计算密码强度
        const strength = Utils.checkPasswordStrength(password);
        
        // 设置强度条
        if (strengthBar) {
            let width = 0;
            let className = '';
            
            if (strength === 'weak') {
                width = 33;
                className = 'strength-weak';
            } else if (strength === 'medium') {
                width = 66;
                className = 'strength-medium';
            } else {
                width = 100;
                className = 'strength-strong';
            }
            
            strengthBar.style.width = width + '%';
            strengthBar.className = 'password-strength-bar ' + className;
        }
        
        // 显示/隐藏错误信息
        if (passwordError) {
            passwordError.style.display = password.length > 0 && password.length < 6 ? 'flex' : 'none';
        }
        
        return password.length >= 6;
    },
    
    // 检查密码匹配
    checkPasswordMatch: function() {
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-password-confirm')?.value;
        
        if (!confirmPassword) {
            this.hideRegisterError('register-confirm-error');
            this.hideRegisterSuccess('register-confirm-success');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showRegisterError('register-confirm-error', '两次输入的密码不一致');
            this.hideRegisterSuccess('register-confirm-success');
            return false;
        }
        
        this.hideRegisterError('register-confirm-error');
        this.showRegisterSuccess('register-confirm-success');
        return true;
    },
    
    // 注册
    register: async function() {
        const username = document.getElementById('register-name')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-password-confirm')?.value;
        
        // 验证表单
        if (!username || !password || !confirmPassword) {
            Utils.showNotification('请填写所有必填信息', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            Utils.showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        if (password.length < 6) {
            Utils.showNotification('密码至少需要6位', 'error');
            return;
        }
        
        try {
            this.state.isLoading = true;
            
            // 调用API注册 - 严格按照API文档格式
            // API文档：username(2-50字符), password(6-20字符), role(可选，默认'user')
            const result = await API.register({
                username: username,
                password: password,
                role: 'user'  // 固定为user角色，符合API文档默认值
            });
            
            console.log('注册API响应:', result);
            
            if (result.code === 0) {
                // 注册成功
                // 根据API文档，返回格式：{userId, username, role, createdAt}
                const { userId, username: apiUsername, role } = result.data;
                
                // 记录隐私协议同意状态（注册时也需要同意）
                this.recordPrivacyAgreement(userId);
                
                Utils.showNotification('注册成功！请使用新账号登录', 'success');
                
                // 清空表单
                const nameInput = document.getElementById('register-name');
                const pwdInput = document.getElementById('register-password');
                const confirmInput = document.getElementById('register-password-confirm');
                
                if (nameInput) nameInput.value = '';
                if (pwdInput) pwdInput.value = '';
                if (confirmInput) confirmInput.value = '';
                
                // 提示用户登录
                setTimeout(() => {
                    this.navigateTo('login');
                }, 1000);
                
            } else {
                Utils.showNotification(result.msg || '注册失败', 'error');
            }
            
        } catch (error) {
            console.error('注册失败:', error);
            Utils.showNotification(error.message || '注册失败', 'error');
        } finally {
            this.state.isLoading = false;
        }
    },

    // 隐藏登录错误提示
hideLoginError: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
},
    
    // ================ 俱乐部功能 ================
    
    // 渲染首页
    renderHome: async function() {
        if (!Auth.isLoggedIn()) {
            this.navigateTo('login');
            return;
        }
        
        try {
            // 加载俱乐部数据
            await Clubs.loadMyClubs();
            
            // 渲染俱乐部列表
            Clubs.renderClubList();
            
            // 更新用户显示
            Auth.updateUserDisplay();
            
        } catch (error) {
            console.error('渲染首页失败:', error);
            Utils.showNotification('加载俱乐部数据失败', 'error');
        }
    },
    
    // 打开加入俱乐部模态框
    openJoinClubModal: function() {
        const modal = document.getElementById('join-club-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // 清空搜索输入和结果
            const searchInput = document.getElementById('search-club-input');
            const searchResults = document.getElementById('search-results');
            
            if (searchInput) searchInput.value = '';
            if (searchResults) {
                searchResults.innerHTML = `
                    <div style="text-align: center; color: #999; padding: 40px 20px;">
                        <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p>输入关键词搜索俱乐部</p>
                    </div>
                `;
            }
        }
    },
    
    // 关闭加入俱乐部模态框
    closeJoinClubModal: function() {
        const modal = document.getElementById('join-club-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // 打开创建俱乐部模态框
    openCreateClubModal: function() {
        // 所有登录用户都可以创建俱乐部
        const modal = document.getElementById('create-club-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // 清空输入
            const nameInput = document.getElementById('new-club-name');
            const tagInput = document.getElementById('new-club-tag');
            const descInput = document.getElementById('new-club-description');
            
            if (nameInput) nameInput.value = '';
            if (tagInput) tagInput.value = '教研组';
            if (descInput) descInput.value = '';
        }
    },
    
    // 关闭创建俱乐部模态框
    closeCreateClubModal: function() {
        const modal = document.getElementById('create-club-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // 搜索俱乐部
    searchClubs: async function(keyword) {
    try {
        console.log('搜索俱乐部，关键词:', keyword);
        // 从API搜索俱乐部 - 适配新的API格式
        const response = await API.getAllClubs({ keyword: keyword });
        
        if (response && response.code === 0 && response.data && Array.isArray(response.data.list)) {
            // 过滤掉已加入的俱乐部和已归档的俱乐部
            const joinedIds = this.myClubs.map(club => club.id);
            
            const clubs = response.data.list
                .filter(club => !club.archived && club.status !== 'archived') // 过滤已归档
                .map(club => {
                    const creatorId = club.creator && club.creator.userId ? club.creator.userId : club.creatorId;
                    const creatorName = club.creator && club.creator.username ? club.creator.username : (club.creatorName || club.creator || '未知');
                    return ({
                        id: club.clubId,
                        name: club.name,
                        creatorId: creatorId,
                        creator: creatorName || '未知',
                        members: club.memberCount || 0,
                        tag: club.tag || '教研组',
                        description: club.description || '',
                        status: club.status || 'active',
                        archived: club.archived || false,
                        joinPolicy: club.joinPolicy || 'free',            // ← 添加这个
                        joinConditions: club.joinConditions || null       // ← 添加这个
                    });
                });
            
            return clubs.filter(club => !joinedIds.includes(club.id));
        } else {
            console.warn('搜索俱乐部API返回格式不正确:', response);
            return [];
        }
    } catch (error) {
        console.error('搜索俱乐部失败:', error);
        // 如果API失败，本地搜索
        const joinedIds = this.myClubs.map(club => club.id);
        return this.allClubs.filter(club => {
            if (joinedIds.includes(club.id)) return false;
            if (club.archived || club.status === 'archived') return false; // 过滤本地归档
            return club.name.includes(keyword) || 
                   club.tag.includes(keyword) || 
                   club.id.toString().includes(keyword);
        });
    }
},

    /**
 * 显示加入俱乐部对话框
 * @param {number} clubId - 俱乐部ID
 */
showJoinClubDialog: async function(clubId) {
    try {
        // 获取俱乐部详情以了解加入政策
        const clubDetail = await Clubs.getClubDetail(clubId);
        
        if (!clubDetail) {
            Utils.showNotification('获取俱乐部信息失败', 'error');
            return;
        }
        
        const isApprovalRequired = clubDetail.joinPolicy === 'approval';
        
        if (!isApprovalRequired) {
            // 自由加入，直接调用原来的joinClub方法
            this.joinClub(clubId);
            return;
        }
        
        // 需要审核，显示申请对话框
        const modalHTML = `
            <div id="join-request-modal" class="modal-overlay" style="display: flex;">
                <div class="modal">
                    <h3 style="margin-bottom: 20px;"><i class="fas fa-user-plus"></i> 申请加入俱乐部</h3>
                    <div style="margin-bottom: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                        <div style="display: flex; align-items: center; margin-bottom: 12px;">
                            <i class="fas fa-users" style="font-size: 20px; color: #1890ff; margin-right: 10px;"></i>
                            <div>
                                <strong style="font-size: 16px;">${clubDetail.name}</strong>
                                ${clubDetail.tag ? `<div style="font-size: 13px; color: #666;">标签：${clubDetail.tag}</div>` : ''}
                            </div>
                        </div>
                        ${clubDetail.joinConditions ? `
                        <div style="font-size: 13px; color: #666; margin-bottom: 8px; padding: 8px; background: #fff; border-radius: 4px; border-left: 3px solid #1890ff;">
                            <strong><i class="fas fa-info-circle"></i> 入会条件：</strong> ${clubDetail.joinConditions}
                        </div>
                        ` : ''}
                        <div style="font-size: 13px; color: #666;">
                            <div><i class="fas fa-user"></i> 创建者：${(clubDetail.creator && clubDetail.creator.username) || clubDetail.creatorName || '未知'}</div>
                            <div><i class="fas fa-users"></i> 成员：${clubDetail.memberCount || 0}人</div>
                        </div>
                    </div>
                    
                    <div class="form-item">
                        <label>申请说明（选填）</label>
                        <textarea id="join-apply-message" placeholder="请简单介绍一下自己或说明申请理由..." rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>
                    
                    <div style="text-align:right; margin-top: 24px;">
                        <button class="btn btn-outline" onclick="App.closeJoinRequestModal()">取消</button>
                        <button class="btn btn-primary" onclick="App.submitJoinRequest(${clubId})">提交申请</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 绑定点击外部关闭事件
        const modal = document.getElementById('join-request-modal');
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                this.closeJoinRequestModal();
            }
        }.bind(this));
        
    } catch (error) {
        console.error('显示加入对话框失败:', error);
        Utils.showNotification('加载失败: ' + error.message, 'error');
    }
},

/**
 * 关闭加入申请模态框
 */
closeJoinRequestModal: function() {
    const modal = document.getElementById('join-request-modal');
    if (modal) {
        modal.remove();
    }
},

/**
 * 提交加入申请
 * @param {number} clubId - 俱乐部ID
 */
submitJoinRequest: async function(clubId) {
    const messageInput = document.getElementById('join-apply-message');
    const applyMessage = messageInput ? messageInput.value.trim() : '';
    
    try {
        Utils.showNotification('正在提交申请...', 'info');
        
        // 调用新的加入俱乐部方法（支持申请信息）
        const result = await Clubs.joinClub(clubId, applyMessage);
        
        if (result.success) {
            if (result.status === 'joined') {
                Utils.showNotification(result.message, 'success');
                this.closeJoinClubModal();
                this.closeJoinRequestModal();
                this.enterTaskPage(clubId); // 直接进入任务页面
            } else if (result.status === 'pending') {
                Utils.showNotification(result.message, 'info');
                this.closeJoinClubModal();
                this.closeJoinRequestModal();
            } else {
                Utils.showNotification(result.message, 'info');
            }
        } else {
            Utils.showNotification(result.message || '申请失败', 'error');
        }
        
    } catch (error) {
        console.error('提交申请失败:', error);
        Utils.showNotification('提交失败: ' + error.message, 'error');
    }
},
    
    // 加入俱乐部
    joinClub: async function(clubId) {
        try {
            Utils.showNotification('正在加入俱乐部...', 'info');
            
            // 调用API加入俱乐部
            const result = await Clubs.joinClub(clubId);
            
            if (result.success) {
                Utils.showNotification(`成功加入${result.club.name}！`, 'success');
                this.closeJoinClubModal();
                this.enterTaskPage(clubId); // 直接进入任务页面
            } else {
                Utils.showNotification(result.message || '加入俱乐部失败', 'error');
            }
            
        } catch (error) {
            console.error('加入俱乐部失败:', error);
            Utils.showNotification(error.message || '加入俱乐部失败', 'error');
        }
    },
    
    // 创建新俱乐部
    // 创建新俱乐部
createNewClub: async function() {
    const nameInput = document.getElementById('new-club-name');
    const tagInput = document.getElementById('new-club-tag');
    const descInput = document.getElementById('new-club-description');
    const policySelect = document.getElementById('new-club-join-policy');
    const conditionsInput = document.getElementById('new-club-join-conditions');
    
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    const tag = tagInput ? tagInput.value.trim() : '教研组';
    const description = descInput ? descInput.value.trim() : '';
    const joinPolicy = policySelect ? policySelect.value : 'free';
    const joinConditions = joinPolicy === 'approval' && conditionsInput ? conditionsInput.value.trim() : null;
    
    if (!name) {
        Utils
.showNotification('请填写俱乐部名称', 'error');
        return;
    }
    
    if (name.length < 2 || name.length > 50) {
        Utils
.showNotification('俱乐部名称长度应在2-50字符之间', 'error');
        return;
    }
    
    try {
        // 显示加载状态
        Utils
.showNotification('正在创建俱乐部...', 'info');
        
        // 构建俱乐部数据，包括加入政策
        const clubData = {
            name: name,
            tag: tag,
            description:
 description
        };
        
        // 添加加入政策（如果用户选择了）
        if (joinPolicy) {
            clubData
.joinPolicy = joinPolicy;
            if (joinConditions) {
                clubData
.joinConditions = joinConditions;
            }
        }
        
        // 调用API创建俱乐部 - 严格按照API文档格式
        const result = await Clubs.createClub(clubData);
        
        if (result.success) {
            Utils
.showNotification(`俱乐部"${name}"创建成功！`, 'success');
            this.closeCreateClubModal();
            this.enterTaskPage(result.club ? result.club.id : undefined); // 直接进入任务页面
        } else {
            Utils
.showNotification(result.message || '创建俱乐部失败', 'error');
        }
        
    } catch (error) {
        console
.error('创建俱乐部失败:', error);
        Utils
.showNotification(error.message || '创建俱乐部失败', 'error');
    }
},

// 导航到通知列表
    navigateToNotifications: function() {
        console.log('导航到通知列表');
        this.navigateTo('notifications');
    },
    
    // 获取未读通知数量
    updateUnreadCount: function() {
        if (!Auth.isLoggedIn()) return;
        
        Notifications.getUnreadCount().then(count => {
            this.state.unreadNotificationCount = count;
            this.updateNotificationBadge();
        }).catch(error => {
            console.error('获取未读通知数量失败:', error);
        });
    },
    
    // 更新通知徽章显示
    updateNotificationBadge: function() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.state.unreadNotificationCount > 0) {
                badge.textContent = this.state.unreadNotificationCount > 99 ? '99+' : this.state.unreadNotificationCount.toString();
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },
    
    // ================ 任务功能 ================
    
    // 进入任务页面
    enterTaskPage: async function(clubId) {
        console.log('进入任务页面 - 通过接口获取任务数据');
        
        // 保存俱乐部ID
        if (Number.isInteger(clubId)) {
            this.state.currentClubId = clubId;
            if (window.Clubs && Clubs.setCurrentClub) {
                Clubs.setCurrentClub(clubId);
            }
        }
        
        // 跳转到视频页面（创建/查看任务）
        this.navigateTo('video');
    },
    
    // 标记任务完成（现在逻辑在tasks.html中处理，这里留空）
    markTaskComplete: async function(taskId) {
        console.log('任务完成逻辑在tasks.html中处理，这里仅作为兼容接口');
        // 什么都不做，逻辑已移动到tasks.html
    },
    
    // 更新任务UI显示
    updateTaskUI: function(taskId, status) {
        console.log('更新任务UI，任务ID:', taskId, '状态:', status);
        
        // 更新任务卡片显示
        const taskCards = document.querySelectorAll('.task-card-item');
        taskCards.forEach(card => {
            const cardTaskId = parseInt(card.getAttribute('data-task-id'));
            if (cardTaskId === taskId) {
                const statusElement = card.querySelector('.task-card-status');
                const actionButtons = card.querySelector('.task-card-actions');
                
                if (statusElement) {
                    if (status === 'complete') {
                        statusElement.innerHTML = '已完成 <i class="fas fa-check"></i>';
                        statusElement.className = 'task-card-status task-status-complete';
                        
                        // 更新按钮状态
                        if (actionButtons) {
                            actionButtons.innerHTML = '<button class="btn btn-outline" disabled><i class="fas fa-check-circle"></i> 已完成</button>';
                        }
                    }
                }
            }
        });
    },
    
    // 打开外部平台
    openExternalPlatform: function(taskId) {
        const success = Tasks.openExternalPlatform(taskId);
        
        if (success) {
            const task = Tasks.currentTasks.find(t => t.id === taskId);
            if (task) {
                const platformName = task.type === 'watch' ? '分秒帧平台' : '石墨文档协同空间';
                Utils.showNotification(`请在${platformName}完成任务后，返回此页面点击"标记完成"按钮`, 'info');
            }
        }
    },
    
    // ================ 其他功能 ================
    
    // 处理表单提交
    handleFormSubmit: function(form) {
        const formId = form.id;
        
        if (formId === 'login-form') {
            this.login();
        } else if (formId === 'register-form') {
            this.register();
        }
    },
    
    // 退出俱乐部
    quitClub: async function(clubId) {
        if (!confirm('确定要退出这个俱乐部吗？')) {
            return;
        }
        
        try {
            // 调用API退出俱乐部
            const result = await API.quitClub(clubId);
            
            if (result.code === 0) {
                Utils.showNotification('已成功退出俱乐部', 'success');
                
                // 从本地俱乐部列表中移除
                Clubs.myClubs = Clubs.myClubs.filter(club => club.id !== clubId);
                Clubs.saveClubsToStorage();
                
                // 重新渲染首页
                this.renderHome();
            } else {
                Utils.showNotification(result.msg || '退出俱乐部失败', 'error');
            }
            
        } catch (error) {
            console.error('退出俱乐部失败:', error);
            Utils.showNotification('退出俱乐部失败', 'error');
        }
    },
    
    enterVideoPage: function(clubId) {
        console.log('App.enterVideoPage 被调用，俱乐部ID:', clubId);
        
        // 设置当前俱乐部
        if (window.Clubs && window.Clubs.setCurrentClub) {
            window.Clubs.setCurrentClub(clubId);
        }
        
        // 更新App状态
        this.state.currentClubId = clubId;
        
        // 跳转到视频页面
        this.navigateTo('video');
    },
    
    // 登出
    logout: function() {
        if (!confirm('确定要退出登录吗？')) {
            return;
        }
        
        try {
            // 使用Auth模块处理登出
            Auth.logout().then(success => {
                if (success) {
                    // 清除俱乐部和任务缓存
                    Utils.removeFromStorage(AppConfig.STORAGE_KEYS.CLUBS_CACHE);
                    Utils.removeFromStorage(AppConfig.STORAGE_KEYS.TASKS_CACHE);
                    
                    // 跳转到登录页
                    this.navigateTo('login');
                    
                    Utils.showNotification('已退出登录', 'info');
                } else {
                    Utils.showNotification('退出登录失败', 'error');
                }
            }).catch(error => {
                console.error('登出失败:', error);
                Utils.showNotification('退出登录失败', 'error');
            });
            
        } catch (error) {
            console.error('登出失败:', error);
            Utils.showNotification('退出登录失败', 'error');
        }
    },
    
    // 显示通知
    showNotification: function(message, type) {
        Utils.showNotification(message, type);
    },

    // ================ 个人资料功能 ================

/**
 * 导航到个人资料页面
 */
navigateToProfile: function() {
    console.log('导航到个人资料页面');
    this.navigateTo('profile');
},

/**
 * 更新用户个人资料
 * @param {object} profileData - 个人资料数据
 */
updateUserProfile: async function(profileData) {
    try {
        if (!window.Profile) {
            throw new Error('个人资料模块未加载');
        }
        
        // 调用Profile模块保存资料
        const result = await window.Profile.saveUserProfile(profileData);
        
        if (result.success) {
            Utils.showNotification('个人资料更新成功', 'success');
            
            // 更新用户显示
            if (window.Auth && window.Auth.updateUserDisplay) {
                window.Auth.updateUserDisplay();
            }
            
            return true;
        } else {
            Utils.showNotification(result.message || '更新失败', 'error');
            return false;
        }
        
    } catch (error) {
        console.error('更新用户个人资料失败:', error);
        Utils.showNotification('更新失败: ' + error.message, 'error');
        return false;
    }
},

/**
 * 检查个人资料完成度
 * @returns {number} 完成度百分比
 */
checkProfileCompletion: function() {
    if (!window.Profile) {
        console.warn('个人资料模块未加载');
        return 0;
    }
    
    try {
        return window.Profile.calculateCompletion();
    } catch (error) {
        console.error('检查个人资料完成度失败:', error);
        return 0;
    }
},

/**
 * 获取个人资料完成度描述
 * @returns {string} 完成度描述
 */
getProfileCompletionDescription: function() {
    if (!window.Profile) {
        return '个人资料模块未加载';
    }
    
    try {
        return window.Profile.getCompletionDescription();
    } catch (error) {
        console.error('获取个人资料描述失败:', error);
        return '获取失败';
    }
},

/**
 * 检查是否需要提醒完善资料
 * @returns {boolean} 是否需要提醒
 */
shouldShowProfileReminder: function() {
    if (!window.Profile) {
        return false;
    }
    
    try {
        return window.Profile.shouldShowReminder();
    } catch (error) {
        console.error('检查个人资料提醒失败:', error);
        return false;
    }
},

/**
 * 导出个人资料
 */
exportProfile: function() {
    if (!window.Profile) {
        Utils.showNotification('个人资料模块未加载', 'error');
        return;
    }
    
    const success = window.Profile.exportProfile();
    
    if (success) {
        Utils.showNotification('个人资料导出成功', 'success');
    } else {
        Utils.showNotification('导出失败', 'error');
    }
},

/**
 * 清空个人资料
 */
clearProfile: function() {
    if (!window.Profile) {
        Utils.showNotification('个人资料模块未加载', 'error');
        return;
    }
    
    const success = window.Profile.clearProfile();
    
    if (success) {
        Utils.showNotification('个人资料已清空', 'info');
        // 刷新页面
        setTimeout(() => {
            this.navigateTo('profile');
        }, 1000);
    }
},
    
    // 发送用户行为埋点
    sendUserAction: function(action, data = {}) {
        if (!this.state.privacyAgreed) {
            console.log('[埋点] 隐私协议未同意，不发送埋点数据');
            return;
        }
        
        const user = Auth.getUser();
        if (!user) return;
        
        const eventData = {
            event: action,
            userId: user.userId,
            timestamp: new Date().toISOString(),
            page: this.state.currentPage,
            data: data,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            platform: 'web'
        };
        
        console.log('[埋点] 用户行为:', eventData);
        
        // 在实际应用中，可以发送到分析服务器
        /*
        if (window.AppConfig.ANALYTICS_ENABLED) {
            fetch(AppConfig.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            }).catch(error => {
                console.error('[埋点] 发送行为数据失败:', error);
            });
        }
        */
    }
};

