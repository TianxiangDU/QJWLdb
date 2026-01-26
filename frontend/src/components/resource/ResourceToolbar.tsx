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
    <div className="flex items-center gap-2">
      <Button onClick={onAdd} size="sm" className="h-8">
        <Plus className="mr-1.5 h-4 w-4" />
        新增
      </Button>

      {importable && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8" 
            onClick={onDownloadTemplate}
          >
            <Download className="mr-1.5 h-4 w-4" />
            模板
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-4 w-4" />
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
        <Button variant="outline" size="sm" className="h-8" onClick={onExport}>
          <FileDown className="mr-1.5 h-4 w-4" />
          导出
        </Button>
      )}

      {batchable && selectedCount > 0 && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <span className="text-sm text-gray-600">
            已选 <span className="font-medium text-blue-600">{selectedCount}</span> 项
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <MoreHorizontal className="mr-1.5 h-4 w-4" />
                批量
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={onBatchEnable} className="cursor-pointer">
                <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                启用
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBatchDisable} className="cursor-pointer">
                <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                停用
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBatchDelete} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}
