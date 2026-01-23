import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ResourceConfig, ColumnDef } from "@/resources/types"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"

interface DetailModalProps {
  config: ResourceConfig
  record: any | null
  open: boolean
  onClose: () => void
}

/**
 * 通用详情弹窗 (shadcn/ui 版本)
 */
export function DetailModal({ config, record, open, onClose }: DetailModalProps) {
  if (!record) return null

  // 渲染字段值
  const renderValue = (column: ColumnDef, value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>
    }

    switch (column.type) {
      case "text":
      case "badge":
        return value

      case "date":
        return dayjs(value).format("YYYY-MM-DD")

      case "datetime":
        return dayjs(value).format("YYYY-MM-DD HH:mm:ss")

      case "number":
        return typeof value === "number" ? value.toLocaleString() : value

      case "enum":
        const option = column.options.find((opt) => opt.value === value)
        if (!option) return value
        return (
          <Badge
            variant={option.variant === "destructive" ? "destructive" : "secondary"}
            className={cn(
              option.variant === "success" && "bg-green-500",
              option.variant === "warning" && "bg-orange-500 text-white"
            )}
          >
            {option.label}
          </Badge>
        )

      case "boolean":
        return value ? (
          <Badge className="bg-green-500">{column.trueLabel || "是"}</Badge>
        ) : (
          <Badge variant="secondary">{column.falseLabel || "否"}</Badge>
        )

      case "link":
        return value

      case "file":
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            查看文件
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )

      case "json":
        return (
          <pre className="text-xs bg-muted p-2 rounded max-h-48 overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        )

      default:
        return String(value)
    }
  }

  const columns = config.list.columns

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{config.name}详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">ID</div>
              <div>{record[config.api.idField || "id"]}</div>
            </div>
          </div>

          <Separator />

          {/* 字段列表 */}
          <div className="grid grid-cols-2 gap-4">
            {columns.map((column) => (
              <div
                key={column.field}
                className={cn(
                  (column.type === "json" || column.type === "file") && "col-span-2"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {column.header}
                </div>
                <div className="break-words">
                  {renderValue(column, record[column.field])}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* 时间信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {record.createdAt && (
              <div>
                <div className="text-muted-foreground mb-1">创建时间</div>
                <div>{dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
              </div>
            )}
            {record.updatedAt && (
              <div>
                <div className="text-muted-foreground mb-1">更新时间</div>
                <div>{dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm:ss")}</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
