这份完整的 API 文档基于你提供的 `database.md`（数据结构）、`code-style.md`（接口规范）以及我们已经确定的代码实现（Auth/User/Club/Video/Task 模块）整理而成。

文档已按照标准 RESTful 风格编写，并严格遵守规定的 `{ code, msg, data }` 响应格式。

------

# 视频俱乐部系统 API 文档

- **基础路径 (Base URL)**: `/api/v1`
- **鉴权方式**: HTTP Header `Authorization: Bearer {Token}`
- **响应格式**: JSON

## 1. 全局规范

### 1.1 统一响应结构

所有接口（无论成功失败）均返回以下 JSON 结构:

JSON

```
{
  "code": 0,          // 0 表示成功，非 0 表示失败
  "msg": "success",   // 提示信息
  "data": { ... }     // 业务数据，失败时可能为 null
}
```

### 1.2 常见错误码

- `0`: 成功
- `401`: 未登录或 Token 过期
- `403`: 无权限执行该操作
- `10001` 及其他: 业务逻辑错误（如“用户名已存在”、“俱乐部已满”等）

------

## 2. 认证模块 (Auth)

> 公开接口，无需携带 Token。

### 2.1 用户注册

- **接口**: `POST /auth/register`
- **描述**: 注册新账号，密码后端自动加密。
- **参数**:

| **参数名** | **类型** | **必填** | **说明**                              |
| ---------- | -------- | -------- | ------------------------------------- |
| `username` | string   | 是       | 用户名 (2-50字符)                     |
| `password` | string   | 是       | 密码 (6-20字符)                       |
| `role`     | string   | 否       | 角色: 默认 `user` |

- **响应示例**:

JSON

```
{
  "code": 0,
  "msg": "注册成功",
  "data": {
    "userId": 1001,
    "username": "teacher_wang",
    "role": "teacher",
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
```

### 2.2 用户登录

- **接口**: `POST /auth/login`
- **描述**: 获取访问令牌 (JWT)。
- **参数**:

| **参数名** | **类型** | **必填** | **说明** |
| ---------- | -------- | -------- | -------- |
| `username` | string   | 是       | 用户名   |
| `password` | string   | 是       | 密码     |

- **响应示例**:

JSON

```
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
    "userInfo": {
      "userId": 1001,
      "username": "teacher_wang",
      "role": "teacher",
      "avatarUrl": null
    }
  }
}
```

------

## 3. 用户模块 (User)

> 需携带 Token。

### 3.1 获取我的个人资料

- **接口**: `GET /users/me`
- **描述**: 获取当前登录用户的详细信息。
- **响应**: `data` 包含 `userId`, `username`, `role`, `avatarUrl` 等，不含密码。

### 3.2 修改个人资料

- **接口**: `PATCH /users/me`
- **参数**:

| **参数名**  | **类型** | **必填** | **说明**          |
| ----------- | -------- | -------- | ----------------- |
| `username`  | string   | 否       | 新用户名 (需唯一) |
| `avatarUrl` | string   | 否       | 新头像链接        |

### 3.3 修改密码

- **接口**: `POST /users/me/password`
- **参数**:

| **参数名**    | **类型** | **必填** | **说明**          |
| ------------- | -------- | -------- | ----------------- |
| `oldPassword` | string   | 是       | 旧密码            |
| `newPassword` | string   | 是       | 新密码 (6-20字符) |

### 3.4 获取我加入的俱乐部

- **接口**: `GET /users/me/clubs`
- **描述**: 查询我创建或加入的所有俱乐部列表。
- **响应示例**:

JSON

```
{
  "code": 0,
  "msg": "ok",
  "data": [
    {
      "clubId": 101,
      "clubName": "数学研讨组",
      "memberRole": "manager", // manager(管理者) 或 member(成员)
      "joinTime": "2026-01-10T12:00:00Z"
    }
  ]
}
```

### 3.5 用户列表查询 (搜索)

- **接口**: `GET /users`
- **Query 参数**:
  - `keyword`: 搜索用户名 (可选)
  - `page`: 页码 (默认1)
  - `pageSize`: 每页数量 (默认20)

------

## 4. 俱乐部模块 (Club)

> 需携带 Token。

### 4.1 创建俱乐部

- **接口**: `POST /clubs`
- **描述**: 创建新俱乐部，创建者自动成为管理员 (`manager`)。
- **参数**:

| **参数名**    | **类型** | **必填** | **说明**   |
| ------------- | -------- | -------- | ---------- |
| `name`        | string   | 是       | 俱乐部名称 |
| `tag`         | string   | 是       | 标签       |
| `description` | string   | 否       | ID      |

### 4.2 查询俱乐部列表

- **接口**: `GET /clubs`
- **Query 参数**:
  - `keyword`: 搜索名称或标签
  - `type`: `my` (我创建的) / `all` (全部，默认)
  - `page`, `pageSize`

### 4.3 查询俱乐部详情

- **接口**: `GET /clubs/:id`
- **描述**: 获取指定 ID 俱乐部的详细信息（名称、简介、成员数、创建者信息）。

### 4.4 加入俱乐部

- **接口**: `POST /clubs/:id/join`
- **描述**: 当前用户申请加入指定俱乐部。
- **响应**: 成功返回 `status: "joined"`。

### 4.5 退出俱乐部

- **接口**: `POST /clubs/:id/quit`
- **描述**: 普通成员退出。**注意**: 管理员(创建者)无法直接退出，需先解散。

### 4.6 编辑俱乐部

- **接口**: `PATCH /clubs/:id`
- **权限**: 仅创建者 (`manager`) 可操作。
- **参数**: `name`, `tag`, `description` (均为选填)。

### 4.7 解散俱乐部

- **接口**: `DELETE /clubs/:id`
- **权限**: 仅创建者可操作。
- **描述**: 物理删除俱乐部及其关联数据。

------

## 5. 任务模块 (Task)

### 5.1 提交/完成任务

- **接口**: `POST /tasks/:id/complete`
- **描述**: 用户提交任务成果。
- **参数**:

| **参数名**      | **类型** | **必填** | **说明**                             |
| --------------- | -------- | -------- | ------------------------------------ |
| `researchNotes` | string   | 否       | 研视频笔记 (当 type=research 时必填) |
| `attachmentUrl` | string   | 否       | 附件图片链接                         |

------

