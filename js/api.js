// API调用模块
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
                        creator: {
                            userId: 1001,
                            username: "math_teacher"
                        },
                        tag: "数学",
                        description: "初中数学教学研讨",
                        memberCount: 12,
                        status: "active",
                        joinPolicy: "free",
                        joinConditions: null,
                        createdAt: "2026-01-01T10:00:00Z"
                    },
                    {
                        clubId: 102,
                        clubName: "PBL项目式学习",
                        creator: {
                            userId: 1002,
                            username: "pbl_teacher"
                        },
                        tag: "综合",
                        description: "项目式学习方法研讨",
                        memberCount: 8,
                        status: "active",
                        joinPolicy: "approval",
                        joinConditions: "仅限在职教师",
                        createdAt: "2026-01-02T10:00:00Z"
                    }
                ]
            },
            
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
            },
            
            // 通知模块 - 新增离线数据
            '/notifications': {
                code: 0,
                msg: 'success',
                data: {
                    list: [
                        {
                            notificationId: 1,
                            userId: 1001,
                            type: "club_join_request",
                            title: "新的入会申请",
                            content: "用户ID 1002 申请加入 PBL项目式学习",
                            payload: {
                                clubId: 102,
                                requestId: 1,
                                applicantId: 1002,
                                clubName: "PBL项目式学习",
                                applyMessage: "我是数学老师，希望加入学习"
                            },
                            isRead: false,
                            readAt: null,
                            createdAt: "2026-01-25T10:00:00Z"
                        }
                    ],
                    total: 1,
                    page: 1,
                    pageSize: 20
                }
            },
            
            '/notifications/unread-count': {
                code: 0,
                msg: 'success',
                data: {
                    total: 1
                }
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
     * @param {object} clubData - 俱乐部数据 {name, tag, description, joinPolicy, joinConditions}
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
     * @param {object} joinData - 加入数据 {applyMessage}
     * @returns {Promise} {code, msg, data: {clubId, status, requestId}}
     */
    async joinClub(clubId, joinData = {}) {
        const endpoint = window.AppConfig.API_ENDPOINTS.JOIN_CLUB;
        const data = { ...joinData, _pathParams: { id: clubId } };
        return await this.request(endpoint, 'POST', data);
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
     * @param {object} clubData - 更新的俱乐部数据 {name, tag, description, joinPolicy, joinConditions}
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

    /**
     * 4.8 归档俱乐部
     * @param {number} clubId - 俱乐部ID
     * @param {object} data - 归档数据 {status}
     * @returns {Promise} {code, msg, data: null}
     */
    async archiveClub(clubId, data = { status: 'archived' }) {
        const endpoint = window.AppConfig.API_ENDPOINTS.ARCHIVE_CLUB;
        const requestData = { ...data, _pathParams: { id: clubId } };
        return await this.request(endpoint, 'PATCH', requestData);
    },

    /**
     * 4.9 入会申请列表
     * @param {number} clubId - 俱乐部ID
     * @param {object} params - 查询参数 {status}
     * @returns {Promise} {code, msg, data: {list}}
     */
    async getJoinRequests(clubId, params = {}) {
        const endpoint = window.AppConfig.API_ENDPOINTS.GET_JOIN_REQUESTS;
        const queryString = this.buildQueryString(params);
        const fullEndpoint = endpoint.replace('{id}', clubId) + queryString;
        return await this.request(fullEndpoint, 'GET');
    },

    /**
     * 4.10 通过入会申请
     * @param {number} clubId - 俱乐部ID
     * @param {number} requestId - 申请ID
     * @returns {Promise} {code, msg, data: null}
     */
    async approveJoinRequest(clubId, requestId) {
        const endpoint = window.AppConfig.API_ENDPOINTS.APPROVE_JOIN_REQUEST;
        const fullEndpoint = endpoint.replace('{id}', clubId).replace('{requestId}', requestId);
        return await this.request(fullEndpoint, 'POST');
    },

    /**
     * 4.11 驳回入会申请
     * @param {number} clubId - 俱乐部ID
     * @param {number} requestId - 申请ID
     * @returns {Promise} {code, msg, data: null}
     */
    async rejectJoinRequest(clubId, requestId) {
        const endpoint = window.AppConfig.API_ENDPOINTS.REJECT_JOIN_REQUEST;
        const fullEndpoint = endpoint.replace('{id}', clubId).replace('{requestId}', requestId);
        return await this.request(fullEndpoint, 'POST');
    },
    
    // ================ 通知模块（需Token） ================
    
    /**
     * 9.1 站内信列表
     * @param {object} params - 查询参数 {isRead, page, pageSize}
     * @returns {Promise} {code, msg, data: {list}}
     */
    async getNotifications(params = {}) {
        const queryString = this.buildQueryString(params);
        return await this.request('/notifications' + queryString, 'GET');
    },

    /**
     * 9.2 未读数量
     * @returns {Promise} {code, msg, data: {total}}
     */
    async getUnreadCount() {
        return await this.request('/notifications/unread-count', 'GET');
    },

    /**
     * 9.3 标记已读
     * @param {number} notificationId - 通知ID
     * @returns {Promise} {code, msg, data: null}
     */
    async markNotificationAsRead(notificationId) {
        return await this.request(`/notifications/${notificationId}/read`, 'POST');
    },

    /**
     * 9.4 全部已读
     * @returns {Promise} {code, msg, data: null}
     */
    async markAllNotificationsAsRead() {
        return await this.request('/notifications/read-all', 'POST');
    },
    
    // ================ 任务模块（需Token） ================

    /**
     * 7.1 发布任务
     * @param {object} taskData - 任务数据 {clubId, videoId, type, title, description}
     * @returns {Promise} {code, msg, data: {taskId}}
     */
    async createTask(taskData) {
    const endpoint = window.AppConfig.API_ENDPOINTS.CREATE_TASK;
    
    // 构建请求数据，确保 unlockAt 被正确处理
    const requestData = {
        clubId: parseInt(taskData.clubId),
        title: taskData.title,
        description: taskData.description || '',
        type: 'all'
    };
    
    // 添加 unlockAt（如果有）
    if (taskData.unlockAt) {
        requestData.unlockAt = taskData.unlockAt;
    }
    
    console.log('发送到后端的最终数据:', requestData);
    
    return await this.request(endpoint, 'POST', requestData);
},

    /**
     * 7.3 任务列表
     * @param {number} clubId - 俱乐部ID
     * @returns {Promise} {code, msg, data: Array<任务信息>}
     */
    async getTasks(clubId) {
        const endpoint = window.AppConfig.API_ENDPOINTS.GET_TASKS;
        const queryString = this.buildQueryString({ clubId });
        return await this.request(endpoint + queryString, 'GET');
    },

    /**
     * 7.4 任务详情
     * @param {number} taskId - 任务ID
     * @returns {Promise} {code, msg, data: {taskInfo}}
     */
    async getTaskDetail(taskId) {
        const endpoint = '/tasks/{id}';
        return await this.request(endpoint, 'GET', { _pathParams: { id: taskId } });
    },

    /**
     * 7.2 提交子任务
     * @param {number} taskId - 任务ID
     * @param {number} subtaskId - 子任务ID (1:看视频, 2:研视频)
     * @param {object} completionData - 完成数据 {researchNotes, attachmentUrl}
     * @returns {Promise} {code, msg, data: null}
     */
    async completeSubTask(taskId, subtaskId, completionData = {}) {
        const endpoint = `/tasks/${taskId}/subtasks/${subtaskId}/complete`;
        return await this.request(endpoint, 'POST', completionData);
    },

    /**
     * 7.5 修改任务
     * @param {number} taskId - 任务ID
     * @param {object} taskData - 更新的任务数据 {title, description, videoId}
     * @returns {Promise} {code, msg, data: null}
     */
    async updateTask(taskId, taskData) {
    // 获取配置中的端点
    const baseEndpoint = window.AppConfig.API_ENDPOINTS.UPDATE_TASK;
    
    // 手动替换 :id 为实际taskId
    const endpoint = baseEndpoint.replace(':id', taskId);
    
    // 确保unlockAt是有效的日期字符串或null
    const requestData = { ...taskData };
    
    console.log('修改任务请求:', { endpoint, requestData });
    return await this.request(endpoint, 'PATCH', requestData);
},
    /**
     * 7.6 删除任务
     * @param {number} taskId - 任务ID
     * @returns {Promise} {code, msg, data: null}
     */
    async deleteTask(taskId) {
        // 获取配置中的端点
        const baseEndpoint = window.AppConfig.API_ENDPOINTS.DELETE_TASK;
        
        // 手动替换 :id 为实际taskId
        const endpoint = baseEndpoint.replace(':id', taskId);
        
        console.log('删除任务请求:', endpoint);
        return await this.request(endpoint, 'DELETE');
    }
};
