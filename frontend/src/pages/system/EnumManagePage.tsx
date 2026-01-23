import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const API_BASE = '/api/v1'

interface EnumOption {
  id: number
  category: string
  value: string
  label: string
  shortCode?: string
  parentValue?: string
  sortOrder: number
  status: number
}

const CATEGORIES = [
  { key: 'projectPhase', label: '项目阶段', hasShortCode: true },
  { key: 'majorCategory', label: '大类', hasShortCode: true },
  { key: 'minorCategory', label: '小类', hasParent: true, parentCategory: 'majorCategory' },
  { key: 'region', label: '适用地区' },
  { key: 'ownerOrg', label: '适用业主' },
]

async function fetchOptions(category: string): Promise<EnumOption[]> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/enum-options?category=${category}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('获取选项失败')
  const json = await res.json()
  return json.data || json || []
}

async function addOption(data: {
  category: string
  value: string
  label?: string
  parentValue?: string
}): Promise<EnumOption> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/enum-options`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '添加失败')
  }
  const json = await res.json()
  return json.data || json
}

async function updateOption(
  id: number,
  data: { value?: string; label?: string; shortCode?: string }
): Promise<EnumOption> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/enum-options/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '更新失败')
  }
  const json = await res.json()
  return json.data || json
}

async function deleteOption(id: number): Promise<void> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/enum-options/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '删除失败')
  }
}

export default function EnumManagePage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('projectPhase')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<EnumOption | null>(null)
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    shortCode: '',
    parentValue: '',
  })

  const currentCategory = CATEGORIES.find((c) => c.key === activeTab)

  // 获取当前分类的选项
  const { data: options = [], isLoading, refetch } = useQuery({
    queryKey: ['enumOptions', activeTab],
    queryFn: () => fetchOptions(activeTab),
  })

  // 获取父级选项（用于小类）
  const { data: parentOptions = [] } = useQuery({
    queryKey: ['enumOptions', currentCategory?.parentCategory],
    queryFn: () => fetchOptions(currentCategory?.parentCategory || ''),
    enabled: !!currentCategory?.hasParent,
  })

  // 添加选项
  const addMutation = useMutation({
    mutationFn: addOption,
    onSuccess: () => {
      toast({ title: '添加成功' })
      queryClient.invalidateQueries({ queryKey: ['enumOptions', activeTab] })
      resetForm()
    },
    onError: (err: Error) => {
      toast({ title: '添加失败', description: err.message, variant: 'destructive' })
    },
  })

  // 更新选项
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateOption(id, data),
    onSuccess: () => {
      toast({ title: '更新成功' })
      queryClient.invalidateQueries({ queryKey: ['enumOptions', activeTab] })
      setEditDialogOpen(false)
      setSelectedOption(null)
    },
    onError: (err: Error) => {
      toast({ title: '更新失败', description: err.message, variant: 'destructive' })
    },
  })

  // 删除选项
  const deleteMutation = useMutation({
    mutationFn: deleteOption,
    onSuccess: () => {
      toast({ title: '删除成功' })
      queryClient.invalidateQueries({ queryKey: ['enumOptions', activeTab] })
      setDeleteDialogOpen(false)
      setSelectedOption(null)
    },
    onError: (err: Error) => {
      toast({ title: '删除失败', description: err.message, variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setFormData({ value: '', label: '', shortCode: '', parentValue: '' })
  }

  const handleAdd = () => {
    if (!formData.value.trim()) {
      toast({ title: '请输入选项值', variant: 'destructive' })
      return
    }
    addMutation.mutate({
      category: activeTab,
      value: formData.value.trim(),
      label: formData.label.trim() || undefined,
      parentValue: formData.parentValue || undefined,
    })
  }

  const handleEdit = (option: EnumOption) => {
    setSelectedOption(option)
    setFormData({
      value: option.value,
      label: option.label || '',
      shortCode: option.shortCode || '',
      parentValue: option.parentValue || '',
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!selectedOption) return
    updateMutation.mutate({
      id: selectedOption.id,
      data: {
        value: formData.value.trim(),
        label: formData.label.trim() || undefined,
        shortCode: formData.shortCode.trim() || undefined,
      },
    })
  }

  const handleDelete = (option: EnumOption) => {
    setSelectedOption(option)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedOption) return
    deleteMutation.mutate(selectedOption.id)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">枚举管理</h1>
          <p className="text-muted-foreground">管理系统中的枚举选项：项目阶段、大类、小类、地区、业主</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="space-y-4">
            {/* 添加新选项 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">添加{cat.label}</CardTitle>
                <CardDescription>输入新的{cat.label}选项</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>选项值</Label>
                    <Input
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={`输入${cat.label}名称`}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>显示标签（可选）</Label>
                    <Input
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="留空则与选项值相同"
                    />
                  </div>
                  {cat.hasParent && (
                    <div className="flex-1">
                      <Label>所属{CATEGORIES.find((c) => c.key === cat.parentCategory)?.label}</Label>
                      <Select
                        value={formData.parentValue}
                        onValueChange={(v) => setFormData({ ...formData, parentValue: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择父级" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label || opt.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button onClick={handleAdd} disabled={addMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 选项列表 */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{cat.label}列表</CardTitle>
                  <CardDescription>共 {options.length} 个选项</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">加载中...</div>
                ) : options.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">暂无数据</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">序号</TableHead>
                        <TableHead>选项值</TableHead>
                        <TableHead>显示标签</TableHead>
                        {cat.hasShortCode && <TableHead className="w-24">缩写</TableHead>}
                        {cat.hasParent && <TableHead>所属父级</TableHead>}
                        <TableHead className="w-20">排序</TableHead>
                        <TableHead className="w-24 text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {options.map((opt, idx) => (
                        <TableRow key={opt.id || opt.value}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{opt.value}</TableCell>
                          <TableCell>{opt.label || opt.value}</TableCell>
                          {cat.hasShortCode && (
                            <TableCell>
                              {opt.shortCode ? (
                                <Badge variant="secondary">{opt.shortCode}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          )}
                          {cat.hasParent && (
                            <TableCell>{opt.parentValue || '-'}</TableCell>
                          )}
                          <TableCell>{opt.sortOrder}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(opt)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(opt)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑选项</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>选项值</Label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>显示标签</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>
            {currentCategory?.hasShortCode && (
              <div className="space-y-2">
                <Label>缩写编码（用于生成文件类型编码）</Label>
                <Input
                  value={formData.shortCode}
                  onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                  maxLength={2}
                  placeholder="2个大写字母"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选项 "{selectedOption?.value}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
