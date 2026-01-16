# 教师视频俱乐部-前端 说明文档

Update Time: 2026.1.16

Developer: X.Z. Duan, J. Liu, J.Y. Wang, C.R. Zhu, J.J. Gao

## 一、项目简介

前端已严格按照 API 文档进行开发，**部分接口调用已完成实现**。
当前阶段交付后端进行接口联调与功能测试。

------

## 二、项目目录结构

```text
video-club-platform/
├── index.html          # 主入口文件
├── config.js           # API 配置（修改基础 URL）
├── css/                # 样式文件
├── js/                 # JavaScript 模块
│   ├── utils.js        # 工具函数
│   ├── api.js          # API 调用模块（按接口文档实现）
│   ├── auth.js         # 认证模块
│   ├── clubs.js        # 俱乐部模块
│   ├── tasks.js        # 任务模块
│   └── app.js          # 主应用入口
└── pages/              # 页面文件
    ├── login.html      # 登录页
    ├── register.html   # 注册页
    ├── home.html       # 首页
    └── tasks.html      # 任务页
```

------

## 三、后端地址配置

请在 `config.js` 中配置后端 API 基础地址：

```js
API_BASE_URL: 'http://你的后端地址:端口/api/v1'
```

------

## 四、前端已实现接口说明

### 已完成接口

#### 1. 认证模块

- `POST /auth/login`
  用户登录
- `POST /auth/register`
  用户注册

#### 2. 用户模块

- `GET /users/me`
  获取当前用户信息
- `GET /users/me/clubs`
  获取我加入的俱乐部列表

#### 3. 俱乐部模块

- `POST /clubs`
  创建俱乐部
- `GET /clubs`
  查询俱乐部列表（支持搜索）
- `GET /clubs/{id}`
  获取俱乐部详情
- `POST /clubs/{id}/join`
  加入俱乐部
- `POST /clubs/{id}/quit`
  退出俱乐部

#### 4. 任务模块

- `POST /tasks/{id}/complete`
  完成任务

------

## 五、快速测试数据

### 测试账号

```json
{
  "username": "王老师",
  "password": "123456"
}
```

------

## 六、重要说明

### 1. 视频上传功能说明

- 视频页面 **已从前端移除**
- 视频上传功能目前存在问题，尚未调试完成
- **建议当前阶段不要对接视频上传相关接口**

后端可暂不实现以下接口：

```http
POST /videos
```

原因：

- 前端暂无视频上传页面
- 当前联调阶段重点不在视频功能

------

## 七、后端对接优先级建议

**第一阶段（优先）**

- 登录
- 注册
- 俱乐部创建 / 加入 / 查询

**第二阶段**

- 视频列表
- 任务功能

**第三阶段**

- 其他扩展功能
