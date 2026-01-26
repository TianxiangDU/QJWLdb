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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  List,
  Database,
} from 'lucide-react'
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

// 数据表与枚举分类的映射
const TABLE_ENUM_MAP: {
  key: string
  table: string
  label: string
  categories: { key: string; label: string; hasShortCode?: boolean; hasParent?: boolean; parentCategory?: string }[]
}[] = [
  {
    key: 'docType',
    table: 'doc_type',
    label: '文件类型',
    categories: [
      { key: 'projectPhase', label: '项目阶段', hasShortCode: true },
      { key: 'majorCategory', label: '大类', hasShortCode: true },
      { key: 'minorCategory', label: '小类', hasParent: true, parentCategory: 'majorCategory' },
      { key: 'projectType', label: '项目类型' },
      { key: 'region', label: '适用地区' },
      { key: 'ownerOrg', label: '适用业主' },
    ],
  },
  {
    key: 'auditRule',
    table: 'audit_rule',
    label: '审计规则',
    categories: [
      { key: 'auditType', label: '审计类型', hasShortCode: true },
      { key: 'auditPhase', label: '审计阶段', hasShortCode: true },
      { key: 'verifySection', label: '查证板块', hasShortCode: true },
    ],
  },
  {
    key: 'lawDocument',
    table: 'law_document',
    label: '法规与标准',
    categories: [
      { key: 'lawCategory', label: '法规类别' },
      { key: 'lawStatus', label: '法规状态' },
    ],
  },
  {
    key: 'docFieldDef',
    table: 'doc_field_def',
    label: '关键信息字段',
    categories: [
      { key: 'fieldCategory', label: '字段类别' },
    ],
  },
]

async function fetchOptions(category: string, parentValue?: string): Promise<EnumOption[]> {
  const token = localStorage.getItem('qjwl_token')
  let url = `${API_BASE}/enum-options?category=${category}`
  if (parentValue) {
    url += `&parentValue=${encodeURIComponent(parentValue)}`
  }
  const res = await fetch(url, {
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
  const token = localStorage.getItem('qjwl_token')
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
  const token = localStorage.getItem('qjwl_token')
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
  const token = localStorage.getItem('qjwl_token')
  const res = await fetch(`${API_BASE}/enum-options/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '删除失败')
  }
}

export function EnumSettingsPanel() {
  const queryClient = useQueryClient()
  
  // 状态
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedParent, setSelectedParent] = useState<string>('')
  
  // 弹窗状态
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<EnumOption | null>(null)
  
  // 表单数据
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    shortCode: '',
    parentValue: '',
  })

  // 获取当前表配置
  const currentTable = TABLE_ENUM_MAP.find((t) => t.key === selectedTable)
  const currentCategoryConfig = currentTable?.categories.find((c) => c.key === selectedCategory)

  // 获取枚举选项
  const { data: options = [], isLoading, refetch } = useQuery({
    queryKey: ['enumOptions', selectedCategory, selectedParent],
    queryFn: () => fetchOptions(
      selectedCategory,
      currentCategoryConfig?.hasParent ? selectedParent : undefined
    ),
    enabled: !!selectedCategory,
  })

  // 获取父级选项（用于级联）
  const { data: parentOptions = [] } = useQuery({
    queryKey: ['enumOptions', currentCategoryConfig?.parentCategory],
    queryFn: () => fetchOptions(currentCategoryConfig?.parentCategory || ''),
    enabled: !!currentCategoryConfig?.hasParent && !!currentCategoryConfig?.parentCategory,
  })

  // 添加选项
  const addMutation = useMutation({
    mutationFn: addOption,
    onSuccess: () => {
      toast({ title: '添加成功' })
      queryClient.invalidateQueries({ queryKey: ['enumOptions'] })
      setAddDialogOpen(false)
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
      queryClient.invalidateQueries({ queryKey: ['enumOptions'] })
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
      queryClient.invalidateQueries({ queryKey: ['enumOptions'] })
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

  const handleTableChange = (tableKey: string) => {
    setSelectedTable(tableKey)
    setSelectedCategory('')
    setSelectedParent('')
  }

  const handleCategoryChange = (categoryKey: string) => {
    setSelectedCategory(categoryKey)
    setSelectedParent('')
  }

  const handleAdd = () => {
    if (!formData.value.trim()) {
      toast({ title: '请输入选项值', variant: 'destructive' })
      return
    }
    addMutation.mutate({
      category: selectedCategory,
      value: formData.value.trim(),
      label: formData.label.trim() || undefined,
      parentValue: currentCategoryConfig?.hasParent ? (selectedParent || formData.parentValue) : undefined,
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
    <div className="space-y-6">
      {/* 步骤 1：选择数据表 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            选择数据表
          </CardTitle>
          <CardDescription>先选择要配置枚举的数据表</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TABLE_ENUM_MAP.map((table) => (
              <Button
                key={table.key}
                variant={selectedTable === table.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTableChange(table.key)}
              >
                {table.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 步骤 2：选择枚举类型 */}
      {selectedTable && currentTable && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <List className="h-5 w-5" />
              选择枚举类型
            </CardTitle>
            <CardDescription>选择要配置的枚举字段</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentTable.categories.map((cat) => (
                <Button
                  key={cat.key}
                  variant={selectedCategory === cat.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(cat.key)}
                  className="gap-1"
                >
                  {cat.label}
                  {cat.hasShortCode && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      有缩写
                    </Badge>
                  )}
                  {cat.hasParent && (
                    <Badge variant="outline" className="ml-1 text-xs">
                      级联
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* 级联选择父级 */}
            {selectedCategory && currentCategoryConfig?.hasParent && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                <Label className="text-sm font-medium">
                  筛选：选择所属的
                  {TABLE_ENUM_MAP.find((t) => t.key === selectedTable)?.categories.find(
                    (c) => c.key === currentCategoryConfig.parentCategory
                  )?.label}
                </Label>
                <Select value={selectedParent || '__all__'} onValueChange={(v) => setSelectedParent(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="mt-2 max-w-xs">
                    <SelectValue placeholder="全部" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">全部</SelectItem>
                    {parentOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label || opt.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 步骤 3：管理枚举选项 */}
      {selectedCategory && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {currentCategoryConfig?.label} 选项列表
              </CardTitle>
              <CardDescription>共 {options.length} 个选项</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button size="sm" onClick={() => { resetForm(); setAddDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" />
                新增
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : options.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无数据，点击"新增"添加选项
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">序号</TableHead>
                      <TableHead>选项值</TableHead>
                      <TableHead>显示标签</TableHead>
                      {currentCategoryConfig?.hasShortCode && (
                        <TableHead className="w-24">缩写</TableHead>
                      )}
                      {currentCategoryConfig?.hasParent && (
                        <TableHead>所属父级</TableHead>
                      )}
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
                        {currentCategoryConfig?.hasShortCode && (
                          <TableCell>
                            {opt.shortCode ? (
                              <Badge variant="secondary">{opt.shortCode}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                        {currentCategoryConfig?.hasParent && (
                          <TableCell>{opt.parentValue || '-'}</TableCell>
                        )}
                        <TableCell>{opt.sortOrder}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(opt)}
                              title="编辑"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(opt)}
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* 新增弹窗 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增{currentCategoryConfig?.label}选项</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>选项值</Label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={`输入${currentCategoryConfig?.label}名称`}
              />
            </div>
            <div className="space-y-2">
              <Label>显示标签（可选）</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="留空则与选项值相同"
              />
            </div>
            {currentCategoryConfig?.hasParent && !selectedParent && (
              <div className="space-y-2">
                <Label>
                  所属
                  {TABLE_ENUM_MAP.find((t) => t.key === selectedTable)?.categories.find(
                    (c) => c.key === currentCategoryConfig.parentCategory
                  )?.label}
                </Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending}>
              {addMutation.isPending ? '添加中...' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {currentCategoryConfig?.hasShortCode && (
              <div className="space-y-2">
                <Label>缩写编码</Label>
                <Input
                  value={formData.shortCode}
                  onChange={(e) =>
                    setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })
                  }
                  maxLength={2}
                  placeholder="2个大写字母"
                />
                <p className="text-xs text-muted-foreground">
                  用于生成文件类型编码，如 QQ=前期准备
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '保存中...' : '保存'}
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
              {deleteMutation.isPending ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
