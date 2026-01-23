import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Settings, Palette, List, Save, Upload } from 'lucide-react'
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

    // 简单处理：转为 base64 存储
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      handleChange('logoUrl', base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            界面设置
          </CardTitle>
          <CardDescription>配置系统的外观和品牌信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 站点名称 */}
          <div className="space-y-2">
            <Label htmlFor="siteName">站点名称</Label>
            <Input
              id="siteName"
              value={config.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder="输入站点名称"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              显示在页面左上角和浏览器标题
            </p>
          </div>

          <Separator />

          {/* Logo */}
          <div className="space-y-2">
            <Label>站点 Logo</Label>
            <div className="flex items-center gap-4">
              {config.logoUrl ? (
                <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={config.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">暂无</span>
                </div>
              )}
              <div className="flex gap-2">
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
                {config.logoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange('logoUrl', '')}
                  >
                    移除
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              建议尺寸：32x32 或 64x64 像素，支持 PNG、JPG、SVG 格式
            </p>
          </div>

          <Separator />

          {/* 预览 */}
          <div className="space-y-2">
            <Label>预览效果</Label>
            <div className="p-4 rounded-lg border bg-sidebar">
              <div className="flex items-center gap-3">
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt="Logo"
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      {config.siteName?.[0] || 'D'}
                    </span>
                  </div>
                )}
                <span className="font-semibold text-sidebar-foreground">
                  {config.siteName || '数据中台'}
                </span>
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={!isDirty}>
              <Save className="h-4 w-4 mr-2" />
              保存设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('ui')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          系统设置
        </h1>
        <p className="text-muted-foreground">管理系统配置、界面外观和数据选项</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="ui" className="gap-2">
            <Palette className="h-4 w-4" />
            界面设置
          </TabsTrigger>
          <TabsTrigger value="enum" className="gap-2">
            <List className="h-4 w-4" />
            枚举设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ui">
          <UISettingsPanel />
        </TabsContent>

        <TabsContent value="enum">
          <EnumSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
