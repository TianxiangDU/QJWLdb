import { useState , useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { FilterConfig } from "@/types/resource"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

// 获取枚举选项
async function fetchEnumOptions(category: string) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/v1/enum-options?category=${category}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  return json.data || []
}

// 枚举筛选器组件
function EnumFilter({ 
  filter, 
  value, 
  onChange 
}: { 
  filter: FilterConfig
  value: string
  onChange: (v: string) => void 
}) {
  const { data: options = [], isLoading } = useQuery({
    queryKey: ['enumOptions', filter.enumCategory],
    queryFn: () => fetchEnumOptions(filter.enumCategory!),
    enabled: !!filter.enumCategory,
  })

  return (
    <Select
      value={value || ""}
      onValueChange={(v) => onChange(v === "__all__" ? "" : v)}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder={isLoading ? "加载中..." : (filter.placeholder || `选择${filter.label}`)} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">全部</SelectItem>
        {options.map((opt: any) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface ResourceFiltersProps {
  filters: FilterConfig[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onSearch: () => void
  onReset: () => void
}

export function ResourceFilters({
  filters,
  values,
  onChange,
  onSearch,
  onReset,
}: ResourceFiltersProps) {
  const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({})

  // 加载动态选项
  useEffect(() => {
    filters.forEach(async (filter) => {
      if (filter.optionsLoader && !filter.options) {
        try {
          const options = await filter.optionsLoader()
          setOptionsMap((prev) => ({ ...prev, [filter.key]: options }))
        } catch (error) {
          console.error(`Failed to load options for ${filter.key}:`, error)
        }
      }
    })
  }, [filters])

  const handleValueChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value })
  }

  const renderFilter = (filter: FilterConfig) => {
    const options = filter.options || optionsMap[filter.key] || []

    switch (filter.type) {
      case "enumSelect":
        return <EnumFilter filter={filter} value={values[filter.key]} onChange={(v) => handleValueChange(filter.key, v)} />

      case "select":
        return (
          <Select
            value={values[filter.key] || ""}
            onValueChange={(value) => handleValueChange(filter.key, value === "__all__" ? "" : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={filter.placeholder || `选择${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部</SelectItem>
              {options.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "text":
      default:
        return (
          <Input
            value={values[filter.key] || ""}
            onChange={(e) => handleValueChange(filter.key, e.target.value)}
            placeholder={filter.placeholder || `输入${filter.label}`}
            className="w-40"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch()
              }
            }}
          />
        )
    }
  }

  const hasActiveFilters = Object.values(values).some(
    (v) => v !== undefined && v !== null && v !== ""
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filter.label}</span>
          {renderFilter(filter)}
        </div>
      ))}

      <Button onClick={onSearch} size="sm">
        <Search className="mr-1 h-4 w-4" />
        搜索
      </Button>

      {hasActiveFilters && (
        <Button onClick={onReset} variant="ghost" size="sm">
          <X className="mr-1 h-4 w-4" />
          清除
        </Button>
      )}
    </div>
  )
}
