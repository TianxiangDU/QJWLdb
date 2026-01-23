import {
  Plus,
  Upload,
  Download,
  FileDown,
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  File,
  FileSpreadsheet,
  Image,
  Database,
  Table,
  List,
  Grid,
  Settings,
  User,
  Users,
  LogOut,
  LogIn,
  Home,
  Menu,
  Copy,
  ExternalLink,
  Link,
  AlertCircle,
  Info,
  HelpCircle,
  Calendar,
  Clock,
  Tag,
  Bookmark,
  Star,
  Heart,
  Flag,
  Archive,
  Folder,
  FolderOpen,
  Save,
  Edit,
  Play,
  Pause,
  StopCircle,
  Power,
  Zap,
  Shield,
  Lock,
  Unlock,
  Key,
  Scale,
  FileCheck,
  ScrollText,
  BookOpen,
  Layers,
  Package,
  Box,
  Briefcase,
  Building,
  MapPin,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Printer,
  Scan,
  QrCode,
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2,
  type LucideIcon,
} from "lucide-react"

/**
 * 图标名称到组件的映射
 */
const iconMap: Record<string, LucideIcon> = {
  // 操作类
  Plus,
  Upload,
  Download,
  FileDown,
  Eye,
  Pencil,
  Edit,
  Trash2,
  Check,
  X,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Link,
  Save,
  Play,
  Pause,
  Stop: StopCircle,
  Power,
  Send,
  Printer,
  Scan,

  // 导航类
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  Menu,
  LogOut,
  LogIn,

  // 文件类
  FileText,
  File,
  FileSpreadsheet,
  FileCheck,
  Image,
  Folder,
  FolderOpen,
  Archive,

  // 数据类
  Database,
  Table,
  List,
  Grid,
  Layers,
  Package,
  Box,

  // 用户类
  User,
  Users,
  Settings,

  // 信息类
  AlertCircle,
  Info,
  HelpCircle,

  // 时间类
  Calendar,
  Clock,

  // 标记类
  Tag,
  Bookmark,
  Star,
  Heart,
  Flag,

  // 业务类
  Scale,
  ScrollText,
  BookOpen,
  Briefcase,
  Building,

  // 安全类
  Shield,
  Lock,
  Unlock,
  Key,
  Zap,

  // 位置类
  MapPin,
  Globe,

  // 通信类
  Mail,
  Phone,
  MessageSquare,
  QrCode,

  // 图表类
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,

  // 加载
  Loader2,
}

interface IconProps {
  name: string
  className?: string
  size?: number
}

/**
 * 动态图标组件
 * 根据字符串名称渲染对应的 lucide-react 图标
 */
export function Icon({ name, className, size = 16 }: IconProps) {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`)
    return null
  }

  return <IconComponent className={className} size={size} />
}

/**
 * 获取图标组件
 */
export function getIconComponent(name?: string): LucideIcon | null {
  if (!name) return null
  return iconMap[name] || null
}

export { iconMap }
