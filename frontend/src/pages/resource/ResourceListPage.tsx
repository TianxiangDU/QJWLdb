import React, { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { getResource } from "@/resources/registry"
import { createResourceApi } from "@/resources/api"
import { DataTable } from "@/components/resource/DataTable"
import { EntityForm } from "@/components/resource/EntityForm"
import { FilterBar } from "@/components/resource/FilterBar"
import { ActionBar } from "@/components/resource/ActionBar"
import { DetailModal } from "@/components/resource/DetailModal"
import { ResourceConfig, QueryParams } from "@/resources/types"
import { useToast } from "@/components/ui/toast"

interface ResourceListPageProps {
  resourceKey?: string
  parentFkField?: string
  parentId?: string | number
  embedded?: boolean
}

/**
 * 通用资源列表页面 (shadcn/ui 版本)
 */
export function ResourceListPage({
  resourceKey: propResourceKey,
  parentFkField,
  parentId,
  embedded = false,
}: ResourceListPageProps) {
  const params = useParams<{ resourceKey: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const resourceKey = propResourceKey || params.resourceKey
  const config = resourceKey ? getResource(resourceKey) : undefined

  // 查询参数
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 20,
  })

  // 选择状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])

  // 表单状态
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingRecord, setEditingRecord] = useState<any>(null)

  // 详情弹窗状态
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<any>(null)

  // 预览弹窗状态
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">未找到资源配置: {resourceKey}</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>
    )
  }

  const api = createResourceApi(config)

  const buildQueryParams = useCallback((): QueryParams => {
    const params = { ...queryParams }
    if (parentFkField && parentId) {
      params[parentFkField] = parentId
    }
    return params
  }, [queryParams, parentFkField, parentId])

  // 列表查询
  const {
    data: listData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [resourceKey, "list", buildQueryParams()],
    queryFn: () => api.list(buildQueryParams()),
    staleTime: 1000 * 60,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.create(data),
    onSuccess: () => {
      setFormOpen(false)
      refetch()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => api.update(id, data),
    onSuccess: () => {
      setFormOpen(false)
      setEditingRecord(null)
      refetch()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => api.delete(id),
    onSuccess: () => refetch(),
  })

  const batchEnableMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => api.batchEnable(ids),
    onSuccess: () => {
      setSelectedRowKeys([])
      setSelectedRows([])
      refetch()
    },
  })

  const batchDisableMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => api.batchDisable(ids),
    onSuccess: () => {
      setSelectedRowKeys([])
      setSelectedRows([])
      refetch()
    },
  })

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => api.batchDelete(ids),
    onSuccess: () => {
      setSelectedRowKeys([])
      setSelectedRows([])
      refetch()
    },
  })

  // Handlers
  const handleFilterChange = (values: Record<string, any>) => {
    setQueryParams((prev) => ({ ...prev, ...values, page: 1 }))
  }

  const handleSearch = () => {
    setQueryParams((prev) => ({ ...prev, page: 1 }))
    refetch()
  }

  const handleClearFilters = () => {
    setQueryParams({ page: 1, pageSize: queryParams.pageSize })
    refetch()
  }

  const handlePaginationChange = (page: number, pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize }))
  }

  const handleCreate = () => {
    setFormMode("create")
    setEditingRecord(null)
    setFormOpen(true)
  }

  const handleEdit = (record: any) => {
    setFormMode("edit")
    setEditingRecord(record)
    setFormOpen(true)
  }

  const handleView = (record: any) => {
    setDetailRecord(record)
    setDetailOpen(true)
  }

  const handleDelete = (record: any) => {
    deleteMutation.mutate(record[config.api.idField || "id"])
  }

  const handleFormSubmit = async (values: any) => {
    if (parentFkField && parentId) {
      values[parentFkField] = parentId
    }

    if (formMode === "create") {
      await createMutation.mutateAsync(values)
    } else {
      await updateMutation.mutateAsync({
        id: editingRecord[config.api.idField || "id"],
        data: values,
      })
    }
  }

  const handleImport = async (file: File) => {
    try {
      await api.import(file)
      refetch()
    } catch (error) {
      // Error handled in api
    }
  }

  const handleBulkExport = () => {
    const columns = config.list.columns
    const headers = columns.map((col) => col.header).join(",")
    const rows = selectedRows.map((row) =>
      columns.map((col) => {
        const value = row[col.field]
        if (value === null || value === undefined) return ""
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`
        }
        return value
      }).join(",")
    )
    const csv = [headers, ...rows].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${config.name}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast({ title: "导出成功" })
  }

  const handlePreview = (record: any, field: string) => {
    const url = record[field]
    if (!url) return
    const ext = url.split(".").pop()?.toLowerCase()
    if (["pdf", "png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) {
      setPreviewUrl(url)
      setPreviewOpen(true)
    } else {
      window.open(url, "_blank")
    }
  }

  const handleRowClick = (record: any) => {
    if (config.detail?.enabled) {
      navigate(`/${resourceKey}/${record[config.api.idField || "id"]}`)
    } else {
      handleView(record)
    }
  }

  const tableData = listData?.data || []
  const totalCount = listData?.meta?.total || 0

  // 表单容器
  const FormWrapper = config.form.mode === "dialog" ? Dialog : Sheet
  const FormContent = config.form.mode === "dialog" ? DialogContent : SheetContent
  const FormHeader = config.form.mode === "dialog" ? DialogHeader : SheetHeader
  const FormTitle = config.form.mode === "dialog" ? DialogTitle : SheetTitle

  const content = (
    <>
      <FilterBar
        config={config}
        values={queryParams}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      <ActionBar
        config={config}
        selectedCount={selectedRowKeys.length}
        selectedKeys={selectedRowKeys}
        onCreate={handleCreate}
        onImport={handleImport}
        onDownloadTemplate={() => api.downloadTemplate()}
        onExport={() => api.export(buildQueryParams())}
        onBulkEnable={() => batchEnableMutation.mutate(selectedRowKeys as (string | number)[])}
        onBulkDisable={() => batchDisableMutation.mutate(selectedRowKeys as (string | number)[])}
        onBulkDelete={() => batchDeleteMutation.mutate(selectedRowKeys as (string | number)[])}
        onBulkExport={handleBulkExport}
        onClearSelection={() => {
          setSelectedRowKeys([])
          setSelectedRows([])
        }}
      />

      <DataTable
        config={config}
        data={tableData}
        loading={isLoading}
        pagination={{
          current: queryParams.page || 1,
          pageSize: queryParams.pageSize || 20,
          total: totalCount,
          onChange: handlePaginationChange,
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys)
            setSelectedRows(rows)
          },
        }}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPreview={handlePreview}
        onRowClick={handleRowClick}
      />

      {/* 新增/编辑表单 */}
      <FormWrapper open={formOpen} onOpenChange={setFormOpen}>
        <FormContent className={config.form.mode === "sheet" ? "sm:max-w-lg" : ""}>
          <FormHeader>
            <FormTitle>
              {formMode === "create" ? config.form.titleCreate : config.form.titleEdit}
            </FormTitle>
          </FormHeader>
          <div className="mt-4">
            <EntityForm
              config={config}
              mode={formMode}
              initialValues={editingRecord}
              onSubmit={handleFormSubmit}
              onCancel={() => setFormOpen(false)}
              loading={createMutation.isPending || updateMutation.isPending}
              parentFkField={parentFkField}
              parentId={parentId}
            />
          </div>
        </FormContent>
      </FormWrapper>

      {/* 详情弹窗 */}
      <DetailModal
        config={config}
        record={detailRecord}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* 预览弹窗 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>文件预览</DialogTitle>
          </DialogHeader>
          {previewUrl.endsWith(".pdf") ? (
            <iframe src={previewUrl} className="w-full h-[60vh] border-0" />
          ) : (
            <img src={previewUrl} alt="预览" className="max-w-full max-h-[60vh] object-contain mx-auto" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )

  if (embedded) {
    return content
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.name}</CardTitle>
        {config.description && <CardDescription>{config.description}</CardDescription>}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export default ResourceListPage
