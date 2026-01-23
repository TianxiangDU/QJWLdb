import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Download,
  Upload,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash2,
  FileDown,
} from "lucide-react"

interface ResourceToolbarProps {
  selectedCount: number
  onAdd: () => void
  onBatchEnable?: () => void
  onBatchDisable?: () => void
  onBatchDelete?: () => void
  onDownloadTemplate?: () => void
  onImport?: (file: File) => void
  onExport?: () => void
  importable?: boolean
  exportable?: boolean
  batchable?: boolean
}

export function ResourceToolbar({
  selectedCount,
  onAdd,
  onBatchEnable,
  onBatchDisable,
  onBatchDelete,
  onDownloadTemplate,
  onImport,
  onExport,
  importable = true,
  exportable = true,
  batchable = true,
}: ResourceToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImport) {
      onImport(file)
      e.target.value = ""
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" />
          新增
        </Button>

        {importable && (
          <>
            <Button variant="outline" onClick={onDownloadTemplate}>
              <Download className="mr-1 h-4 w-4" />
              下载模板
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-1 h-4 w-4" />
              导入
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}

        {exportable && (
          <Button variant="outline" onClick={onExport}>
            <FileDown className="mr-1 h-4 w-4" />
            导出
          </Button>
        )}
      </div>

      {batchable && selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            已选择 {selectedCount} 项
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="mr-1 h-4 w-4" />
                批量操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onBatchEnable}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                批量启用
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBatchDisable}>
                <XCircle className="mr-2 h-4 w-4 text-yellow-500" />
                批量停用
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBatchDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                批量删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
