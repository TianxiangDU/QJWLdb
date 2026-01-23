import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Option {
  label: string
  value: string | number
}

interface SearchableSelectProps {
  options: Option[]
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = '请选择',
  searchPlaceholder = '搜索...',
  emptyText = '暂无选项',
  loading = false,
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // 过滤选项
  const filteredOptions = useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lower) ||
        String(opt.value).toLowerCase().includes(lower)
    )
  }, [options, search])

  // 获取当前选中的标签
  const selectedLabel = useMemo(() => {
    if (value === undefined || value === null || value === '') return null
    const found = options.find((opt) => String(opt.value) === String(value))
    return found?.label
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
          disabled={disabled || loading}
        >
          {loading ? (
            <span className="text-muted-foreground">加载中...</span>
          ) : selectedLabel ? (
            <span className="truncate">{selectedLabel}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? '加载中...' : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((opt) => (
                <CommandItem
                  key={String(opt.value)}
                  value={String(opt.value)}
                  onSelect={() => {
                    onChange?.(opt.value)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      String(value) === String(opt.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
