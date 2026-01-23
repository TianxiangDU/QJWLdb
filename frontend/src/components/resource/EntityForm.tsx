import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import { FormField, ResourceConfig } from "@/resources/types"
import { createResourceApi } from "@/resources/api"
import { getResource } from "@/resources/registry"
import { cn } from "@/lib/utils"

interface EntityFormProps {
  config: ResourceConfig
  mode: "create" | "edit"
  initialValues?: any
  onSubmit: (values: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
  parentFkField?: string
  parentId?: string | number
}

/**
 * 动态实体表单组件 (shadcn/ui 版本)
 */
export function EntityForm({
  config,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading,
  parentFkField,
  parentId,
}: EntityFormProps) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // 关联选择器的选项缓存
  const [relationOptions, setRelationOptions] = useState<Record<string, any[]>>({})
  const [relationLoading, setRelationLoading] = useState<Record<string, boolean>>({})

  // 异步选择器的选项缓存
  const [asyncSelectOptions, setAsyncSelectOptions] = useState<Record<string, any[]>>({})
  const [asyncLoading, setAsyncLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues)
    } else {
      // 初始化默认值
      const defaultValues: Record<string, any> = {}
      if (parentFkField && parentId) {
        defaultValues[parentFkField] = parentId
      }
      setValues(defaultValues)
    }
    setErrors({})
  }, [initialValues, parentFkField, parentId])

  // 加载异步选择器选项
  useEffect(() => {
    config.form.fields.forEach((field) => {
      if (field.type === "asyncSelect" && field.optionsLoader) {
        setAsyncLoading((prev) => ({ ...prev, [field.field]: true }))
        field.optionsLoader().then((options) => {
          setAsyncSelectOptions((prev) => ({ ...prev, [field.field]: options }))
          setAsyncLoading((prev) => ({ ...prev, [field.field]: false }))
        })
      }
    })
  }, [config])

  // 更新字段值
  const updateValue = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // 搜索关联资源
  const searchRelation = async (field: FormField & { type: "relationSelect" }, keyword: string) => {
    const relationConfig = getResource(field.relation.resourceKey)
    if (!relationConfig) return

    setRelationLoading((prev) => ({ ...prev, [field.field]: true }))
    try {
      const api = createResourceApi(relationConfig)
      const results = await api.searchRelation(
        field.relation.resourceKey,
        keyword,
        field.relation.searchField
      )
      setRelationOptions((prev) => ({
        ...prev,
        [field.field]: results.map((item) => ({
          label: item[field.relation.labelField],
          value: String(item[field.relation.valueField]),
        })),
      }))
    } finally {
      setRelationLoading((prev) => ({ ...prev, [field.field]: false }))
    }
  }

  // 验证表单
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    config.form.fields.forEach((field) => {
      const value = values[field.field]
      if (field.required && (value === undefined || value === null || value === "")) {
        newErrors[field.field] = `请输入${field.label}`
      }
    })

    // 自定义校验
    if (config.form.validate) {
      const result = config.form.validate(values)
      if (!result.ok && result.message) {
        newErrors._form = result.message
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  // 渲染表单字段
  const renderFormField = (field: FormField) => {
    const isEditDisabled = mode === "edit" && "editDisabled" in field && field.editDisabled
    const error = errors[field.field]
    const value = values[field.field]

    const fieldContent = (() => {
      switch (field.type) {
        case "input":
          return (
            <Input
              value={value || ""}
              onChange={(e) => updateValue(field.field, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              disabled={isEditDisabled}
              className={cn(error && "border-destructive")}
            />
          )

        case "textarea":
          return (
            <Textarea
              value={value || ""}
              onChange={(e) => updateValue(field.field, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className={cn(error && "border-destructive")}
            />
          )

        case "number":
          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={value ?? ""}
                onChange={(e) => updateValue(field.field, e.target.value ? Number(e.target.value) : undefined)}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
                className={cn(error && "border-destructive")}
              />
              {field.unit && <span className="text-muted-foreground">{field.unit}</span>}
            </div>
          )

        case "select":
          return (
            <Select
              value={value !== undefined ? String(value) : undefined}
              onValueChange={(v) => updateValue(field.field, v)}
            >
              <SelectTrigger className={cn(error && "border-destructive")}>
                <SelectValue placeholder={field.placeholder || `选择${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((opt) => (
                  <SelectItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )

        case "asyncSelect":
          return (
            <Select
              value={value !== undefined ? String(value) : undefined}
              onValueChange={(v) => updateValue(field.field, v)}
            >
              <SelectTrigger className={cn(error && "border-destructive")}>
                <SelectValue placeholder={field.placeholder || `选择${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {asyncLoading[field.field] ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  (asyncSelectOptions[field.field] || []).map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )

        case "switch":
          return (
            <Switch
              checked={value === (field.trueValue ?? true)}
              onCheckedChange={(checked) =>
                updateValue(field.field, checked ? (field.trueValue ?? true) : (field.falseValue ?? false))
              }
            />
          )

        case "date":
          return (
            <Input
              type="date"
              value={value || ""}
              onChange={(e) => updateValue(field.field, e.target.value)}
              className={cn(error && "border-destructive")}
            />
          )

        case "fileUpload":
          return (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept={field.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    updateValue(field.field, file)
                  }
                }}
                className={cn(error && "border-destructive")}
              />
            </div>
          )

        case "relationSelect":
          return (
            <Select
              value={value !== undefined ? String(value) : undefined}
              onValueChange={(v) => updateValue(field.field, v)}
              onOpenChange={(open) => {
                if (open && !relationOptions[field.field]?.length) {
                  searchRelation(field, "")
                }
              }}
              disabled={!!parentFkField && field.field === parentFkField}
            >
              <SelectTrigger className={cn(error && "border-destructive")}>
                <SelectValue placeholder={field.placeholder || `选择${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {relationLoading[field.field] ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  (relationOptions[field.field] || []).map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )

        default:
          return null
      }
    })()

    return (
      <div key={field.field} className="space-y-2">
        <Label htmlFor={field.field} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
          {field.label}
        </Label>
        {fieldContent}
        {field.helpText && (
          <p className="text-sm text-muted-foreground">{field.helpText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {config.form.fields.map(renderFormField)}

          {errors._form && (
            <p className="text-sm text-destructive text-center">{errors._form}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "创建" : "保存"}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
