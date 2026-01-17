window.AppConfig = {
    // API基础URL - 修改为你后端的地址
    // 注意：API文档指定基础路径为 /api/v1
    API_BASE_URL: 'http://videohub.rhuey.org/api/v1',
    
    // API端点配置（完全按照API文档）
    API_ENDPOINTS: {
        // ================ 认证模块（无需Token） ================
        // 2.1 用户注册
        REGISTER: '/auth/register',
        // 2.2 用户登录
        LOGIN: '/auth/login',
        
        // ================ 用户模块（需Token） ================
        // 3.1 获取我的个人资料
        GET_USER_INFO: '/users/me',
        // 3.2 修改个人资料
        UPDATE_USER_INFO: '/users/me',
        // 3.3 修改密码
        CHANGE_PASSWORD: '/users/me/password',
        // 3.4 获取我加入的俱乐部
        GET_MY_CLUBS: '/users/me/clubs',
        // 3.5 获取用户公开详情
        GET_USER_DETAIL: '/users/{id}',
        
        // ================ 俱乐部模块（需Token） ================
        // 4.1 创建俱乐部
        CREATE_CLUB: '/clubs',
        // 4.2 查询俱乐部列表
        GET_ALL_CLUBS: '/clubs',  // 支持query参数：keyword, page, pageSize
        // 4.3 查询俱乐部详情
        GET_CLUB_DETAIL: '/clubs/{id}',
        // 4.4 加入俱乐部
        JOIN_CLUB: '/clubs/{id}/join',
        // 4.5 退出俱乐部
        QUIT_CLUB: '/clubs/{id}/quit',
        // 4.6 编辑俱乐部
        UPDATE_CLUB: '/clubs/{id}',
        // 4.7 解散俱乐部
        DELETE_CLUB: '/clubs/{id}',
        
        // ================ 任务模块（需Token） ================
        GET_TASKS: '/tasks',
        COMPLETE_TASK: '/tasks/{id}/complete'
    },
    
    // 本地存储键名（保持不变）
    STORAGE_KEYS: {
        USER_TOKEN: 'teacher_video_club_token',
        USER_INFO: 'teacher_video_club_user',
        CLUBS_CACHE: 'teacher_video_club_clubs_cache',
        TASKS_CACHE: 'teacher_video_club_tasks_cache'
    },
    
    // 页面路径配置（保持不变）
    PAGE_PATHS: {
        LOGIN: 'pages/login.html',
        REGISTER: 'pages/register.html',
        HOME: 'pages/home.html',
        TASKS: 'pages/tasks.html'  
    },
    
    // 固定任务配置（新增）
    FIXED_TASKS: {
        WATCH_TASK: {
            id: 1,
            title: "观看教学视频",
            type: "watch",
            description: "前往分秒帧平台观看教学视频",
            externalLink: "https://app.mediatrack.cn/projects/2009960971614818304/files",
            platformName: "分秒帧平台"
        },
        RESEARCH_TASK: {
            id: 2,
            title: "教学研讨笔记",
            type: "research",
            description: "前往石墨文档完成教学研讨笔记",
            externalLink: "https://shimo.im/space/2wAldmGZonhwbwAP",
            platformName: "石墨文档协同空间"
        }
    },
    
    // 响应超时时间（毫秒）
    REQUEST_TIMEOUT: 10000,
    
    // 调试模式
    DEBUG_MODE: true
};
