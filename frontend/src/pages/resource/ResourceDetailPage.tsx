import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Pencil, Loader2 } from "lucide-react"
import { getResource } from "@/resources/registry"
import { createResourceApi } from "@/resources/api"
import { ResourceListPage } from "./ResourceListPage"
import { ColumnDef } from "@/resources/types"
import { Icon } from "@/components/common/Icon"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"

/**
 * 通用资源详情页 (shadcn/ui 版本)
 */
export function ResourceDetailPage() {
  const { resourceKey, id } = useParams<{ resourceKey: string; id: string }>()
  const navigate = useNavigate()

  const config = resourceKey ? getResource(resourceKey) : undefined

  if (!config || !config.detail?.enabled) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">该资源不存在或未开启详情页</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>
    )
  }

  const api = createResourceApi(config)

  const { data: record, isLoading } = useQuery({
    queryKey: [resourceKey, "detail", id],
    queryFn: () => api.get(id!),
    enabled: !!id,
  })

  // 渲染字段值
  const renderValue = (column: ColumnDef, value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>
    }

    switch (column.type) {
      case "date":
        return dayjs(value).format("YYYY-MM-DD")
      case "datetime":
        return dayjs(value).format("YYYY-MM-DD HH:mm")
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
      default:
        return String(value)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">未找到 ID 为 "{id}" 的记录</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>
    )
  }

  const headerFields = config.detail.headerFields || config.list.columns.slice(0, 5).map((c) => c.field)
  const displayColumns = config.list.columns.filter((c) => headerFields.includes(c.field))

  return (
    <div className="space-y-4">
      {/* 顶部卡片：主要信息 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/${resourceKey}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{config.name}详情</CardTitle>
          </div>
          <Button variant="outline" onClick={() => navigate(`/${resourceKey}`)}>
            <Pencil className="mr-2 h-4 w-4" />
            编辑
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">ID</div>
              <div>{record[config.api.idField || "id"]}</div>
            </div>
            {displayColumns.map((col) => (
              <div key={col.field}>
                <div className="text-sm font-medium text-muted-foreground mb-1">{col.header}</div>
                <div>{renderValue(col, record[col.field])}</div>
              </div>
            ))}
            {record.createdAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">创建时间</div>
                <div>{dayjs(record.createdAt).format("YYYY-MM-DD HH:mm")}</div>
              </div>
            )}
            {record.updatedAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">更新时间</div>
                <div>{dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm")}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs：子资源/关联信息 */}
      {config.detail.tabs && config.detail.tabs.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue={config.detail.tabs[0].key}>
              <TabsList>
                {config.detail.tabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key} className="gap-2">
                    {tab.icon && <Icon name={tab.icon} size={16} />}
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {config.detail.tabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key} className="mt-4">
                  {tab.kind === "childResource" && tab.child ? (
                    <ResourceListPage
                      resourceKey={tab.child.resourceKey}
                      parentFkField={tab.child.fkField}
                      parentId={id}
                      embedded
                    />
                  ) : tab.kind === "info" && tab.infoFields ? (
                    <div className="grid grid-cols-2 gap-4">
                      {tab.infoFields.map((field) => {
                        const col = config.list.columns.find((c) => c.field === field)
                        if (!col) return null
                        return (
                          <div key={field}>
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              {col.header}
                            </div>
                            <div>{record ? renderValue(col, record[field]) : "-"}</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ResourceDetailPage
