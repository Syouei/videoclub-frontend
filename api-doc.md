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

  | 参数名   | 类型   | 必填 | 说明                     |
  | -------- | ------ | ---- | ------------------------ |
  | username | string | 是   | 用户名，2-50             |
  | password | string | 是   | 密码，6-20               |
  | role     | string | 否   | 角色：`teacher` / `user` |

- **说明**：当未传 `type` 时，系统会自动生成两个子任务（继承父任务 videoId）：
  1. `watch` 子任务：标题“看视频任务”，描述“前往分秒帧平台观看完整教学视频”
  2. `research` 子任务：标题“研视频任务”，描述“前往石墨文档完成教学反思与研讨笔记”

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

  | 参数名   | 类型   | 必填 | 说明   |
  | -------- | ------ | ---- | ------ |
  | username | string | 是   | 用户名 |
  | password | string | 是   | 密码   |

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
- **接口描述**：获取当前登录用户的公开资料
- **接口路径**：`/users/me`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
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

#### 3.2 更新我的资料

- **接口名称**：更新我的资料
- **接口描述**：修改当前用户的用户名或头像
- **接口路径**：`/users/me`
- **请求方法**：PATCH
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**

  | 参数名    | 类型   | 必填 | 说明         |
  | --------- | ------ | ---- | ------------ |
  | username  | string | 否   | 用户名，2-50 |
  | avatarUrl | string | 否   | 头像地址     |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "userId": 1001,
    "username": "demo2",
    "role": "user",
    "avatarUrl": "https://example.com/a.png",
    "createdAt": "2026-01-17T12:00:00.000Z"
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

  | 参数名      | 类型   | 必填 | 说明   |
  | ----------- | ------ | ---- | ------ |
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
- **接口描述**：按关键词分页查询用户基础信息
- **接口路径**：`/users`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **查询参数**

  | 参数名   | 类型   | 必填 | 说明                |
  | -------- | ------ | ---- | ------------------- |
  | keyword  | string | 否   | 搜索关键词          |
  | page     | number | 否   | 页码，默认 1        |
  | pageSize | number | 否   | 每页数量，默认 20   |

- **响应示例（成功）**

```json
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

#### 3.6 用户公开详情

- **接口名称**：用户公开详情
- **接口描述**：查询指定用户的公开信息
- **接口路径**：`/users/{id}`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（用户 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
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

### 4. 俱乐部模块

#### 4.1 创建俱乐部

- **接口名称**：创建俱乐部
- **接口描述**：创建新的俱乐部并自动加入为管理者
- **接口路径**：`/clubs`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**

  | 参数名     | 类型   | 必填 | 说明        |
  | ---------- | ------ | ---- | ----------- |
  | name       | string | 是   | 名称，2-100 |
  | tag        | string | 是   | 标签，1-50  |
  | description| string | 否   | 描述        |

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

  | 参数名   | 类型   | 必填 | 说明                  |
  | -------- | ------ | ---- | --------------------- |
  | keyword  | string | 否   | 搜索关键词（名称/id） |
  | page     | number | 否   | 页码，默认 1          |
  | pageSize | number | 否   | 每页数量，默认 20     |

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
- **认证要求**：登录（仅创建者）
- **路径参数**：`id`（俱乐部 ID）
- **请求体**

  | 参数名     | 类型   | 必填 | 说明        |
  | ---------- | ------ | ---- | ----------- |
  | name       | string | 否   | 名称，2-100 |
  | tag        | string | 否   | 标签，1-50  |
  | description| string | 否   | 描述        |

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
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

------

#### 4.5 解散俱乐部

- **接口名称**：解散俱乐部
- **接口描述**：删除俱乐部（仅创建者可操作）
- **接口路径**：`/clubs/{id}`
- **请求方法**：DELETE
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅创建者）
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

#### 4.6 加入俱乐部

- **接口名称**：加入俱乐部
- **接口描述**：以成员身份加入指定俱乐部
- **接口路径**：`/clubs/{id}/join`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（俱乐部 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "加入成功",
  "data": null
}
```

------

#### 4.7 退出俱乐部

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

### 5. 视频模块

#### 5.1 上传视频

- **接口名称**：上传视频
- **接口描述**：在指定俱乐部下上传视频
- **接口路径**：`/videos`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**

  | 参数名   | 类型   | 必填 | 说明       |
  | -------- | ------ | ---- | ---------- |
  | clubId   | number | 是   | 俱乐部 ID  |
  | title    | string | 是   | 标题       |
  | url      | string | 是   | 视频地址   |
  | duration | number | 是   | 时长（秒） |
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

  | 参数名   | 类型   | 必填 | 说明              |
  | -------- | ------ | ---- | ----------------- |
  | clubId   | number | 是   | 俱乐部 ID         |
  | page     | number | 否   | 页码，默认 1      |
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

  | 参数名    | 类型   | 必填 | 说明                    |
  | --------- | ------ | ---- | ----------------------- |
  | videoId   | number | 是   | 视频 ID                 |
  | content   | string | 是   | 内容                    |
  | videoTime | number | 否   | 时间轴秒数，默认 0      |
  | parentId  | number | 否   | 回复的父评论 ID         |

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

  | 参数名   | 类型   | 必填 | 说明              |
  | -------- | ------ | ---- | ----------------- |
  | videoId  | number | 是   | 视频 ID           |
  | page     | number | 否   | 页码，默认 1      |
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
- **请求体**

  | 参数名      | 类型   | 必填 | 说明                 |
  | ----------- | ------ | ---- | -------------------- |
  | clubId      | number | 是   | 俱乐部 ID            |
  | videoId     | number | 否   | 关联视频 ID          |
  | type        | string | 否   | `watch` / `research` / `all`，默认 `all` |
  | title       | string | 是   | 标题                 |
  | description | string | 否   | 描述                 |

- **说明**：当未传 `type` 时，系统会自动生成两个子任务（继承父任务 videoId）：
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

  | 参数名        | 类型   | 必填 | 说明                                          |
  | ------------- | ------ | ---- | --------------------------------------------- |
  | researchNotes | string | 否   | 研读笔记；当任务类型为 `research` 时必填     |
  | attachmentUrl | string | 否   | 附件地址                                      |

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

------

#### 7.3 任务列表

- **接口名称**：任务列表
- **接口描述**：查询俱乐部任务并返回子任务完成汇总
- **接口路径**：`/tasks`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **查询参数**

  | 参数名 | 类型   | 必填 | 说明      |
  | ------ | ------ | ---- | --------- |
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
      "taskId": 7001,
      "clubId": 3001,
      "videoId": 5001,
      "type": "all",
      "title": "观看示例视频",
      "description": "完成观看",
      "createdAt": "2026-01-17T12:00:00.000Z",
      "video": {
        "videoId": 5001,
        "title": "示例视频",
        "coverUrl": null,
        "duration": 120
      },
      "subTasks": [
        {
          "subtaskId": 9001,
          "type": "watch",
          "title": "固定子任务标题-观看",
          "description": "固定子任务描述-观看",
          "status": "completed",
          "submission": {
            "researchNotes": "观看笔记...",
            "attachmentUrl": null,
            "completedAt": "2026-01-19T13:00:00Z"
          }
        },
        {
          "subtaskId": 9002,
          "type": "research",
          "title": "固定子任务标题-研读",
          "description": "固定子任务描述-研读",
          "status": "incompleted",
          "submission": null
        }
      ]
    }
  }
}
```

------

### 8. 通用错误示例

#### 8.1 认证失败

```json
{
  "code": 401,
  "msg": "登录已过期或未授权",
  "data": null
}
```

#### 8.2 参数校验失败

```json
{
  "code": 400,
  "msg": "参数错误提示",
  "data": null
}
```

#### 8.3 资源不存在

```json
{
  "code": 404,
  "msg": "资源不存在",
  "data": null
}
```

------

### 9. 更新日志
**Current Version: 1.4.1**
#### 2026-01-17

- Version: 1.4.1
- Editor: Jieyang W.
1. 整理文档，补充接口，添加更详细的描述、示例。
1. 修改查询俱乐部列表接口，删除type参数。

#### 2026-01-10
- Version: 1.3.1
- Editor: Cheng R. Zhu
