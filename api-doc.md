# 教师视频俱乐部 后端服务系统 API文档

### 1. 基本信息

- **Base URL**：`/api/v1`
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **统一响应格式**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {}
}
```

- **失败响应说明**：`code` 可能为 HTTP 状态码或业务错误码；参数校验失败时 `msg` 为首条错误信息

------

### 2. 认证模块

#### 2.1 用户注册

- **接口名称**：用户注册

- **接口描述**：创建新用户账号并返回基础资料

- **接口路径**：`/auth/register`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`

- **认证要求**：公开

- **请求体**
  
  | 参数名      | 类型     | 必填  | 说明                    |
  | -------- | ------ | --- | --------------------- |
  | username | string | 是   | 用户名，2-50              |
  | password | string | 是   | 密码，6-20               |
  | role     | string | 否   | 角色：`teacher` / `user` |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "注册成功",
  "data": {
    "userId": 1001,
    "username": "demo",
    "role": "user",
    "avatarUrl": null,
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 2.2 用户登录

- **接口名称**：用户登录

- **接口描述**：校验账号密码并返回 JWT 访问令牌

- **接口路径**：`/auth/login`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`

- **认证要求**：公开

- **请求体**
  
  | 参数名      | 类型     | 必填  | 说明  |
  | -------- | ------ | --- | --- |
  | username | string | 是   | 用户名 |
  | password | string | 是   | 密码  |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "accessToken": "jwt.token.here",
    "userInfo": {
      "userId": 1001,
      "username": "demo",
      "role": "user",
      "avatarUrl": null
    }
  }
}
```

------

### 3. 用户模块

#### 3.1 获取我的资料

- **接口名称**：获取我的资料
- **接口描述**：获取当前登录用户的完整资料（包含隐私字段）
- **接口路径**：`/users/me`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **响应示例（成功）**

```
{
  "code": 0,
  "msg": "ok",
  "data": {
    "userId": 1001,
    "username": "demo",
    "role": "user",
    "avatarUrl": "http://...",
    "createdAt": "2026-01-17T12:00:00.000Z",
    "signature": "好好学习，天天向上",
    "gender": "female",
    "isPublicProfile": true,
    "realname": "珍妮",
    "school": "第一中学",
    "studentId": "A2023001",
    "email": "zhen@example.com",
    "phone": "13800138000",
    "age": 20,
    "job": "teacher",
    "remark": "数学课代表"
  }
}
```

------

#### 3.2 更新我的资料

- **接口名称**：更新我的资料
- **接口描述**：修改个人资料
- **接口路径**：`/users/me`
- **请求方法**：PATCH
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**：

| **参数名**             | **类型**  | **说明**                               |
| ------------------- | ------- | ------------------------------------ |
| username            | string  | 用户名 (2-50字符)                         |
| avatarUrl           | string  | 头像地址                                 |
| **signature**       | string  | 个性签名 (0-50字符)                        |
| **gender**          | string  | 性别: `male`/`female`/`other`/`secret` |
| **isPublicProfile** | boolean | 是否公开详细资料 (`true`/`false`)            |
| **realname**        | string  | 真实姓名                                 |
| **school**          | string  | 学校                                   |
| **studentId**       | string  | 学号（当job为student时必填，1-20位数字/字母，字母统一转为大写） |
| **email**           | string  | 邮箱（有效邮箱格式）                      |
| **phone**           | string  | 手机号（7-16位，仅数字）                   |
| **age**            | number  | 年龄                                   |
| **job**            | string  | `student`/`teacher`                    |
| **remark**          | string  | 备注                                   |

注： 所有字段均为选填，仅更新填写的字段。

- **响应示例（成功）**

```
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "userId": 1001,
    "username": "demo",
    "isPublicProfile": true,
    ...
  }
}
```

------

#### 3.3 修改密码

- **接口名称**：修改密码

- **接口描述**：校验旧密码并更新新密码

- **接口路径**：`/users/me/password`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **请求体**
  
  | 参数名         | 类型     | 必填  | 说明  |
  | ----------- | ------ | --- | --- |
  | oldPassword | string | 是   | 旧密码 |
  | newPassword | string | 是   | 新密码 |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "密码修改成功，请重新登录",
  "data": null
}
```

------

#### 3.4 获取我加入的俱乐部

- **接口名称**：获取我加入的俱乐部
- **接口描述**：返回当前用户加入的俱乐部及角色信息
- **接口路径**：`/users/me/clubs`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": [
    {
      "clubId": 3001,
      "clubName": "数学教研组",
      "tag": "数学",
      "description": "数学教研分享",
      "memberRole": "manager",
      "joinTime": "2026-01-17T12:00:00.000Z"
    }
  ]
}
```

------

#### 3.5 用户列表

- **接口名称**：用户列表
- **接口描述**：按关键词分页查询用户基础公开信息
- **接口路径**：`/users`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **查询参数**

| **参数名**  | **类型** | **必填** | **说明**     |
| -------- | ------ | ------ | ---------- |
| keyword  | string | 否      | 搜索关键词      |
| page     | number | 否      | 页码，默认 1    |
| pageSize | number | 否      | 每页数量，默认 20 |

- **响应示例（成功）**

```
{
  "code": 0,
  "msg": "ok",
  "data": {
    "list": [
      {
        "userId": 1001,
        "username": "demo",
        "role": "user",
        "avatarUrl": null,
        "createdAt": "2026-01-17T12:00:00.000Z",
        "signature": "Hello World",
        "gender": "female"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

------

#### 3.6 用户公开详情

- **接口名称**：用户公开详情

- **接口描述**：查询指定用户的公开信息。****

- **接口路径**：`/users/{id}`

- **请求方法**：GET

- **请求头**：`Authorization: Bearer {Token}`

- **认证要求**：登录

- **路径参数**：`id`（用户 ID）

- **响应示例**

```
{
  "code": 0,
  "msg": "ok",
  "data": {
    "userId": 1001,
    "username": "demo",
    "isPublicProfile": true,
    "realname": "珍妮",
    "school": "第一中学",
    "email": "zhen@example.com",
    ... 
    /*
    受隐私设置控制。
    若isPublicProfile为false，则realname, phone 等隐私字段不会返回。
    详见数据库文档。
    */
  }
}
```

------

### 4. 俱乐部模块

#### 4.1 创建俱乐部

- **接口名称**：创建俱乐部

- **接口描述**：创建新的俱乐部并自动加入为管理者

- **接口路径**：`/clubs`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **请求体**
  
  | 参数名         | 类型     | 必填  | 说明       |
  | ----------- | ------ | --- | -------- |
  | name        | string | 是   | 名称，2-100 |
  | tag         | string | 是   | 标签，1-50  |
  | description | string | 否   | 描述       |
  | joinPolicy  | string | 否   | 加入方式：`free`/`approval` |
  | joinConditions | string | 否 | 加入条件说明 |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "创建成功",
  "data": {
    "clubId": 3001,
    "name": "数学教研组",
    "tag": "数学",
    "description": "数学教研分享",
    "creatorId": 1001,
    "memberCount": 1,
    "status": "active",
    "joinPolicy": "free",
    "joinConditions": null,
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 4.2 俱乐部列表

- **接口名称**：俱乐部列表

- **接口描述**：按条件分页查询俱乐部

- **接口路径**：`/clubs`

- **请求方法**：GET

- **请求头**：`Authorization: Bearer {Token}`

- **认证要求**：登录

- **查询参数**
  
  | 参数名      | 类型     | 必填  | 说明           |
  | -------- | ------ | --- | ------------ |
  | keyword  | string | 否   | 搜索关键词（名称/id） |
  | page     | number | 否   | 页码，默认 1      |
  | pageSize | number | 否   | 每页数量，默认 20   |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "list": [
      {
        "clubId": 3001,
        "name": "数学教研组",
        "tag": "数学",
        "description": "数学教研分享",
        "creatorId": 1001,
        "memberCount": 10,
        "status": "active",
        "joinPolicy": "approval",
        "joinConditions": "仅限在职教师",
        "createdAt": "2026-01-17T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

------

#### 4.3 俱乐部详情

- **接口名称**：俱乐部详情
- **接口描述**：获取指定俱乐部的详细信息
- **接口路径**：`/clubs/{id}`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（俱乐部 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "clubId": 3001,
    "name": "数学教研组",
    "tag": "数学",
    "description": "数学教研分享",
    "creatorId": 1001,
    "memberCount": 10,
    "status": "active",
    "joinPolicy": "approval",
    "joinConditions": "仅限在职教师",
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 4.4 编辑俱乐部

- **接口名称**：编辑俱乐部

- **接口描述**：更新俱乐部的名称、标签或描述

- **接口路径**：`/clubs/{id}`

- **请求方法**：PATCH

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录（仅管理者）

- **路径参数**：`id`（俱乐部 ID）

- **请求体**
  
  | 参数名         | 类型     | 必填  | 说明       |
  | ----------- | ------ | --- | -------- |
  | name        | string | 否   | 名称，2-100 |
  | tag         | string | 否   | 标签，1-50  |
  | description | string | 否   | 描述       |
  | joinPolicy  | string | 否   | 加入方式：`free`/`approval` |
  | joinConditions | string | 否 | 加入条件说明 |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "clubId": 3001,
    "name": "数学教研组（更新）",
    "tag": "数学",
    "description": "数学教研分享",
    "creatorId": 1001,
    "memberCount": 10,
    "status": "active",
    "joinPolicy": "approval",
    "joinConditions": "仅限在职教师",
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 4.5 归档俱乐部

- **接口名称**：归档俱乐部
- **接口描述**：设置俱乐部状态（仅管理者可操作），未传入 status 默认为 archived
- **接口路径**：`/clubs/{id}/archive`
- **请求方法**：PATCH
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅管理者）
- **路径参数**：`id`（俱乐部 ID）
- **请求体**
  
  | 参数名   | 类型   | 必填  | 说明 |
  | ------ | ------ | --- | ---- |
  | status | string | 否   | 状态：`active`/`archived` |
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "状态已更新",
  "data": {
    "clubId": 3001,
    "name": "数学教研组",
    "tag": "数学",
    "description": "数学教研分享",
    "creatorId": 1001,
    "memberCount": 10,
    "status": "archived",
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 4.6 解散俱乐部

- **接口名称**：解散俱乐部
- **接口描述**：解散俱乐部（软删除，仅管理者可操作）
- **接口路径**：`/clubs/{id}`
- **请求方法**：DELETE
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅管理者）
- **路径参数**：`id`（俱乐部 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "俱乐部已解散",
  "data": null
}
```

------

#### 4.7 加入俱乐部

- **接口名称**：加入俱乐部
- **接口描述**：以成员身份加入指定俱乐部（归档俱乐部不可加入）。若 `joinPolicy=free` 直接加入；若 `joinPolicy=approval` 提交申请等待审核
- **接口路径**：`/clubs/{id}/join`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（俱乐部 ID）
- **请求体**

  | 参数名         | 类型     | 必填  | 说明     |
  | ----------- | ------ | --- | ------ |
  | applyMessage | string | 否   | 申请说明 |

- **响应示例（成功，free）**

```json
{
  "code": 0,
  "msg": "加入成功",
  "data": {
    "clubId": 3001,
    "status": "joined"
  }
}
```

- **响应示例（成功，approval）**

```json
{
  "code": 0,
  "msg": "已提交申请，等待审核",
  "data": {
    "clubId": 3001,
    "status": "pending",
    "requestId": 8001
  }
}
```

------

#### 4.8 退出俱乐部

- **接口名称**：退出俱乐部
- **接口描述**：退出已加入的俱乐部
- **接口路径**：`/clubs/{id}/quit`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（俱乐部 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "退出成功",
  "data": null
}
```

------

#### 4.9 入会申请列表

- **接口名称**：入会申请列表
- **接口描述**：查询指定俱乐部的入会申请（仅管理员）
- **接口路径**：`/clubs/{id}/join-requests`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅俱乐部管理员）
- **路径参数**：`id`（俱乐部 ID）
- **查询参数**
  
  | 参数名  | 类型   | 必填  | 说明 |
  | ----- | ------ | --- | ---- |
  | status | string | 否 | 申请状态：`pending`/`approved`/`rejected`/`canceled` |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "list": [
      {
        "requestId": 8001,
        "clubId": 3001,
        "userId": 1002,
        "status": "pending",
        "applyMessage": "数学老师，申请加入",
        "reviewedBy": null,
        "reviewedAt": null,
        "createdAt": "2026-01-17T12:00:00.000Z"
      }
    ]
  }
}
```

------

#### 4.10 通过入会申请

- **接口名称**：通过入会申请
- **接口描述**：管理员审核通过入会申请
- **接口路径**：`/clubs/{id}/join-requests/{requestId}/approve`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅俱乐部管理员）
- **路径参数**：`id`（俱乐部 ID），`requestId`（申请ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "已通过",
  "data": null
}
```

------

#### 4.11 驳回入会申请

- **接口名称**：驳回入会申请
- **接口描述**：管理员驳回入会申请
- **接口路径**：`/clubs/{id}/join-requests/{requestId}/reject`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅俱乐部管理员）
- **路径参数**：`id`（俱乐部 ID），`requestId`（申请ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "已驳回",
  "data": null
}
```

------

### 5. 视频模块

#### 5.1 上传视频

- **接口名称**：上传视频

- **接口描述**：在指定俱乐部下上传视频

- **接口路径**：`/videos`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **请求体**
  
  | 参数名      | 类型     | 必填  | 说明     |
  | -------- | ------ | --- | ------ |
  | clubId   | number | 是   | 俱乐部 ID |
  | title    | string | 是   | 标题     |
  | url      | string | 是   | 视频地址   |
  | duration | number | 是   | 时长（秒）  |
  | coverUrl | string | 否   | 封面地址   |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "上传成功",
  "data": {
    "videoId": 5001,
    "clubId": 3001,
    "uploaderId": 1001,
    "title": "示例视频",
    "url": "https://example.com/v.mp4",
    "coverUrl": null,
    "duration": 120,
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 5.2 视频列表

- **接口名称**：视频列表

- **接口描述**：按俱乐部分页查询视频列表

- **接口路径**：`/videos`

- **请求方法**：GET

- **请求头**：`Authorization: Bearer {Token}`

- **认证要求**：登录

- **查询参数**
  
  | 参数名      | 类型     | 必填  | 说明         |
  | -------- | ------ | --- | ---------- |
  | clubId   | number | 是   | 俱乐部 ID     |
  | page     | number | 否   | 页码，默认 1    |
  | pageSize | number | 否   | 每页数量，默认 20 |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "list": [
      {
        "videoId": 5001,
        "title": "示例视频",
        "url": "https://example.com/v.mp4",
        "coverUrl": null,
        "duration": 120,
        "uploaderName": "demo",
        "createdAt": "2026-01-17T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

------

#### 5.3 视频详情

- **接口名称**：视频详情
- **接口描述**：获取指定视频的详细信息
- **接口路径**：`/videos/{id}`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（视频 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "videoId": 5001,
    "clubId": 3001,
    "uploaderId": 1001,
    "title": "示例视频",
    "url": "https://example.com/v.mp4",
    "coverUrl": null,
    "duration": 120,
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

### 6. 评论模块

#### 6.1 发表评论

- **接口名称**：发表评论

- **接口描述**：对视频发表评论或回复评论

- **接口路径**：`/comments`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **请求体**
  
  | 参数名       | 类型     | 必填  | 说明         |
  | --------- | ------ | --- | ---------- |
  | videoId   | number | 是   | 视频 ID      |
  | content   | string | 是   | 内容         |
  | videoTime | number | 否   | 时间轴秒数，默认 0 |
  | parentId  | number | 否   | 回复的父评论 ID  |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "评论成功",
  "data": {
    "commentId": 9001,
    "videoId": 5001,
    "userId": 1001,
    "parentId": null,
    "videoTime": 0,
    "content": "很好",
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 6.2 评论列表

- **接口名称**：评论列表

- **接口描述**：按视频分页获取评论列表（含发送者信息）

- **接口路径**：`/comments`

- **请求方法**：GET

- **请求头**：`Authorization: Bearer {Token}`

- **认证要求**：登录

- **查询参数**
  
  | 参数名      | 类型     | 必填  | 说明         |
  | -------- | ------ | --- | ---------- |
  | videoId  | number | 是   | 视频 ID      |
  | page     | number | 否   | 页码，默认 1    |
  | pageSize | number | 否   | 每页数量，默认 50 |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "list": [
      {
        "commentId": 9001,
        "content": "很好",
        "videoTime": 0,
        "parentId": null,
        "createdAt": "2026-01-17T12:00:00.000Z",
        "sender": {
          "userId": 1001,
          "username": "demo",
          "avatarUrl": null,
          "role": "user"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 50
  }
}
```

------

#### 6.3 删除评论

- **接口名称**：删除评论
- **接口描述**：软删除自己的评论
- **接口路径**：`/comments/{id}`
- **请求方法**：DELETE
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅作者）
- **路径参数**：`id`（评论 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "评论已删除",
  "data": null
}
```

------

### 7. 任务模块

#### 7.1 发布任务

- **接口名称**：发布任务

- **接口描述**：发布俱乐部任务（可关联视频）

- **接口路径**：`/tasks`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **权限**：仅俱乐部管理员（manager）

- **请求体**
  
  | 参数名         | 类型     | 必填  | 说明                                    |
  | ----------- | ------ | --- | ------------------------------------- |
  | clubId      | number | 是   | 俱乐部 ID                                |
  | videoId     | number | 否   | 关联视频 ID                               |
  | type        | string | 否   | `watch` / `research` / `all`，默认 `all` |
  | title       | string | 是   | 标题                                    |
  | description | string | 否   | 描述                                    |
  | unlockAt    | string | 否   | 解锁时间（ISO8601/时间戳字符串），为空表示立即解锁 |
  | subtasks    | array  | 否   | 自定义子任务列表（如果不传且 type=all，系统会自动生成默认子任务） |

- **说明**：当未传 `type` 时，系统会自动生成两个子任务（继承父任务 videoId）：
  - 当传入 `unlockAt` 时，时间必须晚于当前时间。
  
  1. `watch` 子任务：标题“看视频任务”，描述“前往分秒帧平台观看完整教学视频”
  2. `research` 子任务：标题“研视频任务”，描述“前往石墨文档完成教学反思与研讨笔记”

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "发布成功",
  "data": {
    "taskId": 7001,
    "clubId": 3001,
    "videoId": 5001,
    "type": "watch",
    "title": "观看示例视频",
    "description": "完成观看",
    "unlockAt": null,
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 7.2 提交子任务

- **接口名称**：提交子任务

- **接口描述**：提交子任务完成记录及附件/笔记

- **接口路径**：`/tasks/{taskId}/subtasks/{subtaskId}/complete`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **路径参数**：`taskId`（任务 ID），`subtaskId`（子任务 ID）

- **请求体**

  | 参数名        | 类型   | 必填 | 说明     |
| ------------- | ------ | ---- | -------- |
| researchNotes | string | 否   | 研读笔记 |
| attachmentUrl | string | 否   | 附件地址 |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "任务已提交",
  "data": {
    "completionId": 8001,
    "subtaskId": 1,
    "userId": 1001,
    "researchNotes": "学习要点",
    "attachmentUrl": null,
    "completedAt": "2026-01-17T12:00:00.000Z"
  }
}
```

**说明**：
1. 若任务未解锁，接口返回 `403`。
2. 需先完成同俱乐部上一个任务的所有子任务，才能提交当前任务子任务。

------

#### 7.3 任务列表

- **接口名称**：任务列表

- **接口描述**：查询俱乐部任务并返回子任务完成汇总

- **接口路径**：`/tasks`

- **请求方法**：GET

- **请求头**：`Authorization: Bearer {Token}`

- **认证要求**：登录

- **查询参数**
  
  | 参数名    | 类型     | 必填  | 说明     |
  | ------ | ------ | --- | ------ |
  | clubId | number | 是   | 俱乐部 ID |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": [
    {
      "taskId": 7001,
      "type": "watch",
      "title": "观看示例视频",
      "description": "完成观看",
      "createdAt": "2026-01-17T12:00:00.000Z",
      "video": {
        "videoId": 5001,
        "title": "示例视频",
        "coverUrl": null,
        "duration": 120
      },
      "subtaskSummary": {
        "total": 2,
        "completed": 1,
        "byType": {
          "watch": { "status": "completed" },
          "research": { "status": "incompleted" }
        }
      }
    }
  ]
}
```

**说明**：仅返回已解锁任务（`unlockAt` 为空或已到达）。

------

#### 7.4 任务详情

- **接口名称**：任务详情
- **接口描述**：获取任务详情及当前用户子任务提交情况
- **接口路径**：`/tasks/{taskId}`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`taskId`（任务 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "taskInfo": {
      "taskId": 101,
      "clubId": 3001,
      "videoId": 5001,
      "type": "all",
      "title": "本周研修",
      "description": "完成本周研修",
      "unlockAt": null,
      "createdAt": "2026-01-17T12:00:00.000Z",
      "subTasks": [
        {
          "subtaskId": 501,
          "type": "watch",
          "title": "看视频",
          "description": "观看教学视频",
          "status": "completed", // 当前用户状态
          "submission": {
            "researchNotes": null,
            "attachmentUrl": null,
            "completedAt": "2026-01-17T12:00:00.000Z"
          }
        },
        {
          "subtaskId": 502,
          "type": "research",
          "title": "写反思",
          "description": "完成研讨笔记",
          "status": "incompleted",
          "submission": null
        }
      ]
    }
  }
}
```

**说明**：任务未解锁时接口返回 `403`。

---

#### 7.5 修改任务

- **接口名称**：修改任务
- **接口描述**：更新任务的主信息（标题、描述、关联视频、解锁时间），不影响已生成的子任务结构和用户完成记录。
- **接口路径**：`/tasks/{taskId}`
- **请求方法**：PATCH
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **权限**：仅俱乐部管理员（manager）
- **路径参数**：`taskId`（任务 ID）
- **请求体**

| **参数名**       | **类型** | **必填** | **说明**    |
| ------------- | ------ | ------ | --------- |
| `title`       | string | 否      | 新标题       |
| `description` | string | 否      | 新描述       |
| `videoId`     | number | 否      | 修改关联的视频ID |
| `unlockAt`    | string | 否      | 解锁时间（ISO8601/时间戳字符串），为空表示立即解锁 |

**说明**：当传入 `unlockAt` 时，时间必须晚于当前时间。

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "taskId": 7001,
    "clubId": 3001,
    "videoId": 5001,
    "type": "watch",
    "title": "更新后的标题",
    "description": "更新后的描述",
    "unlockAt": "2026-01-20T12:00:00.000Z",
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 7.6 删除任务

- **接口名称**：删除任务
- **接口描述**：物理删除该任务下的所有子任务 (`Subtasks`) 以及所有用户的完成记录 (`SubtaskCompletions`)。
- **接口路径**：`/tasks/{taskId}`
- **请求方法**：DELETE
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **权限**：仅俱乐部管理员（manager）
- **路径参数**：`taskId`（任务 ID）
- **响应示例（成功）**

JSON

```
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

------

### 8. 统计模块

#### 8.1 上报统计日志

- **接口名称**：上报统计日志
- **接口描述**：前端埋点上报，用于内部统计。无需鉴权，公开访问。
- **接口路径**：`/stat-logs`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`
- **认证要求**：公开
- **请求体** ：

| **参数名** | **类型** | **必填** | **说明**                                                 |
| ------- | ------ | ------ | ------------------------------------------------------ |
| type    | string | 否      | 记录类型，如：`btnclick`、`keyin`、`view`、`duration`、`error` 等等 |
| userId  | number | 否      | 用户ID (未登录则传`_NotLoggedIn`)                             |
| page    | string | 否      | 发生页面/路由                                                |
| item    | string | 否      | 具体项目/按钮/模块                                             |
| value   | string | 否      | 记录的具体值/内容，可以是数字、JSON字符串、长文本等                           |
| remark  | string | 否      | 备注信息                                                   |

注：所有字段均为选填，传入内容后端不设限制，具体规范由前后端协商制订。

- **响应示例（成功）**

```
{
  "code": 0,
  "msg": "上报成功",
  "data": null
}
```

------

### 9. 站内信模块

#### 9.1 站内信列表

- **接口名称**：站内信列表
- **接口描述**：分页获取当前用户的站内信
- **接口路径**：`/notifications`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **查询参数**
  
  | 参数名    | 类型    | 必填  | 说明 |
  | ------- | ----- | --- | ---- |
  | isRead  | boolean | 否 | 是否已读 |
  | page    | number | 否 | 页码，默认 1 |
  | pageSize | number | 否 | 每页数量，默认 20 |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "list": [
      {
        "notificationId": 9001,
        "userId": 1001,
        "type": "club_join_request",
        "title": "新的入会申请",
        "content": "用户ID 1002 申请加入 数学教研组",
        "payload": {
          "clubId": 3001,
          "requestId": 8001,
          "applicantId": 1002,
          "clubName": "数学教研组"
        },
        "isRead": false,
        "readAt": null,
        "createdAt": "2026-01-17T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

------

#### 9.2 未读数量

- **接口名称**：未读数量
- **接口描述**：获取当前用户未读站内信数量
- **接口路径**：`/notifications/unread-count`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "total": 3
  }
}
```

------

#### 9.3 标记已读

- **接口名称**：标记已读
- **接口描述**：将指定站内信标记为已读
- **接口路径**：`/notifications/{id}/read`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（站内信 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "已读",
  "data": null
}
```

------

#### 9.4 全部已读

- **接口名称**：全部已读
- **接口描述**：将当前用户所有站内信标记为已读
- **接口路径**：`/notifications/read-all`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "已全部标为已读",
  "data": null
}
```

------

### 10. 通用错误示例

#### 10.1 认证失败

```json
{
  "code": 401,
  "msg": "登录已过期或未授权",
  "data": null
}
```

#### 10.2 参数校验失败

```json
{
  "code": 400,
  "msg": "参数错误提示",
  "data": null
}
```

#### 10.3 资源不存在

```json
{
  "code": 404,
  "msg": "资源不存在",
  "data": null
}
```

------

### 11. 更新日志

Current Version: 1.5.2

#### 2026-01-26

- Version: 1.5.3
- Editor: Jieyang W.

1. 任务新增解锁时间字段，发布/修改任务支持 unlockAt 并补充校验规则
2. 任务列表仅返回已解锁任务，任务详情未解锁返回 403
3. 提交子任务增加解锁校验
4. 完善任务模块接口文档格式与示例

#### 2026-01-26

- Version: 1.5.2
- Editor: Jieyang W.

1. studentId 改回字符串（1-20位数字/字母，字母统一转为大写）
1. 加入邮箱格式验证

#### 2026-01-25

- Version: 1.5.1
- Editor: Jieyang W.

1. 俱乐部加入流程支持自由加入/审核加入，补充加入条件与入会申请相关接口说明
2. 新增站内信模块接口说明（通知列表、未读数量、已读操作）
3. 归档接口支持传入 status 且返回文案更新为“状态已更新”，并将“创建者”表述调整为“管理者”

#### 2026-01-25

- Version: 1.4.6
- Editor: Jieyang W.

1. 俱乐部增加status字段，修改相关接口
2. 用户模块字段调整：移除nickname，realName更名为realname，studentId/age为数字，phone为字符串（7-16位，仅数字），job限定为student/teacher且student需学号，年龄非负；同步示例与说明

#### 2026-01-24/25

- Version: 1.4.4/5

- Editor: Cheng R. Zhu
1. 增加统计日志接口。
2. 用户表新增：Age、Job字段

#### 2026-01-24

- Version: 1.4.3

- Editor: Cheng R. Zhu
1. 修改用户资料获取、更改、查询接口，扩展用户信息字段。

#### 2026-01-21

- Version: 1.4.2
- Editor: Cheng R. Zhu
1. 增加任务修改、删除接口，更新接口
2. 任务模块权限更新

#### 2026-01-17

- Version: 1.4.1
- Editor: Jieyang W.
1. 整理文档，补充接口，添加更详细的描述、示例。
2. 修改查询俱乐部列表接口，删除type参数。

#### 2026-01-10

- Version: 1.3.1

- Editor: Cheng R. Zhu
1. 基本实现后端功能，撰写API文档。
