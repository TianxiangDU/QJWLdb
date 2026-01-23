# Resource Config 规范说明

## 概述

本项目实现了一套"资源配置驱动"的前端架构，每个数据资源只需新增一份配置文件，即可自动获得完整的 CRUD 管理功能。

## 目录结构

```
frontend/src/resources/
├── types.ts                    # TypeScript 类型定义
├── registry.ts                 # 资源注册表
├── api.ts                      # 通用 API 客户端
├── docType.resource.ts         # 文件类型配置
├── docFieldDef.resource.ts     # 关键信息字段配置
├── docTemplateSample.resource.ts # 文件模板/示例配置
├── auditRule.resource.ts       # 审计规则配置
├── lawDocument.resource.ts     # 法规与标准配置
├── lawClause.resource.ts       # 法规条款配置
├── linkResources.resource.ts   # 关联表资源配置
├── placeholder.resource.ts     # 占位模块配置
└── README.md                   # 本说明文档
```

## 如何新增一个资源

### 步骤 1：创建资源配置文件

在 `frontend/src/resources/` 目录下创建 `yourResource.resource.ts`：

```typescript
import { ResourceConfig } from "./types"

export const yourResource: ResourceConfig = {
  key: "yourResource",
  name: "资源名称",
  description: "资源描述",
  icon: "FileText",  // lucide-react 图标名

  api: {
    basePath: "/your-resources",
    batchEnable: { path: "/your-resources/batch/enable" },
    batchDisable: { path: "/your-resources/batch/disable" },
    batchDelete: { path: "/your-resources/batch/delete" },
    template: { path: "/your-resources/template" },
    import: { path: "/your-resources/import" },
  },

  list: {
    defaultSort: { field: "createdAt", order: "desc" },
    searchable: { placeholder: "搜索..." },
    filters: [
      { type: "status", field: "status" },
    ],
    columns: [
      { type: "text", field: "name", header: "名称" },
      { type: "enum", field: "status", header: "状态", width: 80, options: [
        { label: "启用", value: 1, variant: "success" },
        { label: "停用", value: 0, variant: "secondary" },
      ]},
    ],
    actions: [{ type: "create" }],
    rowActions: [{ type: "view" }, { type: "edit" }, { type: "delete" }],
    bulkActions: [{ type: "bulkEnable" }, { type: "bulkDisable" }, { type: "bulkDelete" }],
  },

  form: {
    mode: "sheet",
    titleCreate: "新增资源",
    titleEdit: "编辑资源",
    fields: [
      { type: "input", field: "name", label: "名称", required: true },
    ],
  },
}
```

### 步骤 2：在 registry.ts 中注册

```typescript
import { yourResource } from "./yourResource.resource"

export const resourceRegistry: ResourceRegistry = {
  // ... 其他资源
  yourResource: yourResource,
}
```

### 步骤 3：添加路由

在 `App.tsx` 中添加路由：

```tsx
<Route path="your-resources" element={<ResourceListPage resourceKey="yourResource" />} />
```

完成！新资源现在拥有完整的 CRUD 功能。

## 配置说明

### ColumnDef（列定义）

| 类型 | 说明 | 特有属性 |
|------|------|---------|
| `text` | 文本 | `ellipsis`, `copyable` |
| `number` | 数字 | - |
| `date` | 日期 | - |
| `datetime` | 日期时间 | - |
| `enum` | 枚举值（显示为 Badge） | `options` |
| `boolean` | 布尔值 | `trueLabel`, `falseLabel` |
| `link` | 可点击链接 | `to: (row) => string` |
| `file` | 文件 | `preview`, `download` |
| `json` | JSON 数据 | `maxHeight` |

### FilterField（筛选字段）

| 类型 | 说明 |
|------|------|
| `input` | 输入框 |
| `select` | 下拉选择（静态选项） |
| `asyncSelect` | 下拉选择（异步加载选项） |
| `multiSelect` | 多选下拉 |
| `dateRange` | 日期范围 |
| `status` | 状态筛选（启用/停用） |

### FormField（表单字段）

| 类型 | 说明 | 特有属性 |
|------|------|---------|
| `input` | 输入框 | `maxLength`, `editDisabled` |
| `textarea` | 多行文本 | `rows` |
| `number` | 数字输入 | `min`, `max`, `step`, `unit` |
| `select` | 下拉选择 | `options` |
| `asyncSelect` | 异步下拉 | `optionsLoader` |
| `switch` | 开关 | `trueValue`, `falseValue` |
| `date` | 日期选择 | - |
| `fileUpload` | 文件上传 | `accept`, `uploadPath` |
| `relationSelect` | 关联选择器 | `relation` |

### ListAction（顶部操作）

| 类型 | 说明 |
|------|------|
| `create` | 新增按钮 |
| `import` | 导入按钮 |
| `downloadTemplate` | 下载模板按钮 |
| `export` | 导出按钮 |
| `custom` | 自定义按钮 |

### BulkAction（批量操作）

| 类型 | 说明 |
|------|------|
| `bulkEnable` | 批量启用 |
| `bulkDisable` | 批量停用 |
| `bulkDelete` | 批量删除 |
| `bulkExport` | 批量导出 |

## 详情页配置

如果需要详情页（带子资源 Tabs），添加 `detail` 配置：

```typescript
detail: {
  enabled: true,
  headerFields: ["code", "name", "status"],  // 顶部展示的字段
  tabs: [
    {
      key: "children",
      title: "子资源",
      icon: "List",
      kind: "childResource",
      child: {
        resourceKey: "childResource",  // 子资源的 key
        fkField: "parentId",           // 外键字段
        mode: "inline",
      },
    },
  ],
},
```

## 已注册的资源

| Key | 名称 | 详情页 |
|-----|------|:------:|
| `docType` | 文件类型 | ✅ |
| `docFieldDef` | 关键信息字段 | - |
| `docTemplateSample` | 文件模板/示例 | - |
| `auditRule` | 审计规则 | ✅ |
| `lawDocument` | 法规与标准 | ✅ |
| `lawClause` | 法规条款 | - |
| `auditRuleFieldLink` | 规则字段关联 | - |
| `auditRuleLawLink` | 规则法规依据 | - |
| `auditRuleExample` | 规则案例 | - |
| `lawClauseDocTypeLink` | 条款适用文件类型 | - |
| `costRule` | 造价规则 | - |
| `bizProcess` | 业务流程 | - |
| `caseLibrary` | 案例库 | - |
| `knowledgeSnippet` | 知识碎片 | - |
| `monitorMetric` | 监测指标 | - |

## 通用组件

| 组件 | 路径 | 说明 |
|------|------|------|
| `DataTable` | `components/resource/DataTable.tsx` | 通用数据表格 |
| `EntityForm` | `components/resource/EntityForm.tsx` | 动态表单 |
| `FilterBar` | `components/resource/FilterBar.tsx` | 筛选工具栏 |
| `ActionBar` | `components/resource/ActionBar.tsx` | 操作按钮栏 |
| `DetailModal` | `components/resource/DetailModal.tsx` | 详情弹窗 |
| `Icon` | `components/common/Icon.tsx` | 图标映射组件 |

## 页面组件

| 组件 | 路径 | 说明 |
|------|------|------|
| `ResourceListPage` | `pages/resource/ResourceListPage.tsx` | 通用列表页 |
| `ResourceDetailPage` | `pages/resource/ResourceDetailPage.tsx` | 通用详情页 |
