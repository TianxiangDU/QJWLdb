import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react"

interface FilePreviewDialogProps {
  open: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  description?: string
}

export function FilePreviewDialog({
  open,
  onClose,
  fileUrl,
  fileName,
  description,
}: FilePreviewDialogProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 判断文件类型
  const getFileType = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || ""
    if (["pdf"].includes(ext)) return "pdf"
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image"
    if (["doc", "docx"].includes(ext)) return "word"
    if (["xls", "xlsx"].includes(ext)) return "excel"
    return "other"
  }

  const fileType = getFileType(fileName)
  
  // 构建完整的文件 URL
  const fullUrl = fileUrl.startsWith("http") ? fileUrl : fileUrl

  // 下载文件
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = fullUrl
    link.download = fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 新窗口打开
  const handleOpenInNewTab = () => {
    window.open(fullUrl, "_blank")
  }

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  // 重置状态
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setLoading(true)
      setError(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="truncate max-w-md" title={fileName}>
                {fileName}
              </span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="h-8"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                新窗口
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="h-8 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
            </div>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden bg-gray-100">
          {/* PDF 预览 */}
          {fileType === "pdf" && (
            <div className="w-full h-[70vh] relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              <iframe
                src={`${fullUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}

          {/* 图片预览 */}
          {fileType === "image" && (
            <div className="w-full h-[70vh] flex items-center justify-center p-4 relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              <img
                src={fullUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}

          {/* Word/Excel 文件 - 使用 Office Online */}
          {(fileType === "word" || fileType === "excel") && (
            <div className="w-full h-[70vh] flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">{fileName}</p>
              <p className="text-muted-foreground mb-4">
                {fileType === "word" ? "Word" : "Excel"} 文件不支持在线预览，请下载后查看
              </p>
              <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                下载文件
              </Button>
            </div>
          )}

          {/* 其他文件类型 */}
          {fileType === "other" && (
            <div className="w-full h-[70vh] flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">{fileName}</p>
              <p className="text-muted-foreground mb-4">
                该文件类型不支持在线预览，请下载后查看
              </p>
              <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                下载文件
              </Button>
            </div>
          )}

          {/* 加载错误 */}
          {error && (
            <div className="w-full h-[70vh] flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-16 w-16 text-red-400 mb-4" />
              <p className="text-lg font-medium mb-2">加载失败</p>
              <p className="text-muted-foreground mb-4">
                文件预览加载失败，请尝试下载后查看
              </p>
              <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                下载文件
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
