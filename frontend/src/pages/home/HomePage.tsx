import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiClient } from "@/services/api-client"
import { FileText, FileCheck, Scale, Database, Search, Loader2, FolderOpen, List, ArrowRight } from "lucide-react"

interface StatCard {
  title: string
  value: number
  icon: React.ElementType
  href: string
  description: string
}

interface DocType {
  id: number
  code: string
  name: string
  projectPhase?: string
  majorCategory?: string
  minorCategory?: string
  region?: string
  ownerOrg?: string
  bizDescription?: string
  fileFeature?: string
  status: number
}

interface DocTypeFullInfo {
  docType: DocType
  fields: Array<{
    id: number
    fieldCode: string
    fieldName: string
    fieldCategory?: string
    requiredFlag: number
    valueSource?: string
    enumOptions?: string
    exampleValue?: string
    fieldDescription?: string
  }>
  templates: Array<{
    id: number
    fileName: string
    description?: string
    filePath?: string
  }>
}

export function HomePage() {
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<number | null>(null)

  // 获取各模块统计
  const { data: docTypesData } = useQuery({
    queryKey: ["doc-types-count"],
    queryFn: async () => {
      const { data } = await apiClient.get("/doc-types/list", { params: { pageSize: 1 } })
      return data
    },
  })

  const { data: auditRulesData } = useQuery({
    queryKey: ["audit-rules-count"],
    queryFn: async () => {
      const { data } = await apiClient.get("/audit-rules/list", { params: { pageSize: 1 } })
      return data
    },
  })

  const { data: lawDocsData } = useQuery({
    queryKey: ["law-documents-count"],
    queryFn: async () => {
      const { data } = await apiClient.get("/law-documents/list", { params: { pageSize: 1 } })
      return data
    },
  })

  const { data: docFieldDefsData } = useQuery({
    queryKey: ["doc-field-defs-count"],
    queryFn: async () => {
      const { data } = await apiClient.get("/doc-field-defs/list", { params: { pageSize: 1 } })
      return data
    },
  })

  // 搜索文件类型
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["docTypeSearch", searchKeyword],
    queryFn: async () => {
      const { data } = await apiClient.get("/doc-types/list", {
        params: { keyword: searchKeyword, pageSize: 20, status: 1 },
      })
      return data
    },
    enabled: searchKeyword.length > 0,
  })

  // 获取选中文件类型的完整信息
  const { data: fullInfo, isLoading: isLoadingFullInfo } = useQuery({
    queryKey: ["docTypeFullInfo", selectedDocTypeId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DocTypeFullInfo }>(`/doc-types/full/${selectedDocTypeId}`)
      return response.data.data // 提取 response.data.data
    },
    enabled: !!selectedDocTypeId,
  })

  const handleSearch = () => {
    setSearchKeyword(searchInput)
    setSelectedDocTypeId(null)
  }

  const stats: StatCard[] = [
    {
      title: "文件类型",
      value: docTypesData?.meta?.total || 0,
      icon: FileText,
      href: "/doc-types",
      description: "工程全阶段文件体系",
    },
    {
      title: "关键信息字段",
      value: docFieldDefsData?.meta?.total || 0,
      icon: List,
      href: "/doc-field-defs",
      description: "文件关键信息定义",
    },
    {
      title: "审计规则",
      value: auditRulesData?.meta?.total || 0,
      icon: FileCheck,
      href: "/audit-rules",
      description: "审计逻辑与比对方法",
    },
    {
      title: "法规标准",
      value: lawDocsData?.meta?.total || 0,
      icon: Scale,
      href: "/law-documents",
      description: "法律法规与行业标准",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">工程咨询数据中台</h1>
        <p className="mt-2 text-muted-foreground">
          元数据驱动的工程咨询全业务数据库管理系统
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 搜索区域 */}
      <div className="flex justify-center">
        <div className="flex items-center gap-3 w-full max-w-2xl">
          <Input
            placeholder="输入文件类型名称或编码搜索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching} size="lg">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            搜索
          </Button>
        </div>
      </div>

      {/* 搜索结果和详情 */}
      {searchKeyword && (
        <div className="flex gap-6">
          {/* 左侧：搜索结果列表 - 固定宽度 */}
          <Card className="w-[360px] flex-shrink-0">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <List className="h-4 w-4" />
                搜索结果
                {searchResults?.data && (
                  <Badge variant="secondary">{searchResults.meta?.total || searchResults.data.length} 条</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !searchResults?.data?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    未找到匹配的文件类型
                  </div>
                ) : (
                  <div className="divide-y">
                    {searchResults.data.map((item: DocType) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedDocTypeId(item.id)}
                        className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                          selectedDocTypeId === item.id ? "bg-accent border-l-2 border-primary" : ""
                        }`}
                      >
                        <div className="font-medium flex items-center gap-2">
                          {item.name}
                          <Badge variant="outline" className="text-xs">{item.code}</Badge>
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.projectPhase && <Badge variant="secondary" className="text-xs">{item.projectPhase}</Badge>}
                          {item.majorCategory && <Badge variant="secondary" className="text-xs">{item.majorCategory}</Badge>}
                          {item.minorCategory && <Badge variant="secondary" className="text-xs">{item.minorCategory}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 右侧：详情展示 - 自适应宽度 */}
          <Card className="flex-1">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                文件类型详情
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                {!selectedDocTypeId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    请从左侧选择一个文件类型查看详情
                  </div>
                ) : isLoadingFullInfo ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : fullInfo ? (
                      <Tabs defaultValue="info" className="p-3">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="info">基本信息</TabsTrigger>
                          <TabsTrigger value="fields">
                            字段 <Badge variant="secondary" className="ml-1">{fullInfo.fields?.length || 0}</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="templates">
                            模板 <Badge variant="secondary" className="ml-1">{fullInfo.templates?.length || 0}</Badge>
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="info" className="mt-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-muted-foreground">名称：</span>{fullInfo.docType.name}</div>
                            <div><span className="text-muted-foreground">编码：</span>{fullInfo.docType.code}</div>
                            <div><span className="text-muted-foreground">阶段：</span>{fullInfo.docType.projectPhase || "-"}</div>
                            <div><span className="text-muted-foreground">大类：</span>{fullInfo.docType.majorCategory || "-"}</div>
                            <div><span className="text-muted-foreground">小类：</span>{fullInfo.docType.minorCategory || "-"}</div>
                            <div><span className="text-muted-foreground">地区：</span>{fullInfo.docType.region || "-"}</div>
                            <div><span className="text-muted-foreground">业主：</span>{fullInfo.docType.ownerOrg || "-"}</div>
                            <div><span className="text-muted-foreground">状态：</span>
                              <Badge variant={fullInfo.docType.status === 1 ? "default" : "secondary"}>
                                {fullInfo.docType.status === 1 ? "启用" : "停用"}
                              </Badge>
                            </div>
                          </div>
                          {fullInfo.docType.bizDescription && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">业务说明：</span>
                              <p className="mt-1">{fullInfo.docType.bizDescription}</p>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="fields" className="mt-3">
                          {fullInfo.fields?.length ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>字段名</TableHead>
                                  <TableHead>编码</TableHead>
                                  <TableHead>类别</TableHead>
                                  <TableHead>必填</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {fullInfo.fields.map((field) => (
                                  <TableRow key={field.id}>
                                    <TableCell>{field.fieldName}</TableCell>
                                    <TableCell className="text-xs">{field.fieldCode}</TableCell>
                                    <TableCell>{field.fieldCategory || "-"}</TableCell>
                                    <TableCell>
                                      <Badge variant={field.requiredFlag === 1 ? "destructive" : "secondary"}>
                                        {field.requiredFlag === 1 ? "是" : "否"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">暂无字段</div>
                          )}
                        </TabsContent>
                        <TabsContent value="templates" className="mt-3">
                          {fullInfo.templates?.length ? (
                            <div className="space-y-2">
                              {fullInfo.templates.map((tpl) => (
                                <div key={tpl.id} className="flex items-center justify-between p-2 border rounded">
                                  <span>{tpl.fileName}</span>
                                  {tpl.filePath && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={`/api/v1/static/${tpl.filePath}`} target="_blank">预览</a>
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">暂无模板</div>
                          )}
                        </TabsContent>
                      </Tabs>
                    ) : null}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
    </div>
  )
}
