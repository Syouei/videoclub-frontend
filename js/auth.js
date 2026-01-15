// 认证模块 - 适配新的API格式
window.Auth = {
    // 当前用户信息（根据API文档的userInfo结构）
    currentUser: null,
    
    /**
     * 初始化认证模块
     * @returns {object} Auth对象
     */
    init: function() {
        this.loadUserFromStorage();
        return this;
    },
    
    /**
     * 从本地存储加载用户信息
     * @returns {boolean} 是否成功加载
     */
    loadUserFromStorage: function() {
        try {
            const userData = Utils.getFromStorage(AppConfig.STORAGE_KEYS.USER_INFO);
            const token = Utils.getFromStorage(AppConfig.STORAGE_KEYS.USER_TOKEN);
            
            if (userData && token) {
                this.currentUser = userData;
                console.log('[Auth] 从本地存储加载用户:', this.currentUser.username);
                return true;
            }
        } catch (error) {
            console.error('[Auth] 加载用户信息失败:', error);
        }
        return false;
    },
    
    /**
     * 保存用户信息到本地存储（适配API响应格式）
     * @param {object} userInfo - API返回的userInfo对象 {userId, username, role, avatarUrl}
     * @param {string} accessToken - JWT访问令牌
     * @returns {boolean} 是否保存成功
     */
    saveUserToStorage: function(userInfo, accessToken) {
        try {
            // API返回的userInfo结构：{userId, username, role, avatarUrl}
            // 我们存储时需要添加一个显示用的name字段
            const userData = {
                // API原始字段
                userId: userInfo.userId,
                username: userInfo.username,
                role: userInfo.role || 'user',
                avatarUrl: userInfo.avatarUrl,
                
                // 前端显示字段（兼容旧代码）
                name: userInfo.username, // 使用username作为显示名称
                id: userInfo.userId      // 兼容旧代码中的id字段
            };
            
            Utils.saveToStorage(AppConfig.STORAGE_KEYS.USER_INFO, userData);
            Utils.saveToStorage(AppConfig.STORAGE_KEYS.USER_TOKEN, accessToken);
            
            this.currentUser = userData;
            console.log('[Auth] 保存用户信息:', userInfo.username);
            
            // 立即更新UI显示
            this.updateUserDisplay();
            
            return true;
        } catch (error) {
            console.error('[Auth] 保存用户信息失败:', error);
            return false;
        }
    },
    
    /**
     * 清除用户信息（登出）
     * @returns {boolean} 是否清除成功
     */
    clearUserStorage: function() {
        try {
            Utils.removeFromStorage(AppConfig.STORAGE_KEYS.USER_INFO);
            Utils.removeFromStorage(AppConfig.STORAGE_KEYS.USER_TOKEN);
            this.currentUser = null;
            console.log('[Auth] 清除用户信息');
            return true;
        } catch (error) {
            console.error('[Auth] 清除用户信息失败:', error);
            return false;
        }
    },
    
    /**
     * 检查是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn: function() {
        return !!this.currentUser;
    },
    
    /**
     * 获取当前用户信息
     * @returns {object|null} 用户信息或null
     */
    getUser: function() {
        return this.currentUser;
    },
    
    /**
     * 获取当前用户的用户名
     * @returns {string} 用户名
     */
    getUsername: function() {
        return this.currentUser ? this.currentUser.username : '';
    },
    
    /**
     * 获取当前用户的显示名称（兼容旧代码）
     * @returns {string} 显示名称
     */
    getDisplayName: function() {
        if (!this.currentUser) return '';
        // 优先使用name字段，没有则使用username
        return this.currentUser.name || this.currentUser.username || '';
    },
    
    /**
     * 获取当前用户的角色
     * @returns {string} 用户角色
     */
    getUserRole: function() {
        return this.currentUser ? this.currentUser.role : null;
    },
    
    /**
     * 获取当前用户的Token
     * @returns {string|null} Token或null
     */
    getToken: function() {
        return Utils.getFromStorage(AppConfig.STORAGE_KEYS.USER_TOKEN);
    },
    
    /**
     * 更新用户信息（部分更新）
     * @param {object} userData - 要更新的用户数据
     * @returns {boolean} 是否更新成功
     */
    updateUser: function(userData) {
        if (!this.currentUser) {
            console.warn('[Auth] 无法更新用户信息：当前用户为空');
            return false;
        }
        
        try {
            // 合并新数据
            this.currentUser = { ...this.currentUser, ...userData };
            
            // 确保必要的字段存在
            if (userData.username && !this.currentUser.name) {
                this.currentUser.name = userData.username;
            }
            
            // 保存到本地存储
            Utils.saveToStorage(AppConfig.STORAGE_KEYS.USER_INFO, this.currentUser);
            
            // 更新UI显示
            this.updateUserDisplay();
            
            console.log('[Auth] 更新用户信息成功');
            return true;
        } catch (error) {
            console.error('[Auth] 更新用户信息失败:', error);
            return false;
        }
    },
    
    /**
     * 检查用户权限（简化版）
     * @param {string} action - 要检查的动作
     * @returns {boolean} 是否有权限
     */
    hasPermission: function(action) {
        if (!this.currentUser) return false;
        
        // 所有登录用户都可以创建俱乐部
        if (action === 'create_club') {
            return true;
        }
        
        // 其他权限可以根据用户角色扩展
        // 例如：只有管理员可以删除俱乐部等
        
        return true; // 默认都有权限
    },
    
    /**
     * 更新用户显示信息（头像、用户名）
     * 在所有页面中更新用户显示
     */
    updateUserDisplay: function() {
        if (!this.currentUser) {
            console.warn('[Auth] 无法更新显示：当前用户为空');
            return;
        }
        
        // 获取显示名称（优先使用name，没有则用username）
        const displayName = this.getDisplayName();
        const firstChar = displayName ? displayName.charAt(0) : '?';
        
        // 更新所有头像元素
        const avatarElements = document.querySelectorAll('.avatar, .user-avatar');
        avatarElements.forEach(avatar => {
            avatar.textContent = firstChar;
        });
        
        // 更新所有用户名显示元素
        const nameElements = document.querySelectorAll(
            '#user-name-display, #video-user-name, #task-user-name, ' +
            '.user-name, .username-display'
        );
        
        nameElements.forEach(element => {
            if (element) {
                element.textContent = displayName;
            }
        });
        
        // 特殊处理：如果页面有特定的用户信息区域，也更新
        this.updateSpecificPageDisplays();
        
        console.log('[Auth] 更新用户显示:', displayName);
    },
    
    /**
     * 更新特定页面的显示（如有需要）
     */
    updateSpecificPageDisplays: function() {
        // 首页的用户信息区域
        const homeUserInfo = document.querySelector('.user-info');
        if (homeUserInfo && this.currentUser) {
            const nameSpan = homeUserInfo.querySelector('#user-name-display');
            const avatarDiv = homeUserInfo.querySelector('#user-avatar');
            
            if (nameSpan) nameSpan.textContent = this.getDisplayName();
            if (avatarDiv) avatarDiv.textContent = this.getDisplayName().charAt(0);
        }
        
        // 视频页面的用户信息
        const videoUserInfo = document.getElementById('video-user-name');
        if (videoUserInfo) {
            videoUserInfo.textContent = this.getDisplayName();
        }
        
        // 任务页面的用户信息
        const taskUserInfo = document.getElementById('task-user-name');
        if (taskUserInfo) {
            taskUserInfo.textContent = this.getDisplayName();
        }
    },
    
    /**
     * 自动登录（使用本地存储的token）
     * @returns {Promise<boolean>} 是否自动登录成功
     */
    autoLogin: async function() {
        try {
            if (!this.isLoggedIn()) {
                console.log('[Auth] 没有保存的用户信息，需要手动登录');
                return false;
            }
            
            const token = this.getToken();
            if (!token) {
                console.log('[Auth] Token不存在，需要重新登录');
                this.clearUserStorage();
                return false;
            }
            
            // 这里可以添加检查token有效性的API调用
            // 例如：尝试获取用户信息验证token是否有效
            try {
                const result = await API.getMyInfo();
                if (result.code === 0) {
                    console.log('[Auth] 自动登录成功:', result.data.username);
                    return true;
                } else {
                    console.warn('[Auth] Token已失效:', result.msg);
                    this.clearUserStorage();
                    return false;
                }
            } catch (error) {
                // API调用失败，但token存在，保持登录状态
                console.log('[Auth] 验证token失败，但保持登录状态:', error.message);
                return true;
            }
            
        } catch (error) {
            console.error('[Auth] 自动登录失败:', error);
            this.clearUserStorage();
            return false;
        }
    },
    
    /**
     * 处理登录成功后的操作
     * @param {object} apiResponse - API登录响应 {code, msg, data: {accessToken, userInfo}}
     * @returns {boolean} 是否处理成功
     */
    handleLoginSuccess: function(apiResponse) {
        if (!apiResponse || apiResponse.code !== 0 || !apiResponse.data) {
            console.error('[Auth] 无效的登录响应:', apiResponse);
            return false;
        }
        
        const { accessToken, userInfo } = apiResponse.data;
        
        if (!accessToken || !userInfo) {
            console.error('[Auth] 登录响应缺少必要字段:', apiResponse.data);
            return false;
        }
        
        // 保存用户信息
        const success = this.saveUserToStorage(userInfo, accessToken);
        
        if (success) {
            console.log('[Auth] 登录成功处理完成:', userInfo.username);
            return true;
        }
        
        return false;
    },
    
    /**
     * 处理注册成功后的操作（通常自动登录）
     * @param {object} apiResponse - API注册响应 {code, msg, data: {userId, username, role, createdAt}}
     * @returns {boolean} 是否处理成功
     */
    handleRegisterSuccess: function(apiResponse) {
        if (!apiResponse || apiResponse.code !== 0 || !apiResponse.data) {
            console.error('[Auth] 无效的注册响应:', apiResponse);
            return false;
        }
        
        const { userId, username, role } = apiResponse.data;
        
        if (!userId || !username) {
            console.error('[Auth] 注册响应缺少必要字段:', apiResponse.data);
            return false;
        }
        
        // 注册成功后，创建临时的userInfo对象
        const tempUserInfo = {
            userId: userId,
            username: username,
            role: role || 'user',
            avatarUrl: null
        };
        
        // 生成临时token（实际应该调用登录接口）
        const tempToken = 'temp_token_' + Date.now();
        
        // 保存用户信息
        const success = this.saveUserToStorage(tempUserInfo, tempToken);
        
        if (success) {
            console.log('[Auth] 注册成功处理完成:', username);
            // 提示用户需要登录
            Utils.showNotification('注册成功！请使用新账号登录', 'success');
            return true;
        }
        
        return false;
    },
    
    /**
     * 登出操作
     * @returns {Promise<boolean>} 是否登出成功
     */
    logout: async function() {
        try {
            // 可以调用API的登出接口（如果有）
            // await API.logout().catch(() => {});
            
            // 清除本地存储
            this.clearUserStorage();
            
            console.log('[Auth] 用户已登出');
            return true;
        } catch (error) {
            console.error('[Auth] 登出失败:', error);
            return false;
        }
    }
};