import React, { useRef } from "react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Upload,
  Download,
  FileDown,
  CheckCircle,
  XCircle,
  Trash2,
  X,
} from "lucide-react"
import { ResourceConfig, ListAction, BulkAction } from "@/resources/types"

interface ActionBarProps {
  config: ResourceConfig
  selectedCount: number
  selectedKeys: React.Key[]
  onCreate?: () => void
  onImport?: (file: File) => Promise<void>
  onDownloadTemplate?: () => void
  onExport?: () => void
  onBulkEnable?: () => void
  onBulkDisable?: () => void
  onBulkDelete?: () => void
  onBulkExport?: () => void
  onClearSelection?: () => void
}

/**
 * 操作按钮栏 (shadcn/ui 版本)
 */
export function ActionBar({
  config,
  selectedCount,
  selectedKeys,
  onCreate,
  onImport,
  onDownloadTemplate,
  onExport,
  onBulkEnable,
  onBulkDisable,
  onBulkDelete,
  onBulkExport,
  onClearSelection,
}: ActionBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { actions, bulkActions } = config.list

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImport) {
      await onImport(file)
      // 清空 input 以便再次选择相同文件
      e.target.value = ""
    }
  }

  // 渲染单个操作按钮
  const renderAction = (action: ListAction, index: number) => {
    switch (action.type) {
      case "create":
        return (
          <Button key={index} onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {action.label || "新增"}
          </Button>
        )

      case "import":
        return (
          <div key={index}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              {action.label || "导入"}
            </Button>
          </div>
        )

      case "downloadTemplate":
        return (
          <Button key={index} variant="outline" onClick={onDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            {action.label || "下载模板"}
          </Button>
        )

      case "export":
        return (
          <Button key={index} variant="outline" onClick={onExport}>
            <FileDown className="mr-2 h-4 w-4" />
            {action.label || "导出"}
          </Button>
        )

      case "custom":
        return (
          <Button key={index} variant="outline" onClick={() => action.onClick?.({})}>
            {action.label}
          </Button>
        )

      default:
        return null
    }
  }

  // 渲染批量操作按钮
  const renderBulkAction = (action: BulkAction, index: number) => {
    switch (action.type) {
      case "bulkEnable":
        return (
          <AlertDialog key={index}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                {action.label || "批量启用"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认批量启用</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要启用选中的 {selectedCount} 条记录吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onBulkEnable}>确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )

      case "bulkDisable":
        return (
          <AlertDialog key={index}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                {action.label || "批量停用"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认批量停用</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要停用选中的 {selectedCount} 条记录吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onBulkDisable}>确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )

      case "bulkDelete":
        return (
          <AlertDialog key={index}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                {action.label || "批量删除"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要删除选中的 {selectedCount} 条记录吗？此操作不可恢复！
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onBulkDelete}>确定删除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )

      case "bulkExport":
        return (
          <Button key={index} variant="outline" size="sm" onClick={onBulkExport}>
            <FileDown className="mr-2 h-4 w-4" />
            {action.label || "批量导出"}
          </Button>
        )

      default:
        return null
    }
  }

  return (
    <div className="mb-4 space-y-3">
      {/* 顶部操作按钮 */}
      <div className="flex flex-wrap items-center gap-2">
        {actions?.map(renderAction)}
      </div>

      {/* 批量操作栏 */}
      {selectedCount > 0 && bulkActions && bulkActions.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-950 p-3">
          <div className="flex items-center gap-2 text-sm">
            <span>
              已选择 <strong className="text-primary">{selectedCount}</strong> 项
            </span>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="mr-1 h-3 w-3" />
              取消选择
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map(renderBulkAction)}
          </div>
        </div>
      )}
    </div>
  )
}
