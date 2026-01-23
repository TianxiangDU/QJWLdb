# 前端技术栈规范

> ⚠️ **本文档定义的技术栈规范是项目的核心约束，所有后续迭代必须严格遵守！**

---

## 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| **shadcn/ui** | latest | UI 组件库（强制） |
| **Tailwind CSS** | 3.4.x | 样式系统（强制） |
| **lucide-react** | latest | 图标库（强制） |
| TanStack Query | 5.x | 数据请求 |
| React Router | 6.x | 路由管理 |

---

## 样式规范（强制）

### 1. 禁止使用 CSS 文件

❌ **禁止**：
```tsx
// 禁止创建或导入任何 .css / .scss / .less 文件
import "./MyComponent.css"
import styles from "./MyComponent.module.css"
```

✅ **允许**：
- `src/index.css` - 仅用于 Tailwind 初始化和 CSS 变量定义
- 使用 Tailwind 类名和 shadcn 语义 token

### 2. 优先使用 shadcn 语义 Token

shadcn/ui 提供了一套语义化的 CSS 变量，应优先使用：

```tsx
// ✅ 优先使用 shadcn 语义 token
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-primary text-primary-foreground">
<div className="bg-secondary text-secondary-foreground">
<div className="bg-muted text-muted-foreground">
<div className="bg-accent text-accent-foreground">
<div className="bg-destructive text-destructive-foreground">
<div className="border-border">
<div className="text-popover-foreground bg-popover">
```

### 3. 次选 Tailwind 原子 Token

当 shadcn 语义 token 无法满足需求时，使用 Tailwind：

```tsx
// ✅ Tailwind 原子类
<div className="flex items-center gap-4">
<div className="grid grid-cols-3">
<div className="p-4 m-2 rounded-lg">
<div className="text-sm font-medium">
<div className="w-full h-12">
```

### 4. 组合示例

```tsx
// ✅ 正确：结合 shadcn token + Tailwind 布局
<Card className="p-6">
  <CardHeader className="flex flex-row items-center gap-4">
    <CardTitle className="text-lg font-semibold">标题</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-muted-foreground">描述文字</p>
    <Button variant="default">操作</Button>
  </CardContent>
</Card>
```

---

## 图标规范（强制）

### 只使用 lucide-react

官方文档: https://lucide.dev/icons/

```tsx
// ✅ 正确
import { Plus, Edit, Trash2, Eye, Search, Loader2 } from "lucide-react"

// ❌ 禁止使用其他图标库
import { FaPlus } from "react-icons/fa"  // 禁止
import { PlusIcon } from "@heroicons/react" // 禁止
import { PlusOutlined } from "@ant-design/icons" // 禁止
```

### 图标使用方式

```tsx
import { Plus, Loader2 } from "lucide-react"

// 直接使用
<Plus className="h-4 w-4" />

// 在按钮中使用
<Button>
  <Plus className="mr-2 h-4 w-4" />
  新增
</Button>

// 加载状态
<Loader2 className="h-4 w-4 animate-spin" />
```

### 动态图标组件

使用 `src/components/common/Icon.tsx` 进行字符串到图标的映射：

```tsx
import { Icon } from "@/components/common/Icon"

<Icon name="Plus" className="h-4 w-4" />
<Icon name="Edit" size={16} />
```

---

## 组件规范

### 1. 优先使用 shadcn/ui 组件

```tsx
// ✅ 使用 shadcn 组件
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
```

### 2. 禁止使用 Ant Design

```tsx
// ❌ 禁止
import { Button, Table, Form, Input, Select, Modal } from "antd"
import { message, notification } from "antd"
import { PlusOutlined } from "@ant-design/icons"
```

### 3. 自定义组件命名

- 放在 `src/components/` 目录
- 使用 PascalCase 命名
- 导出命名函数组件

```tsx
// src/components/resource/ResourceTable.tsx
export function ResourceTable({ data, columns }: ResourceTableProps) {
  return (
    <Table>
      {/* ... */}
    </Table>
  )
}
```

---

## 颜色系统

### shadcn 语义颜色（优先使用）

| Token | 用途 | 类名示例 |
|-------|------|---------|
| `background` | 页面背景 | `bg-background` |
| `foreground` | 主文字 | `text-foreground` |
| `card` | 卡片背景 | `bg-card` |
| `card-foreground` | 卡片文字 | `text-card-foreground` |
| `primary` | 主要操作 | `bg-primary text-primary-foreground` |
| `secondary` | 次要操作 | `bg-secondary text-secondary-foreground` |
| `muted` | 辅助信息 | `bg-muted text-muted-foreground` |
| `accent` | 强调 | `bg-accent text-accent-foreground` |
| `destructive` | 危险操作 | `bg-destructive text-destructive-foreground` |
| `border` | 边框 | `border-border` |
| `input` | 输入框边框 | `border-input` |
| `ring` | 焦点环 | `ring-ring` |

### 使用方式

```tsx
<div className="bg-background">        // 页面背景
<div className="bg-card">              // 卡片背景
<p className="text-muted-foreground">  // 次要文字
<span className="text-destructive">    // 错误/危险
<div className="border border-border"> // 边框
```

---

## 间距与布局

使用 Tailwind 的间距系统：

```tsx
// 间距
<div className="p-4">      // padding: 1rem
<div className="m-2">      // margin: 0.5rem
<div className="gap-4">    // gap: 1rem
<div className="space-y-4"> // 子元素垂直间距

// Flexbox
<div className="flex items-center justify-between">
<div className="flex flex-col gap-2">

// Grid
<div className="grid grid-cols-2 gap-4">
<div className="grid grid-cols-1 md:grid-cols-3">
```

---

## 响应式设计

使用 Tailwind 断点前缀：

| 前缀 | 最小宽度 |
|------|---------|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="hidden md:block">
<div className="text-sm md:text-base">
```

---

## 文件组织

```
frontend/src/
├── components/
│   ├── ui/                 # shadcn/ui 组件（自动生成）
│   ├── common/             # 通用组件
│   │   └── Icon.tsx        # 动态图标组件
│   └── resource/           # 资源管理组件
│       ├── ResourceTable.tsx
│       ├── ResourceForm.tsx
│       ├── ResourceFilters.tsx
│       └── ResourcePage.tsx
├── config/
│   └── resources.ts        # 资源配置
├── hooks/
│   └── use-toast.ts        # Toast Hook
├── layouts/
│   └── MainLayout.tsx      # 主布局
├── pages/
│   ├── auth/               # 认证页面
│   ├── resources/          # 资源页面
│   └── schema/             # Schema 浏览器
├── services/
│   └── api-client.ts       # API 客户端
├── types/
│   └── resource.ts         # 类型定义
└── lib/
    └── utils.ts            # 工具函数 (cn)
```

---

## 检查清单

在提交代码前，确保：

- [ ] 没有创建新的 CSS 文件（除 index.css）
- [ ] 没有使用 Ant Design 组件
- [ ] 没有使用 `@ant-design/icons`
- [ ] 没有使用 lucide-react 以外的图标库
- [ ] 优先使用了 shadcn 语义 token
- [ ] 所有样式都是 Tailwind 类名
- [ ] 组件从 `@/components/ui/` 导入
- [ ] TypeScript 编译通过 (`npm run build`)

---

## 参考链接

- [shadcn/ui 文档](https://ui.shadcn.com/)
- [shadcn/ui 组件](https://ui.shadcn.com/docs/components)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [lucide-react 图标](https://lucide.dev/icons/)
- [lucide-react 包](https://lucide.dev/guide/packages/lucide-react)
