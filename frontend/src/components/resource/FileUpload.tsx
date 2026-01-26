import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  value?: string
  onChange: (filePath: string, fileName: string) => void
  placeholder?: string
  accept?: string
  className?: string
  error?: boolean
}

export function FileUpload({
  value,
  onChange,
  placeholder = "上传文件",
  accept,
  className,
  error,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const token = localStorage.getItem("qjwl_token")
      const response = await fetch("/api/v1/files/upload?subDir=samples", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("上传失败")
      }

      const result = await response.json()
      // 服务端返回 { url, originalName, filename }
      setFileName(result.originalName || file.name)
      onChange(result.url, result.originalName || file.name)
    } catch (err) {
      console.error("文件上传失败:", err)
      alert("文件上传失败，请重试")
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setFileName("")
    onChange("", "")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  // 如果已有值，从路径中提取文件名
  const displayName = fileName || (value ? value.split("/").pop() : "")

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      
      {value ? (
        <div className={cn(
          "flex-1 flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50",
          error && "border-destructive"
        )}>
          <FileText className="h-4 w-4 text-blue-600" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm text-blue-600 hover:underline truncate"
            title={displayName}
          >
            {displayName}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={cn("w-full", error && "border-destructive")}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {placeholder}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
