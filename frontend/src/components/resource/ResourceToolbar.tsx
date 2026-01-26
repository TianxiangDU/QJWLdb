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
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          onClick={onAdd} 
          size="sm" 
          className="h-9 px-4 bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          新增
        </Button>

        {importable && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 border-gray-300 hover:bg-gray-50" 
              onClick={onDownloadTemplate}
            >
              <Download className="mr-1.5 h-4 w-4 text-gray-500" />
              下载模板
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 border-gray-300 hover:bg-gray-50" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-4 w-4 text-gray-500" />
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
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3 border-gray-300 hover:bg-gray-50" 
            onClick={onExport}
          >
            <FileDown className="mr-1.5 h-4 w-4 text-gray-500" />
            导出
          </Button>
        )}
      </div>

      {batchable && selectedCount > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <span className="text-sm font-medium text-blue-700">
            已选择 <span className="text-blue-900">{selectedCount}</span> 项
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-blue-200 bg-white hover:bg-blue-50">
                <MoreHorizontal className="mr-1.5 h-4 w-4" />
                批量操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onBatchEnable} className="cursor-pointer">
                <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                批量启用
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBatchDisable} className="cursor-pointer">
                <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                批量停用
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBatchDelete} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
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
