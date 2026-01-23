/**
 * API 响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  code: string | number;
  message: string;
  traceId?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  affected: number;
}

/**
 * 导入模式
 */
export type ImportMode = 'upsert' | 'insertOnly' | 'updateOnly';

/**
 * 导入结果
 */
export interface ImportResult {
  success: number;
  failed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  duplicateRows?: Array<{
    row: number;
    duplicateOf: number;
    uniqueKey: string;
  }>;
}

/**
 * 导入选项
 */
export interface ImportOptions {
  mode: ImportMode;
  dryRun: boolean;
}

/**
 * Excel 列配置
 */
export interface ExcelColumnConfig<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  required?: boolean;
  description?: string;
  transform?: (value: string) => any;
  format?: (value: any) => string;
}

/**
 * 资源配置
 */
export interface ResourceConfig<T> {
  resourceName: string;
  resourceType: string; // 用于编码生成
  uniqueKey?: keyof T | (keyof T)[]; // 唯一键（用于 upsert）
  secondaryUniqueKey?: (keyof T)[]; // 备用唯一键
  searchFields?: (keyof T)[]; // 关键字搜索字段
  defaultSortField?: keyof T;
  defaultSortOrder?: 'ASC' | 'DESC';
  excelColumns?: ExcelColumnConfig<T>[];
  supportsAutoCode?: boolean; // 是否支持自动编码
  codeField?: keyof T; // 编码字段名（默认 'code'）
  parentCodeField?: keyof T; // 父级编码字段（子资源用）
}

/**
 * 基础查询参数
 */
export interface BaseQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 乐观锁更新 DTO 基类
 */
export interface VersionedUpdateDto {
  rowVersion?: number;
}

/**
 * 代码关联字段
 * 用于支持既可以用 ID 也可以用 Code 关联
 */
export interface CodeRelation {
  id?: number;
  code?: string;
}

/**
 * 解析后的关联信息
 */
export interface ResolvedRelation {
  id: number;
  code: string;
  name?: string;
}
