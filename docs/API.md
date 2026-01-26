# API 接口文档

## 概述

本系统所有 API 使用 RESTful 风格设计，统一前缀为 `/api/v1`。

- **基础 URL**: `http://localhost:3000/api/v1`
- **Swagger 文档**: http://localhost:3000/api-docs
- **认证方式**: JWT Bearer Token

## 通用响应格式

### 成功响应

```json
{
  "data": { /* 返回数据 */ },
  "meta": { /* 元数据（分页信息等）*/ }
}
```

### 分页列表响应

```json
{
  "data": [ /* 数据列表 */ ],
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
  "code": "ERROR_CODE",
  "message": "错误描述",
  "traceId": "追踪ID"
}
```

---

## 认证模块 (Auth)

### 登录

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**请求体：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应：**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "1",
      "username": "admin",
      "nickname": "管理员",
      "role": "admin"
    }
  }
}
```

### 用户注册

```http
POST /api/v1/auth/register
Content-Type: application/json
```

**请求体：**
```json
{
  "username": "newuser",
  "password": "password123",
  "nickname": "新用户"
}
```

### 获取当前用户信息

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

### 更新个人信息

```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "nickname": "新昵称",
  "email": "email@example.com",
  "phone": "13800138000"
}
```

### 修改密码

```http
POST /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

### 重置管理员密码

```http
POST /api/v1/auth/reset-admin
```

---

## 系统模块

### 健康检查

```http
GET /api/v1/healthz
```

**响应：**
```json
{
  "data": {
    "status": "ok",
    "timestamp": "2026-01-26T05:17:58.140Z",
    "database": { "status": "ok" }
  }
}
```

### 就绪检查

```http
GET /api/v1/ready
```

---

## 枚举选项 (Enum Options)

### 获取枚举选项列表

```http
GET /api/v1/enum-options?category=projectPhase
Authorization: Bearer <token>
```

**查询参数：**
- `category` (可选): 分类名称
- `tableName` (可选): 关联表名

### 获取所有分类

```http
GET /api/v1/enum-options/categories
Authorization: Bearer <token>
```

### 批量获取多个分类

```http
GET /api/v1/enum-options/batch?categories=projectPhase,majorCategory
Authorization: Bearer <token>
```

### 创建枚举选项

```http
POST /api/v1/enum-options
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "category": "projectPhase",
  "value": "竣工验收阶段",
  "tableName": "doc_type",
  "sortOrder": 5
}
```

### 更新枚举选项

```http
PUT /api/v1/enum-options/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### 删除枚举选项

```http
DELETE /api/v1/enum-options/:id
Authorization: Bearer <token>
```

### 生成枚举简码

```http
POST /api/v1/enum-options/generate-short-codes
Authorization: Bearer <token>
```

---

## 文件类型 (Doc Types)

### 获取文件类型列表

```http
GET /api/v1/doc-types/list?page=1&pageSize=10
Authorization: Bearer <token>
```

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `keyword`: 搜索关键词
- `projectPhase`: 项目阶段筛选
- `majorCategory`: 大类筛选
- `status`: 状态筛选（1启用/0停用）

### 获取所有文件类型（不分页）

```http
GET /api/v1/doc-types/all
Authorization: Bearer <token>
```

### 获取文件类型详情

```http
GET /api/v1/doc-types/:id
Authorization: Bearer <token>
```

### 获取文件类型完整信息（含关联字段）

```http
GET /api/v1/doc-types/full/:idOrCode
Authorization: Bearer <token>
```

### 创建文件类型

```http
POST /api/v1/doc-types
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "name": "施工合同",
  "projectPhase": "施工阶段",
  "majorCategory": "合同类",
  "minorCategory": "施工合同",
  "projectType": "工程建设",
  "fileFeature": "合同内容包含...",
  "bizDescription": "业务说明"
}
```

### 更新文件类型

```http
PUT /api/v1/doc-types/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### 删除文件类型

```http
DELETE /api/v1/doc-types/:id
Authorization: Bearer <token>
```

### 批量启用

```http
POST /api/v1/doc-types/batch/enable
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "ids": [1, 2, 3]
}
```

### 批量停用

```http
POST /api/v1/doc-types/batch/disable
Authorization: Bearer <token>
Content-Type: application/json
```

### 批量删除

```http
POST /api/v1/doc-types/batch/delete
Authorization: Bearer <token>
Content-Type: application/json
```

### 下载导入模板

```http
GET /api/v1/doc-types/template
Authorization: Bearer <token>
```

**响应：** Excel 文件流

### 导出数据

```http
GET /api/v1/doc-types/export
Authorization: Bearer <token>
```

**响应：** Excel 文件流

### 导入数据

```http
POST /api/v1/doc-types/import
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**表单字段：**
- `file`: Excel 文件

**响应：**
```json
{
  "data": {
    "success": 10,
    "failed": 2,
    "errors": ["第3行：名称不能为空"]
  }
}
```

### 同步枚举选项

```http
POST /api/v1/doc-types/sync-enum-options
Authorization: Bearer <token>
```

### 重新生成编码

```http
POST /api/v1/doc-types/regenerate-codes
Authorization: Bearer <token>
```

### 获取筛选选项

```http
GET /api/v1/doc-types/filter-options
Authorization: Bearer <token>
```

---

## 关键信息字段 (Doc Field Defs)

### 获取字段列表

```http
GET /api/v1/doc-field-defs/list?page=1&pageSize=10
Authorization: Bearer <token>
```

**查询参数：**
- `docTypeId`: 文件类型ID
- `fieldCategory`: 字段类别
- `requiredFlag`: 是否必填

### 按文件类型获取字段

```http
GET /api/v1/doc-field-defs/by-doc-type/:docTypeId
Authorization: Bearer <token>
```

### 获取字段详情

```http
GET /api/v1/doc-field-defs/:id
Authorization: Bearer <token>
```

### 创建字段

```http
POST /api/v1/doc-field-defs
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "docTypeId": 1,
  "fieldName": "合同金额",
  "fieldCategory": "金额",
  "requiredFlag": 1,
  "valueSource": "从合同正文提取",
  "valueSourceLlm": "在合同正文中找到"合同总价"字样后提取金额",
  "anchorWord": "合同总价、合同金额",
  "enumOptions": "",
  "exampleValue": "1000000.00",
  "fieldDescription": "合同约定的总金额",
  "processMethod": "自动提取"
}
```

### 更新字段

```http
PUT /api/v1/doc-field-defs/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### 删除字段

```http
DELETE /api/v1/doc-field-defs/:id
Authorization: Bearer <token>
```

### 批量操作

```http
POST /api/v1/doc-field-defs/batch/enable
POST /api/v1/doc-field-defs/batch/disable
POST /api/v1/doc-field-defs/batch/delete
Authorization: Bearer <token>
```

### 下载模板

```http
GET /api/v1/doc-field-defs/template
Authorization: Bearer <token>
```

### 导出数据

```http
GET /api/v1/doc-field-defs/export
Authorization: Bearer <token>
```

### 导入数据

```http
POST /api/v1/doc-field-defs/import
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

## 文件模板/示例 (Doc Template Samples)

### 获取模板列表

```http
GET /api/v1/doc-template-samples/list
Authorization: Bearer <token>
```

### 获取模板详情

```http
GET /api/v1/doc-template-samples/:id
Authorization: Bearer <token>
```

### 创建模板

```http
POST /api/v1/doc-template-samples
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "docTypeId": 1,
  "name": "施工合同示例A",
  "fileName": "contract-sample.pdf",
  "filePath": "/uploads/samples/contract-sample.pdf",
  "description": "标准施工合同示例"
}
```

### 更新模板

```http
PUT /api/v1/doc-template-samples/:id
Authorization: Bearer <token>
```

### 删除模板

```http
DELETE /api/v1/doc-template-samples/:id
Authorization: Bearer <token>
```

### 批量操作

```http
POST /api/v1/doc-template-samples/batch/enable
POST /api/v1/doc-template-samples/batch/disable
POST /api/v1/doc-template-samples/batch/delete
Authorization: Bearer <token>
```

---

## 审计规则 (Audit Rules)

### 获取规则列表

```http
GET /api/v1/audit-rules/list
Authorization: Bearer <token>
```

**查询参数：**
- `auditType`: 审计类型
- `phase`: 阶段
- `verifySection`: 查证板块

### 获取所有规则（不分页）

```http
GET /api/v1/audit-rules/all
Authorization: Bearer <token>
```

### 获取规则详情

```http
GET /api/v1/audit-rules/:id
Authorization: Bearer <token>
```

### 根据编码获取关联字段

```http
GET /api/v1/audit-rules/field-by-code/:fieldCode
Authorization: Bearer <token>
```

### 创建规则

```http
POST /api/v1/audit-rules
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "ruleName": "合同金额一致性检查",
  "auditType": "工程管理审计",
  "phase": "施工阶段",
  "verifySection": "合同管理",
  "problemDesc": "检查合同金额与付款金额是否一致",
  "compareMethod": "对比合同总价与已付款金额",
  "compareMethodLlm": "提取合同总价字段，对比付款记录总额",
  "auditBasis": "根据《建设工程施工合同管理办法》第XX条",
  "source1Code": "QQTZ0101001-001",
  "source2Code": "QQTZ0101001-002"
}
```

### 更新规则

```http
PUT /api/v1/audit-rules/:id
Authorization: Bearer <token>
```

### 删除规则

```http
DELETE /api/v1/audit-rules/:id
Authorization: Bearer <token>
```

### 批量操作

```http
POST /api/v1/audit-rules/batch/enable
POST /api/v1/audit-rules/batch/disable
POST /api/v1/audit-rules/batch/delete
Authorization: Bearer <token>
```

### 下载模板

```http
GET /api/v1/audit-rules/template
Authorization: Bearer <token>
```

### 导出数据

```http
GET /api/v1/audit-rules/export
Authorization: Bearer <token>
```

### 导入数据

```http
POST /api/v1/audit-rules/import
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

## 法规与标准 (Law Documents)

### 获取法规列表

```http
GET /api/v1/law-documents/list
Authorization: Bearer <token>
```

### 获取所有法规（不分页）

```http
GET /api/v1/law-documents/all
Authorization: Bearer <token>
```

### 获取法规详情

```http
GET /api/v1/law-documents/:id
Authorization: Bearer <token>
```

### 创建法规

```http
POST /api/v1/law-documents
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "lawName": "建设工程施工合同管理办法",
  "lawCode": "建办〔2020〕1号",
  "lawCategory": "部门规章",
  "publishOrg": "住建部",
  "publishDate": "2020-01-01",
  "effectiveDate": "2020-03-01",
  "lawStatus": "现行有效"
}
```

### 批量操作

```http
POST /api/v1/law-documents/batch/enable
POST /api/v1/law-documents/batch/disable
POST /api/v1/law-documents/batch/delete
Authorization: Bearer <token>
```

### 下载模板

```http
GET /api/v1/law-documents/template
Authorization: Bearer <token>
```

### 导入数据

```http
POST /api/v1/law-documents/import
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

## 法规条款 (Law Clauses)

### 获取条款列表

```http
GET /api/v1/law-clauses/list
Authorization: Bearer <token>
```

### 获取所有条款（不分页）

```http
GET /api/v1/law-clauses/all
Authorization: Bearer <token>
```

### 按法规获取条款

```http
GET /api/v1/law-clauses/by-law/:lawDocumentId
Authorization: Bearer <token>
```

### 获取条款详情

```http
GET /api/v1/law-clauses/:id
Authorization: Bearer <token>
```

### 创建条款

```http
POST /api/v1/law-clauses
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "lawDocumentId": 1,
  "clauseNo": "第一条",
  "clauseTitle": "总则",
  "clauseContent": "条款内容..."
}
```

### 批量操作

```http
POST /api/v1/law-clauses/batch/enable
POST /api/v1/law-clauses/batch/disable
POST /api/v1/law-clauses/batch/delete
Authorization: Bearer <token>
```

### 下载模板

```http
GET /api/v1/law-clauses/template
Authorization: Bearer <token>
```

### 导入数据

```http
POST /api/v1/law-clauses/import
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

## 文件上传 (Files)

### 上传文件

```http
POST /api/v1/files/upload?subDir=general
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**表单字段：**
- `file`: 要上传的文件

**查询参数：**
- `subDir`: 子目录（可选，默认 general）

**响应：**
```json
{
  "data": {
    "id": "1",
    "sha256": "a1b2c3...",
    "storagePath": "/uploads/general/uuid.pdf",
    "originalName": "document.pdf",
    "size": 1024,
    "mime": "application/pdf",
    "isExisting": false,
    "message": "上传成功"
  }
}
```

### 获取文件信息

```http
GET /api/v1/files/:id/info
Authorization: Bearer <token>
```

### 预览文件

```http
GET /api/v1/files/:id/preview
Authorization: Bearer <token>
```

### 下载文件

```http
GET /api/v1/files/:id/download
Authorization: Bearer <token>
```

### 按路径下载文件

```http
GET /api/v1/files/download/:subDir/:filename
Authorization: Bearer <token>
```

### 检查文件是否存在

```http
GET /api/v1/files/check/:sha256
Authorization: Bearer <token>
```

---

## 权限管理 (Permissions)

### 获取所有权限

```http
GET /api/v1/permissions/all
Authorization: Bearer <token>
```

### 获取角色列表（含权限）

```http
GET /api/v1/permissions/roles
Authorization: Bearer <token>
```

---

## 操作日志 (Operation Logs)

### 获取操作日志列表

```http
GET /api/v1/operation-logs/list
Authorization: Bearer <token>
```

**查询参数：**
- `page`: 页码
- `pageSize`: 每页数量
- `userId`: 用户ID筛选
- `module`: 模块筛选
- `action`: 操作类型筛选

---

## 元数据 (Meta)

### 获取所有表信息

```http
GET /api/v1/meta/tables
Authorization: Bearer <token>
```

### 获取指定表结构

```http
GET /api/v1/meta/tables/:tableName
Authorization: Bearer <token>
```

### 下载数据字典

```http
GET /api/v1/meta/dict.xlsx
Authorization: Bearer <token>
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| UNAUTHORIZED | 未授权（Token 无效或过期）|
| NOT_FOUND | 资源不存在 |
| BAD_REQUEST | 请求参数错误 |
| VALIDATION_ERROR | 数据验证失败 |
| CONFLICT | 资源冲突（如重复的编码）|
| INTERNAL_ERROR | 服务器内部错误 |

---

## 通用查询参数

### 分页参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码（从1开始）|
| pageSize | number | 10 | 每页数量 |

### 搜索参数

| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 模糊搜索关键词 |

### 排序参数

| 参数 | 类型 | 说明 |
|------|------|------|
| sortBy | string | 排序字段 |
| sortOrder | string | 排序方向（ASC/DESC）|

### 状态筛选

| 参数 | 类型 | 说明 |
|------|------|------|
| status | number | 1-启用 0-停用 |
