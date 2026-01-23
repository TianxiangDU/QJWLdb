import { DeepPartial, FindOptionsWhere, ObjectLiteral } from 'typeorm';

/**
 * 统一响应格式
 */
export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
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
 * 导入结果
 */
export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  code: string;
  message: string;
  traceId: string;
  details?: any;
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
 * 资源配置接口 - 用于元数据驱动的 CRUD
 */
export interface ResourceConfig<T extends ObjectLiteral> {
  /**
   * 资源名称（中文）
   */
  resourceName: string;

  /**
   * 唯一键字段名（用于导入时判断是否已存在）
   */
  uniqueKey?: keyof T | (keyof T)[];

  /**
   * 关键字搜索字段
   */
  searchFields?: (keyof T)[];

  /**
   * 默认排序字段
   */
  defaultSortField?: keyof T;

  /**
   * 默认排序方向
   */
  defaultSortOrder?: 'ASC' | 'DESC';

  /**
   * Excel 导入/导出列配置
   */
  excelColumns?: ExcelColumnConfig<T>[];
}

/**
 * Excel 列配置
 */
export interface ExcelColumnConfig<T> {
  /**
   * 列标题
   */
  header: string;

  /**
   * 对应实体字段
   */
  key: keyof T;

  /**
   * 列宽
   */
  width?: number;

  /**
   * 是否必填
   */
  required?: boolean;

  /**
   * 值转换函数（导入时）
   */
  transform?: (value: any) => any;

  /**
   * 格式化函数（导出时）
   */
  format?: (value: any) => any;
}
