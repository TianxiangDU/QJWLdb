import { useState, useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ResourceConfig, ResourceApi, DetailFieldConfig } from "@/types/resource"
import { ResourceTable } from "./ResourceTable"
import { ResourceFilters } from "./ResourceFilters"
import { ResourceForm } from "./ResourceForm"
import { ResourceDetail } from "./ResourceDetail"
import { ResourceToolbar } from "./ResourceToolbar"
import { SimplePagination } from "@/components/ui/pagination"
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

  // 从 localStorage 读取全局 pageSize
  const getGlobalPageSize = () => {
    try {
      const saved = localStorage.getItem('app_page_size')
      return saved ? parseInt(saved, 10) : 10
    } catch {
      return 10
    }
  }

  // 状态
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(getGlobalPageSize)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({})
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<T | null>(null)
  const [detailRecord, setDetailRecord] = useState<T | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "single" | "batch"; id?: number } | null>(null)

  // 查询数据
  const { data, isLoading } = useQuery({
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
    mutationFn: (file: File) => api.import?.(file) || Promise.resolve({ success: 0, failed: 0, created: 0, updated: 0, skipped: 0, errors: [] }),
    onSuccess: (response: any) => {
      const result = response?.data || response
      const errors: string[] = result?.errors || []
      
      if (errors.length > 0) {
        console.log('导入失败详情:', errors)
        // 使用 alert 显示完整错误信息，方便用户查看
        const errorList = errors.map((e, i) => `${i + 1}. ${e}`).join('\n')
        alert(`导入完成\n\n成功: ${result?.success ?? 0} 条\n失败: ${result?.failed ?? 0} 条\n\n失败详情:\n${errorList}`)
      }
      
      toast({
        title: "导入完成",
        description: `成功 ${result?.success ?? 0} 条，失败 ${result?.failed ?? 0} 条`,
        variant: (result?.failed ?? 0) > 0 ? "destructive" : "default",
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
        width: 100,
        render: (_: any, record: T) => (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setDetailRecord(record)}
              title="查看详情"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-600"
              onClick={() => {
                setEditRecord(record)
                setFormOpen(true)
              }}
              title="编辑"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              onClick={() => setDeleteConfirm({ type: "single", id: record.id })}
              title="删除"
            >
              <Trash2 className="h-4 w-4" />
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
    <div className="h-full flex flex-col min-w-0">
      {/* 页面标题和工具栏 */}
      <div className="flex-shrink-0 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{config.name}</h1>
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
          onExport={async () => {
            try {
              await api.export?.(appliedFilters)
              toast({ title: "导出成功", description: "文件已开始下载" })
            } catch (error: any) {
              toast({ title: "导出失败", description: error.message, variant: "destructive" })
            }
          }}
          importable={config.importable}
          exportable={config.exportable}
          batchable={config.batchable}
        />
      </div>

      {/* 筛选区域 */}
      {config.filters && config.filters.length > 0 && (
        <div className="flex-shrink-0 mb-4">
          <ResourceFilters
            filters={config.filters}
            values={filters}
            onChange={setFilters}
            onSearch={handleSearch}
            onReset={handleReset}
          />
        </div>
      )}

      {/* 表格区域 */}
      <div className="flex-1 min-h-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <ResourceTable
          data={data?.data || []}
          columns={columnsWithActions}
          loading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(record) => setDetailRecord(record)}
        />
      </div>

      {/* 分页 */}
      {data?.meta && (
        <div className="flex-shrink-0 mt-3">
          <SimplePagination
            page={data.meta.page}
            pageSize={data.meta.pageSize}
            total={data.meta.total}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
              localStorage.setItem('app_page_size', String(size))
            }}
          />
        </div>
      )}

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
