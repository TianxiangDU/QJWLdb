import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { metaApi } from "@/services/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageLoading } from "@/components/ui/loading"
import { Database, Download, Search, Table as TableIcon, Key, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableInfo {
  tableName: string
  tableComment: string
  estimatedRows: number
}

interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue: string | null
  comment: string
  key: string
}

interface IndexInfo {
  indexName: string
  columnName: string
  nonUnique: boolean
  indexType: string
}

interface ForeignKeyInfo {
  constraintName: string
  columnName: string
  referencedTable: string
  referencedColumn: string
}

export function SchemaExplorerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  // 获取所有表
  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ["meta-tables"],
    queryFn: () => metaApi.getTables(),
  })

  // 获取选中表的详情
  const { data: tableDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["meta-table-detail", selectedTable],
    queryFn: () => metaApi.getTableDetail(selectedTable!),
    enabled: !!selectedTable,
  })

  const tables: TableInfo[] = tablesData?.data || []
  const filteredTables = tables.filter(
    (t) =>
      t.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tableComment?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportDict = async () => {
    await metaApi.downloadDataDict()
  }

  if (tablesLoading) {
    return <PageLoading />
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* 左侧表列表 */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              数据表
            </CardTitle>
            <Badge variant="secondary">{tables.length}</Badge>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索表名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="px-4 pb-4 space-y-1">
              {filteredTables.map((table) => (
                <div
                  key={table.tableName}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent",
                    selectedTable === table.tableName && "bg-accent"
                  )}
                  onClick={() => setSelectedTable(table.tableName)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TableIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {table.tableName}
                      </div>
                      {table.tableComment && (
                        <div className="text-xs text-muted-foreground truncate">
                          {table.tableComment}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {table.estimatedRows}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 右侧详情 */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedTable ? (
                <div>
                  <span className="font-mono">{selectedTable}</span>
                  {tableDetail?.data?.tableComment && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      {tableDetail.data.tableComment}
                    </span>
                  )}
                </div>
              ) : (
                "选择一个表查看详情"
              )}
            </CardTitle>
            <Button onClick={handleExportDict} variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              导出数据字典
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {selectedTable ? (
            detailLoading ? (
              <PageLoading />
            ) : (
              <Tabs defaultValue="columns" className="h-full flex flex-col">
                <TabsList>
                  <TabsTrigger value="columns" className="gap-1">
                    <TableIcon className="h-4 w-4" />
                    字段 ({tableDetail?.data?.columns?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="indexes" className="gap-1">
                    <Key className="h-4 w-4" />
                    索引 ({tableDetail?.data?.indexes?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="foreignKeys" className="gap-1">
                    <Link2 className="h-4 w-4" />
                    外键 ({tableDetail?.data?.foreignKeys?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="columns" className="flex-1 overflow-auto mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>字段名</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>可空</TableHead>
                        <TableHead>默认值</TableHead>
                        <TableHead>键</TableHead>
                        <TableHead>说明</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableDetail?.data?.columns?.map((col: ColumnInfo) => (
                        <TableRow key={col.name}>
                          <TableCell className="font-mono">{col.name}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {col.type}
                          </TableCell>
                          <TableCell>
                            {col.nullable ? (
                              <Badge variant="outline">YES</Badge>
                            ) : (
                              <Badge variant="secondary">NO</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {col.defaultValue || "-"}
                          </TableCell>
                          <TableCell>
                            {col.key === "PRI" && (
                              <Badge variant="default">PK</Badge>
                            )}
                            {col.key === "UNI" && (
                              <Badge variant="secondary">UK</Badge>
                            )}
                            {col.key === "MUL" && (
                              <Badge variant="outline">FK</Badge>
                            )}
                          </TableCell>
                          <TableCell>{col.comment || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="indexes" className="flex-1 overflow-auto mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>索引名</TableHead>
                        <TableHead>字段</TableHead>
                        <TableHead>唯一</TableHead>
                        <TableHead>类型</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableDetail?.data?.indexes?.map((idx: IndexInfo, i: number) => (
                        <TableRow key={`${idx.indexName}-${i}`}>
                          <TableCell className="font-mono">{idx.indexName}</TableCell>
                          <TableCell className="font-mono">{idx.columnName}</TableCell>
                          <TableCell>
                            {!idx.nonUnique ? (
                              <Badge variant="success">是</Badge>
                            ) : (
                              <Badge variant="outline">否</Badge>
                            )}
                          </TableCell>
                          <TableCell>{idx.indexType}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="foreignKeys" className="flex-1 overflow-auto mt-4">
                  {tableDetail?.data?.foreignKeys?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>约束名</TableHead>
                          <TableHead>字段</TableHead>
                          <TableHead>关联表</TableHead>
                          <TableHead>关联字段</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableDetail?.data?.foreignKeys?.map((fk: ForeignKeyInfo, i: number) => (
                          <TableRow key={`${fk.constraintName}-${i}`}>
                            <TableCell className="font-mono">{fk.constraintName}</TableCell>
                            <TableCell className="font-mono">{fk.columnName}</TableCell>
                            <TableCell className="font-mono">{fk.referencedTable}</TableCell>
                            <TableCell className="font-mono">{fk.referencedColumn}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                      该表没有外键约束
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>从左侧选择一个表查看其结构</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
