import { ColumnConfig } from "@/types/resource"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TableLoading } from "@/components/ui/loading"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ResourceTableProps<T> {
  data: T[]
  columns: ColumnConfig<T>[]
  loading?: boolean
  selectedIds: number[]
  onSelectionChange: (ids: number[]) => void
  onRowClick?: (record: T) => void
  primaryKey?: keyof T
}

export function ResourceTable<T extends { id: number }>({
  data,
  columns,
  loading,
  selectedIds,
  onSelectionChange,
  onRowClick,
  primaryKey = "id" as keyof T,
}: ResourceTableProps<T>) {
  const visibleColumns = columns.filter((col) => !col.hidden)

  const allSelected = data.length > 0 && data.every((item) => selectedIds.includes(item[primaryKey] as number))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map((item) => item[primaryKey] as number)
      onSelectionChange([...new Set([...selectedIds, ...allIds])])
    } else {
      const currentPageIds = data.map((item) => item[primaryKey] as number)
      onSelectionChange(selectedIds.filter((id) => !currentPageIds.includes(id)))
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const renderCellValue = (column: ColumnConfig<T>, value: any, record: T) => {
    // 自定义渲染
    if (column.render) {
      return column.render(value, record)
    }

    // 空值
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400">-</span>
    }

    // 按类型渲染
    switch (column.type) {
      case "status":
        return value === 1 ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 font-medium">
            启用
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 font-medium">
            停用
          </Badge>
        )

      case "boolean":
        return value ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">是</Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">否</Badge>
        )

      case "date":
        try {
          return <span className="text-gray-600">{format(new Date(value), "yyyy-MM-dd")}</span>
        } catch {
          return value
        }

      case "datetime":
        try {
          return <span className="text-gray-500 text-sm">{format(new Date(value), "MM-dd HH:mm")}</span>
        } catch {
          return value
        }

      case "link":
        return (
          <span
            className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onRowClick?.(record)
            }}
          >
            {value}
          </span>
        )

      case "fileLink":
        // 文件链接：显示文件名，点击可下载/预览
        const linkUrl = column.linkField ? (record as any)[column.linkField] : null
        if (!value || !linkUrl) {
          return <span className="text-gray-400">-</span>
        }
        return (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            onClick={(e) => e.stopPropagation()}
            title={value}
          >
            {String(value).length > 20 ? String(value).slice(0, 20) + '...' : value}
          </a>
        )

      default:
        // 长文本截断
        const strValue = String(value)
        const maxLength = column.width ? Math.floor(column.width / 8) : 20
        if (strValue.length > maxLength) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-gray-700">{strValue.slice(0, maxLength)}...</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-md whitespace-pre-wrap">
                {strValue}
              </TooltipContent>
            </Tooltip>
          )
        }
        return <span className="text-gray-700">{strValue}</span>
    }
  }

  if (loading) {
    return <TableLoading />
  }

  return (
    <TooltipProvider>
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 hover:bg-gray-50/80">
              <TableHead className="w-12 bg-gray-50/80">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="全选"
                  disabled={data.length === 0}
                />
              </TableHead>
              {visibleColumns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  style={{ 
                    width: column.width ? `${column.width}px` : undefined,
                    minWidth: column.width ? `${column.width}px` : '100px',
                  }}
                  className="whitespace-nowrap text-gray-600 font-semibold bg-gray-50/80"
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + 1} 
                  className="h-40 text-center text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-4xl mb-2">📭</div>
                    <div>暂无数据</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.map((record, index) => {
              const id = record[primaryKey] as number
              const isSelected = selectedIds.includes(id)

              return (
                <TableRow
                  key={id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "cursor-pointer transition-all duration-150 border-b border-gray-100",
                    isSelected 
                      ? "bg-blue-50/60 hover:bg-blue-50" 
                      : index % 2 === 0 
                        ? "bg-white hover:bg-gray-50" 
                        : "bg-gray-50/30 hover:bg-gray-50"
                  )}
                  onClick={() => onRowClick?.(record)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectRow(id, !!checked)}
                      aria-label="选择行"
                    />
                  </TableCell>
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={String(column.key)}
                      style={{
                        width: column.width ? `${column.width}px` : undefined,
                        minWidth: column.width ? `${column.width}px` : '100px',
                        maxWidth: column.width ? `${column.width}px` : '300px',
                      }}
                      className="py-3"
                    >
                      {renderCellValue(column, (record as any)[column.key], record)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
