import { ResourceConfig } from "@/types/resource"
import { FileText, List, FileCheck, Scale, ScrollText } from "lucide-react"

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
    { key: "code", title: "编码", width: 120 },
    { key: "name", title: "名称", type: "link" },
    { key: "projectPhase", title: "项目阶段", width: 100 },
    { key: "majorCategory", title: "大类", width: 100 },
    { key: "minorCategory", title: "小类", width: 100 },
    { key: "status", title: "状态", type: "status", width: 80 },
    { key: "updatedAt", title: "更新时间", type: "datetime", width: 150 },
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
    { key: "code", label: "编码", type: "text", required: false, placeholder: "留空自动生成，如：DT-202601-000001", help: "编码留空时将自动生成" },
    { key: "name", label: "名称", type: "text", required: true, placeholder: "如：施工合同" },
    { key: "projectPhase", label: "项目阶段", type: "text", placeholder: "如：施工阶段" },
    { key: "majorCategory", label: "大类", type: "text" },
    { key: "minorCategory", label: "小类", type: "text" },
    { key: "projectType", label: "项目类型", type: "text" },
    { key: "region", label: "适用地区", type: "text" },
    { key: "ownerOrg", label: "适用业主", type: "text" },
    { key: "bizDescription", label: "业务说明", type: "textarea" },
    { key: "fileFeature", label: "文件特征（LLM识别）", type: "textarea" },
    { key: "remark", label: "备注", type: "textarea" },
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "名称/说明" },
    { key: "projectPhase", label: "项目阶段", type: "text" },
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
  fieldCode: string
  fieldName: string
  fieldCategory?: string
  requiredFlag?: number
  valueSource?: string
  anchorWord?: string
  enumOptions?: string
  exampleValue?: string
  fieldDescription?: string
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
    { key: "fieldCode", title: "字段编码", width: 120 },
    { key: "fieldName", title: "字段名称", type: "link" },
    { key: "fieldCategory", title: "类别", width: 80 },
    { key: "requiredFlag", title: "必填", type: "boolean", width: 60 },
    { key: "valueSource", title: "取值方式", width: 150 },
    { key: "status", title: "状态", type: "status", width: 80 },
  ],
  
  formFields: [
    { 
      key: "docTypeId", 
      label: "所属文件类型", 
      type: "select", 
      required: true,
      optionsLoader: async () => {
        const res = await fetch('/api/v1/doc-types/list?pageSize=1000', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        return (data.data || []).map((d: any) => ({ label: `${d.code} - ${d.name}`, value: d.id }));
      }
    },
    { key: "fieldCode", label: "字段编码", type: "text", required: true },
    { key: "fieldName", label: "字段名称", type: "text", required: true },
    { key: "fieldCategory", label: "字段类别", type: "select", options: [
      { label: "金额", value: "金额" },
      { label: "日期", value: "日期" },
      { label: "数量", value: "数量" },
      { label: "文字", value: "文字" },
      { label: "枚举", value: "枚举" },
      { label: "其他", value: "其他" },
    ]},
    { key: "requiredFlag", label: "是否必填", type: "switch", defaultValue: 0 },
    { key: "valueSource", label: "取值方式", type: "text", placeholder: "在文件中的位置" },
    { key: "anchorWord", label: "定位词", type: "text", placeholder: "用于定位该字段的关键词" },
    { key: "enumOptions", label: "枚举值", type: "text", placeholder: "逗号分隔" },
    { key: "exampleValue", label: "示例值", type: "text" },
    { key: "fieldDescription", label: "字段说明", type: "textarea" },
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "名称/编码" },
    { key: "docTypeId", label: "文件类型ID", type: "number" },
    { key: "fieldCategory", label: "类别", type: "select", options: [
      { label: "金额", value: "金额" },
      { label: "日期", value: "日期" },
      { label: "数量", value: "数量" },
      { label: "文字", value: "文字" },
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
  ruleCategory?: string
  bizDescription?: string
  compareMethod?: string
  riskLevel?: string
  projectPhase?: string
  version?: number
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
    { key: "ruleCode", title: "规则编码", width: 120 },
    { key: "ruleName", title: "规则名称", type: "link" },
    { key: "ruleCategory", title: "分类", width: 100 },
    { key: "riskLevel", title: "风险等级", width: 80 },
    { key: "version", title: "版本", width: 60 },
    { key: "status", title: "状态", type: "status", width: 80 },
  ],
  
  formFields: [
    { key: "ruleCode", label: "规则编码", type: "text", required: true },
    { key: "ruleName", label: "规则名称", type: "text", required: true },
    { key: "ruleCategory", label: "规则分类", type: "text" },
    { key: "riskLevel", label: "风险等级", type: "select", options: [
      { label: "高", value: "高" },
      { label: "中", value: "中" },
      { label: "低", value: "低" },
    ]},
    { key: "projectPhase", label: "适用阶段", type: "text" },
    { key: "bizDescription", label: "业务说明", type: "textarea" },
    { key: "compareMethod", label: "比对方法", type: "textarea" },
    { key: "version", label: "版本号", type: "number", defaultValue: 1 },
  ],
  
  filters: [
    { key: "keyword", label: "关键词", type: "text", placeholder: "名称/说明" },
    { key: "ruleCategory", label: "分类", type: "text" },
    { key: "riskLevel", label: "风险等级", type: "select", options: [
      { label: "高", value: "高" },
      { label: "中", value: "中" },
      { label: "低", value: "低" },
    ]},
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
    { key: "lawCode", title: "法规编号", width: 120 },
    { key: "lawName", title: "法规名称", type: "link" },
    { key: "lawCategory", title: "文种类别", width: 100 },
    { key: "issueOrg", title: "发布单位", width: 150 },
    { key: "lawStatus", title: "法规状态", width: 80 },
    { key: "status", title: "状态", type: "status", width: 80 },
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
    { key: "lawCode", title: "法规编号", width: 120 },
    { key: "clauseNo", title: "条款号", width: 80 },
    { key: "clauseTitle", title: "条款标题", type: "link" },
    { key: "status", title: "状态", type: "status", width: 80 },
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
