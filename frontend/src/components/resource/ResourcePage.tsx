import React, { useState, useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ResourceConfig, ResourceApi, DetailFieldConfig } from "@/types/resource"
import { ResourceTable } from "./ResourceTable"
import { ResourceFilters } from "./ResourceFilters"
import { ResourceForm } from "./ResourceForm"
import { ResourceDetail } from "./ResourceDetail"
import { ResourceToolbar } from "./ResourceToolbar"
import { SimplePagination } from "@/components/ui/pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { Eye, Pencil, Trash2 } from "lucide-react"

interface ResourcePageProps<T> {
  config: ResourceConfig<T>
  api: ResourceApi<T>
}

export function ResourcePage<T extends { id: number; status?: number }>({
  config,
  api,
}: ResourcePageProps<T>) {
  const queryClient = useQueryClient()

  // 状态
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({})
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<T | null>(null)
  const [detailRecord, setDetailRecord] = useState<T | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "single" | "batch"; id?: number } | null>(null)

  // 查询数据
  const { data, isLoading, refetch } = useQuery({
    queryKey: [config.key, page, pageSize, appliedFilters],
    queryFn: () => api.list({ page, pageSize, ...appliedFilters }),
  })

  // 创建
  const createMutation = useMutation({
    mutationFn: (values: Partial<T>) => api.create(values),
    onSuccess: () => {
      toast({ title: "创建成功", variant: "success" })
      queryClient.invalidateQueries({ queryKey: [config.key] })
    },
    onError: (error: any) => {
      toast({ title: "创建失败", description: error.message, variant: "destructive" })
    },
  })

  // 更新
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Partial<T> }) => api.update(id, values),
    onSuccess: () => {
      toast({ title: "保存成功", variant: "success" })
      queryClient.invalidateQueries({ queryKey: [config.key] })
    },
    onError: (error: any) => {
      toast({ title: "保存失败", description: error.message, variant: "destructive" })
    },
  })

  // 删除
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(id),
    onSuccess: () => {
      toast({ title: "删除成功", variant: "success" })
      queryClient.invalidateQueries({ queryKey: [config.key] })
    },
    onError: (error: any) => {
      toast({ title: "删除失败", description: error.message, variant: "destructive" })
    },
  })

  // 批量操作
  const batchEnableMutation = useMutation({
    mutationFn: () => api.batchEnable?.(selectedIds) || Promise.resolve(),
    onSuccess: () => {
      toast({ title: "批量启用成功", variant: "success" })
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: [config.key] })
    },
    onError: (error: any) => {
      toast({ title: "操作失败", description: error.message, variant: "destructive" })
    },
  })

  const batchDisableMutation = useMutation({
    mutationFn: () => api.batchDisable?.(selectedIds) || Promise.resolve(),
    onSuccess: () => {
      toast({ title: "批量停用成功", variant: "success" })
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: [config.key] })
    },
    onError: (error: any) => {
      toast({ title: "操作失败", description: error.message, variant: "destructive" })
    },
  })

  const batchDeleteMutation = useMutation({
    mutationFn: () => api.batchDelete?.(selectedIds) || Promise.resolve(),
    onSuccess: () => {
      toast({ title: "批量删除成功", variant: "success" })
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: [config.key] })
    },
    onError: (error: any) => {
      toast({ title: "操作失败", description: error.message, variant: "destructive" })
    },
  })

  // 导入
  const importMutation = useMutation({
    mutationFn: (file: File) => api.import?.(file) || Promise.resolve({ success: 0, failed: 0, errors: [] }),
    onSuccess: (result) => {
      toast({
        title: "导入完成",
        description: `成功 ${result.success} 条，失败 ${result.failed} 条`,
        variant: result.failed > 0 ? "destructive" : "success",
      })
      queryClient.invalidateQueries({ queryKey: [config.key] })
    },
    onError: (error: any) => {
      toast({ title: "导入失败", description: error.message, variant: "destructive" })
    },
  })

  // 操作列
  const columnsWithActions = useMemo(() => {
    return [
      ...config.columns,
      {
        key: "__actions__",
        title: "操作",
        width: 120,
        render: (_: any, record: T) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDetailRecord(record)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditRecord(record)
                setFormOpen(true)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteConfirm({ type: "single", id: record.id })}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ]
  }, [config.columns])

  // 详情字段（如果没配置，使用表单字段）
  const detailFields: DetailFieldConfig<T>[] = useMemo(() => {
    if (config.detailFields) return config.detailFields

    return [
      ...config.formFields.map((f) => ({
        key: f.key,
        label: f.label,
      })),
      { key: "status", label: "状态" },
      { key: "createdAt", label: "创建时间" },
      { key: "updatedAt", label: "更新时间" },
    ] as DetailFieldConfig<T>[]
  }, [config.detailFields, config.formFields])

  // 处理函数
  const handleSearch = useCallback(() => {
    setPage(1)
    setAppliedFilters(filters)
  }, [filters])

  const handleReset = useCallback(() => {
    setFilters({})
    setAppliedFilters({})
    setPage(1)
  }, [])

  const handleFormSubmit = useCallback(
    async (values: Partial<T>) => {
      if (editRecord) {
        await updateMutation.mutateAsync({ id: editRecord.id, values })
      } else {
        await createMutation.mutateAsync(values)
      }
    },
    [editRecord, createMutation, updateMutation]
  )

  const handleDelete = useCallback(() => {
    if (deleteConfirm?.type === "single" && deleteConfirm.id) {
      deleteMutation.mutate(deleteConfirm.id)
    } else if (deleteConfirm?.type === "batch") {
      batchDeleteMutation.mutate()
    }
    setDeleteConfirm(null)
  }, [deleteConfirm, deleteMutation, batchDeleteMutation])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{config.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 筛选 */}
          {config.filters && config.filters.length > 0 && (
            <ResourceFilters
              filters={config.filters}
              values={filters}
              onChange={setFilters}
              onSearch={handleSearch}
              onReset={handleReset}
            />
          )}

          {/* 工具栏 */}
          <ResourceToolbar
            selectedCount={selectedIds.length}
            onAdd={() => {
              setEditRecord(null)
              setFormOpen(true)
            }}
            onBatchEnable={() => batchEnableMutation.mutate()}
            onBatchDisable={() => batchDisableMutation.mutate()}
            onBatchDelete={() => setDeleteConfirm({ type: "batch" })}
            onDownloadTemplate={() => api.downloadTemplate?.()}
            onImport={(file) => importMutation.mutate(file)}
            onExport={() => api.export?.(appliedFilters)}
            importable={config.importable}
            exportable={config.exportable}
            batchable={config.batchable}
          />

          {/* 表格 */}
          <ResourceTable
            data={data?.data || []}
            columns={columnsWithActions}
            loading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={(record) => setDetailRecord(record)}
          />

          {/* 分页 */}
          {data?.meta && (
            <SimplePagination
              page={data.meta.page}
              pageSize={data.meta.pageSize}
              total={data.meta.total}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>

      {/* 表单 */}
      <ResourceForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditRecord(null)
        }}
        title={editRecord ? `编辑${config.name}` : `新增${config.name}`}
        fields={config.formFields}
        initialValues={editRecord || undefined}
        onSubmit={handleFormSubmit}
        isEdit={!!editRecord}
      />

      {/* 详情 */}
      <ResourceDetail
        open={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        title={`${config.name}详情`}
        record={detailRecord}
        fields={detailFields}
      />

      {/* 删除确认 */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === "batch"
                ? `确定要删除选中的 ${selectedIds.length} 条记录吗？此操作不可撤销。`
                : "确定要删除这条记录吗？此操作不可撤销。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
