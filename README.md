# 工程咨询全业务数据库平台

一个完整的工程咨询全业务数据库管理系统，包含后端 REST API 和前端管理后台。

## 📋 项目概述

本系统以"工程咨询全业务数据库设计"为中心，涵盖以下模块：

### 核心模块（已完整实现）
- **文件与资料库（工程全阶段文件体系）**
  - 文件类型管理
  - 文件字段定义
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
- **Swagger** - API文档

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
│   │   │   ├── dto/           # 通用DTO
│   │   │   ├── entities/      # 基础实体
│   │   │   └── decorators/    # 装饰器
│   │   ├── modules/           # 业务模块
│   │   │   ├── doc-type/      # 文件类型
│   │   │   ├── doc-field-def/ # 文件字段定义
│   │   │   ├── doc-template-sample/ # 文件模板/示例
│   │   │   ├── audit-rule/    # 审计规则
│   │   │   ├── audit-rule-field-link/ # 规则字段关联
│   │   │   ├── audit-rule-law-link/   # 规则法规关联
│   │   │   ├── audit-rule-example/    # 规则案例
│   │   │   ├── law-document/  # 法规与标准
│   │   │   ├── law-clause/    # 法规条款
│   │   │   ├── law-clause-doc-type-link/ # 条款与文件类型关联
│   │   │   ├── cost-rule/     # 工程造价规则（占位）
│   │   │   ├── biz-process/   # 业务流程（占位）
│   │   │   ├── case-library/  # 案例库（占位）
│   │   │   ├── knowledge-snippet/ # 知识碎片（占位）
│   │   │   ├── monitor-metric/    # 监测指标（占位）
│   │   │   └── file-upload/   # 文件上传
│   │   ├── database/
│   │   │   └── seeds/         # 种子数据
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── uploads/               # 上传文件目录
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── layouts/           # 布局组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── doc-type/
│   │   │   ├── doc-field-def/
│   │   │   ├── doc-template-sample/
│   │   │   ├── audit-rule/
│   │   │   ├── law-document/
│   │   │   ├── law-clause/
│   │   │   ├── law-clause-doc-type-link/
│   │   │   └── placeholder/   # 占位模块页面
│   │   ├── services/          # API服务
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
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

# 安装依赖
npm install

# 启动开发服务器
npm run start:dev
```

后端服务启动后：
- API 服务：http://localhost:3000
- Swagger 文档：http://localhost:3000/api-docs

### 3. 初始化种子数据

```bash
cd backend
npm run seed
```

这会插入一些示例数据：
- 3个文件类型（立项批复、施工合同、竣工验收报告）
- 施工合同的4个字段定义
- 1部法规（GB50500-2013）及2个条款
- 2条审计规则及关联数据

### 4. 配置前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务启动后访问：http://localhost:5173

## 📖 API 接口说明

所有接口统一前缀：`/api/v1`

### 通用接口规范

**列表接口** `GET /[resource]/list`
- 分页参数：`page`, `pageSize`
- 模糊搜索：`keyword`
- 状态筛选：`status`（1=启用，0=停用）
- 其他筛选参数根据实体不同而不同

**详情接口** `GET /[resource]/:id`

**创建接口** `POST /[resource]`

**更新接口** `PUT /[resource]/:id`

**删除/停用接口** `DELETE /[resource]/:id`

### 核心接口示例

#### 文件类型
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/doc-types/list | GET | 文件类型列表 |
| /api/v1/doc-types/:id | GET | 文件类型详情 |
| /api/v1/doc-types | POST | 创建文件类型 |
| /api/v1/doc-types/:id | PUT | 更新文件类型 |
| /api/v1/doc-types/:id | DELETE | 停用文件类型 |
| /api/v1/doc-types/template | GET | 下载导入模板 |
| /api/v1/doc-types/import | POST | Excel批量导入 |

#### 审计规则
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/audit-rules/list | GET | 规则列表 |
| /api/v1/audit-rules/:id | GET | 规则详情（含关联字段、法规、案例） |
| /api/v1/audit-rules | POST | 创建规则 |
| /api/v1/audit-rules/:id | PUT | 更新规则 |
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

### Excel 批量导入

核心表均支持 Excel 模板下载和批量导入：
1. 下载模板：`GET /api/v1/[resource]/template`
2. 上传导入：`POST /api/v1/[resource]/import`（multipart/form-data）

导入结果返回：
```json
{
  "success": 10,
  "failed": 2,
  "errors": ["第3行：编码已存在", "第5行：名称为必填项"]
}
```

## 🎨 前端功能

### 导航结构
- 文件与资料库
  - 文件类型
  - 文件字段定义
  - 文件模板/示例
- 审计逻辑库
  - 审计规则（支持详情页查看关联字段、法规、案例）
- 法律法规与标准库
  - 法规与标准
  - 法规条款
  - 条款与文件类型适用
- 工程造价规则库（占位）
- 工程咨询业务流程库（占位）
- 工程案例库（占位）
- 工程碎片知识库（占位）
- 工程数据监测（占位）

### 功能特性
- ✅ 表格展示 + 分页 + 排序
- ✅ 多条件筛选 + 模糊搜索
- ✅ 新增/编辑抽屉表单
- ✅ 删除确认（软删除）
- ✅ Excel 模板下载
- ✅ Excel 批量导入
- ✅ 文件上传
- ✅ PDF/图片在线预览
- ✅ 审计规则详情页（关联字段、法规、案例管理）

## 🗄 数据库表结构

### 核心表

#### doc_type（文件类型表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| code | VARCHAR(50) | 编码（唯一） |
| name | VARCHAR(100) | 名称 |
| project_phase | VARCHAR(50) | 项目阶段 |
| project_type | VARCHAR(200) | 项目类型 |
| region | VARCHAR(100) | 适用地区 |
| owner_org | VARCHAR(200) | 适用业主 |
| required_flag | TINYINT | 是否必需 |
| biz_description | TEXT | 业务说明 |
| status | TINYINT | 状态 |

#### audit_rule（审计规则表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| rule_code | VARCHAR(50) | 规则编码（唯一） |
| rule_name | VARCHAR(200) | 规则名称 |
| rule_category | VARCHAR(50) | 规则分类 |
| biz_description | TEXT | 业务说明 |
| compare_method | TEXT | 比对方法 |
| risk_level | VARCHAR(20) | 风险等级 |
| project_phase | VARCHAR(200) | 适用阶段 |
| version | INT | 版本号 |
| status | TINYINT | 状态 |

#### law_document（法规标准表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| law_code | VARCHAR(50) | 法规编号（唯一） |
| law_name | VARCHAR(300) | 法规名称 |
| law_category | VARCHAR(50) | 文种类别 |
| issue_org | VARCHAR(200) | 发布单位 |
| issue_date | DATE | 发布日期 |
| effective_date | DATE | 实施日期 |
| law_status | VARCHAR(20) | 当前状态 |
| status | TINYINT | 记录状态 |

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

## 📝 License

MIT


