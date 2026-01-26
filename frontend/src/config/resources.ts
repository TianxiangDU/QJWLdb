import { ResourceConfig } from "@/types/resource"
import { FileText, List, FileCheck, Scale, ScrollText, FileImage } from "lucide-react"

/**
 * 文件类型
 */
export interface DocType {
  id: number
  code: string
  name: string
  projectPhase?: string
  majorCategory?: string
  minorCategory?: string
  fileFeature?: string
  projectType?: string
  region?: string
  ownerOrg?: string
  bizDescription?: string
  remark?: string
  status: number
  rowVersion: number
  createdAt: string
  updatedAt: string
}

export const docTypeConfig: ResourceConfig<DocType> = {
  key: "doc-types",
  name: "文件类型",
  icon: FileText,
  apiPath: "/doc-types",
  
  columns: [
    { key: "code", title: "编码", width: 160, fixed: true },
    { key: "name", title: "名称", type: "link", width: 200, fixed: true },
    { key: "projectPhase", title: "项目阶段", width: 100 },
    { key: "majorCategory", title: "大类", width: 100 },
    { key: "minorCategory", title: "小类", width: 120 },
    { key: "fileFeature", title: "文件特征", width: 150 },
    { key: "projectType", title: "项目类型", width: 100 },
    { key: "region", title: "适用地区", width: 100 },
    { key: "ownerOrg", title: "适用业主", width: 120 },
    { key: "bizDescription", title: "业务说明", width: 200 },
    { key: "remark", title: "备注", width: 150 },
    { key: "status", title: "状态", type: "status", width: 70 },
    { key: "updatedAt", title: "更新时间", type: "datetime", width: 140 },
  ],
  
  codeField: {
    field: "code",
    autoGenerate: true,
    readOnlyOnEdit: true,
    prefix: "DT",
  },
  
  uniqueKeys: ["code"],
  
  importConfig: {
    modeOptions: ["upsert", "insertOnly", "updateOnly"],
    dryRunSupported: true,
  },
  
  formFields: [
    { key: "code", label: "编码", type: "text", required: false, placeholder: "点击生成或留空自动生成", help: "编码留空时将自动生成，格式：DT-YYYYMM-XXXXXX" },
    { key: "name", label: "名称", type: "text", required: true, placeholder: "如：施工合同" },
    { key: "projectPhase", label: "所属项目阶段", type: "enumSelect", enumCategory: "projectPhase", required: true, allowAdd: true, placeholder: "选择或新增项目阶段" },
    { key: "majorCategory", label: "所属大类", type: "enumSelect", enumCategory: "majorCategory", required: true, allowAdd: true, placeholder: "选择或新增大类" },
    { key: "minorCategory", label: "所属小类", type: "enumSelect", enumCategory: "minorCategory", parentField: "majorCategory", required: true, allowAdd: true, placeholder: "选择或新增小类（依赖大类）" },
    { key: "projectType", label: "项目类型", type: "enumSelect", enumCategory: "projectType", allowAdd: true, placeholder: "选择或新增项目类型" },
    { key: "region", label: "适用地区", type: "enumSelect", enumCategory: "region", allowAdd: true, placeholder: "选择或新增地区" },
    { key: "ownerOrg", label: "适用业主", type: "enumSelect", enumCategory: "ownerOrg", allowAdd: true, placeholder: "选择或新增业主" },
    { key: "bizDescription", label: "业务说明/使用场景", type: "textarea", placeholder: "描述该文件类型的业务用途和使用场景" },
    { key: "fileFeature", label: "文件特征信息（LLM识别）", type: "textarea", placeholder: "用于LLM识别的文件特征描述" },
    { key: "remark", label: "备注", type: "textarea" },
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "名称/说明" },
    { key: "projectPhase", label: "项目阶段", type: "enumSelect", enumCategory: "projectPhase" },
    { key: "majorCategory", label: "大类", type: "enumSelect", enumCategory: "majorCategory" },
    { key: "status", label: "状态", type: "select", options: [
      { label: "启用", value: "1" },
      { label: "停用", value: "0" },
    ]},
  ],
  
  importable: true,
  exportable: true,
  batchable: true,
}

/**
 * 关键信息字段
 */
export interface DocFieldDef {
  id: number
  docTypeId: number
  docType?: { id: number; code: string; name: string }
  fieldCode: string
  fieldName: string
  fieldCategory?: string
  requiredFlag?: number
  valueSource?: string
  anchorWord?: string
  enumOptions?: string
  exampleValue?: string
  fieldDescription?: string
  outputFormat?: string
  extractMethod?: string
  status: number
  createdAt: string
  updatedAt: string
}

export const docFieldDefConfig: ResourceConfig<DocFieldDef> = {
  key: "doc-field-defs",
  name: "关键信息字段",
  icon: List,
  apiPath: "/doc-field-defs",
  
  columns: [
    { key: "fieldCode", title: "编码", width: 180, fixed: true },
    { key: "fieldName", title: "名称", type: "link", width: 180, fixed: true },
    { key: "docType.name", title: "文件类型", width: 150, render: (_, row: any) => row.docType?.name || '-' },
    { key: "fieldCategory", title: "类别", width: 80 },
    { key: "requiredFlag", title: "必填", type: "boolean", width: 60 },
    { key: "valueSource", title: "取值方式", width: 150 },
    { key: "anchorWord", title: "定位词", width: 120 },
    { key: "enumOptions", title: "枚举值", width: 120 },
    { key: "exampleValue", title: "示例数据", width: 120 },
    { key: "fieldDescription", title: "字段说明", width: 200 },
    { key: "outputFormat", title: "输出格式", width: 100 },
    { key: "extractMethod", title: "提取方法", width: 100 },
    { key: "status", title: "状态", type: "status", width: 70 },
  ],
  
  formFields: [
    { 
      key: "docTypeId", 
      label: "文件类型", 
      type: "select", 
      required: true,
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-types/list?pageSize=100&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: `${d.code} - ${d.name}`, value: d.id }));
      }
    },
    { key: "fieldCode", label: "字段编码", type: "text", placeholder: "留空自动生成（格式：文件类型编码-序号）" },
    { key: "fieldName", label: "字段名称", type: "text", required: true },
    { key: "fieldCategory", label: "字段类别", type: "select", required: true, options: [
      { label: "文字", value: "文字" },
      { label: "日期", value: "日期" },
      { label: "金额", value: "金额" },
      { label: "数量", value: "数量" },
      { label: "枚举", value: "枚举" },
      { label: "其他", value: "其他" },
    ]},
    { key: "requiredFlag", label: "是否必填", type: "select", defaultValue: 0, options: [
      { label: "是", value: 1 },
      { label: "否", value: 0 },
    ]},
    { key: "valueSource", label: "取值方式", type: "text", placeholder: "描述如何从文件中获取该字段值" },
    { key: "anchorWord", label: "定位词", type: "text", placeholder: "用于定位该字段的关键词，空格分隔" },
    { key: "enumOptions", label: "枚举值", type: "text", placeholder: "如字段类别为枚举则填写，空格分隔" },
    { key: "exampleValue", label: "示例数据", type: "text", placeholder: "字段的示例值" },
    { key: "fieldDescription", label: "字段说明", type: "textarea", placeholder: "详细描述该字段的含义和用途" },
    { key: "outputFormat", label: "输出格式", type: "text", placeholder: "如：金额（元）、日期（YYYY-MM-DD）" },
    { key: "extractMethod", label: "提取方法", type: "text", placeholder: "如：正则匹配、关键词定位" },
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "名称/编码/说明" },
    { 
      key: "docTypeId", 
      label: "文件类型", 
      type: "select",
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-types/list?pageSize=100&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: d.name, value: d.id }));
      }
    },
    { key: "fieldCategory", label: "类别", type: "select", options: [
      { label: "文字", value: "文字" },
      { label: "日期", value: "日期" },
      { label: "金额", value: "金额" },
      { label: "数量", value: "数量" },
      { label: "枚举", value: "枚举" },
      { label: "其他", value: "其他" },
    ]},
  ],
  
  importable: true,
  exportable: true,
  batchable: true,
}

/**
 * 审计规则
 */
export interface AuditRule {
  id: number
  ruleCode: string
  ruleName: string
  auditType?: string
  phase?: string
  verifySection?: string
  problemDesc?: string
  compareMethod?: string
  compareMethodLlm?: string
  auditBasis?: string
  source1Code?: string
  source1Name?: string
  source2Code?: string
  source2Name?: string
  source3Code?: string
  source3Name?: string
  source4Code?: string
  source4Name?: string
  source5Code?: string
  source5Name?: string
  lawClauseCode?: string
  remark?: string
  status: number
  createdAt: string
  updatedAt: string
}

export const auditRuleConfig: ResourceConfig<AuditRule> = {
  key: "audit-rules",
  name: "审计规则",
  icon: FileCheck,
  apiPath: "/audit-rules",
  
  columns: [
    { key: "ruleCode", title: "编码", width: 140, fixed: true },
    { key: "ruleName", title: "名称", type: "link", width: 200, fixed: true },
    { key: "auditType", title: "审计类型", width: 100 },
    { key: "phase", title: "阶段", width: 100 },
    { key: "verifySection", title: "查证板块", width: 100 },
    { key: "problemDesc", title: "问题描述", width: 200 },
    { key: "compareMethod", title: "比对方式", width: 200 },
    { key: "compareMethodLlm", title: "比对方式-LLM", width: 200 },
    { key: "auditBasis", title: "审计依据", width: 200 },
    { key: "source1Code", title: "数据源1编码", width: 150 },
    { key: "source1Name", title: "数据源1名称", width: 150 },
    { key: "source2Code", title: "数据源2编码", width: 150 },
    { key: "source2Name", title: "数据源2名称", width: 150 },
    { key: "source3Code", title: "数据源3编码", width: 150 },
    { key: "source3Name", title: "数据源3名称", width: 150 },
    { key: "source4Code", title: "数据源4编码", width: 150 },
    { key: "source4Name", title: "数据源4名称", width: 150 },
    { key: "source5Code", title: "数据源5编码", width: 150 },
    { key: "source5Name", title: "数据源5名称", width: 150 },
    { key: "lawClauseCode", title: "法条编码", width: 120 },
    { key: "remark", title: "备注", width: 150 },
    { key: "status", title: "状态", type: "status", width: 70 },
  ],
  
  formFields: [
    { key: "ruleName", label: "规则名称", type: "text", required: true },
    { key: "auditType", label: "审计类型", type: "enumSelect", enumCategory: "auditType", allowAdd: true, placeholder: "选择或新增审计类型" },
    { key: "phase", label: "阶段", type: "enumSelect", enumCategory: "auditPhase", allowAdd: true, placeholder: "选择或新增阶段" },
    { key: "verifySection", label: "查证板块", type: "enumSelect", enumCategory: "verifySection", allowAdd: true, placeholder: "选择或新增查证板块" },
    { key: "problemDesc", label: "问题描述", type: "textarea" },
    { key: "compareMethod", label: "比对方式", type: "textarea" },
    { key: "compareMethodLlm", label: "比对方式-LLM用", type: "textarea" },
    { key: "auditBasis", label: "审计依据内容", type: "textarea" },
    { 
      key: "source1Code", 
      label: "数据源1编码", 
      type: "select",
      placeholder: "选择关键信息字段",
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-field-defs/list?pageSize=500&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: `${d.fieldCode} - ${d.fieldName}`, value: d.fieldCode }));
      }
    },
    { 
      key: "source2Code", 
      label: "数据源2编码", 
      type: "select",
      placeholder: "选择关键信息字段",
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-field-defs/list?pageSize=500&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: `${d.fieldCode} - ${d.fieldName}`, value: d.fieldCode }));
      }
    },
    { 
      key: "source3Code", 
      label: "数据源3编码", 
      type: "select",
      placeholder: "选择关键信息字段",
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-field-defs/list?pageSize=500&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: `${d.fieldCode} - ${d.fieldName}`, value: d.fieldCode }));
      }
    },
    { 
      key: "source4Code", 
      label: "数据源4编码", 
      type: "select",
      placeholder: "选择关键信息字段",
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-field-defs/list?pageSize=500&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: `${d.fieldCode} - ${d.fieldName}`, value: d.fieldCode }));
      }
    },
    { 
      key: "source5Code", 
      label: "数据源5编码", 
      type: "select",
      placeholder: "选择关键信息字段",
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-field-defs/list?pageSize=500&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: `${d.fieldCode} - ${d.fieldName}`, value: d.fieldCode }));
      }
    },
    { key: "lawClauseCode", label: "法条编码", type: "text", placeholder: "关联法规条款编码（暂留空）" },
    { key: "remark", label: "备注", type: "textarea" },
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "名称/编码/问题描述" },
    { key: "auditType", label: "审计类型", type: "enumSelect", enumCategory: "auditType" },
    { key: "phase", label: "阶段", type: "enumSelect", enumCategory: "auditPhase" },
    { key: "verifySection", label: "查证板块", type: "enumSelect", enumCategory: "verifySection" },
  ],
  
  importable: true,
  exportable: true,
  batchable: true,
}

/**
 * 法规与标准
 */
export interface LawDocument {
  id: number
  lawCode: string
  lawName: string
  lawCategory?: string
  issueOrg?: string
  issueDate?: string
  effectiveDate?: string
  lawStatus?: string
  status: number
  createdAt: string
  updatedAt: string
}

export const lawDocumentConfig: ResourceConfig<LawDocument> = {
  key: "law-documents",
  name: "法规与标准",
  icon: Scale,
  apiPath: "/law-documents",
  
  columns: [
    { key: "lawCode", title: "编码", width: 180, fixed: true },
    { key: "lawName", title: "名称", type: "link", width: 250, fixed: true },
    { key: "lawCategory", title: "文种类别", width: 100 },
    { key: "issueOrg", title: "发布单位", width: 150 },
    { key: "issueDate", title: "发布日期", type: "date", width: 110 },
    { key: "effectiveDate", title: "实施日期", type: "date", width: 110 },
    { key: "lawStatus", title: "法规状态", width: 80 },
    { key: "status", title: "状态", type: "status", width: 70 },
  ],
  
  formFields: [
    { key: "lawCode", label: "法规编号", type: "text", required: true },
    { key: "lawName", label: "法规名称", type: "text", required: true },
    { key: "lawCategory", label: "文种类别", type: "text" },
    { key: "issueOrg", label: "发布单位", type: "text" },
    { key: "issueDate", label: "发布日期", type: "date" },
    { key: "effectiveDate", label: "实施日期", type: "date" },
    { key: "lawStatus", label: "法规状态", type: "select", options: [
      { label: "现行", value: "现行" },
      { label: "废止", value: "废止" },
      { label: "即将实施", value: "即将实施" },
    ]},
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "名称/编号" },
    { key: "lawCategory", label: "类别", type: "text" },
    { key: "lawStatus", label: "法规状态", type: "select", options: [
      { label: "现行", value: "现行" },
      { label: "废止", value: "废止" },
    ]},
  ],
  
  importable: true,
  exportable: true,
  batchable: true,
}

/**
 * 法规条款
 */
export interface LawClause {
  id: number
  lawDocumentId: number
  lawCode?: string
  lawName?: string
  clauseNo: string
  clauseTitle?: string
  clauseText?: string
  clauseSummary?: string
  status: number
  createdAt: string
  updatedAt: string
}

export const lawClauseConfig: ResourceConfig<LawClause> = {
  key: "law-clauses",
  name: "法规条款",
  icon: ScrollText,
  apiPath: "/law-clauses",
  
  columns: [
    { key: "clauseNo", title: "编码", width: 160, fixed: true },
    { key: "clauseTitle", title: "名称", type: "link", width: 220, fixed: true },
    { key: "lawCode", title: "法规编号", width: 140 },
    { key: "clauseText", title: "条款原文", width: 300 },
    { key: "clauseSummary", title: "条款摘要", width: 200 },
    { key: "status", title: "状态", type: "status", width: 70 },
  ],
  
  formFields: [
    { key: "lawDocumentId", label: "所属法规ID", type: "number", required: true },
    { key: "clauseNo", label: "条款号", type: "text", required: true },
    { key: "clauseTitle", label: "条款标题", type: "text" },
    { key: "clauseText", label: "条款原文", type: "textarea" },
    { key: "clauseSummary", label: "条款摘要", type: "textarea" },
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "标题/原文" },
    { key: "lawDocumentId", label: "法规ID", type: "number" },
  ],
  
  importable: true,
  exportable: true,
  batchable: true,
}

/**
 * 文件模板/示例
 */
export interface DocTemplateSample {
  id: number
  code: string
  docTypeId: number
  docType?: { id: number; code: string; name: string }
  name: string
  fileName?: string
  filePath?: string
  description?: string
  status: number
  createdAt: string
  updatedAt: string
}

export const docTemplateSampleConfig: ResourceConfig<DocTemplateSample> = {
  key: "doc-template-samples",
  name: "文件模板/示例",
  icon: FileImage,
  apiPath: "/doc-template-samples",
  
  columns: [
    { key: "code", title: "编码", width: 180, fixed: true },
    { key: "name", title: "名称", type: "link", width: 200, fixed: true },
    { key: "docType.name", title: "文件类型", width: 180, render: (_: any, row: any) => row.docType?.name || '-' },
    { key: "fileName", title: "示例文件", type: "fileLink", width: 200, linkField: "filePath" },
    { key: "description", title: "说明", width: 250 },
    { key: "status", title: "状态", type: "status", width: 70 },
  ],
  
  formFields: [
    { 
      key: "docTypeId", 
      label: "文件类型", 
      type: "select", 
      required: true,
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-types/list?pageSize=100&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: `${d.code} - ${d.name}`, value: d.id }));
      }
    },
    { key: "name", label: "名称", type: "text", required: true },
    { key: "filePath", label: "示例文件", type: "file", placeholder: "上传示例文件" },
    { key: "description", label: "说明", type: "textarea" },
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "名称/编码" },
    { 
      key: "docTypeId", 
      label: "文件类型", 
      type: "select",
      optionsLoader: async () => {
        const token = localStorage.getItem('qjwl_token');
        const res = await fetch('/api/v1/doc-types/list?pageSize=100&status=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: d.name, value: d.id }));
      }
    },
  ],
  
  importable: false,
  exportable: false,
  batchable: true,
}
