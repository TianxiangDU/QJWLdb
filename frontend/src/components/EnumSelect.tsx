import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnumOption {
  value: string
  label: string
  parentValue?: string
}

interface EnumSelectProps {
  category: string
  value?: string
  onChange?: (value: string) => void
  parentValue?: string  // 用于级联（如小类依赖大类）
  placeholder?: string
  allowAdd?: boolean
  disabled?: boolean
  className?: string
}

const API_BASE = '/api/v1'

async function fetchEnumOptions(category: string, parentValue?: string): Promise<EnumOption[]> {
  const token = localStorage.getItem('token')
  let url = `${API_BASE}/enum-options?category=${category}`
  if (parentValue) {
    url += `&parentValue=${encodeURIComponent(parentValue)}`
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  // 后端响应格式: { data: [...], meta: {} }
  return json.data || []
}

async function addEnumOption(
  category: string,
  value: string,
  parentValue?: string
): Promise<EnumOption> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/enum-options`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ category, value, parentValue }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '添加失败')
  }
  const data = await res.json()
  return data.data
}

export function EnumSelect({
  category,
  value,
  onChange,
  parentValue,
  placeholder = '请选择',
  allowAdd = true,
  disabled = false,
  className,
}: EnumSelectProps) {
  const queryClient = useQueryClient()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newValue, setNewValue] = useState('')

  // 查询选项
  const { data: options = [], isLoading } = useQuery({
    queryKey: ['enumOptions', category, parentValue],
    queryFn: () => fetchEnumOptions(category, parentValue),
    enabled: !!category,
  })

  // 当父级值变化时，清空当前值（如果当前值不在新选项中）
  useEffect(() => {
    if (value && options.length > 0) {
      const exists = options.some((opt) => opt.value === value)
      if (!exists && onChange) {
        onChange('')
      }
    }
  }, [parentValue, options])

  // 新增选项
  const addMutation = useMutation({
    mutationFn: () => addEnumOption(category, newValue, parentValue),
    onSuccess: (newOpt) => {
      queryClient.invalidateQueries({ queryKey: ['enumOptions', category] })
      onChange?.(newOpt.value)
      setAddDialogOpen(false)
      setNewValue('')
    },
  })

  const handleAdd = () => {
    if (!newValue.trim()) return
    addMutation.mutate()
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Select
        value={value || ''}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={isLoading ? '加载中...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
          {options.length === 0 && !isLoading && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              暂无选项
            </div>
          )}
        </SelectContent>
      </Select>

      {allowAdd && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setAddDialogOpen(true)}
          disabled={disabled}
          title="新增选项"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>新增选项</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="请输入新选项"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!newValue.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? '添加中...' : '确定'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
