// API调用模块 - 完全按照API文档格式对接
window.API = {
    /**
     * 基础请求方法（处理所有API调用）
     * @param {string} endpoint - API端点路径
     * @param {string} method - HTTP方法
     * @param {object} data - 请求数据
     * @param {object} headers - 额外请求头
     * @returns {Promise} 返回Promise，解析为 {code, msg, data}
     */
    async request(endpoint, method = 'GET', data = null, headers = {}) {
        const config = window.AppConfig;
        
        // 替换路径中的占位符 {id}
        let url = endpoint;
        if (data && data._pathParams) {
            Object.keys(data._pathParams).forEach(key => {
                url = url.replace(`{${key}}`, data._pathParams[key]);
            });
            // 删除路径参数，不发送到body
            delete data._pathParams;
        }
        
        // 构建完整URL
        const fullUrl = config.API_BASE_URL + url;
        
        // 设置请求头
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        // 添加认证token（除了登录和注册）
        if (!endpoint.includes('/auth/')) {
            const token = Utils.getFromStorage(config.STORAGE_KEYS.USER_TOKEN);
            if (token) {
                defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
        }
        
        // 合并headers
        const requestHeaders = { ...defaultHeaders, ...headers };
        
        // 请求配置
        const requestOptions = {
            method: method,
            headers: requestHeaders,
            signal: AbortSignal.timeout ? AbortSignal.timeout(config.REQUEST_TIMEOUT) : null
        };
        
        // 添加请求体
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            requestOptions.body = JSON.stringify(data);
        }
        
        try {
            if (config.DEBUG_MODE) {
                console.log(`[API请求] ${method} ${fullUrl}`, data || '');
            }
            
            const response = await fetch(fullUrl, requestOptions);
            
            // 解析响应
            let result;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`非JSON响应: ${text}`);
            }
            
            if (config.DEBUG_MODE) {
                console.log(`[API响应] ${response.status} ${fullUrl}:`, result);
            }
            
            // 检查HTTP状态码
            if (!response.ok) {
                // HTTP错误
                throw new Error(result.msg || `HTTP错误: ${response.status}`);
            }
            
            // API文档格式：所有接口都返回 {code, msg, data}
            if (result.code !== undefined && result.msg !== undefined) {
                // 业务错误（code !== 0）
                if (result.code !== 0) {
                    throw new Error(result.msg || '业务逻辑错误');
                }
                
                return result; // 返回完整的 {code, msg, data}
            } else {
                // 响应格式不符合API文档
                console.warn('API响应格式不符合文档:', result);
                // 尝试适配旧格式
                return {
                    code: 0,
                    msg: 'success',
                    data: result
                };
            }
            
        } catch (error) {
            console.error(`[API错误] ${method} ${fullUrl}:`, error);
            
            // 如果是网络错误或超时，返回离线数据（开发用）
            if (error.name === 'TypeError' || 
                error.name === 'AbortError' || 
                error.message.includes('Network') ||
                error.message.includes('timeout')) {
                
                if (config.DEBUG_MODE) {
                    console.warn('使用离线数据');
                }
                return this.getOfflineData(endpoint, method, data);
            }
            
            // 其他错误，包装后抛出
            throw new Error(error.message || 'API请求失败');
        }
    },
    
    /**
     * 获取离线数据（开发/测试用）
     * 所有数据都按照 {code: 0, msg: 'success', data: ...} 格式
     */
    getOfflineData(endpoint, method, data) {
        const config = window.AppConfig;
        
        if (!config.DEBUG_MODE) {
            return {
                code: 10001,
                msg: '网络连接失败，请检查网络设置',
                data: null
            };
        }
        
        console.warn(`[离线模式] ${endpoint}`);
        
        // 离线数据响应（模拟API格式）
        const mockResponses = {
            // 认证模块
            '/auth/login': {
                code: 0,
                msg: '登录成功',
                data: {
                    accessToken: 'mock_jwt_token_' + Date.now(),
                    userInfo: {
                        userId: 1001,
                        username: data?.username || '王老师',
                        role: 'user',
                        avatarUrl: null
                    }
                }
            },
            '/auth/register': {
                code: 0,
                msg: '注册成功',
                data: {
                    userId: Date.now(),
                    username: data?.username || '新用户',
                    role: data?.role || 'user',
                    createdAt: new Date().toISOString()
                }
            },
            
            // 用户模块
            '/users/me': {
                code: 0,
                msg: 'success',
                data: {
                    userId: 1001,
                    username: '王老师',
                    role: 'user',
                    avatarUrl: null
                }
            },
            '/users/me/clubs': {
                code: 0,
                msg: 'success',
                data: [
                    {
                        clubId: 101,
                        clubName: "初中数学教研组",
                        memberRole: "manager",
                        joinTime: "2026-01-10T12:00:00Z"
                    },
                    {
                        clubId: 102,
                        clubName: "PBL项目式学习",
                        memberRole: "member",
                        joinTime: "2026-01-12T10:00:00Z"
                    }
                ]
            },
            
            // 俱乐部模块
            '/clubs': {
                code: 0,
                msg: 'success',
                data: [
                    {
                        clubId: 101,
                        clubName: "初中数学教研组",
                        creatorId: 1001,
                        tag: "数学",
                        description: "初中数学教学研讨",
                        memberCount: 12,
                        createdAt: "2026-01-01T10:00:00Z"
                    },
                    {
                        clubId: 102,
                        clubName: "PBL项目式学习",
                        creatorId: 1002,
                        tag: "综合",
                        description: "项目式学习方法研讨",
                        memberCount: 8,
                        createdAt: "2026-01-02T10:00:00Z"
                    }
                ]
            },
            
            // ⭐⭐⭐ 修改：删除视频模块的离线数据 ⭐⭐⭐
            
            // 任务模块
            '/tasks': {
                code: 0,
                msg: 'success',
                data: [
                    {
                        taskId: 1,
                        type: "watch",
                        title: "观看教学视频",
                        description: "前往分秒帧平台观看教学视频",
                        status: "incomplete"
                    },
                    {
                        taskId: 2,
                        type: "research",
                        title: "教学研讨笔记",
                        description: "前往石墨文档完成教学研讨笔记",
                        status: "incomplete"
                    }
                ]
            }
        };
        
        // 查找匹配的模拟数据
        for (const [key, value] of Object.entries(mockResponses)) {
            if (endpoint.includes(key)) {
                return value;
            }
        }
        
        // 默认返回成功（但不包含数据）
        return {
            code: 0,
            msg: 'success (离线模式)',
            data: null
        };
    },
    
    /**
     * 构建查询字符串
     * @param {object} params - 查询参数对象
     * @returns {string} 查询字符串
     */
    buildQueryString(params) {
        if (!params || Object.keys(params).length === 0) {
            return '';
        }
        
        const validParams = {};
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                validParams[key] = params[key];
            }
        });
        
        if (Object.keys(validParams).length === 0) {
            return '';
        }
        
        return '?' + new URLSearchParams(validParams).toString();
    },
    
    // ================ 认证模块（无需Token） ================
    
    /**
     * 2.2 用户登录
     * @param {object} credentials - 登录凭证
     * @returns {Promise} {code, msg, data: {accessToken, userInfo}}
     */
    async login(credentials) {
        const endpoint = window.AppConfig.API_ENDPOINTS.LOGIN;
        return await this.request(endpoint, 'POST', credentials);
    },
    
    /**
     * 2.1 用户注册
     * @param {object} userData - 用户注册数据
     * @returns {Promise} {code, msg, data: {userId, username, role, createdAt}}
     */
    async register(userData) {
        const endpoint = window.AppConfig.API_ENDPOINTS.REGISTER;
        return await this.request(endpoint, 'POST', userData);
    },
    
    // ================ 用户模块（需Token） ================
    
    /**
     * 3.1 获取我的个人资料
     * @returns {Promise} {code, msg, data: {userId, username, role, avatarUrl}}
     */
    async getMyInfo() {
        const endpoint = window.AppConfig.API_ENDPOINTS.GET_USER_INFO;
        return await this.request(endpoint, 'GET');
    },
    
    /**
     * 3.2 修改个人资料
     * @param {object} userData - 更新的用户数据
     * @returns {Promise} {code, msg, data: null}
     */
    async updateMyInfo(userData) {
        const endpoint = window.AppConfig.API_ENDPOINTS.UPDATE_USER_INFO;
        return await this.request(endpoint, 'PATCH', userData);
    },
    
    /**
     * 3.3 修改密码
     * @param {object} passwordData - 密码数据 {oldPassword, newPassword}
     * @returns {Promise} {code, msg, data: null}
     */
    async changePassword(passwordData) {
        const endpoint = window.AppConfig.API_ENDPOINTS.CHANGE_PASSWORD;
        return await this.request(endpoint, 'POST', passwordData);
    },
    
    /**
     * 3.4 获取我加入的俱乐部
     * @returns {Promise} {code, msg, data: Array<{clubId, clubName, memberRole, joinTime}>}
     */
    async getMyClubs() {
        const endpoint = window.AppConfig.API_ENDPOINTS.GET_MY_CLUBS;
        return await this.request(endpoint, 'GET');
    },

    async getUserDetail(userId) {
        const endpoint = window.AppConfig.API_ENDPOINTS.GET_USER_DETAIL;
        return await this.request(endpoint, 'GET', { _pathParams: { id: userId } });
    },
    
    // ================ 俱乐部模块（需Token） ================
    
    /**
     * 4.1 创建俱乐部
     * @param {object} clubData - 俱乐部数据 {name, tag, description}
     * @returns {Promise} {code, msg, data: {clubId}}
     */
    async createClub(clubData) {
        const endpoint = window.AppConfig.API_ENDPOINTS.CREATE_CLUB;
        return await this.request(endpoint, 'POST', clubData);
    },
    
    /**
     * 4.2 查询俱乐部列表
     * @param {object} params - 查询参数 {keyword, type, page, pageSize}
     * @returns {Promise} {code, msg, data: Array<俱乐部信息>}
     */
    async getAllClubs(params = {}) {
        const endpoint = window.AppConfig.API_ENDPOINTS.GET_ALL_CLUBS;
        const queryString = this.buildQueryString(params);
        return await this.request(endpoint + queryString, 'GET');
    },
    
    /**
     * 4.3 查询俱乐部详情
     * @param {number} clubId - 俱乐部ID
     * @returns {Promise} {code, msg, data: 俱乐部详细信息}
     */
    async getClubDetail(clubId) {
        const endpoint = window.AppConfig.API_ENDPOINTS.GET_CLUB_DETAIL;
        // 使用_pathParams传递路径参数
        return await this.request(endpoint, 'GET', { _pathParams: { id: clubId } });
    },
    
    /**
     * 4.4 加入俱乐部
     * @param {number} clubId - 俱乐部ID
     * @returns {Promise} {code, msg, data: {status: "joined"}}
     */
    async joinClub(clubId) {
        const endpoint = window.AppConfig.API_ENDPOINTS.JOIN_CLUB;
        return await this.request(endpoint, 'POST', { _pathParams: { id: clubId } });
    },
    
    /**
     * 4.5 退出俱乐部
     * @param {number} clubId - 俱乐部ID
     * @returns {Promise} {code, msg, data: null}
     */
    async quitClub(clubId) {
        const endpoint = window.AppConfig.API_ENDPOINTS.QUIT_CLUB;
        return await this.request(endpoint, 'POST', { _pathParams: { id: clubId } });
    },
    
    /**
     * 4.6 编辑俱乐部
     * @param {number} clubId - 俱乐部ID
     * @param {object} clubData - 更新的俱乐部数据 {name, tag, description}
     * @returns {Promise} {code, msg, data: null}
     */
    async updateClub(clubId, clubData) {
        const endpoint = window.AppConfig.API_ENDPOINTS.UPDATE_CLUB;
        const data = { ...clubData, _pathParams: { id: clubId } };
        return await this.request(endpoint, 'PATCH', data);
    },
    
    /**
     * 4.7 解散俱乐部
     * @param {number} clubId - 俱乐部ID
     * @returns {Promise} {code, msg, data: null}
     */
    async deleteClub(clubId) {
        const endpoint = window.AppConfig.API_ENDPOINTS.DELETE_CLUB;
        return await this.request(endpoint, 'DELETE', { _pathParams: { id: clubId } });
    },
    
    // ================ 任务模块（需Token） ================
    
    /**
     * 6.1 发布任务
     * @param {object} taskData - 任务数据 {clubId, videoId, type, title, description}
     * @returns {Promise} {code, msg, data: {taskId}}
     */
    async createTask(taskData) {
        const endpoint = window.AppConfig.API_ENDPOINTS.CREATE_TASK;
        return await this.request(endpoint, 'POST', taskData);
    },
    
    /**
     * 6.2 查询任务列表
     * @returns {Promise} {code, msg, data: Array<任务信息>}
     */
    async getTasks(params = {}) {
        const endpoint = window.AppConfig.API_ENDPOINTS.GET_TASKS;
        const queryString = this.buildQueryString(params);
        return await this.request(endpoint + queryString, 'GET');
    },
    
    /**
     * 6.3 提交/完成任务
     * @param {number} taskId - 任务ID
     * @param {object} completionData - 完成数据 {researchNotes, attachmentUrl}
     * @returns {Promise} {code, msg, data: null}
     */
    async completeTask(taskId, completionData = {}) {
        const endpoint = window.AppConfig.API_ENDPOINTS.COMPLETE_TASK;
        const data = { ...completionData, _pathParams: { id: taskId } };
        return await this.request(endpoint, 'POST', data);
    }
};
