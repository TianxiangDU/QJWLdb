/**
 * 资源配置注册表
 * 集中管理所有资源的配置
 */
import { ResourceConfig } from './types'

// 资源配置存储
const resourceRegistry = new Map<string, ResourceConfig>()

/**
 * 注册资源配置
 */
export function registerResource(config: ResourceConfig): void {
  resourceRegistry.set(config.key, config)
}

/**
 * 获取资源配置
 */
export function getResource(key: string): ResourceConfig | undefined {
  return resourceRegistry.get(key)
}

/**
 * 获取所有资源配置
 */
export function getAllResources(): ResourceConfig[] {
  return Array.from(resourceRegistry.values())
}

/**
 * 检查资源是否已注册
 */
export function hasResource(key: string): boolean {
  return resourceRegistry.has(key)
}

// ================== 资源配置定义 ==================

/**
 * 文件类型
 */
export const docTypeConfig: ResourceConfig = {
  key: 'docType',
  name: '文件类型',
  description: '管理审计项目中涉及的各类文件类型定义',
  
  api: {
    basePath: '/doc-types',
    list: { path: '/list' },
    template: { path: '/doc-types/template' },
    import: { path: '/doc-types/import' },
    batchEnable: { path: '/doc-types/batch/enable' },
    batchDisable: { path: '/doc-types/batch/disable' },
    batchDelete: { path: '/doc-types/batch/delete' },
  },
  
  codeField: {
    field: 'code',
    autoGenerate: true,
    readOnlyOnEdit: true,
    prefix: 'DT',
  },
  
  uniqueKeys: ['code'],
  
  importConfig: {
    modeOptions: ['upsert', 'insertOnly', 'updateOnly'],
    dryRunSupported: true,
  },
  
  list: {
    defaultSort: { field: 'createdAt', order: 'desc' },
    searchable: { placeholder: '搜索名称、说明...', fields: ['name', 'bizDescription'] },
    filters: [
      { type: 'input', field: 'keyword', label: '关键词', placeholder: '名称/说明' },
      { type: 'input', field: 'projectPhase', label: '项目阶段' },
      { type: 'status', field: 'status', label: '状态' },
    ],
    columns: [
      { type: 'text', field: 'code', header: '编码', width: 150, copyable: true },
      { type: 'text', field: 'name', header: '名称', ellipsis: true },
      { type: 'text', field: 'projectPhase', header: '项目阶段', width: 120 },
      { type: 'text', field: 'majorCategory', header: '大类', width: 100 },
      { type: 'text', field: 'minorCategory', header: '小类', width: 100 },
      { type: 'enum', field: 'status', header: '状态', options: [
        { label: '启用', value: 1, variant: 'default' },
        { label: '停用', value: 0, variant: 'secondary' },
      ]},
      { type: 'datetime', field: 'updatedAt', header: '更新时间', width: 160 },
    ],
    actions: [
      { type: 'create', label: '新增', icon: 'Plus' },
      { type: 'downloadTemplate', label: '下载模板', icon: 'Download' },
      { type: 'import', label: '导入', icon: 'Upload' },
    ],
    rowActions: [
      { type: 'edit', icon: 'Pencil' },
      { type: 'detail', icon: 'Eye' },
      { type: 'disable', icon: 'Ban', confirm: { title: '确定停用此文件类型？' } },
    ],
    bulkActions: [
      { type: 'bulkEnable', label: '批量启用' },
      { type: 'bulkDisable', label: '批量停用' },
      { type: 'bulkDelete', label: '批量删除' },
    ],
  },
  
  form: {
    mode: 'sheet',
    titleCreate: '新增文件类型',
    titleEdit: '编辑文件类型',
    layout: { columns: 2 },
    fields: [
      { type: 'input', field: 'code', label: '编码', placeholder: '留空自动生成', helpText: '编码格式：DT-YYYYMM-XXXXXX', readOnlyOnEdit: true },
      { type: 'input', field: 'name', label: '名称', required: true, placeholder: '如：施工合同' },
      { type: 'input', field: 'projectPhase', label: '项目阶段', placeholder: '如：施工阶段' },
      { type: 'input', field: 'majorCategory', label: '大类' },
      { type: 'input', field: 'minorCategory', label: '小类' },
      { type: 'input', field: 'projectType', label: '项目类型' },
      { type: 'input', field: 'region', label: '适用地区' },
      { type: 'input', field: 'ownerOrg', label: '适用业主' },
      { type: 'textarea', field: 'bizDescription', label: '业务说明', rows: 3 },
      { type: 'textarea', field: 'fileFeature', label: '文件特征（LLM识别）', rows: 3 },
      { type: 'textarea', field: 'remark', label: '备注', rows: 2 },
    ],
  },
  
  detail: {
    enabled: true,
    headerFields: ['code', 'name', 'projectPhase', 'status'],
    tabs: [
      {
        key: 'fields',
        title: '关键信息字段',
        kind: 'childResource',
        child: {
          resourceKey: 'docFieldDef',
          fkField: 'docTypeId',
          mode: 'inline',
        },
      },
      {
        key: 'templates',
        title: '文件模板/示例',
        kind: 'childResource',
        child: {
          resourceKey: 'docTemplateSample',
          fkField: 'docTypeId',
          mode: 'inline',
        },
      },
    ],
  },
}

/**
 * 关键信息字段定义
 */
export const docFieldDefConfig: ResourceConfig = {
  key: 'docFieldDef',
  name: '关键信息字段',
  
  api: {
    basePath: '/doc-field-defs',
    list: { path: '/list' },
    template: { path: '/doc-field-defs/template' },
    import: { path: '/doc-field-defs/import' },
    batchEnable: { path: '/doc-field-defs/batch/enable' },
    batchDisable: { path: '/doc-field-defs/batch/disable' },
    batchDelete: { path: '/doc-field-defs/batch/delete' },
  },
  
  list: {
    columns: [
      { type: 'text', field: 'fieldCode', header: '字段编码', width: 120 },
      { type: 'text', field: 'fieldName', header: '字段名称' },
      { type: 'text', field: 'fieldCategory', header: '字段类别', width: 100 },
      { type: 'enum', field: 'requiredFlag', header: '必填', options: [
        { label: '是', value: 1, variant: 'default' },
        { label: '否', value: 0, variant: 'secondary' },
      ]},
      { type: 'text', field: 'valueSource', header: '取值方式' },
      { type: 'enum', field: 'status', header: '状态', options: [
        { label: '启用', value: 1, variant: 'default' },
        { label: '停用', value: 0, variant: 'secondary' },
      ]},
    ],
    actions: [
      { type: 'create', label: '新增', icon: 'Plus' },
      { type: 'downloadTemplate', label: '下载模板', icon: 'Download' },
      { type: 'import', label: '导入', icon: 'Upload' },
    ],
    rowActions: [
      { type: 'edit', icon: 'Pencil' },
      { type: 'detail', icon: 'Eye' },
    ],
    bulkActions: [
      { type: 'bulkEnable' },
      { type: 'bulkDisable' },
      { type: 'bulkDelete' },
    ],
  },
  
  form: {
    mode: 'sheet',
    titleCreate: '新增字段定义',
    titleEdit: '编辑字段定义',
    fields: [
      {
        type: 'relationSelect',
        field: 'docTypeId',
        label: '所属文件类型',
        required: true,
        relation: {
          resourceKey: 'docType',
          valueField: 'id',
          labelField: 'name',
          searchField: 'keyword',
        },
      },
      { type: 'input', field: 'fieldCode', label: '字段编码', required: true },
      { type: 'input', field: 'fieldName', label: '字段名称', required: true },
      { type: 'input', field: 'fieldCategory', label: '字段类别' },
      { type: 'select', field: 'requiredFlag', label: '是否必填', options: [
        { label: '是', value: 1 },
        { label: '否', value: 0 },
      ]},
      { type: 'input', field: 'valueSource', label: '取值方式' },
      { type: 'textarea', field: 'enumOptions', label: '枚举值（多个用逗号分隔）', rows: 2 },
      { type: 'input', field: 'exampleValue', label: '示例值' },
      { type: 'textarea', field: 'fieldDescription', label: '字段说明', rows: 3 },
      { type: 'input', field: 'anchorWord', label: '定位词' },
    ],
  },
}

/**
 * 审计规则
 */
export const auditRuleConfig: ResourceConfig = {
  key: 'auditRule',
  name: '审计规则',
  
  api: {
    basePath: '/audit-rules',
    list: { path: '/list' },
    template: { path: '/audit-rules/template' },
    import: { path: '/audit-rules/import' },
    batchEnable: { path: '/audit-rules/batch/enable' },
    batchDisable: { path: '/audit-rules/batch/disable' },
    batchDelete: { path: '/audit-rules/batch/delete' },
  },
  
  codeField: {
    field: 'ruleCode',
    autoGenerate: true,
    readOnlyOnEdit: true,
    prefix: 'AR',
  },
  
  list: {
    columns: [
      { type: 'text', field: 'ruleCode', header: '规则编码', width: 150, copyable: true },
      { type: 'text', field: 'ruleName', header: '规则名称', ellipsis: true },
      { type: 'text', field: 'ruleCategory', header: '分类', width: 100 },
      { type: 'text', field: 'riskLevel', header: '风险等级', width: 80 },
      { type: 'text', field: 'projectPhase', header: '适用阶段', width: 120 },
      { type: 'enum', field: 'status', header: '状态', options: [
        { label: '启用', value: 1, variant: 'default' },
        { label: '停用', value: 0, variant: 'secondary' },
      ]},
    ],
    actions: [
      { type: 'create', label: '新增', icon: 'Plus' },
      { type: 'downloadTemplate', label: '下载模板', icon: 'Download' },
      { type: 'import', label: '导入', icon: 'Upload' },
    ],
    rowActions: [
      { type: 'edit', icon: 'Pencil' },
      { type: 'detail', icon: 'Eye' },
    ],
    bulkActions: [
      { type: 'bulkEnable' },
      { type: 'bulkDisable' },
      { type: 'bulkDelete' },
    ],
  },
  
  form: {
    mode: 'sheet',
    titleCreate: '新增审计规则',
    titleEdit: '编辑审计规则',
    layout: { columns: 2 },
    fields: [
      { type: 'input', field: 'ruleCode', label: '规则编码', placeholder: '留空自动生成', readOnlyOnEdit: true },
      { type: 'input', field: 'ruleName', label: '规则名称', required: true },
      { type: 'input', field: 'ruleCategory', label: '规则分类' },
      { type: 'select', field: 'riskLevel', label: '风险等级', options: [
        { label: '高', value: '高' },
        { label: '中', value: '中' },
        { label: '低', value: '低' },
      ]},
      { type: 'input', field: 'projectPhase', label: '适用阶段' },
      { type: 'input', field: 'projectType', label: '项目类型' },
      { type: 'input', field: 'region', label: '适用地区' },
      { type: 'input', field: 'ownerOrg', label: '适用业主' },
      { type: 'textarea', field: 'bizDescription', label: '业务说明', rows: 3 },
      { type: 'textarea', field: 'compareMethod', label: '比对方法', rows: 3 },
      { type: 'textarea', field: 'remark', label: '备注', rows: 2 },
    ],
  },
  
  detail: {
    enabled: true,
    headerFields: ['ruleCode', 'ruleName', 'ruleCategory', 'riskLevel', 'status'],
    tabs: [
      {
        key: 'fieldLinks',
        title: '规则字段关联',
        kind: 'childResource',
        child: {
          resourceKey: 'auditRuleFieldLink',
          fkField: 'ruleId',
          mode: 'inline',
        },
      },
      {
        key: 'lawLinks',
        title: '法规依据',
        kind: 'childResource',
        child: {
          resourceKey: 'auditRuleLawLink',
          fkField: 'ruleId',
          mode: 'inline',
        },
      },
    ],
  },
}

/**
 * 法规文档
 */
export const lawDocumentConfig: ResourceConfig = {
  key: 'lawDocument',
  name: '法规标准',
  
  api: {
    basePath: '/law-documents',
    list: { path: '/list' },
    template: { path: '/law-documents/template' },
    import: { path: '/law-documents/import' },
    batchEnable: { path: '/law-documents/batch/enable' },
    batchDisable: { path: '/law-documents/batch/disable' },
    batchDelete: { path: '/law-documents/batch/delete' },
  },
  
  codeField: {
    field: 'lawCode',
    autoGenerate: true,
    readOnlyOnEdit: true,
    prefix: 'LD',
  },
  
  list: {
    columns: [
      { type: 'text', field: 'lawCode', header: '法规编号', width: 150, copyable: true },
      { type: 'text', field: 'lawName', header: '法规名称', ellipsis: true },
      { type: 'text', field: 'lawCategory', header: '类别', width: 100 },
      { type: 'text', field: 'issueOrg', header: '发布单位', width: 150 },
      { type: 'date', field: 'issueDate', header: '发布日期', width: 120 },
      { type: 'text', field: 'lawStatus', header: '状态', width: 80 },
    ],
    actions: [
      { type: 'create', label: '新增', icon: 'Plus' },
      { type: 'downloadTemplate', label: '下载模板', icon: 'Download' },
      { type: 'import', label: '导入', icon: 'Upload' },
    ],
    rowActions: [
      { type: 'edit', icon: 'Pencil' },
      { type: 'detail', icon: 'Eye' },
      { type: 'preview', icon: 'FileText', previewField: 'filePath' },
    ],
    bulkActions: [
      { type: 'bulkEnable' },
      { type: 'bulkDisable' },
      { type: 'bulkDelete' },
    ],
  },
  
  form: {
    mode: 'sheet',
    titleCreate: '新增法规文档',
    titleEdit: '编辑法规文档',
    layout: { columns: 2 },
    fields: [
      { type: 'input', field: 'lawCode', label: '法规编号', placeholder: '留空自动生成', readOnlyOnEdit: true },
      { type: 'input', field: 'lawName', label: '法规名称', required: true },
      { type: 'input', field: 'lawCategory', label: '文种类别' },
      { type: 'input', field: 'issueOrg', label: '发布单位' },
      { type: 'date', field: 'issueDate', label: '发布日期' },
      { type: 'date', field: 'effectiveDate', label: '实施日期' },
      { type: 'date', field: 'expiryDate', label: '失效日期' },
      { type: 'input', field: 'regionScope', label: '适用地区' },
      { type: 'input', field: 'industryScope', label: '适用行业' },
      { type: 'select', field: 'lawStatus', label: '当前状态', options: [
        { label: '有效', value: '有效' },
        { label: '已废止', value: '已废止' },
        { label: '即将生效', value: '即将生效' },
      ]},
      { type: 'fileUpload', field: 'filePath', label: '原文文件', uploadPath: '/files/upload', preview: true },
      { type: 'textarea', field: 'summary', label: '摘要', rows: 3 },
      { type: 'textarea', field: 'remark', label: '备注', rows: 2 },
    ],
  },
  
  detail: {
    enabled: true,
    headerFields: ['lawCode', 'lawName', 'lawCategory', 'lawStatus'],
    tabs: [
      {
        key: 'clauses',
        title: '法规条款',
        kind: 'childResource',
        child: {
          resourceKey: 'lawClause',
          fkField: 'lawDocumentId',
          mode: 'inline',
        },
      },
    ],
  },
  
  preview: [
    { field: 'filePath', fileType: 'pdf', mode: 'dialog' },
  ],
}

/**
 * 法规条款
 */
export const lawClauseConfig: ResourceConfig = {
  key: 'lawClause',
  name: '法规条款',
  
  api: {
    basePath: '/law-clauses',
    list: { path: '/list' },
    template: { path: '/law-clauses/template' },
    import: { path: '/law-clauses/import' },
    batchEnable: { path: '/law-clauses/batch/enable' },
    batchDisable: { path: '/law-clauses/batch/disable' },
    batchDelete: { path: '/law-clauses/batch/delete' },
  },
  
  list: {
    columns: [
      { type: 'text', field: 'clauseNo', header: '条款编号', width: 120 },
      { type: 'text', field: 'clauseTitle', header: '条款标题', ellipsis: true },
      { type: 'text', field: 'levelLabel', header: '层级', width: 80 },
      { type: 'text', field: 'lawCode', header: '所属法规', width: 150 },
      { type: 'enum', field: 'status', header: '状态', options: [
        { label: '启用', value: 1, variant: 'default' },
        { label: '停用', value: 0, variant: 'secondary' },
      ]},
    ],
    actions: [
      { type: 'create', label: '新增', icon: 'Plus' },
      { type: 'downloadTemplate', label: '下载模板', icon: 'Download' },
      { type: 'import', label: '导入', icon: 'Upload' },
    ],
    rowActions: [
      { type: 'edit', icon: 'Pencil' },
      { type: 'detail', icon: 'Eye' },
    ],
    bulkActions: [
      { type: 'bulkEnable' },
      { type: 'bulkDisable' },
      { type: 'bulkDelete' },
    ],
  },
  
  form: {
    mode: 'sheet',
    titleCreate: '新增法规条款',
    titleEdit: '编辑法规条款',
    fields: [
      {
        type: 'relationSelect',
        field: 'lawDocumentId',
        label: '所属法规',
        required: true,
        relation: {
          resourceKey: 'lawDocument',
          valueField: 'id',
          labelField: 'lawName',
          searchField: 'keyword',
        },
      },
      { type: 'input', field: 'clauseNo', label: '条款编号', required: true },
      { type: 'input', field: 'clauseTitle', label: '条款标题' },
      { type: 'select', field: 'levelLabel', label: '层级', options: [
        { label: '章', value: '章' },
        { label: '节', value: '节' },
        { label: '条', value: '条' },
        { label: '款', value: '款' },
      ]},
      { type: 'input', field: 'parentClauseNo', label: '上级条款编号' },
      { type: 'textarea', field: 'clauseText', label: '条款内容', rows: 6 },
      { type: 'textarea', field: 'clauseSummary', label: '要点提炼', rows: 3 },
      { type: 'input', field: 'keywords', label: '关键词' },
      { type: 'input', field: 'topicTags', label: '主题标签' },
      { type: 'input', field: 'regionScope', label: '适用地区' },
      { type: 'input', field: 'industryScope', label: '适用行业' },
      { type: 'select', field: 'importanceLevel', label: '重要程度', options: [
        { label: '高', value: '高' },
        { label: '中', value: '中' },
        { label: '低', value: '低' },
      ]},
      { type: 'textarea', field: 'remark', label: '备注', rows: 2 },
    ],
  },
}

// ================== 注册所有资源 ==================
registerResource(docTypeConfig)
registerResource(docFieldDefConfig)
registerResource(auditRuleConfig)
registerResource(lawDocumentConfig)
registerResource(lawClauseConfig)

export { resourceRegistry }
