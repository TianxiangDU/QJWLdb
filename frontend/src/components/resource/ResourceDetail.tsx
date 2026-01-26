import { DetailFieldConfig } from "@/types/resource"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

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
      return <span className="text-gray-400">-</span>
    }

    // 布尔值
    if (typeof value === "boolean" || (field.key === "requiredFlag" && typeof value === "number")) {
      const boolVal = typeof value === "boolean" ? value : value === 1
      return boolVal ? (
        <Badge className="bg-emerald-100 text-emerald-700 border-0">是</Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-600 border-0">否</Badge>
      )
    }

    // 状态字段
    if (field.key === "status") {
      return value === 1 ? (
        <Badge className="bg-emerald-100 text-emerald-700 border-0">启用</Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-600 border-0">停用</Badge>
      )
    }

    // 日期字段
    if (field.key === "createdAt" || field.key === "updatedAt" || 
        String(field.key).toLowerCase().includes("date") ||
        String(field.key).toLowerCase().includes("time")) {
      try {
        return <span className="text-gray-700">{format(new Date(value), "yyyy-MM-dd HH:mm:ss")}</span>
      } catch {
        return <span className="text-gray-700">{value}</span>
      }
    }

    return <span className="text-gray-700">{String(value)}</span>
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-lg font-semibold text-gray-800">{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <div
                  key={String(field.key)}
                  className={`${field.fullWidth ? 'col-span-2' : ''} bg-gray-50/50 rounded-lg p-4 border border-gray-100`}
                >
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                    {field.label}
                  </dt>
                  <dd className="text-sm break-words">{renderValue(field)}</dd>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
