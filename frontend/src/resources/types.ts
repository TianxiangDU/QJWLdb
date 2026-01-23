/**
 * Resource Config 类型定义
 * 用于配置驱动的页面生成
 */

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
  created?: number
  updated?: number
  skipped?: number
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
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 查询参数
 */
export interface QueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number | string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  [key: string]: any
}

/**
 * 列定义
 */
export type ColumnDef =
  | {
      type: 'text' | 'badge' | 'date' | 'datetime' | 'number'
      field: string
      header: string
      width?: number
      sortable?: boolean
      ellipsis?: boolean
      copyable?: boolean
    }
  | {
      type: 'enum'
      field: string
      header: string
      width?: number
      options: { label: string; value: string | number; variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }[]
      sortable?: boolean
    }
  | {
      type: 'boolean'
      field: string
      header: string
      width?: number
      trueLabel?: string
      falseLabel?: string
    }
  | {
      type: 'link'
      field: string
      header: string
      width?: number
      to: (row: any) => string
    }
  | {
      type: 'file'
      field: string
      header: string
      width?: number
      fileType?: 'pdf' | 'image' | 'office' | 'any'
      preview?: boolean
      download?: boolean
    }
  | {
      type: 'json'
      field: string
      header: string
      width?: number
      maxHeight?: number
    }

/**
 * 筛选字段
 */
export type FilterField =
  | { type: 'input'; field: string; label: string; placeholder?: string }
  | { type: 'select'; field: string; label: string; options: { label: string; value: string }[] }
  | { type: 'multiSelect'; field: string; label: string; options: { label: string; value: string }[] }
  | { type: 'dateRange'; fieldFrom: string; fieldTo: string; label: string }
  | { type: 'status'; field?: string; label?: string }
  | { type: 'asyncSelect'; field: string; label: string; optionsLoader: () => Promise<{ label: string; value: string }[]> }

/**
 * 表单字段基础属性
 */
interface FormFieldBase {
  field: string
  label: string
  required?: boolean
  placeholder?: string
  helpText?: string
}

/**
 * 表单字段
 */
export type FormField =
  | (FormFieldBase & { type: 'input'; maxLength?: number; readOnlyOnEdit?: boolean })
  | (FormFieldBase & { type: 'textarea'; rows?: number })
  | (FormFieldBase & { type: 'number'; min?: number; max?: number; step?: number; unit?: string })
  | (FormFieldBase & { type: 'select'; options: { label: string; value: any }[] })
  | (FormFieldBase & { type: 'multiSelect'; options: { label: string; value: any }[] })
  | (FormFieldBase & { type: 'asyncSelect'; optionsLoader: () => Promise<{ label: string; value: any }[]> })
  | { type: 'switch'; field: string; label: string; required?: boolean; helpText?: string; trueValue?: any; falseValue?: any }
  | (FormFieldBase & { type: 'date' })
  | (FormFieldBase & { type: 'fileUpload'; accept?: string; uploadPath: string; preview?: boolean })
  | (FormFieldBase & {
      type: 'relationSelect'
      relation: {
        resourceKey: string
        valueField: string
        labelField: string
        searchField?: string
      }
    })

/**
 * 列表操作
 */
export type ListAction =
  | { type: 'create'; label?: string; icon?: string }
  | { type: 'import'; label?: string; icon?: string }
  | { type: 'downloadTemplate'; label?: string; icon?: string }
  | { type: 'export'; label?: string; icon?: string }
  | { type: 'custom'; label: string; icon?: string; onClick: (ctx: any) => void }

/**
 * 行操作
 */
export type RowAction =
  | { type: 'edit'; label?: string; icon?: string }
  | { type: 'view'; label?: string; icon?: string }
  | { type: 'disable'; label?: string; icon?: string; confirm?: { title: string; description?: string } }
  | { type: 'enable'; label?: string; icon?: string }
  | { type: 'delete'; label?: string; icon?: string; confirm?: { title: string; description?: string } }
  | { type: 'preview'; label?: string; icon?: string; previewField: string }
  | { type: 'detail'; label?: string; icon?: string }
  | { type: 'custom'; label: string; icon?: string; onClick: (row: any) => void }

/**
 * 批量操作
 */
export type BulkAction =
  | { type: 'bulkEnable'; label?: string; icon?: string }
  | { type: 'bulkDisable'; label?: string; icon?: string }
  | { type: 'bulkDelete'; label?: string; icon?: string }
  | { type: 'bulkExport'; label?: string; icon?: string }

/**
 * 详情 Tab
 */
export type DetailTab =
  | {
      key: string
      title: string
      icon?: string
      kind: 'childResource'
      child: {
        resourceKey: string
        fkField: string
        parentIdField?: string
        mode?: 'inline' | 'drawer'
      }
    }
  | {
      key: string
      title: string
      icon?: string
      kind: 'info'
      infoFields: string[]
    }

/**
 * 预览规则
 */
export interface PreviewRule {
  field: string
  fileType: 'pdf' | 'image' | 'office' | 'any'
  mode: 'dialog' | 'newTab'
}

/**
 * 编码字段配置
 */
export interface CodeFieldConfig {
  field: string
  autoGenerate: boolean
  readOnlyOnEdit: boolean
  prefix?: string
}

/**
 * 资源配置
 */
export interface ResourceConfig {
  // 基本信息
  key: string
  name: string
  description?: string
  
  // API 端点
  api: {
    basePath: string
    idField?: string
    list?: { path?: string }
    get?: { path?: string }
    create?: { path?: string }
    update?: { path?: string }
    delete?: { path?: string }
    batchEnable?: { path: string }
    batchDisable?: { path: string }
    batchDelete?: { path: string }
    template?: { path: string }
    import?: { path: string }
    export?: { path: string }
  }
  
  // 列表页定义
  list: {
    defaultSort?: { field: string; order: 'asc' | 'desc' }
    pageSizeOptions?: number[]
    searchable?: { placeholder?: string; fields?: string[] }
    filters?: FilterField[]
    columns: ColumnDef[]
    actions?: ListAction[]
    rowActions?: RowAction[]
    bulkActions?: BulkAction[]
  }
  
  // 表单定义
  form: {
    mode?: 'sheet' | 'dialog'
    titleCreate?: string
    titleEdit?: string
    fields: FormField[]
    layout?: { columns?: 1 | 2 | 3 }
    validate?: (values: any) => { ok: boolean; message?: string }
  }
  
  // 详情页（可选）
  detail?: {
    enabled: boolean
    headerFields?: string[]
    tabs?: DetailTab[]
  }
  
  // 预览规则（可选）
  preview?: PreviewRule[]
  
  // 编码字段配置
  codeField?: CodeFieldConfig
  
  // 唯一键（用于导入去重）
  uniqueKeys?: string[]
  
  // 导入配置
  importConfig?: {
    modeOptions?: ImportMode[]
    dryRunSupported?: boolean
  }
  
  // 权限（可选）
  access?: {
    canCreate?: boolean
    canUpdate?: boolean
    canDelete?: boolean
    canImport?: boolean
    canExport?: boolean
  }
}
