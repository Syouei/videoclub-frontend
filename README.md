

# 教师视频俱乐部前端项目

## 项目简介

教师视频俱乐部是一个面向教育场景的视频学习与交流平台前端项目，提供俱乐部管理、视频任务、学习进度跟踪等功能模块。本项目采用纯前端技术栈实现，通过调用后端API服务完成业务逻辑交互。

## 主要功能

### 用户模块
- **用户注册/登录**：支持隐私协议确认、密码强度检测
- **个人资料管理**：完善个人信息可获得积分奖励，包含姓名、性别、年龄、学校、联系方式等
- **用户认证**：基于Token的认证机制

### 俱乐部模块
- **俱乐部列表**：展示所有可加入的俱乐部
- **创建俱乐部**：可设置俱乐部名称、简介、入会条件等
- **俱乐部详情**：查看俱乐部详细信息
- **加入/退出俱乐部**：提交入会申请或退出现有俱乐部
- **俱乐部管理**：编辑俱乐部信息、归档或解散俱乐部

### 视频任务模块
- **任务列表**：查看已发布的学习任务
- **任务详情**：查看任务要求及解锁时间
- **任务完成状态**：追踪任务完成进度

### 通知系统
- **消息列表**：查看系统通知和审批消息
- **入会审批**：处理用户的加入申请
- **消息已读管理**：标记单条或全部消息为已读

## 项目结构

```
frontend/
├── .gitee/                  # Gitee平台配置
│   ├── ISSUE_TEMPLATE.zh-CN.md
│   └── PULL_REQUEST_TEMPLATE.zh-CN.md
├── css/
│   └── styles.css           # 全局样式文件
├── js/
│   ├── api.js               # API接口封装
│   ├── app.js               # 应用入口及初始化
│   ├── auth.js              # 认证相关逻辑
│   ├── clubs.js             # 俱乐部功能模块
│   ├── notifications.js     # 通知功能模块
│   ├── profile.js           # 个人资料模块
│   ├── tasks.js             # 任务管理模块
│   └── utils.js             # 工具函数
├── pages/
│   ├── home.html            # 俱乐部列表首页
│   ├── login.html           # 登录页面
│   ├── register.html        # 注册页面
│   ├── profile.html         # 个人资料页面
│   ├── tasks.html           # 任务列表页面
│   ├── video.html           # 视频任务页面
│   └── notifications.html   # 通知消息页面
├── index.html               # 主入口文件
├── config.js                # 配置文件
└── api-doc.md               # 后端API文档
```

## 技术栈

- **HTML5**：页面结构
- **CSS3**：样式设计，包含响应式布局
- **JavaScript (ES6+)**：业务逻辑实现
- **Fetch API**：网络请求
- **Gitee**：代码托管平台

## 快速开始

### 环境要求

- 现代浏览器（Chrome、Firefox、Edge等）
- 本地服务器（用于开发环境）
- 后端API服务（请参考api-doc.md配置）

### 本地运行

1. 克隆项目到本地：
```bash
git clone https://gitee.com/videoclub/frontend.git
```

2. 使用本地服务器运行（如使用VS Code的Live Server插件或Python http.server）

3. 在浏览器中访问对应地址

### 配置说明

修改`config.js`文件配置后端API地址：

```javascript
// API基础地址配置
const API_BASE_URL = 'your-api-server-address';
```

## 页面说明

| 页面 | 路径 | 功能描述 |
|------|------|----------|
| 登录页 | `/pages/login.html` | 用户登录入口 |
| 注册页 | `/pages/register.html` | 新用户注册 |
| 首页 | `/pages/home.html` | 俱乐部列表及加入入口 |
| 个人中心 | `/pages/profile.html` | 个人信息管理 |
| 任务页 | `/pages/tasks.html` | 学习任务列表 |
| 视频页 | `/pages/video.html` | 视频任务详情 |
| 通知页 | `/pages/notifications.html` | 消息通知及审批 |

## API文档

完整的后端API接口文档请参考`api-doc.md`文件，包含以下模块：

- 认证模块（注册、登录）
- 用户模块（资料管理、俱乐部列表）
- 俱乐部模块（创建、编辑、管理）
- 视频模块（上传、列表、详情）
- 评论模块（评论功能）
- 任务模块（发布、提交、列表）
- 统计模块（日志上报）
- 站内信模块（消息管理）

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Edge (最新版本)
- Safari (最新版本)

## 贡献指南

1. Fork本项目
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交Pull Request

提交Pull Request时请按照`.gitee/PULL_REQUEST_TEMPLATE.zh-CN.md`模板填写相关信息。

## 许可证

本项目仅供学习交流使用。

## 更新日志

详见`api-doc.md`中的更新日志部分。