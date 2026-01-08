# 工程咨询全业务数据库平台

一个完整的工程咨询全业务数据库管理系统，包含后端 REST API 和前端管理后台。

## 📋 项目概述

本系统以"工程咨询全业务数据库设计"为中心，涵盖以下模块：

### 核心模块（已完整实现）
- **文件与资料库（工程全阶段文件体系）**
  - 文件类型管理
  - 关键信息字段定义
  - 文件模板/示例
  
- **审计逻辑库**
  - 审计规则管理
  - 规则字段关联
  - 规则法规依据
  - 规则案例
  
- **法律法规与标准库**
  - 法规与标准管理
  - 法规条款管理
  - 条款与文件类型适用关系

- **认证与权限**
  - JWT 认证
  - 用户管理

### 占位模块（基础CRUD）
- 工程造价规则库
- 工程咨询业务流程库
- 工程案例库
- 工程碎片知识库
- 工程数据监测

## 🛠 技术栈

### 后端
- **Node.js + TypeScript**
- **NestJS** - 企业级Node.js框架
- **TypeORM** - ORM框架
- **MySQL 8** - 数据库（字符集：utf8mb4）
- **Swagger** - API文档（含示例）
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

### 前端
- **React 18 + TypeScript**
- **Vite** - 构建工具
- **Ant Design 5** - UI组件库
- **React Query** - 数据请求状态管理
- **React Router 6** - 路由管理

## 📁 项目结构

```
QJWLdb/
├── backend/                    # 后端项目
│   ├── src/
│   │   ├── common/            # 通用模块
│   │   │   ├── dto/           # 通用DTO（分页、批量操作）
│   │   │   ├── entities/      # 基础实体
│   │   │   └── decorators/    # 装饰器
│   │   ├── modules/           # 业务模块
│   │   │   ├── auth/          # 认证模块
│   │   │   ├── doc-type/      # 文件类型
│   │   │   ├── doc-field-def/ # 关键信息字段
│   │   │   ├── doc-template-sample/ # 文件模板/示例
│   │   │   ├── audit-rule/    # 审计规则
│   │   │   ├── audit-rule-field-link/ # 规则字段关联
│   │   │   ├── audit-rule-law-link/   # 规则法规关联
│   │   │   ├── audit-rule-example/    # 规则案例
│   │   │   ├── law-document/  # 法规与标准
│   │   │   ├── law-clause/    # 法规条款
│   │   │   ├── law-clause-doc-type-link/ # 条款与文件类型关联
│   │   │   └── file-upload/   # 文件上传
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── BatchActions.tsx
│   │   │   ├── DetailModal.tsx
│   │   │   ├── FilterToolbar.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── layouts/           # 布局组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API服务
│   │   ├── utils/             # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── project/                   # 持久化文件目录
│   └── uploads/               # 上传文件存储
│
├── docker-compose.yml         # Docker 编排
└── README.md
```

## 🚀 快速开始

### 前置要求
- Node.js >= 18
- MySQL >= 8.0
- npm 或 yarn

### 1. 创建数据库

```sql
CREATE DATABASE qjwl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
```

### 2. 配置后端

```bash
cd backend

# 复制环境配置
cp env.example .env

# 编辑 .env 文件，配置数据库连接
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=your_password
# DB_DATABASE=qjwl_db
# DB_SYNCHRONIZE=true
# JWT_SECRET=your-secret-key
# JWT_EXPIRES_IN=7d

# 安装依赖
npm install

# 启动开发服务器
npm run start:dev
```

后端服务启动后：
- API 服务：http://localhost:3000
- Swagger 文档：http://localhost:3000/api-docs
- 默认管理员账号：`admin` / `admin123`

### 3. 配置前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务启动后访问：http://localhost:5173

## 🔐 认证说明

### 登录接口
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例：**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "role": "admin"
  }
}
```

### 使用 Token
在请求头中携带：
```
Authorization: Bearer <accessToken>
```

### 重置管理员密码
如果忘记密码，可以调用：
```bash
POST /api/v1/auth/reset-admin
```

## 📖 API 接口说明

所有接口统一前缀：`/api/v1`

### 通用接口规范

**列表接口** `GET /[resource]/list`
- 分页参数：`page`（默认1）, `pageSize`（默认10）
- 模糊搜索：`keyword`
- 状态筛选：`status`（1=启用，0=停用）

**详情接口** `GET /[resource]/:id`

**创建接口** `POST /[resource]`

**更新接口** `PUT /[resource]/:id`

**删除接口** `DELETE /[resource]/:id`

**批量操作接口**
- `POST /[resource]/batch/enable` - 批量启用
- `POST /[resource]/batch/disable` - 批量停用
- `POST /[resource]/batch/delete` - 批量删除

### 核心接口

#### 认证
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/auth/login | POST | 用户登录 |
| /api/v1/auth/register | POST | 用户注册 |
| /api/v1/auth/profile | GET | 获取当前用户信息 |
| /api/v1/auth/change-password | POST | 修改密码 |
| /api/v1/auth/reset-admin | POST | 重置管理员密码 |

#### 文件类型
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/doc-types/list | GET | 文件类型列表 |
| /api/v1/doc-types/all | GET | 获取所有文件类型（不分页） |
| /api/v1/doc-types/filter-options | GET | 获取筛选选项 |
| /api/v1/doc-types/:id | GET | 文件类型详情 |
| /api/v1/doc-types/full/:idOrCode | GET | 完整信息（含字段和模板） |
| /api/v1/doc-types | POST | 创建文件类型 |
| /api/v1/doc-types/:id | PUT | 更新文件类型 |
| /api/v1/doc-types/template | GET | 下载导入模板 |
| /api/v1/doc-types/import | POST | Excel批量导入 |

#### 关键信息字段
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/doc-field-defs/list | GET | 字段列表 |
| /api/v1/doc-field-defs/by-doc-type/:docTypeId | GET | 按文件类型获取字段 |
| /api/v1/doc-field-defs/:id | GET | 字段详情 |
| /api/v1/doc-field-defs | POST | 创建字段 |
| /api/v1/doc-field-defs/:id | PUT | 更新字段 |
| /api/v1/doc-field-defs/template | GET | 下载导入模板 |
| /api/v1/doc-field-defs/import | POST | Excel批量导入 |

#### 审计规则
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/audit-rules/list | GET | 规则列表 |
| /api/v1/audit-rules/:id | GET | 规则详情（含关联） |
| /api/v1/audit-rules | POST | 创建规则 |
| /api/v1/audit-rule-field-links | POST | 添加规则字段关联 |
| /api/v1/audit-rule-law-links | POST | 添加规则法规关联 |

#### 法规与标准
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/law-documents/list | GET | 法规列表 |
| /api/v1/law-documents/:id | GET | 法规详情（含条款） |
| /api/v1/law-clauses/list | GET | 条款列表 |
| /api/v1/law-clauses/by-law/:lawDocumentId | GET | 按法规获取条款 |

#### 文件上传
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/files/upload | POST | 上传文件 |

### 请求/响应示例

#### 创建关键信息字段
```bash
POST /api/v1/doc-field-defs
Authorization: Bearer <token>
Content-Type: application/json

{
  "docTypeId": 1,
  "fieldCode": "CONTRACT_AMOUNT",
  "fieldName": "合同金额",
  "fieldCategory": "金额",
  "requiredFlag": 1,
  "valueSource": "正文第三条第2款",
  "anchorWord": "合同价款,合同金额,总价",
  "exampleValue": "1000000.00",
  "fieldDescription": "施工合同的总金额"
}
```

**响应：**
```json
{
  "id": 1,
  "docTypeId": 1,
  "fieldCode": "CONTRACT_AMOUNT",
  "fieldName": "合同金额",
  "fieldCategory": "金额",
  "requiredFlag": 1,
  "valueSource": "正文第三条第2款",
  "anchorWord": "合同价款,合同金额,总价",
  "enumOptions": null,
  "exampleValue": "1000000.00",
  "fieldDescription": "施工合同的总金额",
  "status": 1,
  "createdAt": "2026-01-08T10:00:00.000Z",
  "updatedAt": "2026-01-08T10:00:00.000Z"
}
```

## 🎨 前端功能

### 功能特性
- ✅ JWT 认证登录
- ✅ 表格展示 + 分页 + 排序
- ✅ 多条件筛选 + 模糊搜索 + 一键清除筛选
- ✅ 新增/编辑抽屉表单
- ✅ 查看详情弹窗
- ✅ 批量启用/停用/删除/导出
- ✅ Excel 模板下载
- ✅ Excel 批量导入
- ✅ 文件上传
- ✅ PDF/图片在线预览
- ✅ 搜索主页（快速查找文件类型信息）

## 🗄 数据库表结构

### 用户表 users

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 密码哈希 |
| nickname | VARCHAR(100) | 昵称 |
| email | VARCHAR(100) | 邮箱 |
| role | VARCHAR(20) | 角色（admin/user） |
| status | TINYINT | 状态（1=启用，0=停用） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 文件类型表 doc_type

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| code | VARCHAR(50) | 文件类型编码（唯一） |
| name | VARCHAR(100) | 文件类型名称 |
| project_phase | VARCHAR(50) | 所属项目阶段 |
| major_category | VARCHAR(100) | 所属大类 |
| minor_category | VARCHAR(100) | 所属小类 |
| file_feature | TEXT | 文件特征信息（用于LLM识别） |
| project_type | VARCHAR(200) | 适用项目类型 |
| region | VARCHAR(100) | 适用地区 |
| owner_org | VARCHAR(200) | 适用业主 |
| biz_description | TEXT | 业务说明/使用场景 |
| remark | TEXT | 备注 |
| status | TINYINT | 状态（1=启用，0=停用） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 关键信息字段表 doc_field_def

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| doc_type_id | BIGINT | 所属文件类型ID（外键） |
| field_code | VARCHAR(50) | 字段编码 |
| field_name | VARCHAR(100) | 字段名称 |
| field_category | VARCHAR(50) | 字段类别（金额/日期/数量/文字/枚举/其他） |
| required_flag | TINYINT | 是否必填（1=是，0=否） |
| value_source | VARCHAR(200) | 取值方式（在文件中的位置） |
| anchor_word | VARCHAR(500) | 定位词（用于在文件中定位该字段） |
| enum_options | TEXT | 枚举值（当字段类别为枚举时填写） |
| example_value | VARCHAR(500) | 示例数据 |
| field_description | TEXT | 字段说明 |
| status | TINYINT | 状态（1=启用，0=停用） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**唯一约束**：`doc_type_id + field_code` 组合唯一

### 文件模板/示例表 doc_template_sample

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| doc_type_id | BIGINT | 所属文件类型ID（外键） |
| file_name | VARCHAR(200) | 文件名称 |
| file_path | VARCHAR(500) | 文件存储路径 |
| description | TEXT | 说明 |
| status | TINYINT | 状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 审计规则表 audit_rule

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| rule_code | VARCHAR(50) | 规则编码（唯一） |
| rule_name | VARCHAR(200) | 规则名称 |
| rule_category | VARCHAR(50) | 规则分类 |
| biz_description | TEXT | 业务说明 |
| compare_method | TEXT | 比对方法/思路说明 |
| risk_level | VARCHAR(20) | 风险等级（高/中/低） |
| project_phase | VARCHAR(200) | 适用项目阶段 |
| project_type | VARCHAR(200) | 适用项目类型 |
| region | VARCHAR(100) | 适用地区 |
| owner_org | VARCHAR(200) | 适用业主 |
| version | INT | 版本号 |
| remark | TEXT | 备注 |
| status | TINYINT | 状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 法规标准表 law_document

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| law_code | VARCHAR(50) | 法规编号（唯一） |
| law_name | VARCHAR(300) | 法规名称 |
| law_category | VARCHAR(50) | 文种类别 |
| issue_org | VARCHAR(200) | 发布单位 |
| issue_date | DATE | 发布日期 |
| effective_date | DATE | 实施日期 |
| expiry_date | DATE | 失效日期 |
| region_scope | VARCHAR(200) | 适用地区范围 |
| industry_scope | VARCHAR(200) | 适用行业范围 |
| law_status | VARCHAR(20) | 当前状态（现行/废止/即将实施） |
| file_path | VARCHAR(500) | 原文文件位置 |
| summary | TEXT | 摘要/要点说明 |
| remark | TEXT | 备注 |
| status | TINYINT | 记录状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 法规条款表 law_clause

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| law_document_id | BIGINT | 所属法规ID（外键） |
| law_code | VARCHAR(50) | 法规编号（冗余） |
| law_name | VARCHAR(300) | 法规名称（冗余） |
| clause_no | VARCHAR(50) | 条款号 |
| clause_title | VARCHAR(200) | 条款标题 |
| clause_text | TEXT | 条款原文 |
| clause_summary | TEXT | 条款摘要 |
| level_label | VARCHAR(20) | 层级标签 |
| parent_clause_no | VARCHAR(50) | 父条款号 |
| keywords | VARCHAR(500) | 关键词 |
| topic_tags | VARCHAR(500) | 主题标签 |
| region_scope | VARCHAR(200) | 适用地区范围 |
| industry_scope | VARCHAR(200) | 适用行业范围 |
| importance_level | VARCHAR(20) | 重要程度 |
| remark | TEXT | 备注 |
| status | TINYINT | 状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 关联表

#### audit_rule_field_link（审计规则-字段关联）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| rule_id | BIGINT | 审计规则ID |
| doc_type_id | BIGINT | 文件类型ID |
| doc_field_id | BIGINT | 字段ID |
| required_flag | TINYINT | 是否必需 |
| remark | TEXT | 备注 |

#### audit_rule_law_link（审计规则-法规关联）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| rule_id | BIGINT | 审计规则ID |
| law_document_id | BIGINT | 法规ID |
| law_clause_id | BIGINT | 条款ID |
| reference_description | TEXT | 引用说明 |

#### law_clause_doc_type_link（条款-文件类型关联）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| law_clause_id | BIGINT | 条款ID |
| doc_type_id | BIGINT | 文件类型ID |
| applicability_description | TEXT | 适用性说明 |
| applicability_level | VARCHAR(20) | 适用程度 |

## 🐳 Docker 部署

详见 [DOCKER.md](./DOCKER.md)

```bash
# 快速启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🔧 开发说明

### 添加新模块

1. 在 `backend/src/modules/` 创建模块目录
2. 创建实体、DTO、服务、控制器、模块文件
3. 在 `app.module.ts` 注册模块
4. 在前端创建对应页面和API服务
5. 更新路由配置

### 代码规范
- 后端：使用 NestJS 推荐的模块化结构
- 前端：使用 React Query 管理服务端状态
- 所有实体继承 `BaseEntity`（包含 id, status, createdAt, updatedAt）
- API 路径统一使用小写和连字符
- DTO 使用 Swagger 装饰器添加示例

## 📝 License

MIT
