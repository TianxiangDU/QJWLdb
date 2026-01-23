import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pagination } from "@/components/ui/pagination"
import {
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  FileText,
  Loader2,
} from "lucide-react"
import { ColumnDef, RowAction, ResourceConfig } from "@/resources/types"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"

interface DataTableProps {
  config: ResourceConfig
  data: any[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  rowSelection?: {
    selectedRowKeys: React.Key[]
    onChange: (keys: React.Key[], rows: any[]) => void
  }
  onView?: (record: any) => void
  onEdit?: (record: any) => void
  onDelete?: (record: any) => void
  onEnable?: (record: any) => void
  onDisable?: (record: any) => void
  onPreview?: (record: any, field: string) => void
  onRowClick?: (record: any) => void
}

/**
 * 通用数据表格组件 (shadcn/ui 版本)
 */
export function DataTable({
  config,
  data,
  loading,
  pagination,
  rowSelection,
  onView,
  onEdit,
  onDelete,
  onEnable,
  onDisable,
  onPreview,
  onRowClick,
}: DataTableProps) {
  const idField = config.api.idField || "id"

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // 判断行是否选中
  const isRowSelected = (record: any) => {
    return rowSelection?.selectedRowKeys.includes(record[idField])
  }

  // 切换行选择
  const toggleRowSelection = (record: any) => {
    if (!rowSelection) return
    const key = record[idField]
    const isSelected = rowSelection.selectedRowKeys.includes(key)
    if (isSelected) {
      rowSelection.onChange(
        rowSelection.selectedRowKeys.filter((k) => k !== key),
        data.filter((r) => r[idField] !== key && rowSelection.selectedRowKeys.includes(r[idField]))
      )
    } else {
      rowSelection.onChange(
        [...rowSelection.selectedRowKeys, key],
        [...data.filter((r) => rowSelection.selectedRowKeys.includes(r[idField])), record]
      )
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (!rowSelection) return
    if (rowSelection.selectedRowKeys.length === data.length) {
      rowSelection.onChange([], [])
    } else {
      rowSelection.onChange(
        data.map((r) => r[idField]),
        data
      )
    }
  }

  // 渲染单元格内容
  const renderCell = (column: ColumnDef, value: any, record: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>
    }

    switch (column.type) {
      case "text":
        const textContent = (
          <span className={cn(column.ellipsis && "truncate block", column.width && `max-w-[${column.width}px]`)}>
            {value}
          </span>
        )
        if (column.copyable) {
          return (
            <div className="flex items-center gap-1">
              {textContent}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(value)
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>复制</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        }
        return textContent

      case "link":
        return (
          <button
            onClick={() => onRowClick?.(record)}
            className="text-primary hover:underline cursor-pointer text-left"
          >
            {value}
          </button>
        )

      case "badge":
        return <Badge variant="outline">{value}</Badge>

      case "date":
        return dayjs(value).format("YYYY-MM-DD")

      case "datetime":
        return dayjs(value).format("YYYY-MM-DD HH:mm")

      case "number":
        return typeof value === "number" ? value.toLocaleString() : value

      case "enum":
        const option = column.options.find((opt) => opt.value === value)
        if (!option) return value
        const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          success: "default",
          destructive: "destructive",
          warning: "secondary",
          secondary: "secondary",
          default: "outline",
        }
        return (
          <Badge
            variant={variantMap[option.variant || "default"]}
            className={cn(
              option.variant === "success" && "bg-green-500 hover:bg-green-600",
              option.variant === "warning" && "bg-orange-500 hover:bg-orange-600 text-white"
            )}
          >
            {option.label}
          </Badge>
        )

      case "boolean":
        return value ? (
          <Badge variant="default" className="bg-green-500">{column.trueLabel || "是"}</Badge>
        ) : (
          <Badge variant="secondary">{column.falseLabel || "否"}</Badge>
        )

      case "file":
        if (!value) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {column.preview && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview?.(record, column.field)
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            {column.download && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                asChild
              >
                <a href={value} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        )

      case "json":
        return (
          <pre className="text-xs bg-muted p-2 rounded max-h-24 overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        )

      default:
        return String(value)
    }
  }

  // 渲染操作按钮
  const renderRowActions = (record: any) => {
    if (!config.list.rowActions || config.list.rowActions.length === 0) return null

    return (
      <div className="flex items-center gap-1">
        {config.list.rowActions.map((action, idx) => {
          switch (action.type) {
            case "view":
              return (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onView?.(record)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label || "查看"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )

            case "edit":
              return (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit?.(record)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label || "编辑"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )

            case "delete":
              return (
                <AlertDialog key={idx}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>{action.label || "删除"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{action.confirm?.title || "确认删除"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {action.confirm?.description || "删除后无法恢复，确定要删除这条记录吗？"}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete?.(record)}>
                        确定
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )

            case "enable":
              if (record.status === 1) return null
              return (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEnable?.(record)
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label || "启用"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )

            case "disable":
              if (record.status === 0) return null
              return (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-orange-500 hover:text-orange-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDisable?.(record)
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label || "停用"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )

            case "preview":
              return (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPreview?.(record, action.previewField)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label || "预览"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )

            default:
              return null
          }
        })}
      </div>
    )
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1

  return (
    <div className="space-y-4">
      {/* 表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {rowSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={data.length > 0 && rowSelection.selectedRowKeys.length === data.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              {config.list.columns.map((col) => (
                <TableHead key={col.field} style={{ width: col.width }}>
                  {col.header}
                </TableHead>
              ))}
              {config.list.rowActions && config.list.rowActions.length > 0 && (
                <TableHead className="w-32 text-right">操作</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={config.list.columns.length + (rowSelection ? 2 : 1)}
                  className="h-24 text-center"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={config.list.columns.length + (rowSelection ? 2 : 1)}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((record) => (
                <TableRow
                  key={record[idField]}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    isRowSelected(record) && "bg-muted"
                  )}
                  onClick={() => onRowClick?.(record)}
                >
                  {rowSelection && (
                    <TableCell>
                      <Checkbox
                        checked={isRowSelected(record)}
                        onCheckedChange={() => toggleRowSelection(record)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {config.list.columns.map((col) => (
                    <TableCell key={col.field}>
                      {renderCell(col, record[col.field], record)}
                    </TableCell>
                  ))}
                  {config.list.rowActions && config.list.rowActions.length > 0 && (
                    <TableCell className="text-right">
                      {renderRowActions(record)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {pagination.total} 条
          </div>
          <Pagination
            currentPage={pagination.current}
            totalPages={totalPages}
            onPageChange={(page) => pagination.onChange(page, pagination.pageSize)}
          />
        </div>
      )}
    </div>
  )
}
