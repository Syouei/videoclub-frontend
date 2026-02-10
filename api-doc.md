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

---

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

---

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

---

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

---

#### 3.2 更新我的资料

- **接口名称**：更新我的资料
- **接口描述**：修改个人资料
- **接口路径**：`/users/me`
- **请求方法**：PATCH
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**：

| **参数名**          | **类型** | **说明**                                                        |
| ------------------- | -------- | --------------------------------------------------------------- |
| username            | string   | 用户名 (2-50字符)                                               |
| avatarUrl           | string   | 头像地址                                                        |
| **signature**       | string   | 个性签名 (0-50字符)                                             |
| **gender**          | string   | 性别: `male`/`female`/`other`/`secret`                          |
| **isPublicProfile** | boolean  | 是否公开详细资料 (`true`/`false`)                               |
| **realname**        | string   | 真实姓名                                                        |
| **school**          | string   | 学校                                                            |
| **studentId**       | string   | 学号（当job为student时必填，1-20位数字/字母，字母统一转为大写） |
| **email**           | string   | 邮箱（有效邮箱格式）                                            |
| **phone**           | string   | 手机号（7-16位，仅数字）                                        |
| **age**             | number   | 年龄（非负数）                                                  |
| **job**             | string   | `student`/`teacher`                                             |
| **remark**          | string   | 备注                                                            |

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

---

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

---

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

---

#### 3.5 用户列表

- **接口名称**：用户列表
- **接口描述**：按关键词分页查询用户基础公开信息
- **接口路径**：`/users`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **查询参数**

| **参数名** | **类型** | **必填** | **说明**          |
| ---------- | -------- | -------- | ----------------- |
| keyword    | string   | 否       | 搜索关键词        |
| page       | number   | 否       | 页码，默认 1      |
| pageSize   | number   | 否       | 每页数量，默认 20 |

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

---

#### 3.6 用户公开详情

- **接口名称**：用户公开详情

- **接口描述**：查询指定用户的公开信息。\*\*\*\*

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

---

### 4. 俱乐部模块

#### 4.1 创建俱乐部

- **接口名称**：创建俱乐部

- **接口描述**：创建新的俱乐部并自动加入为管理者

- **接口路径**：`/clubs`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **请求体**

  | 参数名         | 类型   | 必填 | 说明                        |
  | -------------- | ------ | ---- | --------------------------- |
  | name           | string | 是   | 名称，2-100                 |
  | tag            | string | 是   | 标签，1-50                  |
  | description    | string | 否   | 描述                        |
  | joinPolicy     | string | 否   | 加入方式：`free`/`approval` |
  | joinConditions | string | 否   | 加入条件说明                |

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

---

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
        "creator": {
          "userId": 1001,
          "username": "math_teacher"
        },
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

- **说明**：`status` 可能为 `active` / `archived` / `dissolved`

---

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
    "creator": {
      "userId": 1001,
      "username": "math_teacher"
    },
    "memberCount": 10,
    "status": "active",
    "joinPolicy": "approval",
    "joinConditions": "仅限在职教师",
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

---

#### 4.4 编辑俱乐部

- **接口名称**：编辑俱乐部

- **接口描述**：更新俱乐部的名称、标签或描述（仅管理者可操作）

- **接口路径**：`/clubs/{id}`

- **请求方法**：PATCH

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录（仅管理者）

- **路径参数**：`id`（俱乐部 ID）

- **请求体**

  | 参数名         | 类型   | 必填 | 说明                        |
  | -------------- | ------ | ---- | --------------------------- |
  | name           | string | 否   | 名称，2-100                 |
  | tag            | string | 否   | 标签，1-50                  |
  | description    | string | 否   | 描述                        |
  | joinPolicy     | string | 否   | 加入方式：`free`/`approval` |
  | joinConditions | string | 否   | 加入条件说明                |

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

---

#### 4.5 归档/恢复俱乐部

- **接口名称**：归档/恢复俱乐部
- **接口描述**：设置俱乐部状态（仅管理者可操作），未传入 status 默认为 archived
- **接口路径**：`/clubs/{id}/archive`
- **请求方法**：PATCH
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅管理者）
- **路径参数**：`id`（俱乐部 ID）
- **请求体**

  | 参数名 | 类型   | 必填 | 说明                      |
  | ------ | ------ | ---- | ------------------------- |
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

---

#### 4.6 解散俱乐部

- **接口名称**：解散俱乐部
- **接口描述**：解散俱乐部（软删除，状态置为 dissolved，仅管理者可操作）
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

---

#### 4.7 加入俱乐部

- **接口名称**：加入俱乐部
- **接口描述**：以成员身份加入指定俱乐部（仅 `status=active` 可加入）。若 `joinPolicy=free` 直接加入；若 `joinPolicy=approval` 提交申请等待审核
- **接口路径**：`/clubs/{id}/join`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（俱乐部 ID）
- **请求体**

  | 参数名       | 类型   | 必填 | 说明     |
  | ------------ | ------ | ---- | -------- |
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

---

#### 4.8 退出俱乐部

- **接口名称**：退出俱乐部
- **接口描述**：退出已加入的俱乐部（创建者/管理员不可退出，需解散俱乐部）
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

---

#### 4.9 入会申请列表

- **接口名称**：入会申请列表
- **接口描述**：查询指定俱乐部的入会申请（仅管理员）
- **接口路径**：`/clubs/{id}/join-requests`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅俱乐部管理员）
- **路径参数**：`id`（俱乐部 ID）
- **查询参数**

  | 参数名 | 类型   | 必填 | 说明                                                 |
  | ------ | ------ | ---- | ---------------------------------------------------- |
  | status | string | 否   | 申请状态：`pending`/`approved`/`rejected`/`canceled` |

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

---

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

---

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

---

### 5. 视频模块

#### 5.1 秒传检测与上传

- **接口名称**：秒传检测与上传
- **接口描述**：前端计算文件 Etag 后调用此接口。若返回成功，说明内容已存在并自动创建当前俱乐部视频记录；若返回失败 (code=1)，则需走普通上传流程。
- **接口路径**：`/videos/fast-upload`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`, `Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**

  | 参数名 | 类型   | 必填 | 说明      |
  | ------ | ------ | ---- | --------- |
  | clubId | number | 是   | 俱乐部 ID |
  | title  | string | 是   | 视频标题  |
  | etag   | string | 是   | 文件 Etag |

- **响应示例（秒传成功）**

```json
{
  "code": 0,
  "msg": "秒传成功",
  "data": {
    "videoId": 5002,
    "clubId": 3001,
    "uploaderId": 1001,
    "contentId": 7001,
    "title": "教学视频",
    "playUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
    "sourceUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
    "coverUrl": null,
    "duration": 120,
    "etag": "etag",
    "storage": {
      "provider": "qiniu",
      "bucket": "videoclub1",
      "objectKey": "content/etag/demo.mp4"
    },
    "variants": {
      "defaultUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
      "source": {
        "url": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
        "size": 104857600,
        "mimeType": "video/mp4"
      },
      "renditions": []
    },
    "uploaderName": "demo",
    "createdAt": "2026-01-30T10:00:00.000Z",
    "updatedAt": "2026-01-30T10:00:00.000Z"
  }
}
```

- **响应示例（无法秒传）**

```json
{
  "code": 1,
  "msg": "无法秒传，请上传文件",
  "data": null
}
```

---

#### 5.2 获取上传凭证

- **接口名称**：获取上传凭证
- **接口描述**：前端在执行上传操作前，调用此接口获取七牛云上传凭证 (uploadToken) 及相关配置。
- **接口路径**：`/videos/token`
- **请求方法**：GET
- **请求头**：`Content-Type: application/json`
- **认证要求**：公开
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "uploadToken": "y_IhcPIatpARaYf-m0qZPqV9NQp0unc8AixwIpBI:...",
    "domain": "http://qnkodovc1.rhuey.top",
    "region": "z1",
    "bucket": "videoclub1"
  }
}
```

---

#### 5.3 保存视频信息

- **接口名称**：保存视频信息
- **接口描述**：前端在对象存储直传成功后，调用此接口将视频元数据写入数据库。
- **接口路径**：`/videos`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**

| **参数名** | **类型** | **必填** | **说明**                         |
| ---------- | -------- | -------- | -------------------------------- |
| clubId     | number   | 是       | 俱乐部 ID                        |
| title      | string   | 是       | 视频标题                         |
| bucket     | string   | 否       | 存储桶（不传则使用后端默认配置） |
| region     | string   | 否       | 区域（不传则使用后端默认配置）   |
| objectKey  | string   | 是       | 七牛返回的文件名 (key)           |
| etag       | string   | 是       | 七牛返回的文件哈希 (hash)        |
| sourceUrl  | string   | 否       | 源视频地址（不传则自动拼接）     |
| duration   | number   | 否       | 视频时长 (秒)                    |
| coverUrl   | string   | 否       | 封面图地址                       |
| fileSize   | number   | 否       | 文件大小 (字节)                  |
| mimeType   | string   | 否       | 文件类型 (如 video/mp4)          |

- **说明**
  - 当 `etag` 在全局内容表中不存在时，`duration` 必填，否则返回 **400**。
  - 当 `etag` 已存在且当前俱乐部已有该内容记录时返回 **409**，提示“视频已存在当前俱乐部视频库中！”
  - `mimeType` 仅支持：`video/mp4`、`video/webm`、`video/quicktime`、`video/x-msvideo`、`video/x-matroska`、`video/ogg`、`application/vnd.apple.mpegurl`、`application/x-mpegURL`、`video/MP2T`

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "保存成功",
  "data": {
    "videoId": 15,
    "contentId": 7001,
    "clubId": 2,
    "uploaderId": 1001,
    "title": "我的教学视频",
    "playUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
    "sourceUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
    "coverUrl": null,
    "duration": 120,
    "etag": "etag",
    "storage": {
      "provider": "qiniu",
      "bucket": "videoclub1",
      "objectKey": "content/etag/demo.mp4"
    },
    "variants": {
      "defaultUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
      "source": {
        "url": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
        "size": 104857600,
        "mimeType": "video/mp4"
      },
      "renditions": []
    },
    "uploaderName": "teacher_zhang",
    "createdAt": "2026-01-30T10:00:00.000Z",
    "updatedAt": "2026-01-30T10:00:00.000Z"
  }
}
```

---

#### 5.4 视频列表

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
        "contentId": 7001,
        "clubId": 3001,
        "uploaderId": 1001,
        "title": "示例视频",
        "playUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
        "sourceUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
        "coverUrl": null,
        "duration": 120,
        "etag": "etag",
        "storage": {
          "provider": "qiniu",
          "bucket": "videoclub1",
          "objectKey": "content/etag/demo.mp4"
        },
        "variants": {
          "defaultUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
          "source": {
            "url": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
            "size": 104857600,
            "mimeType": "video/mp4"
          },
          "renditions": []
        },
        "uploaderName": "demo",
        "createdAt": "2026-01-17T12:00:00.000Z",
        "updatedAt": "2026-01-17T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

#### 5.5 视频详情

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
    "contentId": 7001,
    "clubId": 3001,
    "uploaderId": 1001,
    "title": "示例视频",
    "playUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
    "sourceUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
    "coverUrl": null,
    "duration": 120,
    "etag": "etag",
    "storage": {
      "provider": "qiniu",
      "bucket": "videoclub1",
      "objectKey": "content/etag/demo.mp4"
    },
    "variants": {
      "defaultUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
      "source": {
        "url": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
        "size": 104857600,
        "mimeType": "video/mp4"
      },
      "renditions": []
    },
    "uploaderName": "demo",
    "createdAt": "2026-01-17T12:00:00.000Z",
    "updatedAt": "2026-01-17T12:00:00.000Z"
  }
}
```

#### **5.6 删除视频**

- **接口名称**：删除视频
- **接口描述**：删除指定视频。系统会自动检查引用，若该物理文件未被其他视频记录引用，则会同步从七牛云物理删除。
- **接口路径**：`/videos/{id}`
- **请求方法**：DELETE
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录（仅上传者可删除）
- **说明**：当前实现仅允许视频上传者删除自己的视频。如果需要允许俱乐部管理员删除任意视频，请在 `video.service.ts` 中完善权限验证逻辑。
- **路径参数**：`id`（视频 ID）
- **响应示例（成功）**

```
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

#### 5.7 获取播放信息

- **接口名称**：获取播放信息
- **接口描述**：获取播放地址与多码率信息
- **接口路径**：`/videos/{id}/play`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录，俱乐部成员
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "videoId": 5001,
    "clubId": 3001,
    "title": "示例视频",
    "playUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
    "sourceUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
    "coverUrl": null,
    "duration": 120,
    "variants": {
      "defaultUrl": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
      "source": {
        "url": "http://qnkodovc1.rhuey.top/content/etag/demo.mp4",
        "size": 104857600,
        "mimeType": "video/mp4"
      },
      "renditions": []
    },
    "storage": {
      "provider": "qiniu",
      "bucket": "videoclub1",
      "objectKey": "content/etag/demo.mp4"
    }
  }
}
```

---

### 6. 教学资源模块

#### 6.1 秒传检测与上传

- **接口名称**：秒传检测与上传
- **接口描述**：前端计算文件 Etag 后调用此接口。若返回成功，说明内容已存在并自动创建当前俱乐部资源记录；若返回失败 (code=1)，则需走普通上传流程。
- **接口路径**：`/resources/fast-upload`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`, `Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**

  | 参数名   | 类型   | 必填 | 说明      |
  | -------- | ------ | ---- | --------- |
  | clubId   | number | 是   | 俱乐部 ID |
  | title    | string | 是   | 资源标题  |
  | filename | string | 是   | 文件名    |
  | etag     | string | 是   | 文件 Etag |

- **响应示例（秒传成功）**

```json
{
  "code": 0,
  "msg": "秒传成功",
  "data": {
    "resourceId": 6001,
    "clubId": 3001,
    "uploaderId": 1001,
    "contentId": 7001,
    "title": "教学课件",
    "filename": "课件.pdf",
    "description": null,
    "downloadUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
    "sourceUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
    "etag": "etag",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "storage": {
      "provider": "qiniu",
      "bucket": "videoclub1",
      "region": "z1",
      "objectKey": "resource/etag/课件.pdf"
    },
    "uploaderName": "demo",
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

- **响应示例（无法秒传）**

```json
{
  "code": 1,
  "msg": "无法秒传，请上传文件",
  "data": null
}
```

- **说明**
  - 当当前俱乐部已存在同内容资源时返回 **409**，提示"文件已存在当前俱乐部资源库中！"

---

#### 6.2 获取上传凭证

- **接口名称**：获取上传凭证
- **接口描述**：前端在执行上传操作前，调用此接口获取七牛云上传凭证 (uploadToken) 及相关配置。
- **接口路径**：`/resources/token`
- **请求方法**：GET
- **请求头**：`Content-Type: application/json`
- **认证要求**：公开
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "uploadToken": "y_IhcPIatpARaYf-m0qZPqV9NQp0unc8AixwIpBI:...",
    "domain": "http://qnkodovc1.rhuey.top",
    "region": "z1",
    "bucket": "videoclub1"
  }
}
```

---

#### 6.3 保存资源信息

- **接口名称**：保存资源信息
- **接口描述**：前端在对象存储直传成功后，调用此接口将资源元数据写入数据库。
- **接口路径**：`/resources`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **请求体**

| **参数名**  | **类型** | **必填** | **说明**                         |
| ----------- | -------- | -------- | -------------------------------- |
| clubId      | number   | 是       | 俱乐部 ID                        |
| title       | string   | 是       | 资源标题                         |
| filename    | string   | 是       | 文件名                           |
| description | string   | 否       | 资源描述                         |
| bucket      | string   | 否       | 存储桶（不传则使用后端默认配置） |
| region      | string   | 否       | 区域（不传则使用后端默认配置）   |
| objectKey   | string   | 是       | 七牛返回的文件名 (key)           |
| etag        | string   | 是       | 七牛返回的文件哈希 (hash)        |
| sourceUrl   | string   | 否       | 源文件地址（不传则自动拼接）     |
| fileSize    | number   | 否       | 文件大小 (字节)                  |
| mimeType    | string   | 否       | 文件类型 (如 application/pdf)    |

- **说明**
  - 当 `etag` 在全局内容表中不存在时，创建新内容记录；当已存在且当前俱乐部已有该内容记录时返回 **409**，提示"文件已存在当前俱乐部资源库中！"
  - `mimeType` 仅支持：`application/pdf`、`application/msword`、`application/vnd.openxmlformats-officedocument.wordprocessingml.document`、`application/vnd.ms-excel`、`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`、`application/vnd.ms-powerpoint`、`application/vnd.openxmlformats-officedocument.presentationml.presentation`、`application/zip`、`application/x-rar-compressed`、`application/x-7z-compressed`、`image/jpeg`、`image/png`、`image/gif`、`text/plain`

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "保存成功",
  "data": {
    "resourceId": 15,
    "contentId": 7001,
    "clubId": 2,
    "uploaderId": 1001,
    "title": "教学课件",
    "filename": "课件.pdf",
    "description": "第一单元课件",
    "downloadUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
    "sourceUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
    "etag": "etag",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "storage": {
      "provider": "qiniu",
      "bucket": "videoclub1",
      "region": "z1",
      "objectKey": "resource/etag/课件.pdf"
    },
    "uploaderName": "teacher_zhang",
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

---

#### 6.4 资源列表

- **接口名称**：资源列表
- **接口描述**：按俱乐部分页查询资源列表，支持关键词搜索和类型筛选
- **接口路径**：`/resources`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **查询参数**

  | 参数名   | 类型   | 必填 | 说明                      |
  | -------- | ------ | ---- | ------------------------- |
  | clubId   | number | 是   | 俱乐部 ID                 |
  | keyword  | string | 否   | 搜索关键词（标题/文件名） |
  | mimeType | string | 否   | 文件类型                  |
  | page     | number | 否   | 页码，默认 1              |
  | pageSize | number | 否   | 每页数量，默认 20         |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "list": [
      {
        "resourceId": 6001,
        "contentId": 7001,
        "clubId": 3001,
        "uploaderId": 1001,
        "title": "教学课件",
        "filename": "课件.pdf",
        "description": "第一单元课件",
        "downloadUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
        "sourceUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
        "etag": "etag",
        "fileSize": 1048576,
        "mimeType": "application/pdf",
        "storage": {
          "provider": "qiniu",
          "bucket": "videoclub1",
          "region": "z1",
          "objectKey": "resource/etag/课件.pdf"
        },
        "uploaderName": "demo",
        "createdAt": "2026-02-03T10:00:00.000Z",
        "updatedAt": "2026-02-03T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

#### 6.5 资源详情

- **接口名称**：资源详情
- **接口描述**：获取指定资源的详细信息
- **接口路径**：`/resources/{id}`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（资源 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "resourceId": 6001,
    "contentId": 7001,
    "clubId": 3001,
    "uploaderId": 1001,
    "title": "教学课件",
    "filename": "课件.pdf",
    "description": "第一单元课件",
    "downloadUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
    "sourceUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
    "etag": "etag",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "storage": {
      "provider": "qiniu",
      "bucket": "videoclub1",
      "region": "z1",
      "objectKey": "resource/etag/课件.pdf"
    },
    "uploaderName": "demo",
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

---

#### 6.6 更新资源信息

- **接口名称**：更新资源信息
- **接口描述**：更新资源的标题和描述（仅上传者可操作）
- **接口路径**：`/resources/{id}`
- **请求方法**：PUT
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录，仅上传者
- **路径参数**：`id`（资源 ID）
- **请求体**

| **参数名**  | **类型** | **必填** | **说明**                |
| ----------- | -------- | -------- | ----------------------- |
| title       | string   | 否       | 新标题                  |
| description | string   | 否       | 新描述（最多 500 字符） |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "修改成功",
  "data": {
    "resourceId": 6001,
    "contentId": 7001,
    "clubId": 3001,
    "uploaderId": 1001,
    "title": "更新后的课件标题",
    "filename": "课件.pdf",
    "description": "更新后的描述",
    "downloadUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
    "sourceUrl": "http://qnkodovc1.rhuey.top/resource/etag/课件.pdf",
    "etag": "etag",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "storage": {
      "provider": "qiniu",
      "bucket": "videoclub1",
      "region": "z1",
      "objectKey": "resource/etag/课件.pdf"
    },
    "uploaderName": "demo",
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T11:00:00.000Z"
  }
}
```

---

#### 6.7 删除资源

- **接口名称**：删除资源
- **接口描述**：删除指定资源。系统会自动检查引用，若该物理文件未被其他资源记录引用，则会同步从七牛云物理删除。
- **接口路径**：`/resources/{id}`
- **请求方法**：DELETE
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录，仅上传者
- **路径参数**：`id`（资源 ID）
- **响应示例（成功）**

```
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 7. 评论模块

#### 7.1 发表评论

- **接口名称**：发表评论

- **接口描述**：对视频发表评论或回复评论

- **接口路径**：`/comments`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **请求体**

  | 参数名    | 类型   | 必填 | 说明               |
  | --------- | ------ | ---- | ------------------ |
  | videoId   | number | 是   | 视频 ID            |
  | content   | string | 是   | 内容               |
  | videoTime | number | 否   | 时间轴秒数，默认 0 |
  | parentId  | number | 否   | 回复的父评论 ID    |

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

---

#### 7.2 评论列表

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
          "realname": "珍妮",
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

>  注：`sender.realname` 默认返回

---

#### 7.3 删除评论

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

---

### 8. 任务模块

#### 8.1 发布任务

- **接口名称**：发布任务

- **接口描述**：发布俱乐部任务（可关联视频或教学设计）

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
  | pdfId       | number | 否   | 关联教学设计案例（PDF）资源ID                |
  | type        | string | 否   | `watch` / `research` / `read_design` / `all`，默认 `all` |
  | title       | string | 是   | 标题                                    |
  | description | string | 否   | 描述                                    |
  | isUnlocked  | boolean | 否  | 是否解锁，默认 `false`                   |
  | subtasks    | array  | 否   | 自定义子任务列表（如果不传且 type=all，系统会自动生成默认子任务） |

- `isUnlocked` 不传默认 `false`，需手动解锁后才可访问。
- **说明**：当未传 `type` 时，系统会自动生成 3 个子任务（继承父任务 videoId）：
  1. `read_design` 子任务：标题“阅读教学设计”，描述“阅读并理解本课的教学设计方案”
  2. `watch` 子任务：标题“看视频任务”，描述“观看完整教学视频”，关联videoId（如果提供）
  3. `research` 子任务：标题“研视频任务”，描述“完成教学反思与研讨”，关联videoId（如果提供）

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
    "isUnlocked": false,
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

---

#### 8.2 提交子任务

- **接口名称**：提交子任务

- **接口描述**：提交子任务完成记录及附件/笔记

- **接口路径**：`/tasks/{taskId}/subtasks/{subtaskId}/complete`

- **请求方法**：POST

- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`

- **认证要求**：登录

- **权限**：仅俱乐部成员

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
3. 非俱乐部成员访问返回 `403`。

---

#### 8.3 任务列表

- **接口名称**：任务列表

- **接口描述**：查询俱乐部任务并返回子任务完成汇总

- **接口路径**：`/tasks`

- **请求方法**：GET

- **请求头**：`Authorization: Bearer {Token}`

- **认证要求**：登录
- **权限**：仅俱乐部成员（管理员可查看未解锁任务）

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
      "isUnlocked": true,
      "video": {
        "videoId": 5001,
        "title": "示例视频",
        "coverUrl": null,
        "duration": 120
      },
      // 注：如果有关联的视频，duration 来自于 video.content.duration
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

**说明**：俱乐部成员可访问；若为俱乐部管理员，返回全部任务（包含未解锁任务），否则仅返回已解锁（ `isUnlocked=true`） 的任务；非俱乐部成员访问返回 `403`。

---

#### 8.4 任务详情

- **接口名称**：任务详情
- **接口描述**：获取任务详情及当前用户子任务提交情况
- **接口路径**：`/tasks/{taskId}`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **权限**：仅俱乐部成员（管理员可查看未解锁任务）
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
      "isUnlocked": false,
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

**说明**：非俱乐部成员访问返回 `403`；若为俱乐部管理员，可查看未解锁任务详情，否则任务未解锁时返回 `403`。

---

#### 8.5 修改任务

- **接口名称**：修改任务
- **接口描述**：更新任务的主信息（标题、描述、关联视频、解锁状态），不影响已生成的子任务结构和用户完成记录。
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
| `pdfId`       | number | 否      | 修改关联的教学设计案例（PDF）资源ID |
| `isUnlocked`  | boolean | 否     | 解锁状态（`true`/`false`） |

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
    "isUnlocked": true,
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

---

#### 8.6 删除任务

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

---

### 9. 统计模块

#### 9.1 上报事件

- **接口名称**：上报事件
- **接口描述**：上报前端埋点事件数据，覆盖用户行为、页面访问与隐私合规相关事件
- **接口路径**：`/analytics/events`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`
- **认证要求**：公开

**参数（服务端接收字段，snake_case）**：

| 参数名            | 类型     | 必填  | 说明                                                                  |
| --------------- | ------ | --- | ------------------------------------------------------------------- |
| user_id         | number | 否   | 用户 ID                                                               |
| club_id         | number | 否   | 俱乐部 ID                                                              |
| event_time      | number | 是   | 事件时间（Unix 时间戳，毫秒）。前端建议使用 `Date.now()`                   |
| user_name       | string | 否   | 用户名                                                                 |
| user_true_name  | string | 否   | 用户真实姓名                                                            |
| page            | string | 否   | 页面标识/路由（前端 `currentPage` 或完整路径均可）                          |
| event           | string | 是   | 事件类型（见下方“科研关注埋点方案”与“系统通用事件（可选）”）                   |
| sub_event       | string | 否   | 子事件类型（通用/系统）：`click`/`input`/`change`/`submit`/`page_view`/`route_change`/`scroll_depth`/`page_visible`/`page_hidden`/`js_error`/`resource_error`/`unhandled_rejection`/`page_performance` |
| target_type     | string | 否   | 目标类型（如 `task`/`video`/`pdf`/`topic`/`comment`/`subtask`/`club`）         |
| target_id       | string | 否   | 目标 ID（建议使用业务主键，字符串或数字均可）                                  |
| video_time      | number | 否   | 视频播放时间（秒，可小数），用于 `view_video`/`video_play_*` 事件               |
| target_object   | string | 否   | 备用扩展字段（推荐 JSON 字符串），用于承载未结构化信息                           |

**事件类型说明（仅保留科研关注埋点方案）**

- 默认仅采集下方“科研关注埋点方案”内的事件类型；未列入方案的基础/动作事件不采集。
- 系统通用事件保留定义但默认不启用（仅排障启用），见文末“系统通用事件（可选）”。

**前端对接说明：**

- 前端 `Utils.sendPrivacyEvent`/`App.sendUserAction` 使用 camelCase 字段（如 `userId`、`timestamp`），调用本接口需转换为 snake_case 并补齐 `event_time`（毫秒）。
- `page` 表示路由/页面，用于统计访问路径与学习流程。
- 后端启用白名单校验，未在表格内的字段会被剔除（如前端 `data`、`userAgent` 等）。
- 推荐使用 `target_type` + `target_id` 进行结构化标识，`target_object` 仅用于无法结构化的补充信息。

**科研关注埋点方案（学习行为/教学效果/内容互动）**

学习行为（采集）：

| event | 字段建议（target_type / target_id / video_time / 其他） | 触发点（前端页面/动作） |
| --- | --- | --- |
| task_enter | `target_type: task`, `target_id: {taskId}`, `club_id: {clubId}` | 进入任务页或切换任务详情（`pages/tasks.html`） |
| view_task | `target_type: task`, `target_id: {taskId}`, `club_id: {clubId}` | 任务详情加载完成（`Tasks.getTaskDetail`） |
| club_submit_join_request | `target_type: club`, `target_id: {clubId}`, `target_object: {"request_id":{requestId},"apply_message":"..."}` | 申请加入俱乐部（`joinPolicy=approval` 时提交申请） |
| subtask_complete | `target_type: subtask`, `target_id: {subtaskId}`, `target_object: {"subtask_type":"watch|read_design|research"}` | 子任务完成提交（`completeSubTask`） |
| video_open_player | `target_type: video`, `target_id: {videoId}`, `target_object: {"task_id":{taskId}}` | 从任务页进入视频播放页（`goToVideoPlayer`） |
| view_video | `target_type: video`, `target_id: {videoId}` | 进入视频播放页（`pages/video-player.html` 页面加载完成） |
| video_play_start | `target_type: video`, `target_id: {videoId}`, `video_time` | 视频开始播放 |
| video_play_pause | `target_type: video`, `target_id: {videoId}`, `video_time` | 视频暂停 |
| video_play_seek | `target_type: video`, `target_id: {videoId}`, `video_time`, `target_object: {"seek_from":x,"seek_to":y}` | 视频拖拽/跳转（记录起止点） |
| video_play_finish | `target_type: video`, `target_id: {videoId}`, `video_time` | 视频播放结束 |
| pdf_preview_open / pdf_preview_close | `target_type: pdf`, `target_id: {pdfId}`, `target_object: {"task_id":{taskId}}` | 预览教学设计文档打开/关闭（`previewTeachingDesign`） |

教学效果/教学活动（采集）：

| event | 字段建议（target_type / target_id / video_time / 其他） | 触发点（前端页面/动作） |
| --- | --- | --- |
| create_club | `target_type: club`, `target_id: {clubId}` | 创建俱乐部成功（`clubs` 创建流程） |
| archive_club | `target_type: club`, `target_id: {clubId}` | 俱乐部归档成功 |
| dissolve_club | `target_type: club`, `target_id: {clubId}` | 俱乐部解散成功 |
| club_approve_join_request | `target_type: club`, `target_id: {clubId}`, `target_object: {"request_id":{requestId},"applicant_id":{userId}}` | 管理员同意入会申请（`pages/notifications.html`） |
| task_open_create_modal | `club_id: {clubId}` | 打开创建任务弹窗（`pages/video.html`） |
| task_create | `target_type: task`, `target_id: {taskId}`, `club_id: {clubId}` | 创建任务成功 |
| task_open_edit_modal | `target_type: task`, `target_id: {taskId}` | 打开编辑任务弹窗 |
| task_save_edit | `target_type: task`, `target_id: {taskId}` | 保存任务编辑成功 |
| task_delete | `target_type: task`, `target_id: {taskId}` | 删除任务成功 |
| task_lock / task_unlock | `target_type: task`, `target_id: {taskId}` | 锁定/解锁任务成功 |
| file_upload_video / file_remove_video | `target_type: video`, `target_id: {videoId}`, `target_object: {"task_id":{taskId}}` | 视频资源上传/移除 |
| file_upload_pdf / file_remove_pdf | `target_type: pdf`, `target_id: {pdfId}`, `target_object: {"task_id":{taskId}}` | 教学设计 PDF 上传/移除 |

内容互动（采集）：

| event | 字段建议（target_type / target_id / video_time / 其他） | 触发点（前端页面/动作） |
| --- | --- | --- |
| topic_open_list | `target_type: task`, `target_id: {taskId}`, `club_id: {clubId}` | 进入话题列表页（`pages/topiclist.html`） |
| topic_open_detail | `target_type: topic`, `target_id: {topicId}` | 进入话题详情页（`pages/topicforum.html`） |
| topic_create / topic_edit / topic_delete | `target_type: topic`, `target_id: {topicId}`, `club_id: {clubId}`, `target_object: {"title":"...","content":"...","content_length":123}` | 话题创建/编辑/删除（正文放入 `target_object`） |
| reflection_submit | `target_type: topic`, `target_id: {topicId}`, `target_object: {"content":"...","content_length":45,"scaffold_type":"opinion|question|case|summary|reflection","parent_id":null}` | 发表评论（话题详情页，正文放入 `target_object`） |
| reflection_reply_submit | `target_type: comment`, `target_id: {commentId}`, `target_object: {"content":"...","content_length":45,"parent_id":{parentId}}` | 回复评论（正文放入 `target_object`） |
| reflection_like / reflection_delete | `target_type: comment`, `target_id: {commentId}` | 点赞/删除评论 |
| comment_sort_change | `target_type: topic`, `target_id: {topicId}`, `target_object: {"sort_by":"timestamp|newest|oldest|popular"}` | 评论排序切换（话题/视频评论） |
| comment_submit（视频评论） | `target_type: video`, `target_id: {videoId}`, `target_object: {"content":"...","content_length":45,"timestamp":12,"parent_id":null}` | 视频评论发表（`pages/video-player.html`） |
| comment_reply_submit（视频评论） | `target_type: comment`, `target_id: {commentId}`, `target_object: {"content":"...","content_length":45,"parent_id":{parentId},"video_id":{videoId}}` | 视频评论回复（`pages/video-player.html`） |
| comment_delete（视频评论） | `target_type: comment`, `target_id: {commentId}`, `target_object: {"video_id":{videoId}}` | 视频评论删除（`pages/video-player.html`） |

会话与合规（采集，科研辅助）：

| event | 字段建议（target_type / target_id / video_time / 其他） | 触发点（前端页面/动作） |
| --- | --- | --- |
| user_login | `user_id`, `page: login` | 登录成功（自动/手动） |
| user_logout | `user_id`, `page: profile` | 用户登出 |
| privacy_agreement_accepted | `user_id`, `target_object: {"version":"2026-01"}` | 隐私协议同意 |

系统通用事件（可选/仅排障启用）：

- `generic_interaction`
- `system_event`（具体类型放在 `sub_event` 中）
  - `sub_event` 可选值：`page_view`/`route_change`/`scroll_depth`/`page_visible`/`page_hidden`/`js_error`/`resource_error`/`unhandled_rejection`/`page_performance`

说明：科研目标聚焦“学习行为/教学效果/内容互动”时，系统通用事件默认不采集；仅在排障或性能诊断阶段短期开启。

**前端页面建议值（便于统计口径一致）**

| page | 对应页面 |
| --- | --- |
| tasks | `pages/tasks.html` |
| video | `pages/video.html` |
| video-player | `pages/video-player.html` |
| topiclist | `pages/topiclist.html` |
| topicforum | `pages/topicforum.html` |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "eventId": 1
  }
}
```

**说明**：

- `eventId`：数据库自动生成的事件 ID

- **请求示例**

```json
{
  "user_id": 1001,
  "club_id": 3001,
  "event_time": 1737945600000,
  "page": "video-player",
  "event": "video_play_start",
  "target_type": "video",
  "target_id": "123",
  "video_time": 12.5,
  "target_object": "{\"task_id\":7001}"
}
```

---

### 10. 站内信模块

#### 10.1 站内信列表

- **接口名称**：站内信列表
- **接口描述**：分页获取当前用户的站内信
- **接口路径**：`/notifications`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **查询参数**

  | 参数名      | 类型    | 必填 | 说明              |
  | ----------- | ------- | ---- | ----------------- |
  | isRead      | boolean | 否   | 是否已读          |
  | isProcessed | boolean | 否   | 是否已处理        |
  | page        | number  | 否   | 页码，默认 1      |
  | pageSize    | number  | 否   | 每页数量，默认 20 |

- `type` 取值说明：`club_join_request` / `club_join_approved` / `club_join_rejected` / `topic_comment_like` / `topic_comment_reply`

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
        "content": "申请理由：XXX",
        "payload": {
          "clubId": 3001,
          "requestId": 8001,
          "applicantId": 1002,
          "clubName": "数学教研组"
        },
        "isRead": false,
        "readAt": null,
        "isProcessed": false,
        "processAt": null,
        "createdAt": "2026-01-17T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

#### 10.2 未读数量

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

---

#### 10.3 标记已读

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

---

#### 10.4 全部已读

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

---

### 11. 话题模块

#### 11.1 创建话题

- **接口名称**：创建话题
- **接口描述**：创建新的话题（俱乐部成员可操作）
- **接口路径**：`/topics`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **权限**：仅俱乐部成员
- **请求体**

  | 参数名   | 类型   | 必填 | 说明                          |
  | -------- | ------ | ---- | ----------------------------- |
  | taskId   | number | 是   | 任务ID                        |
  | title    | string | 是   | 话题标题（2-200字符）         |
  | content  | string | 否   | 话题内容（最多5000字符）      |
  | scaffold | string | 否   | 话题脚手架内容（最多1000字符） |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "话题创建成功",
  "data": {
    "topicId": 10001,
    "taskId": 7001,
    "creatorId": 1001,
    "title": "关于教学方法的讨论",
    "content": "欢迎大家分享教学经验",
    "scaffold": "引导问题：请结合课堂实例说明你的做法",
    "createdAt": "2026-02-05T10:00:00.000Z"
  }
}
```

---

#### 11.2 获取话题列表

- **接口名称**：获取话题列表
- **接口描述**：按任务分页查询话题列表（含评论数统计、发起者是否俱乐部管理员）
- **实现说明**：高并发场景下，`commentCount` 与 `isManager` 由数据库聚合计算后一次返回，减少接口层多次拼接查询。
- **接口路径**：`/topics`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **查询参数**

  | 参数名   | 类型   | 必填 | 说明              |
  | -------- | ------ | ---- | ----------------- |
  | taskId   | number | 是   | 任务ID            |
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
        "topicId": 10001,
        "taskId": 7001,
        "title": "关于教学方法的讨论",
        "content": "欢迎大家分享教学经验",
        "scaffold": "引导问题：请结合课堂实例说明你的做法",
        "commentCount": 5,
        "isManager": true,
        "createdAt": "2026-02-05T10:00:00.000Z",
        "creator": {
          "userId": 1001,
          "username": "teacher_zhang",
          "realname": "张三",
          "avatarUrl": "http://..."
        }
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

#### 11.3 获取话题详情

- **接口名称**：获取话题详情
- **接口描述**：获取指定话题的详细信息（含评论数统计、发起者是否俱乐部管理员）
- **实现说明**：高并发场景下，`commentCount` 与 `isManager` 由数据库聚合计算后一次返回。
- **接口路径**：`/topics/{id}`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`id`（话题 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "topicId": 10001,
    "taskId": 7001,
    "title": "关于教学方法的讨论",
    "content": "欢迎大家分享教学经验",
    "scaffold": "引导问题：请结合课堂实例说明你的做法",
    "commentCount": 5,
    "isManager": true,
    "createdAt": "2026-02-05T10:00:00.000Z",
    "creator": {
      "userId": 1001,
      "username": "teacher_zhang",
      "realname": "张三",
      "avatarUrl": "http://..."
    }
  }
}
```

---

#### 11.4 编辑话题

- **接口名称**：编辑话题
- **接口描述**：更新话题标题或内容（仅话题创建者可操作）
- **接口路径**：`/topics/{id}`
- **请求方法**：PATCH
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **权限**：仅话题创建者
- **路径参数**：`id`（话题 ID）
- **请求体**

  | 参数名   | 类型   | 必填 | 说明                          |
  | -------- | ------ | ---- | ----------------------------- |
  | title    | string | 否   | 新标题（2-200字符）           |
  | content  | string | 否   | 新内容（最多5000字符）        |
  | scaffold | string | 否   | 新脚手架内容（最多1000字符） |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "话题编辑成功",
  "data": {
    "topicId": 10001,
    "taskId": 7001,
    "creatorId": 1001,
    "title": "更新后的标题",
    "content": "更新后的内容",
    "scaffold": "更新后的引导问题",
    "createdAt": "2026-02-05T10:00:00.000Z"
  }
}
```

---

#### 11.5 删除话题

- **接口名称**：删除话题
- **接口描述**：软删除话题及其所有评论（仅话题创建者可操作）
- **接口路径**：`/topics/{id}`
- **请求方法**：DELETE
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **权限**：仅话题创建者
- **路径参数**：`id`（话题 ID）
- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "话题删除成功",
  "data": null
}
```

---

#### 11.6 获取评论列表

- **接口名称**：获取评论列表
- **接口描述**：获取话题下的评论列表（扁平结构，含点赞信息）
- **接口路径**：`/topics/{topicId}/comments`
- **请求方法**：GET
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`topicId`（话题 ID）
- **查询参数**

  | 参数名   | 类型   | 必填 | 说明              |
  | -------- | ------ | ---- | ----------------- |
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
        "commentId": 20001,
        "topicId": 10001,
        "content": "很好的话题",
        "parentId": null,
        "likeCount": 3,
        "isLiked": true,
        "createdAt": "2026-02-05T10:30:00.000Z",
        "user": {
          "userId": 1002,
          "username": "teacher_li",
          "realname": "李四",
          "avatarUrl": "http://...",
          "role": "teacher"
        }
      },
      {
        "commentId": 20002,
        "topicId": 10001,
        "content": "赞同",
        "parentId": 20001,
        "likeCount": 1,
        "isLiked": false,
        "createdAt": "2026-02-05T11:00:00.000Z",
        "user": {
          "userId": 1003,
          "username": "teacher_wang",
          "realname": "王五",
          "avatarUrl": "http://...",
          "role": "teacher"
        }
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 50
  }
}
```

注：`isLiked` 表示当前登录用户是否已点赞该评论。

---

#### 11.7 发表评论

- **接口名称**：发表评论
- **接口描述**：对话题发表评论或回复评论
- **接口路径**：`/topics/{topicId}/comments`
- **请求方法**：POST
- **请求头**：`Content-Type: application/json`，`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`topicId`（话题 ID）
- **通知规则**：当 `parentId` 有值且回复他人评论时，会向被回复评论作者发送 `topic_comment_reply` 站内信。
- **请求体**

  | 参数名   | 类型   | 必填 | 说明                   |
  | -------- | ------ | ---- | ---------------------- |
  | content  | string | 是   | 评论内容（1-2000字符） |
  | parentId | number | 否   | 父评论ID（回复时填写） |

- **响应示例（成功）**

```json
{
  "code": 0,
  "msg": "评论发表成功",
  "data": {
    "commentId": 20003,
    "topicId": 10001,
    "userId": 1001,
    "content": "这是一个回复",
    "parentId": 20001,
    "likeCount": 0,
    "createdAt": "2026-02-05T12:00:00.000Z"
  }
}
```

---

#### 11.8 点赞/取消点赞

- **接口名称**：点赞/取消点赞
- **接口描述**：对评论进行点赞或取消点赞操作
- **接口路径**：`/topic-comments/{commentId}/like`
- **请求方法**：POST
- **请求头**：`Authorization: Bearer {Token}`
- **认证要求**：登录
- **路径参数**：`commentId`（评论 ID）
- **通知规则**：点赞成功且点赞对象为他人评论时，会向评论作者发送 `topic_comment_like` 站内信；取消点赞不发送通知。
- **响应示例（成功，点赞）**

```json
{
  "code": 0,
  "msg": "点赞成功",
  "data": {
    "liked": true
  }
}
```

- **响应示例（成功，取消点赞）**

```json
{
  "code": 0,
  "msg": "取消点赞成功",
  "data": {
    "liked": false
  }
}
```

---

### 12. 通用错误示例

#### 12.1 认证失败

```json
{
  "code": 401,
  "msg": "登录已过期或未授权",
  "data": null
}
```

#### 12.2 参数校验失败

```json
{
  "code": 400,
  "msg": "参数错误提示",
  "data": null
}
```

#### 12.3 资源不存在

```json
{
  "code": 404,
  "msg": "资源不存在",
  "data": null
}
```

---

### 13. 更新日志

Current Version: 1.8.5

#### 2026-02-08

- Version: 1.8.5
- Editor: Cheng R. Zhu

1. 修改Topic实体，为Task设置外键级联删除
2. getTopic、findTopic、deleteTopic等方法查询添加软删除过滤

#### 2026-02-08

- Version: 1.8.4
- Editor: Jieyang W.

1. 话题的 点赞/评论回复 作为消息通知，发送站内信
2. 开放创建话题的权限到俱乐部成员
3. 获取话题列表/详情 增加返回 `isManager` ，用于判断是否是俱乐部管理员
4. 优化话题列表/详情接口高并发性能：将 `commentCount` 与 `isManager` 下推到 SQL 聚合计算，减少数据库往返次数（接口响应结构不变）
5. 修改站内信 `content` 字段可为空，申请加入俱乐部时， `content`为申请理由
6. 话题模块新增 `scaffold` 字段（可选）：`POST /topics`、`PATCH /topics/{id}` 请求体支持 `scaffold`（最长1000字符），`GET /topics` 与 `GET /topics/{id}` 返回新增 `scaffold`
7. 修改部分子任务描述，与前端一致

#### 2026-02-07

- Version: 1.8.3
- Editor: J.J. Gao

1. 统计模块补充视频评论埋点说明，`comment_sort_change.sort_by` 增加 `oldest` 取值

#### 2026-02-06

- Version: 1.8.2
- Editor: Jieyang W.

1. 话题列表/话题详情/话题评论列表 增加返回 realname
2. 修复视频和资源的秒传接口

#### 2026-02-06

- Version: 1.8.1
- Editor: Cheng R. Zhu

1. 新增话题详情接口 `GET /topics/{id}`

#### 2026-02-05

- Version: 1.8.0
- Editor: Jieyang W.

1. 新增话题模块（Topic），支持创建、编辑、删除话题
2. 新增话题评论功能，支持多轮回复
3. 新增话题评论点赞功能，支持点赞/取消点赞
4. 同步更新数据库文档，新增 Topics、TopicComments、TopicCommentLikes 三张表
5. 微调视频上传及评论列表显示真名

#### 2026-02-05

- Version: 1.7.2
- Editor: Cheng R. Zhu

1. 任务发布更新接口增加pdfId字段

#### 2026-02-04

- Version: 1.7.1
- Editor: Jieyang W.

1. 评论列表增加返回 `sender.realname`
1. 整理接口文档

#### 2026-02-03

- Version: 1.6.5
- Editor: Cheng R. Zhu

1. 新增教学资源模块，支持文件上传、存储、获取、修改、删除和秒传功能；同步更新API文档、数据库文档

#### 2026-02-03

- Version: 1.6.4
- Editor: Cheng R. Zhu

1. 修正接口说明

#### 2026-02-03

- Version: 1.6.3
- Editor: Jieyang W.

1. 增加子任务类型 `read_design`，创建任务时默认创建 3 个子任务。
1. 修复任务模块的一些问题，俱乐部管理员现在可以查看所有任务，包括解锁和未解锁的。

#### 2026-02-02

- Version: 1.6.2
- Editor: Jieyang W.

1. 合并分支，整理视频相关接口
1. 微调更新用户资料接口
1. 补充俱乐部状态与加入/退出限制说明
1. 任务解锁改为手动控制，新增 isUnlocked 字段，移除 unlockAt 相关说明与校验

#### 2026-01-30

- Version: 1.6.1
- Editor: Jieyang W.

1. 新增全局内容表保存所有视频，俱乐部视频表引用全局内容表的视频。
2. 完善视频上传：增加COS SDK依赖，增加权限控制。
3. 增加播放相关接口。

#### 2026-01-29/30

- Version: 1.5.6/7
- Editor: Jieyang W. & Cheng R. Zhu

1. 更新视频模块接口，完善代码

#### 2026-01-28

- Version: 1.5.5
- Editor: Cheng R. Zhu

1. 埋点分析模块（Analytics）接口更新。

#### 2026-01-28

- Version: 1.5.4
- Editor: Jieyang W.

1. 站内信表增加两个字段：IsProcessed, ProcessAt。如果入会申请审批后 IsProcessed 为 true。
1. 修改4.2和4.3接口，返回的 creatorId 改为 creator 对象，包含 userId 和 username。

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
