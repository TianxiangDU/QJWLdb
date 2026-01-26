import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getToken } from "@/services/api-client"

interface EnumOption {
  id: number
  category: string
  value: string
  label: string
  parentValue?: string
}

interface EnumSelectProps {
  category: string
  value?: string
  onChange: (value: string) => void
  parentValue?: string
  placeholder?: string
  allowAdd?: boolean
  disabled?: boolean
  className?: string
}

export function EnumSelect({
  category,
  value,
  onChange,
  parentValue,
  placeholder = "选择...",
  allowAdd = true,
  disabled = false,
  className,
}: EnumSelectProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<EnumOption[]>([])
  const [loading, setLoading] = useState(false)
  const [newValue, setNewValue] = useState("")
  const [adding, setAdding] = useState(false)

  // 加载枚举选项
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      try {
        const token = getToken()
        let url = `/api/v1/enum-options?category=${encodeURIComponent(category)}`
        if (parentValue) {
          url += `&parentValue=${encodeURIComponent(parentValue)}`
        }
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setOptions(Array.isArray(data) ? data : data.data || [])
        }
      } catch (err) {
        console.error("Failed to load enum options:", err)
      } finally {
        setLoading(false)
      }
    }

    if (open || !options.length) {
      fetchOptions()
    }
  }, [category, parentValue, open])

  // 新增选项
  const handleAddOption = async () => {
    if (!newValue.trim()) return
    
    setAdding(true)
    try {
      const token = getToken()
      const res = await fetch("/api/v1/enum-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          value: newValue.trim(),
          label: newValue.trim(),
          parentValue: parentValue || undefined,
        }),
      })
      
      if (res.ok) {
        const newOption = await res.json()
        setOptions((prev) => [...prev, newOption.data || newOption])
        onChange(newValue.trim())
        setNewValue("")
        setOpen(false)
      }
    } catch (err) {
      console.error("Failed to add enum option:", err)
    } finally {
      setAdding(false)
    }
  }

  const selectedLabel = value && options.find((opt) => opt.value === value)?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn("w-full justify-between font-normal", className)}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              加载中...
            </span>
          ) : selectedLabel ? (
            selectedLabel
          ) : value ? (
            value
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`搜索${category}...`} />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>暂无选项</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id || option.value}
                      value={option.label || option.value}
                      onSelect={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label || option.value}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
          
          {/* 新增选项输入 */}
          {allowAdd && !loading && (
            <div className="border-t p-2">
              <div className="flex gap-2">
                <Input
                  placeholder="输入新选项..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddOption()
                    }
                  }}
                  className="h-8"
                />
                <Button
                  size="sm"
                  onClick={handleAddOption}
                  disabled={!newValue.trim() || adding}
                  className="h-8"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
