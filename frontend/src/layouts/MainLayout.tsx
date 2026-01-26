import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import {
  FileText,
  FileCheck,
  Scale,
  Database,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
  Search,
  Info,
  ExternalLink,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getUser, logout } from "@/services/api-client"

// UI 配置
const UI_CONFIG_KEY = 'app_ui_config'
interface UIConfig {
  siteName: string
  logoUrl: string
}
const defaultUIConfig: UIConfig = { siteName: '数据中台', logoUrl: '' }

function getUIConfig(): UIConfig {
  try {
    const stored = localStorage.getItem(UI_CONFIG_KEY)
    return stored ? { ...defaultUIConfig, ...JSON.parse(stored) } : defaultUIConfig
  } catch {
    return defaultUIConfig
  }
}

interface NavItem {
  title: string
  href?: string
  icon?: React.ElementType
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { title: "首页", href: "/", icon: Search },
  {
    title: "文件与资料库",
    icon: FileText,
    children: [
      { title: "文件类型", href: "/doc-types" },
      { title: "关键信息字段", href: "/doc-field-defs" },
      { title: "文件模板/示例", href: "/doc-template-samples" },
    ],
  },
  {
    title: "审计逻辑库",
    icon: FileCheck,
    children: [
      { title: "审计规则", href: "/audit-rules" },
    ],
  },
  {
    title: "法规与标准库",
    icon: Scale,
    children: [
      { title: "法规与标准", href: "/law-documents" },
      { title: "法规条款", href: "/law-clauses" },
    ],
  },
  { title: "数据库结构", href: "/schema", icon: Database },
  { title: "系统设置", href: "/system/settings", icon: Settings },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon

  return (
    <Link
      to={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive 
          ? "bg-blue-50 text-blue-700 font-medium" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      {Icon && <Icon className={cn("h-4 w-4", isActive && "text-blue-600")} />}
      {item.title}
    </Link>
  )
}

function NavGroup({ item }: { item: NavItem }) {
  const location = useLocation()
  const isChildActive = item.children?.some((child) => child.href === location.pathname)
  const [open, setOpen] = useState(isChildActive || false)

  const Icon = item.icon

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isChildActive 
            ? "text-blue-700" 
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon className={cn("h-4 w-4", isChildActive && "text-blue-600")} />}
          {item.title}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform text-gray-400", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
          {item.children?.map((child) => (
            <NavLink
              key={child.href}
              item={child}
              isActive={location.pathname === child.href}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function MainLayout() {
  const location = useLocation()
  const _navigate = useNavigate()
  void _navigate // 保留以备后用
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [uiConfig, setUiConfig] = useState<UIConfig>(getUIConfig)
  const user = getUser()

  // 监听 UI 配置变化
  useEffect(() => {
    const handleConfigChange = (e: CustomEvent<UIConfig>) => {
      setUiConfig(e.detail)
    }
    window.addEventListener('ui-config-changed', handleConfigChange as EventListener)
    return () => {
      window.removeEventListener('ui-config-changed', handleConfigChange as EventListener)
    }
  }, [])

  // 更新页面标题
  useEffect(() => {
    document.title = uiConfig.siteName || '数据中台'
  }, [uiConfig.siteName])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - 固定宽度 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[220px] flex-shrink-0 bg-white border-r border-gray-200 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 bg-white">
          <Link to="/" className="flex items-center gap-2 font-semibold text-gray-800">
            {uiConfig.logoUrl ? (
              <img src={uiConfig.logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
            ) : (
              <Database className="h-6 w-6 text-blue-600" />
            )}
            <span className="truncate">{uiConfig.siteName || '数据中台'}</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-56px)]">
          <div className="space-y-1 p-3">
            {navItems.map((item) =>
              item.children ? (
                <NavGroup key={item.title} item={item} />
              ) : (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              )
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main content area - 占据剩余空间 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - 固定高度 */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between border-b border-gray-200 px-4 bg-white">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                {user?.nickname || user?.username || "用户"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                {user?.username}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Info className="h-4 w-4" />
                  系统信息
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>版本</span>
                    <span className="font-medium text-foreground">v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>前端</span>
                    <span>React + shadcn/ui</span>
                  </div>
                  <div className="flex justify-between">
                    <span>后端</span>
                    <span>NestJS + MySQL</span>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  API 文档
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content - 可滚动区域 */}
        <main className="flex-1 overflow-auto p-5 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
