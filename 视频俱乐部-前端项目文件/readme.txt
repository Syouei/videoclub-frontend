教师视频俱乐部 - 前后端接口说明
项目简介
前端已按照API文档修改，部分接口调用已实现，现在交付后端进行测试。

video-club-platform/
├── index.html          # 主入口文件
├── config.js          # API配置（修改这里的基础URL）
├── css/              # 样式文件
├── js/               # JavaScript模块
│   ├── utils.js      # 工具函数
│   ├── api.js        # API调用模块（完全按文档实现）
│   ├── auth.js       # 认证模块
│   ├── clubs.js      # 俱乐部模块
│   ├── tasks.js      # 任务模块
│   └── app.js        # 主应用
└── pages/            # 页面文件
    ├── login.html    # 登录页
    ├── register.html # 注册页
    ├── home.html     # 首页
    └── tasks.html    # 任务页

2. 配置后端地址
在 config.js 中修改 API 基础URL：
API_BASE_URL: 'http://你的后端地址:端口/api/v1'

📌 前端已实现的接口
✅ 已完成
认证模块

POST /auth/login - 用户登录

POST /auth/register - 用户注册

用户模块

GET /users/me - 获取我的信息

GET /users/me/clubs - 获取我加入的俱乐部

俱乐部模块

POST /clubs - 创建俱乐部

GET /clubs - 查询俱乐部列表（支持搜索）

GET /clubs/{id} - 俱乐部详情

POST /clubs/{id}/join - 加入俱乐部

POST /clubs/{id}/quit - 退出俱乐部

任务模块

POST /tasks/{id}/complete - 完成任务



🚀 快速测试数据
用户测试账号
json
用户名: "王老师"
密码: "123456"

⚠️ 特别注意
视频上传功能 视频页面删掉了  这边一直出问题还没调好  我建议先进行注册登录功能的测试以及俱乐部的创建，这些完成再进行视频及任务管理的工作
后端可以先不实现 POST /videos 接口，因为：

前端暂无视频上传界面

建议优先级
先对接：登录、注册、俱乐部功能（先把初步的功能实现）

再对接：视频列表、任务功能

最后：其他功能