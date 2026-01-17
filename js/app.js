// 主应用模块
window.App = {
    // 应用状态
    state: {
        currentPage: 'login',
        isLoading: false,
        currentClubId: null
    },
    
    // 初始化应用
    init: function() {
        console.log('教师视频俱乐部平台初始化...');
        
        // 初始化各模块
        Auth.init();
        Clubs.init();
        Tasks.init();
        
        // 检查URL路由
        this.handleRouting();
        
        // 绑定事件
        this.bindEvents();
        
        // 检查是否已登录
        this.checkAutoLogin();
        
        console.log('应用初始化完成');
        return this;
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
            this.navigateTo('login');
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
        
        this.loadPage(pageName);
        this.updatePageDisplay();
    },
    
    // 带参数的导航
    navigateToWithParams: function(pageName, params = {}) {
        console.log('带参数导航到页面:', pageName, params);
        
        this.state.currentPage = pageName;
        
        // 构建带参数的URL
        const queryString = new URLSearchParams(params).toString();
        const hash = queryString ? `${pageName}?${queryString}` : pageName;
        
        window.location.hash = hash;
        
        this.loadPage(pageName);
        this.updatePageDisplay();
    },
    
    // 加载页面
    loadPage: async function(pageName) {
        const container = document.getElementById('page-container');
        if (!container) return;
        
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
        let isValid = true;
        
        // 重置错误信息
        const nameError = document.getElementById('login-name-error');
        const passwordError = document.getElementById('login-password-error');
        
        if (nameError) nameError.style.display = 'none';
        if (passwordError) passwordError.style.display = 'none';
        
        if (!name) {
            if (nameError) nameError.style.display = 'flex';
            isValid = false;
        }
        
        if (!password) {
            if (passwordError) passwordError.style.display = 'flex';
            isValid = false;
        }
        
        return { isValid, name, password };
    },
    
    // 登录
    login: async function() {
        const { isValid, name, password } = this.validateLoginForm();
        
        if (!isValid) {
            Utils.showNotification('请填写完整的登录信息', 'error');
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
                
                // 使用Auth模块处理登录成功
                const success = Auth.handleLoginSuccess(result);
                
                if (success) {
                    // 加载用户俱乐部数据
                    await Clubs.loadMyClubs();
                    
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
    
    // 验证注册表单
    validateRegisterForm: function() {
        const username = document.getElementById('register-name')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-confirm-password')?.value;
        
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
        const confirmPassword = document.getElementById('register-confirm-password')?.value;
        
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
        const confirmPassword = document.getElementById('register-confirm-password')?.value;
        
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
                
                Utils.showNotification('注册成功！请使用新账号登录', 'success');
                
                // 清空表单
                const nameInput = document.getElementById('register-name');
                const pwdInput = document.getElementById('register-password');
                const confirmInput = document.getElementById('register-confirm-password');
                
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
    searchClubs: async function() {
        const searchInput = document.getElementById('search-club-input');
        const resultsContainer = document.getElementById('search-results');
        
        if (!searchInput || !resultsContainer) return;
        
        const keyword = searchInput.value.trim();
        
        if (!keyword) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; color: #999; padding: 40px 20px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>请输入搜索关键词</p>
                </div>
            `;
            return;
        }
        
        try {
            Utils.showLoading(resultsContainer);
            
            // 搜索俱乐部 - 使用Clubs模块的searchClubs方法
            const searchResults = await Clubs.searchClubs(keyword);
            
            console.log('搜索到俱乐部:', searchResults);
            
            if (!searchResults || searchResults.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="text-align: center; color: #999; padding: 40px 20px;">
                        <i class="fas fa-search-minus" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p>未找到匹配的俱乐部</p>
                        <p style="font-size: 13px; margin-top: 8px;">尝试其他关键词</p>
                    </div>
                `;
                return;
            }
            
            // 显示搜索结果
            let resultsHTML = '';
            searchResults.forEach(club => {
                // 注意：club结构已经是转换后的格式
                resultsHTML += `
                    <div style="border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="font-size: 16px;">${club.name}</strong>
                            <span class="tag" style="background: linear-gradient(135deg, #e6f7ff, #bae7ff); color: #096dd9; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500;">ID: ${club.id}</span>
                        </div>
                        ${club.tag ? `<div style="font-size: 12px; margin-bottom: 8px;"><span style="background: #f0f0f0; padding: 2px 8px; border-radius: 10px;">${club.tag}</span></div>` : ''}
                        <div style="font-size: 12px; color: #999; display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span><i class="fas fa-user"></i> 创建者：${club.creator}</span>
                            <span><i class="fas fa-users"></i> 成员：${club.members}人</span>
                        </div>
                        ${club.description ? `<div style="font-size: 13px; color: #666; margin-bottom: 12px; line-height: 1.4;">${club.description}</div>` : ''}
                        <div style="text-align: right;">
                            <button class="btn btn-primary" onclick="App.joinClub(${club.id})" style="padding: 8px 16px; font-size: 13px;">
                                <i class="fas fa-user-plus"></i> 加入俱乐部
                            </button>
                        </div>
                    </div>
                `;
            });
            
            resultsContainer.innerHTML = resultsHTML;
            
        } catch (error) {
            console.error('搜索俱乐部失败:', error);
            resultsContainer.innerHTML = `
                <div style="text-align: center; color: #999; padding: 40px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>搜索失败</p>
                    <p style="font-size: 13px; margin-top: 8px;">${error.message}</p>
                </div>
            `;
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
                this.enterTaskPage(); // 直接进入任务页面
            } else {
                Utils.showNotification(result.message || '加入俱乐部失败', 'error');
            }
            
        } catch (error) {
            console.error('加入俱乐部失败:', error);
            Utils.showNotification(error.message || '加入俱乐部失败', 'error');
        }
    },
    
    // 创建新俱乐部
    createNewClub: async function() {
        const nameInput = document.getElementById('new-club-name');
        const tagInput = document.getElementById('new-club-tag');
        const descInput = document.getElementById('new-club-description');
        
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        const tag = tagInput ? tagInput.value.trim() : '教研组';
        const description = descInput ? descInput.value.trim() : '';
        
        if (!name) {
            Utils.showNotification('请填写俱乐部名称', 'error');
            return;
        }
        
        if (name.length < 2 || name.length > 50) {
            Utils.showNotification('俱乐部名称长度应在2-50字符之间', 'error');
            return;
        }
        
        try {
            // 显示加载状态
            Utils.showNotification('正在创建俱乐部...', 'info');
            
            // 调用API创建俱乐部 - 严格按照API文档格式
            // 参数：name(必填), tag(必填), description(可选)
            const result = await Clubs.createClub({
                name: name,
                tag: tag,
                description: description
            });
            
            if (result.success) {
                Utils.showNotification(`俱乐部"${name}"创建成功！`, 'success');
                this.closeCreateClubModal();
                this.enterTaskPage(); // 直接进入任务页面
            } else {
                Utils.showNotification(result.message || '创建俱乐部失败', 'error');
            }
            
        } catch (error) {
            console.error('创建俱乐部失败:', error);
            Utils.showNotification(error.message || '创建俱乐部失败', 'error');
        }
    },
    
    // ================ 任务功能 ================
    
// 进入任务页面
enterTaskPage: async function() {
    console.log('进入任务页面 - 强制设置任务数据');
    
    // 1. 设置固定任务数据
    const fixedTasks = [
        { 
            id: 1, 
            title: "看视频任务", 
            type: "watch", 
            description: "观看完整教学视频", 
            status: "incomplete", 
            externalLink: "https://app.mediatrack.cn/projects/2009960971614818304/files",
            platformName: "分秒帧平台"
        },
        { 
            id: 2, 
            title: "研视频任务", 
            type: "research", 
            description: "完成教学反思与研讨笔记", 
            status: "incomplete", 
            externalLink: "https://shimo.im/space/2wAldmGZonhwbwAP",
            platformName: "石墨文档协同空间"
        }
    ];
    
    // 2. 直接保存到sessionStorage
    sessionStorage.setItem('CURRENT_TASKS_FORCE', JSON.stringify(fixedTasks));
    
    // 3. 跳转到任务页面
    this.navigateTo('tasks');
    
    console.log('任务数据已保存到sessionStorage');
},
    // 标记任务完成（与API文档完全对接）
    markTaskComplete: async function(taskId) {
        console.log('标记任务完成，任务ID:', taskId);
        
        // 获取任务信息
        let task;
        if (window.Tasks && window.Tasks.currentTasks) {
            task = Tasks.currentTasks.find(t => t.id === taskId);
        }
        
        if (!task) {
            Utils.showNotification('任务不存在', 'error');
            return;
        }
        
        const platformName = task.type === 'watch' ? '分秒帧平台' : '石墨文档协同空间';
        
        // 根据任务类型显示不同的确认信息
        let confirmMessage = '';
        let requireNotes = false;
        
        if (task.type === 'watch') {
            confirmMessage = `请确认：\n\n✅ 已在 ${platformName} 完整观看视频\n✅ 视频研讨已完成\n\n如果还未完成，请点击"取消"先前往平台观看视频。\n\n确定标记为已完成吗？`;
            requireNotes = false;
        } else if (task.type === 'research') {
            confirmMessage = `请确认：\n\n✅ 已在 ${platformName} 完成教研笔记\n✅ 笔记内容已提交\n\n如果还未完成，请点击"取消"先前往平台完成笔记。\n\n确定标记为已完成吗？`;
            requireNotes = true;
        }
        
        if (!confirm(confirmMessage)) {
            Utils.showNotification('请先前往平台完成任务', 'info');
            return;
        }
        
        // 准备提交数据（根据API文档格式）
        const completionData = {};
        
        if (requireNotes) {
            // 如果是研视频任务，需要笔记内容（根据API文档）
            const researchNotes = prompt('请输入您的教研笔记内容（必填）：');
            if (researchNotes && researchNotes.trim()) {
                completionData.researchNotes = researchNotes.trim();
            } else {
                Utils.showNotification('请输入教研笔记内容', 'error');
                return;
            }
        }
        
        try {
            // 显示加载状态
            Utils.showNotification('正在提交任务完成状态...', 'info');
            
            // 调用Tasks模块的方法来更新状态并保存到API
            const result = await Tasks.updateTaskStatus(taskId, 'complete', completionData);
            
            if (result.success) {
                // 更新UI显示
                this.updateTaskUI(taskId, 'complete');
                
                const completionMessage = task.type === 'watch' 
                    ? '视频观看任务已标记为完成！'
                    : '教研笔记任务已标记为完成！';
                
                Utils.showNotification(completionMessage, 'success');
                
                // 检查是否所有任务都完成了
                if (Tasks.areAllTasksCompleted()) {
                    Utils.showNotification('🎉 恭喜！您已完成该视频的所有任务！', 'success');
                }
            } else {
                Utils.showNotification(result.message || '标记任务完成失败', 'error');
            }
            
        } catch (error) {
            console.error('标记任务完成失败:', error);
            Utils.showNotification('标记任务完成失败: ' + error.message, 'error');
        }
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
    }
};

// 应用初始化
document.addEventListener('DOMContentLoaded', function() {
    window.App.init();
});