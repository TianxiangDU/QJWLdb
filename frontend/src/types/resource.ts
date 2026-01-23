import { LucideIcon } from "lucide-react"

/**
 * API 响应格式
 */
export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    totalPages?: number
  }
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 列配置
 */
export interface ColumnConfig<T = any> {
  /** 列键名 */
  key: keyof T | string
  /** 列标题 */
  title: string
  /** 列宽 */
  width?: number
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否可排序 */
  sortable?: boolean
  /** 渲染函数 */
  render?: (value: any, record: T) => React.ReactNode
  /** 类型（用于默认渲染） */
  type?: "text" | "number" | "date" | "datetime" | "status" | "boolean" | "link"
}

/**
 * 表单字段配置
 */
export interface FormFieldConfig<T = any> {
  /** 字段键名 */
  key: keyof T | string
  /** 字段标签 */
  label: string
  /** 字段类型 */
  type: "text" | "number" | "textarea" | "select" | "date" | "switch" | "file"
  /** 是否必填 */
  required?: boolean
  /** 占位符 */
  placeholder?: string
  /** 帮助文本 */
  help?: string
  /** 选项（用于 select 类型） */
  options?: { label: string; value: string | number }[]
  /** 选项获取函数 */
  optionsLoader?: () => Promise<{ label: string; value: string | number }[]>
  /** 默认值 */
  defaultValue?: any
  /** 是否只在编辑时显示 */
  editOnly?: boolean
  /** 是否只在创建时显示 */
  createOnly?: boolean
  /** 隐藏条件 */
  hidden?: (values: Partial<T>) => boolean
}

/**
 * 筛选配置
 */
export interface FilterConfig {
  /** 筛选键名 */
  key: string
  /** 筛选标签 */
  label: string
  /** 筛选类型 */
  type: "text" | "number" | "select" | "date" | "dateRange"
  /** 选项（用于 select 类型） */
  options?: { label: string; value: string | number }[]
  /** 选项获取函数 */
  optionsLoader?: () => Promise<{ label: string; value: string | number }[]>
  /** 占位符 */
  placeholder?: string
}

/**
 * 详情字段配置
 */
export interface DetailFieldConfig<T = any> {
  /** 字段键名 */
  key: keyof T | string
  /** 字段标签 */
  label: string
  /** 是否占满一行 */
  fullWidth?: boolean
  /** 渲染函数 */
  render?: (value: any, record: T) => React.ReactNode
}

/**
 * 资源配置
 */
export interface ResourceConfig<T = any> {
  /** 资源标识 */
  key: string
  /** 资源名称 */
  name: string
  /** 资源图标 */
  icon?: LucideIcon
  /** API 路径前缀 */
  apiPath: string
  
  /** 列配置 */
  columns: ColumnConfig<T>[]
  
  /** 表单字段配置 */
  formFields: FormFieldConfig<T>[]
  
  /** 筛选配置 */
  filters?: FilterConfig[]
  
  /** 详情字段配置 */
  detailFields?: DetailFieldConfig<T>[]
  
  /** 主键字段 */
  primaryKey?: keyof T
  
  /** 名称字段（用于显示） */
  nameField?: keyof T
  
  /** 是否支持导入 */
  importable?: boolean
  
  /** 是否支持导出 */
  exportable?: boolean
  
  /** 是否支持批量操作 */
  batchable?: boolean
  
  /** 自定义操作按钮 */
  actions?: ResourceAction[]
  
  /** 编码字段配置 */
  codeField?: CodeFieldConfig
  
  /** 唯一键（用于导入去重） */
  uniqueKeys?: string[]
  
  /** 导入配置 */
  importConfig?: {
    /** 支持的导入模式 */
    modeOptions?: ImportMode[]
    /** 是否支持 dryRun */
    dryRunSupported?: boolean
  }
}

/**
 * 资源操作
 */
export interface ResourceAction {
  key: string
  label: string
  icon?: LucideIcon
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  onClick: (selectedIds: number[], records: any[]) => void | Promise<void>
  /** 是否需要选中行 */
  requireSelection?: boolean
}

/**
 * 导入模式
 */
export type ImportMode = 'upsert' | 'insertOnly' | 'updateOnly'

/**
 * 导入结果
 */
export interface ImportResult {
  success: number
  failed: number
  created: number
  updated: number
  skipped: number
  errors: Array<{
    row: number
    field?: string
    message: string
  }>
  duplicateRows?: Array<{
    row: number
    duplicateOf: number
    uniqueKey: string
  }>
}

/**
 * 导入选项
 */
export interface ImportOptions {
  mode: ImportMode
  dryRun: boolean
}

/**
 * 编码字段配置
 */
export interface CodeFieldConfig {
  /** 编码字段名 */
  field: string
  /** 是否自动生成 */
  autoGenerate: boolean
  /** 编辑时是否只读 */
  readOnlyOnEdit: boolean
  /** 编码前缀（用于提示） */
  prefix?: string
}

/**
 * 资源 API 接口
 */
export interface ResourceApi<T = any> {
  list: (params: Record<string, any>) => Promise<PaginatedResult<T>>
  get: (id: number) => Promise<ApiResponse<T>>
  create: (data: Partial<T>) => Promise<ApiResponse<T>>
  update: (id: number, data: Partial<T>) => Promise<ApiResponse<T>>
  delete: (id: number) => Promise<void>
  batchEnable?: (ids: number[]) => Promise<void>
  batchDisable?: (ids: number[]) => Promise<void>
  batchDelete?: (ids: number[]) => Promise<void>
  downloadTemplate?: () => Promise<void>
  import?: (file: File, options?: ImportOptions) => Promise<ImportResult>
  export?: (params: Record<string, any>) => Promise<void>
}
