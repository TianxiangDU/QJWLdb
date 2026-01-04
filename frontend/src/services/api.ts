import axios from 'axios';
import { getToken, logout } from '../utils/auth';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理 401 未授权
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // token 过期或无效，跳转登录
      logout();
      return Promise.reject(error);
    }
    const message = error.response?.data?.message || '请求失败';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// 登录响应类型
export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    nickname: string;
    role: string;
  };
}

// 认证 API
export const authApi = {
  login: (username: string, password: string) =>
    api.post<any, LoginResponse>('/auth/login', { username, password }),
  getProfile: () => api.get<any, any>('/auth/profile'),
};

// 通用分页响应类型
export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 通用查询参数
export interface QueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
  [key: string]: any;
}

// 文件类型
export interface DocType {
  id: number;
  code: string;
  name: string;
  projectPhase?: string;
  majorCategory?: string;
  minorCategory?: string;
  fileFeature?: string;
  projectType?: string;
  region?: string;
  ownerOrg?: string;
  bizDescription?: string;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 关键信息字段
export interface DocFieldDef {
  id: number;
  docTypeId: number;
  fieldCode: string;
  fieldName: string;
  fieldCategory?: string;
  requiredFlag: number;
  valueSource?: string;
  enumOptions?: string;
  exampleValue?: string;
  fieldDescription?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  docType?: DocType;
}

// 文件模板/示例
export interface DocTemplateSample {
  id: number;
  docTypeId: number;
  fileName: string;
  filePath?: string;
  description?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  docType?: DocType;
}

// 审计规则
export interface AuditRule {
  id: number;
  ruleCode: string;
  ruleName: string;
  ruleCategory?: string;
  bizDescription?: string;
  compareMethod?: string;
  riskLevel?: string;
  projectPhase?: string;
  projectType?: string;
  region?: string;
  ownerOrg?: string;
  version: number;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  fieldLinks?: AuditRuleFieldLink[];
  lawLinks?: AuditRuleLawLink[];
  examples?: AuditRuleExample[];
}

// 审计规则字段关联
export interface AuditRuleFieldLink {
  id: number;
  ruleId: number;
  docTypeId: number;
  docFieldId: number;
  requiredFlag: number;
  remark?: string;
  status: number;
  docType?: DocType;
  docField?: DocFieldDef;
}

// 审计规则法规关联
export interface AuditRuleLawLink {
  id: number;
  ruleId: number;
  lawDocumentId?: number;
  lawClauseId?: number;
  lawCode?: string;
  lawName?: string;
  clauseNo?: string;
  referenceDescription?: string;
  remark?: string;
  status: number;
  lawDocument?: LawDocument;
  lawClause?: LawClause;
}

// 审计规则案例
export interface AuditRuleExample {
  id: number;
  ruleId: number;
  exampleName: string;
  background?: string;
  inputExample?: string;
  conclusionExample?: string;
  experience?: string;
  status: number;
}

// 法规
export interface LawDocument {
  id: number;
  lawCode: string;
  lawName: string;
  lawCategory?: string;
  issueOrg?: string;
  issueDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  regionScope?: string;
  industryScope?: string;
  lawStatus: string;
  filePath?: string;
  summary?: string;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  clauses?: LawClause[];
}

// 法规条款
export interface LawClause {
  id: number;
  lawDocumentId: number;
  lawCode?: string;
  lawName?: string;
  clauseNo: string;
  clauseTitle?: string;
  clauseText?: string;
  clauseSummary?: string;
  levelLabel?: string;
  parentClauseNo?: string;
  keywords?: string;
  topicTags?: string;
  regionScope?: string;
  industryScope?: string;
  importanceLevel?: string;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  lawDocument?: LawDocument;
}

// 条款与文件类型关联
export interface LawClauseDocTypeLink {
  id: number;
  lawClauseId: number;
  lawDocumentId?: number;
  lawCode?: string;
  lawName?: string;
  docTypeId: number;
  docTypeName?: string;
  applicabilityDescription?: string;
  applicabilityLevel?: string;
  remark?: string;
  status: number;
  lawClause?: LawClause;
  lawDocument?: LawDocument;
  docType?: DocType;
}

// 占位模块通用类型
export interface PlaceholderEntity {
  id: number;
  code: string;
  name: string;
  description?: string;
  tags?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 文件类型完整信息（聚合查询结果）
export interface DocTypeFullInfo {
  docType: DocType;
  fields: Array<{
    id: number;
    fieldCode: string;
    fieldName: string;
    fieldCategory?: string;
    requiredFlag: number;
    valueSource?: string;
    enumOptions?: string;
    exampleValue?: string;
    fieldDescription?: string;
  }>;
  templates: Array<{
    id: number;
    fileName: string;
    description?: string;
  }>;
}

// API 函数
export const docTypeApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<DocType>>('/doc-types/list', { params }),
  all: () => api.get<any, DocType[]>('/doc-types/all'),
  get: (id: number) => api.get<any, DocType>(`/doc-types/${id}`),
  /** 获取文件类型完整信息（包含关键信息字段和模板/示例） */
  getFullInfo: (idOrCode: string | number) => api.get<any, DocTypeFullInfo>(`/doc-types/full/${idOrCode}`),
  create: (data: Partial<DocType>) => api.post<any, DocType>('/doc-types', data),
  update: (id: number, data: Partial<DocType>) => api.put<any, DocType>(`/doc-types/${id}`, data),
  delete: (id: number) => api.delete(`/doc-types/${id}`),
  downloadTemplate: () => window.open('/api/v1/doc-types/template', '_blank'),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/doc-types/import', formData);
  },
  // 批量操作
  batchEnable: (ids: number[]) => api.post('/doc-types/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/doc-types/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/doc-types/batch/delete', { ids }),
};

export const docFieldDefApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<DocFieldDef>>('/doc-field-defs/list', { params }),
  byDocType: (docTypeId: number) => api.get<any, DocFieldDef[]>(`/doc-field-defs/by-doc-type/${docTypeId}`),
  get: (id: number) => api.get<any, DocFieldDef>(`/doc-field-defs/${id}`),
  create: (data: Partial<DocFieldDef>) => api.post<any, DocFieldDef>('/doc-field-defs', data),
  update: (id: number, data: Partial<DocFieldDef>) => api.put<any, DocFieldDef>(`/doc-field-defs/${id}`, data),
  delete: (id: number) => api.delete(`/doc-field-defs/${id}`),
  downloadTemplate: () => window.open('/api/v1/doc-field-defs/template', '_blank'),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/doc-field-defs/import', formData);
  },
  batchEnable: (ids: number[]) => api.post('/doc-field-defs/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/doc-field-defs/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/doc-field-defs/batch/delete', { ids }),
};

export const docTemplateSampleApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<DocTemplateSample>>('/doc-template-samples/list', { params }),
  get: (id: number) => api.get<any, DocTemplateSample>(`/doc-template-samples/${id}`),
  create: (data: Partial<DocTemplateSample>) => api.post<any, DocTemplateSample>('/doc-template-samples', data),
  update: (id: number, data: Partial<DocTemplateSample>) => api.put<any, DocTemplateSample>(`/doc-template-samples/${id}`, data),
  delete: (id: number) => api.delete(`/doc-template-samples/${id}`),
  batchEnable: (ids: number[]) => api.post('/doc-template-samples/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/doc-template-samples/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/doc-template-samples/batch/delete', { ids }),
};

export const auditRuleApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<AuditRule>>('/audit-rules/list', { params }),
  all: () => api.get<any, AuditRule[]>('/audit-rules/all'),
  get: (id: number) => api.get<any, AuditRule>(`/audit-rules/${id}`),
  create: (data: Partial<AuditRule>) => api.post<any, AuditRule>('/audit-rules', data),
  update: (id: number, data: Partial<AuditRule>) => api.put<any, AuditRule>(`/audit-rules/${id}`, data),
  delete: (id: number) => api.delete(`/audit-rules/${id}`),
  downloadTemplate: () => window.open('/api/v1/audit-rules/template', '_blank'),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/audit-rules/import', formData);
  },
  batchEnable: (ids: number[]) => api.post('/audit-rules/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/audit-rules/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/audit-rules/batch/delete', { ids }),
};

export const auditRuleFieldLinkApi = {
  byRule: (ruleId: number) => api.get<any, AuditRuleFieldLink[]>(`/audit-rule-field-links/by-rule/${ruleId}`),
  create: (data: Partial<AuditRuleFieldLink>) => api.post<any, AuditRuleFieldLink>('/audit-rule-field-links', data),
  delete: (id: number) => api.delete(`/audit-rule-field-links/${id}`),
};

export const auditRuleLawLinkApi = {
  byRule: (ruleId: number) => api.get<any, AuditRuleLawLink[]>(`/audit-rule-law-links/by-rule/${ruleId}`),
  create: (data: Partial<AuditRuleLawLink>) => api.post<any, AuditRuleLawLink>('/audit-rule-law-links', data),
  delete: (id: number) => api.delete(`/audit-rule-law-links/${id}`),
};

export const auditRuleExampleApi = {
  byRule: (ruleId: number) => api.get<any, AuditRuleExample[]>(`/audit-rule-examples/by-rule/${ruleId}`),
  create: (data: Partial<AuditRuleExample>) => api.post<any, AuditRuleExample>('/audit-rule-examples', data),
  update: (id: number, data: Partial<AuditRuleExample>) => api.put<any, AuditRuleExample>(`/audit-rule-examples/${id}`, data),
  delete: (id: number) => api.delete(`/audit-rule-examples/${id}`),
};

export const lawDocumentApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<LawDocument>>('/law-documents/list', { params }),
  all: () => api.get<any, LawDocument[]>('/law-documents/all'),
  get: (id: number) => api.get<any, LawDocument>(`/law-documents/${id}`),
  create: (data: Partial<LawDocument>) => api.post<any, LawDocument>('/law-documents', data),
  update: (id: number, data: Partial<LawDocument>) => api.put<any, LawDocument>(`/law-documents/${id}`, data),
  delete: (id: number) => api.delete(`/law-documents/${id}`),
  downloadTemplate: () => window.open('/api/v1/law-documents/template', '_blank'),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/law-documents/import', formData);
  },
  batchEnable: (ids: number[]) => api.post('/law-documents/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/law-documents/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/law-documents/batch/delete', { ids }),
};

export const lawClauseApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<LawClause>>('/law-clauses/list', { params }),
  all: () => api.get<any, LawClause[]>('/law-clauses/all'),
  byLaw: (lawDocumentId: number) => api.get<any, LawClause[]>(`/law-clauses/by-law/${lawDocumentId}`),
  get: (id: number) => api.get<any, LawClause>(`/law-clauses/${id}`),
  create: (data: Partial<LawClause>) => api.post<any, LawClause>('/law-clauses', data),
  update: (id: number, data: Partial<LawClause>) => api.put<any, LawClause>(`/law-clauses/${id}`, data),
  delete: (id: number) => api.delete(`/law-clauses/${id}`),
  downloadTemplate: () => window.open('/api/v1/law-clauses/template', '_blank'),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/law-clauses/import', formData);
  },
  batchEnable: (ids: number[]) => api.post('/law-clauses/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/law-clauses/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/law-clauses/batch/delete', { ids }),
};

export const lawClauseDocTypeLinkApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<LawClauseDocTypeLink>>('/law-clause-doc-type-links/list', { params }),
  get: (id: number) => api.get<any, LawClauseDocTypeLink>(`/law-clause-doc-type-links/${id}`),
  create: (data: Partial<LawClauseDocTypeLink>) => api.post<any, LawClauseDocTypeLink>('/law-clause-doc-type-links', data),
  update: (id: number, data: Partial<LawClauseDocTypeLink>) => api.put<any, LawClauseDocTypeLink>(`/law-clause-doc-type-links/${id}`, data),
  delete: (id: number) => api.delete(`/law-clause-doc-type-links/${id}`),
  batchEnable: (ids: number[]) => api.post('/law-clause-doc-type-links/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/law-clause-doc-type-links/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/law-clause-doc-type-links/batch/delete', { ids }),
};

// 占位模块 API - 带批量操作
export const costRuleApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<PlaceholderEntity>>('/cost-rules/list', { params }),
  get: (id: number) => api.get<any, PlaceholderEntity>(`/cost-rules/${id}`),
  create: (data: Partial<PlaceholderEntity>) => api.post<any, PlaceholderEntity>('/cost-rules', data),
  update: (id: number, data: Partial<PlaceholderEntity>) => api.put<any, PlaceholderEntity>(`/cost-rules/${id}`, data),
  delete: (id: number) => api.delete(`/cost-rules/${id}`),
  batchEnable: (ids: number[]) => api.post('/cost-rules/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/cost-rules/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/cost-rules/batch/delete', { ids }),
};

export const bizProcessApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<PlaceholderEntity>>('/biz-processes/list', { params }),
  get: (id: number) => api.get<any, PlaceholderEntity>(`/biz-processes/${id}`),
  create: (data: Partial<PlaceholderEntity>) => api.post<any, PlaceholderEntity>('/biz-processes', data),
  update: (id: number, data: Partial<PlaceholderEntity>) => api.put<any, PlaceholderEntity>(`/biz-processes/${id}`, data),
  delete: (id: number) => api.delete(`/biz-processes/${id}`),
  batchEnable: (ids: number[]) => api.post('/biz-processes/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/biz-processes/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/biz-processes/batch/delete', { ids }),
};

export const caseLibraryApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<PlaceholderEntity>>('/case-libraries/list', { params }),
  get: (id: number) => api.get<any, PlaceholderEntity>(`/case-libraries/${id}`),
  create: (data: Partial<PlaceholderEntity>) => api.post<any, PlaceholderEntity>('/case-libraries', data),
  update: (id: number, data: Partial<PlaceholderEntity>) => api.put<any, PlaceholderEntity>(`/case-libraries/${id}`, data),
  delete: (id: number) => api.delete(`/case-libraries/${id}`),
  batchEnable: (ids: number[]) => api.post('/case-libraries/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/case-libraries/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/case-libraries/batch/delete', { ids }),
};

export const knowledgeSnippetApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<PlaceholderEntity>>('/knowledge-snippets/list', { params }),
  get: (id: number) => api.get<any, PlaceholderEntity>(`/knowledge-snippets/${id}`),
  create: (data: Partial<PlaceholderEntity>) => api.post<any, PlaceholderEntity>('/knowledge-snippets', data),
  update: (id: number, data: Partial<PlaceholderEntity>) => api.put<any, PlaceholderEntity>(`/knowledge-snippets/${id}`, data),
  delete: (id: number) => api.delete(`/knowledge-snippets/${id}`),
  batchEnable: (ids: number[]) => api.post('/knowledge-snippets/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/knowledge-snippets/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/knowledge-snippets/batch/delete', { ids }),
};

export const monitorMetricApi = {
  list: (params: QueryParams) => api.get<any, PaginationResult<PlaceholderEntity>>('/monitor-metrics/list', { params }),
  get: (id: number) => api.get<any, PlaceholderEntity>(`/monitor-metrics/${id}`),
  create: (data: Partial<PlaceholderEntity>) => api.post<any, PlaceholderEntity>('/monitor-metrics', data),
  update: (id: number, data: Partial<PlaceholderEntity>) => api.put<any, PlaceholderEntity>(`/monitor-metrics/${id}`, data),
  delete: (id: number) => api.delete(`/monitor-metrics/${id}`),
  batchEnable: (ids: number[]) => api.post('/monitor-metrics/batch/enable', { ids }),
  batchDisable: (ids: number[]) => api.post('/monitor-metrics/batch/disable', { ids }),
  batchDelete: (ids: number[]) => api.post('/monitor-metrics/batch/delete', { ids }),
};

export const fileUploadApi = {
  upload: (file: File, subDir?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/files/upload${subDir ? `?subDir=${subDir}` : ''}`, formData);
  },
};

export default api;

