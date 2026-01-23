import { DetailFieldConfig } from "@/types/resource"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ResourceDetailProps<T> {
  open: boolean
  onClose: () => void
  title: string
  record: T | null
  fields: DetailFieldConfig<T>[]
}

export function ResourceDetail<T>({
  open,
  onClose,
  title,
  record,
  fields,
}: ResourceDetailProps<T>) {
  if (!record) return null

  const renderValue = (field: DetailFieldConfig<T>) => {
    const value = (record as any)[field.key]

    // 自定义渲染
    if (field.render) {
      return field.render(value, record)
    }

    // 空值
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground">-</span>
    }

    // 布尔值
    if (typeof value === "boolean") {
      return value ? <Badge variant="success">是</Badge> : <Badge variant="secondary">否</Badge>
    }

    // 状态字段
    if (field.key === "status") {
      return value === 1 ? (
        <Badge variant="success">启用</Badge>
      ) : (
        <Badge variant="secondary">停用</Badge>
      )
    }

    // 日期字段
    if (field.key === "createdAt" || field.key === "updatedAt" || 
        String(field.key).toLowerCase().includes("date") ||
        String(field.key).toLowerCase().includes("time")) {
      try {
        return format(new Date(value), "yyyy-MM-dd HH:mm:ss")
      } catch {
        return value
      }
    }

    return String(value)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {fields.map((field) => (
            <div
              key={String(field.key)}
              className={cn(
                "space-y-1",
                field.fullWidth && "col-span-2"
              )}
            >
              <dt className="text-sm font-medium text-muted-foreground">
                {field.label}
              </dt>
              <dd className="text-sm">{renderValue(field)}</dd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
