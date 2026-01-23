import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/services/api-client"
import { FileText, FileCheck, Scale, Database, ArrowRight } from "lucide-react"
import { PageLoading } from "@/components/ui/loading"

interface StatCard {
  title: string
  value: number
  icon: React.ElementType
  href: string
  description: string
}

export function HomePage() {
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

  const { data: tablesData } = useQuery({
    queryKey: ["meta-tables-count"],
    queryFn: async () => {
      const { data } = await apiClient.get("/meta/tables")
      return data
    },
  })

  const stats: StatCard[] = [
    {
      title: "文件类型",
      value: docTypesData?.meta?.total || 0,
      icon: FileText,
      href: "/doc-types",
      description: "工程全阶段文件体系",
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
    {
      title: "数据表",
      value: tablesData?.data?.length || 0,
      icon: Database,
      href: "/schema",
      description: "数据库结构与元数据",
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

      {/* 快捷入口 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>常用操作入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/doc-types"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <span>管理文件类型</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/audit-rules"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-primary" />
                <span>管理审计规则</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/schema"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <span>查看数据库结构</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
            <CardDescription>版本与技术栈</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">版本</span>
              <Badge>v1.0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">前端</span>
              <span className="text-sm">React + shadcn/ui + Tailwind</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">后端</span>
              <span className="text-sm">NestJS + TypeORM + MySQL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API 文档</span>
              <a
                href="/api-docs"
                target="_blank"
                className="text-sm text-primary hover:underline"
              >
                Swagger UI
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
