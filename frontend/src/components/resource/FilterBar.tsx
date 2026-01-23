import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, Loader2 } from "lucide-react"
import { FilterField, ResourceConfig } from "@/resources/types"

interface FilterBarProps {
  config: ResourceConfig
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onSearch: () => void
  onClear: () => void
}

/**
 * 通用筛选工具栏 (shadcn/ui 版本)
 */
export function FilterBar({
  config,
  values,
  onChange,
  onSearch,
  onClear,
}: FilterBarProps) {
  const [keyword, setKeyword] = useState(values.keyword || "")
  const [asyncOptions, setAsyncOptions] = useState<Record<string, any[]>>({})
  const [asyncLoading, setAsyncLoading] = useState<Record<string, boolean>>({})

  // 加载异步选择器选项
  useEffect(() => {
    config.list.filters?.forEach((filter) => {
      if (filter.type === "asyncSelect" && filter.optionsLoader) {
        setAsyncLoading((prev) => ({ ...prev, [filter.field]: true }))
        filter.optionsLoader().then((options) => {
          setAsyncOptions((prev) => ({ ...prev, [filter.field]: options }))
          setAsyncLoading((prev) => ({ ...prev, [filter.field]: false }))
        })
      }
    })
  }, [config])

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    onChange({ ...values, keyword: value })
  }

  const handleFilterChange = (field: string, value: any) => {
    onChange({ ...values, [field]: value })
  }

  const handleClear = () => {
    setKeyword("")
    onClear()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch()
    }
  }

  // 判断是否有激活的筛选条件
  const hasActiveFilters = Object.entries(values).some(
    ([_, value]) => value !== undefined && value !== "" && value !== null
  )

  // 渲染筛选字段
  const renderFilter = (filter: FilterField, index: number) => {
    switch (filter.type) {
      case "input":
        return (
          <Input
            key={index}
            placeholder={filter.placeholder || `输入${filter.label}`}
            value={values[filter.field] || ""}
            onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-40"
          />
        )

      case "select":
        return (
          <Select
            key={index}
            value={values[filter.field] !== undefined ? String(values[filter.field]) : undefined}
            onValueChange={(value) => handleFilterChange(filter.field, value === "_all_" ? undefined : value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">全部</SelectItem>
              {filter.options.map((opt) => (
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
            key={index}
            value={values[filter.field] !== undefined ? String(values[filter.field]) : undefined}
            onValueChange={(value) => handleFilterChange(filter.field, value === "_all_" ? undefined : value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">全部</SelectItem>
              {asyncLoading[filter.field] ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                (asyncOptions[filter.field] || []).map((opt) => (
                  <SelectItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )

      case "status":
        return (
          <Select
            key={index}
            value={values[filter.field || "status"] !== undefined ? String(values[filter.field || "status"]) : undefined}
            onValueChange={(value) => handleFilterChange(filter.field || "status", value === "_all_" ? undefined : Number(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder={filter.label || "状态"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">全部</SelectItem>
              <SelectItem value="1">启用</SelectItem>
              <SelectItem value="0">停用</SelectItem>
            </SelectContent>
          </Select>
        )

      case "dateRange":
        return (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="date"
              value={values[filter.fieldFrom] || ""}
              onChange={(e) => handleFilterChange(filter.fieldFrom, e.target.value)}
              className="w-36"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={values[filter.fieldTo] || ""}
              onChange={(e) => handleFilterChange(filter.fieldTo, e.target.value)}
              className="w-36"
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* 搜索框 */}
      {config.list.searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={config.list.searchable.placeholder || "搜索..."}
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 w-64"
          />
        </div>
      )}

      {/* 筛选字段 */}
      {config.list.filters?.map(renderFilter)}

      {/* 操作按钮 */}
      <Button onClick={onSearch}>
        <Search className="mr-2 h-4 w-4" />
        查询
      </Button>

      {hasActiveFilters && (
        <Button variant="outline" onClick={handleClear}>
          <X className="mr-2 h-4 w-4" />
          清除筛选
        </Button>
      )}
    </div>
  )
}
