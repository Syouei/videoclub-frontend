
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
        // 4.8 归档俱乐部 
        ARCHIVE_CLUB: '/clubs/{id}/archive',
        // 4.9 入会申请列表
        GET_JOIN_REQUESTS: '/clubs/{id}/join-requests',
        // 4.10 通过入会申请
        APPROVE_JOIN_REQUEST: '/clubs/{id}/join-requests/{requestId}/approve',
        // 4.11 驳回入会申请
        REJECT_JOIN_REQUEST: '/clubs/{id}/join-requests/{requestId}/reject',
        
        // ================ 通知模块（需Token） ================
        // 9.1 站内信列表
        GET_NOTIFICATIONS: '/notifications',
        // 9.2 未读数量
        GET_UNREAD_COUNT: '/notifications/unread-count',
        // 9.3 标记已读
        MARK_NOTIFICATION_READ: '/notifications/{id}/read',
        // 9.4 全部已读
        MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',
        
        // ================ 任务模块（需Token） ================
        CREATE_TASK: '/tasks',
        GET_TASKS: '/tasks',
        GET_TASK_DETAIL: '/tasks/{id}',
        COMPLETE_SUBTASK: '/tasks/{taskId}/subtasks/{subtaskId}/complete',
        UPDATE_TASK: '/tasks/:id',      // 7.5 修改任务
        DELETE_TASK: '/tasks/:id',      // 7.6 删除任务

        // ================ 视频评论模块（需Token） ================
        // 获取视频评论列表
        GET_VIDEO_COMMENTS: '/videos/{videoId}/comments',
        // 提交视频评论
        SUBMIT_VIDEO_COMMENT: '/videos/{videoId}/comments',
        // 点赞评论
        LIKE_COMMENT: '/comments/{commentId}/like',
        // 删除评论
        DELETE_COMMENT: '/comments/{commentId}',
        // 获取热门时间点
        GET_HOT_TIMESTAMPS: '/videos/{videoId}/hot-timestamps',
        // 获取视频信息
        GET_VIDEO_INFO: '/videos/{videoId}'
    },
    
    // 本地存储键名（保持不变）
    STORAGE_KEYS: {
        USER_TOKEN: 'teacher_video_club_token',
        USER_INFO: 'teacher_video_club_user',
        CLUBS_CACHE: 'teacher_video_club_clubs_cache',
        TASKS_CACHE: 'teacher_video_club_tasks_cache',
        NOTIFICATIONS: 'teacher_video_club_notifications',
        VIDEO_COMMENTS: 'teacher_video_club_video_comments'  // 新增：视频评论缓存
    },
    
    // 页面路径配置（添加视频播放页面）
    PAGE_PATHS: {
        LOGIN: 'pages/login.html',
        REGISTER: 'pages/register.html',
        HOME: 'pages/home.html',
        VIDEO: 'pages/video.html',
        TASKS: 'pages/tasks.html',
        PROFILE: 'pages/profile.html',
        NOTIFICATIONS: 'pages/notifications.html',
        VIDEO_PLAYER: 'pages/video-player.html',  // 新增：视频播放页面
        'VIDEO-PLAYER': 'pages/video-player.html'  // 兼容连字符格式
    },

    // 修改用户信息字段配置，使用API文档的字段名：
    USER_INFO_FIELDS: {
        required: ['realname', 'gender', 'age', 'school', 'phone', 'email'],
        optional: ['studentId', 'job', 'signature'],
        genders: [
            { value: 'male', label: '男' },
            { value: 'female', label: '女' },
            { value: 'other', label: '其他' },
            { value: 'secret', label: '保密' }
        ],
        jobs: [
            { value: 'student', label: '学生' },
            { value: 'teacher', label: '教师' }
        ]
    },

    // 添加资料完成度配置：
    USER_PROFILE_COMPLETION: {
        thresholds: {
            basic: 60,
            medium: 80,
            complete: 95
        }
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

    // 视频播放配置
    VIDEO_CONFIG: {
        // 默认视频源（用于开发和测试）
        DEFAULT_VIDEO_URL: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        // 支持的视频格式
        SUPPORTED_FORMATS: ['video/mp4', 'video/webm', 'video/ogg'],
        // 默认视频分辨率
        DEFAULT_RESOLUTION: '720p',
        // 视频缓存配置
        CACHE_ENABLED: true,
        CACHE_SIZE: 100, // MB
        // 自动播放策略
        AUTOPLAY_POLICY: 'user-gesture-required'
    },

    // 评论系统配置
    COMMENTS_CONFIG: {
        // 每页评论数量
        PAGE_SIZE: 20,
        // 最大评论长度
        MAX_LENGTH: 1000,
        // 时间戳精度（秒）
        TIMESTAMP_PRECISION: 1,
        // 热门时间点阈值
        HOT_TIMESTAMP_THRESHOLD: 3,
        // 允许回复的最大层级
        MAX_REPLY_DEPTH: 3,
        // 评论排序方式
        SORT_OPTIONS: [
            { value: 'timestamp', label: '按时间戳' },
            { value: 'newest', label: '最新' },
            { value: 'popular', label: '最热' }
        ]
    },
    
    // ================ 埋点分析配置 ================
    
    // 分析功能开关
    ANALYTICS_ENABLED: true,
    
    // 分析服务器端点（可根据需要配置）
    ANALYTICS_ENDPOINT: 'https://analytics.teachervideoclub.com/events',
    
    // 隐私政策版本
    PRIVACY_VERSION: '2026-01',
    
    // 响应超时时间（毫秒）
    REQUEST_TIMEOUT: 10000,
    
    // 调试模式
    DEBUG_MODE: true,

    // 功能开关配置
    FEATURE_FLAGS: {
        // 是否启用视频播放功能
        VIDEO_PLAYER_ENABLED: true,
        // 是否启用评论功能
        COMMENTS_ENABLED: true,
        // 是否启用时间戳关联
        TIMESTAMP_LINKING_ENABLED: true,
        // 是否启用文件上传
        FILE_UPLOAD_ENABLED: true,
        // 是否启用离线模式
        OFFLINE_MODE_ENABLED: true
    }
};
