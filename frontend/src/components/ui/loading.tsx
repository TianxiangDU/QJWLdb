import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loading size="lg" text="加载中..." />
    </div>
  )
}

export function TableLoading() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Loading text="加载数据中..." />
    </div>
  )
}
