# 工程咨询全业务数据库平台 - App 端 API 文档

## 概述

- **Base URL**: `http://your-server:3000/api/v1`
- **认证方式**: JWT Bearer Token
- **请求头**: `Authorization: Bearer <token>`

---

## 一、认证模块

### 1.1 用户登录

```
POST /auth/login
```

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "role": "admin"
  }
}
```

### 1.2 用户注册

```
POST /auth/register
```

**请求体**:
```json
{
  "username": "newuser",
  "password": "password123",
  "nickname": "新用户",
  "email": "user@example.com"
}
```

### 1.3 获取当前用户信息

```
GET /auth/profile
```

**需要认证**: ✅

### 1.4 更新个人信息

```
PUT /auth/profile
```

**需要认证**: ✅

**请求体**:
```json
{
  "nickname": "新昵称",
  "email": "newemail@example.com",
  "phone": "13800138000",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 1.5 修改密码

```
POST /auth/change-password
```

**需要认证**: ✅

**请求体**:
```json
{
  "oldPassword": "admin123",
  "newPassword": "newpassword123"
}
```

---

## 二、文件类型模块

### 2.1 获取文件类型列表

```
GET /doc-types/list
```

**需要认证**: ✅

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 关键词搜索 |
| status | number | 否 | 状态：1-启用，0-停用 |
| projectPhase | string | 否 | 项目阶段 |
| majorCategory | string | 否 | 大类 |
| minorCategory | string | 否 | 小类 |

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "code": "ZZJY010000001",
      "name": "会议纪要",
      "projectPhase": "招投标阶段",
      "majorCategory": "经营管理",
      "minorCategory": "会议纪要",
      "fileFeature": "LLM识别的文件特征",
      "projectType": "通用",
      "region": "通用",
      "ownerOrg": "通用",
      "bizDescription": "描述该文件类型的使用场景",
      "status": 1,
      "createdAt": "2026-01-15T08:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 366,
    "totalPages": 37
  }
}
```

### 2.2 获取所有启用的文件类型

```
GET /doc-types/all
```

**需要认证**: ✅

### 2.3 获取文件类型详情

```
GET /doc-types/:id
```

**需要认证**: ✅

### 2.4 获取文件类型完整信息（含字段定义和模板）

```
GET /doc-types/full/:idOrCode
```

**需要认证**: ✅

**响应**:
```json
{
  "docType": { ... },
  "fields": [ ... ],
  "templates": [ ... ]
}
```

### 2.5 创建文件类型

```
POST /doc-types
```

**需要认证**: ✅

**请求体**:
```json
{
  "name": "施工合同",
  "projectPhase": "招投标阶段",
  "majorCategory": "合同类",
  "minorCategory": "施工合同",
  "fileFeature": "包含甲方乙方信息、合同金额、工期等关键条款",
  "projectType": "房建工程,市政工程",
  "region": "全国",
  "ownerOrg": "政府投资项目",
  "bizDescription": "用于审计施工合同的合规性和金额准确性"
}
```

### 2.6 更新文件类型

```
PUT /doc-types/:id
```

**需要认证**: ✅

### 2.7 删除/停用文件类型

```
DELETE /doc-types/:id
```

**需要认证**: ✅

### 2.8 批量操作

```
POST /doc-types/batch/enable    # 批量启用
POST /doc-types/batch/disable   # 批量停用
POST /doc-types/batch/delete    # 批量删除
```

**请求体**:
```json
{
  "ids": [1, 2, 3]
}
```

---

## 三、关键信息字段模块

### 3.1 获取字段列表

```
GET /doc-field-defs/list
```

**需要认证**: ✅

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| keyword | string | 否 | 关键词 |
| docTypeIds | string | 否 | 文件类型ID，逗号分隔 |
| fieldCategory | string | 否 | 字段类别 |

### 3.2 根据文件类型获取字段

```
GET /doc-field-defs/by-doc-type/:docTypeId
```

**需要认证**: ✅

### 3.3 创建字段定义

```
POST /doc-field-defs
```

**需要认证**: ✅

**请求体**:
```json
{
  "docTypeId": 1,
  "fieldName": "合同金额",
  "fieldCategory": "金额",
  "requiredFlag": 1,
  "valueSource": "正文第三条第2款",
  "exampleValue": "1000000.00",
  "fieldDescription": "施工合同的总金额"
}
```

---

## 四、审计规则模块

### 4.1 获取规则列表

```
GET /audit-rules/list
```

**需要认证**: ✅

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| keyword | string | 否 | 关键词 |
| auditType | string | 否 | 审计类型 |
| phase | string | 否 | 阶段 |
| verifySection | string | 否 | 查证板块 |

### 4.2 获取规则详情

```
GET /audit-rules/:id
```

**需要认证**: ✅

### 4.3 创建规则

```
POST /audit-rules
```

**需要认证**: ✅

---

## 五、法规与标准模块

### 5.1 获取法规列表

```
GET /law-documents/list
```

**需要认证**: ✅

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| keyword | string | 否 | 关键词 |
| lawCategory | string | 否 | 文种类别 |
| lawStatus | string | 否 | 当前状态 |

### 5.2 获取法规条款

```
GET /law-clauses/by-law/:lawDocumentId
```

**需要认证**: ✅

---

## 六、枚举选项模块

### 6.1 获取枚举选项

```
GET /enum-options?category=projectPhase
```

**需要认证**: ✅

**可用分类**:
- `projectPhase` - 项目阶段
- `majorCategory` - 大类
- `minorCategory` - 小类（支持 parentValue 级联）
- `region` - 适用地区
- `ownerOrg` - 适用业主

**响应**:
```json
[
  {
    "id": 1,
    "category": "projectPhase",
    "value": "招投标阶段",
    "label": "招投标阶段",
    "shortCode": "ZT",
    "sortOrder": 0
  }
]
```

### 6.2 批量获取枚举选项

```
GET /enum-options/batch?categories=projectPhase,majorCategory
```

**需要认证**: ✅

### 6.3 新增枚举选项

```
POST /enum-options
```

**需要认证**: ✅

**请求体**:
```json
{
  "category": "majorCategory",
  "value": "新大类",
  "parentValue": null,
  "label": "新大类"
}
```

---

## 七、文件上传模块

### 7.1 上传文件

```
POST /files/upload?subDir=samples
```

**需要认证**: ✅

**请求体**: `multipart/form-data`
- `file`: 文件

**响应**:
```json
{
  "id": 1,
  "fileName": "example.pdf",
  "filePath": "/uploads/samples/xxx.pdf",
  "fileSize": 102400,
  "mimeType": "application/pdf",
  "sha256": "abc123..."
}
```

### 7.2 获取文件信息

```
GET /files/:id/info
```

### 7.3 预览文件

```
GET /files/:id/preview
```

### 7.4 下载文件

```
GET /files/:id/download
```

---

## 八、Excel 导入导出

### 8.1 下载导入模板

```
GET /doc-types/template
GET /doc-field-defs/template
GET /audit-rules/template
GET /law-documents/template
GET /law-clauses/template
```

### 8.2 导出数据

```
GET /doc-types/export
GET /doc-field-defs/export
GET /audit-rules/export
```

### 8.3 批量导入

```
POST /doc-types/import
POST /doc-field-defs/import
POST /audit-rules/import
POST /law-documents/import
POST /law-clauses/import
```

**请求体**: `multipart/form-data`
- `file`: Excel 文件
- `mode`: 导入模式（`upsert` | `insertOnly` | `updateOnly`）
- `dryRun`: 是否试运行（`true` | `false`）

---

## 九、通用响应格式

### 成功响应

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应

```json
{
  "code": "VALIDATION_ERROR",
  "message": "请求参数验证失败",
  "traceId": "xxx-xxx-xxx",
  "details": {
    "field": "错误详情"
  }
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 十、App 端集成建议

### 10.1 Token 存储

```javascript
// 登录成功后存储
localStorage.setItem('qjwl_token', response.access_token)
localStorage.setItem('qjwl_user', JSON.stringify(response.user))

// 请求时携带
fetch('/api/v1/xxx', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('qjwl_token')
  }
})
```

### 10.2 Token 刷新

当收到 401 响应时，跳转到登录页面重新登录。

### 10.3 分页加载

```javascript
// 首次加载
GET /doc-types/list?page=1&pageSize=20

// 加载更多
GET /doc-types/list?page=2&pageSize=20
```

### 10.4 搜索筛选

```javascript
// 带筛选条件
GET /doc-types/list?keyword=合同&projectPhase=招投标阶段&status=1
```

---

## 附录：OpenAPI 文档

完整的 OpenAPI 3.0 规范文档位于：`/openapi.json`

可以使用 Swagger UI 或 Postman 导入该文件进行接口测试。
