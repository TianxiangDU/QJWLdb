import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Palette, List, Save, Upload, Database, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { EnumSettingsPanel } from './components/EnumSettingsPanel'

// 界面配置存储在 localStorage
const UI_CONFIG_KEY = 'app_ui_config'

interface UIConfig {
  siteName: string
  logoUrl: string
}

const defaultUIConfig: UIConfig = {
  siteName: '数据中台',
  logoUrl: '',
}

function getUIConfig(): UIConfig {
  try {
    const stored = localStorage.getItem(UI_CONFIG_KEY)
    return stored ? { ...defaultUIConfig, ...JSON.parse(stored) } : defaultUIConfig
  } catch {
    return defaultUIConfig
  }
}

function saveUIConfig(config: UIConfig) {
  localStorage.setItem(UI_CONFIG_KEY, JSON.stringify(config))
  // 触发自定义事件通知其他组件
  window.dispatchEvent(new CustomEvent('ui-config-changed', { detail: config }))
}

// 界面设置面板
function UISettingsPanel() {
  const [config, setConfig] = useState<UIConfig>(getUIConfig)
  const [isDirty, setIsDirty] = useState(false)

  const handleChange = (field: keyof UIConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = () => {
    saveUIConfig(config)
    setIsDirty(false)
    toast({ title: '保存成功', description: '界面设置已更新，刷新页面后生效' })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      handleChange('logoUrl', base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-2xl">
      {/* 站点名称 */}
      <div className="mb-8">
        <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">
          站点名称
        </Label>
        <Input
          id="siteName"
          value={config.siteName}
          onChange={(e) => handleChange('siteName', e.target.value)}
          placeholder="输入站点名称"
          className="mt-2"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          显示在页面左上角和浏览器标题
        </p>
      </div>

      {/* Logo */}
      <div className="mb-8">
        <Label className="text-sm font-medium text-gray-700">站点 Logo</Label>
        <div className="mt-2 flex items-center gap-4">
          {config.logoUrl ? (
            <div className="relative h-12 w-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
              <img
                src={config.logoUrl}
                alt="Logo"
                className="h-full w-full object-contain"
              />
              <button
                onClick={() => handleChange('logoUrl', '')}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-12 w-12 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <span className="text-xs text-gray-400">暂无</span>
            </div>
          )}
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              上传 Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          建议尺寸：32×32 或 64×64 像素，支持 PNG、JPG、SVG 格式
        </p>
      </div>

      {/* 预览 */}
      <div className="mb-8 flex items-center gap-6">
        <Label className="text-sm font-medium text-gray-700 flex-shrink-0">预览效果</Label>
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt="Logo"
              className="h-5 w-5 object-contain"
            />
          ) : (
            <Database className="h-5 w-5 text-blue-600" />
          )}
          <span className="font-medium text-gray-800">
            {config.siteName || '数据中台'}
          </span>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="pt-4 border-t border-gray-100">
        <Button onClick={handleSave} disabled={!isDirty}>
          <Save className="h-4 w-4 mr-2" />
          保存设置
        </Button>
      </div>
    </div>
  )
}

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('ui')

  return (
    <div className="p-6 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          系统设置
        </h1>
        <p className="mt-1 text-sm text-gray-500">管理系统配置、界面外观和数据选项</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-transparent border-b border-gray-200 rounded-none p-0 h-auto">
          <TabsTrigger 
            value="ui" 
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5"
          >
            <Palette className="h-4 w-4" />
            界面设置
          </TabsTrigger>
          <TabsTrigger 
            value="enum" 
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5"
          >
            <List className="h-4 w-4" />
            枚举设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ui" className="mt-0">
          <UISettingsPanel />
        </TabsContent>

        <TabsContent value="enum" className="mt-0">
          <EnumSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
