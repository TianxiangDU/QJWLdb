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
import { TableLoading } from "@/components/ui/loading"
import { format } from "date-fns"

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
  const _someSelected = data.some((item) => selectedIds.includes(item[primaryKey] as number))
  void _someSelected // 保留以备后用

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
      return <span className="text-muted-foreground">-</span>
    }

    // 按类型渲染
    switch (column.type) {
      case "status":
        return value === 1 ? (
          <Badge variant="success">启用</Badge>
        ) : (
          <Badge variant="secondary">停用</Badge>
        )

      case "boolean":
        return value ? (
          <Badge variant="success">是</Badge>
        ) : (
          <Badge variant="secondary">否</Badge>
        )

      case "date":
        try {
          return format(new Date(value), "yyyy-MM-dd")
        } catch {
          return value
        }

      case "datetime":
        try {
          return format(new Date(value), "yyyy-MM-dd HH:mm")
        } catch {
          return value
        }

      case "link":
        return (
          <span
            className="cursor-pointer text-primary hover:underline"
            onClick={(e) => {
              e.stopPropagation()
              onRowClick?.(record)
            }}
          >
            {value}
          </span>
        )

      default:
        // 长文本截断
        const strValue = String(value)
        if (strValue.length > 50) {
          return (
            <span title={strValue}>{strValue.slice(0, 50)}...</span>
          )
        }
        return strValue
    }
  }

  if (loading) {
    return <TableLoading />
  }

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        暂无数据
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="全选"
              />
            </TableHead>
            {visibleColumns.map((column) => (
              <TableHead
                key={String(column.key)}
                style={{ width: column.width ? `${column.width}px` : undefined }}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => {
            const id = record[primaryKey] as number
            const isSelected = selectedIds.includes(id)

            return (
              <TableRow
                key={id}
                data-state={isSelected ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => onRowClick?.(record)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectRow(id, !!checked)}
                    aria-label="选择行"
                  />
                </TableCell>
                {visibleColumns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {renderCellValue(column, (record as any)[column.key], record)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
