import React, { useState, useEffect } from "react"
import { FormFieldConfig } from "@/types/resource"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Loading } from "@/components/ui/loading"
import { cn } from "@/lib/utils"

interface ResourceFormProps<T> {
  open: boolean
  onClose: () => void
  title: string
  fields: FormFieldConfig<T>[]
  initialValues?: Partial<T>
  onSubmit: (values: Partial<T>) => Promise<void>
  isEdit?: boolean
}

export function ResourceForm<T>({
  open,
  onClose,
  title,
  fields,
  initialValues,
  onSubmit,
  isEdit = false,
}: ResourceFormProps<T>) {
  const [values, setValues] = useState<Partial<T>>({})
  const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 初始化表单值
  useEffect(() => {
    if (open) {
      const initial: any = {}
      fields.forEach((field) => {
        if (initialValues && (initialValues as any)[field.key] !== undefined) {
          initial[field.key] = (initialValues as any)[field.key]
        } else if (field.defaultValue !== undefined) {
          initial[field.key] = field.defaultValue
        }
      })
      setValues(initial)
      setErrors({})
    }
  }, [open, initialValues, fields])

  // 加载动态选项
  useEffect(() => {
    if (open) {
      fields.forEach(async (field) => {
        if (field.optionsLoader && !field.options) {
          try {
            const options = await field.optionsLoader()
            setOptionsMap((prev) => ({ ...prev, [field.key as string]: options }))
          } catch (error) {
            console.error(`Failed to load options for ${String(field.key)}:`, error)
          }
        }
      })
    }
  }, [open, fields])

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required) {
        const value = (values as any)[field.key]
        if (value === undefined || value === null || value === "") {
          newErrors[field.key as string] = `${field.label}不能为空`
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit(values)
      onClose()
    } catch (error) {
      console.error("Submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: FormFieldConfig<T>) => {
    // 隐藏条件
    if (field.hidden?.(values)) return null
    if (field.editOnly && !isEdit) return null
    if (field.createOnly && isEdit) return null

    const value = (values as any)[field.key]
    const options = field.options || optionsMap[field.key as string] || []
    const error = errors[field.key as string]

    return (
      <div key={String(field.key)} className="space-y-2">
        <Label htmlFor={String(field.key)} className={cn(error && "text-destructive")}>
          {field.label}
          {field.required && <span className="text-destructive"> *</span>}
        </Label>

        {field.type === "textarea" ? (
          <Textarea
            id={String(field.key)}
            value={value || ""}
            onChange={(e) => handleChange(String(field.key), e.target.value)}
            placeholder={field.placeholder}
            className={cn(error && "border-destructive")}
          />
        ) : field.type === "select" ? (
          <Select
            value={value !== undefined ? String(value) : ""}
            onValueChange={(v) => handleChange(String(field.key), v)}
          >
            <SelectTrigger className={cn(error && "border-destructive")}>
              <SelectValue placeholder={field.placeholder || `选择${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "switch" ? (
          <div className="flex items-center space-x-2">
            <Switch
              id={String(field.key)}
              checked={!!value}
              onCheckedChange={(checked) => handleChange(String(field.key), checked ? 1 : 0)}
            />
            <Label htmlFor={String(field.key)}>{value ? "是" : "否"}</Label>
          </div>
        ) : field.type === "number" ? (
          <Input
            id={String(field.key)}
            type="number"
            value={value ?? ""}
            onChange={(e) => handleChange(String(field.key), e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder}
            className={cn(error && "border-destructive")}
          />
        ) : (
          <Input
            id={String(field.key)}
            value={value || ""}
            onChange={(e) => handleChange(String(field.key), e.target.value)}
            placeholder={field.placeholder}
            className={cn(error && "border-destructive")}
          />
        )}

        {field.help && (
          <p className="text-xs text-muted-foreground">{field.help}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {isEdit ? "编辑记录信息" : "填写新记录信息"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {fields.map(renderField)}
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loading size="sm" /> : isEdit ? "保存" : "创建"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
