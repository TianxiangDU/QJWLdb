import axios from "axios"
import { ResourceConfig, PaginatedResponse, QueryParams, ImportResult } from "./types"
import { getToken, logout } from "@/services/api-client"
import { toast } from "@/components/ui/toast"

const API_BASE = "/api/v1"

/**
 * 创建资源的 API 客户端
 */
export function createResourceApi<T = any>(config: ResourceConfig) {
  const basePath = `${API_BASE}${config.api.basePath}`
  const idField = config.api.idField || "id"

  // 通用请求头
  const getHeaders = () => {
    const token = getToken()
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  // 处理 401 错误
  const handle401 = (error: any) => {
    if (error?.response?.status === 401) {
      toast({ title: "登录状态失效，请重新登录", variant: "destructive" })
      logout()
      return true
    }
    return false
  }

  // 显示错误
  const showError = (error: any, defaultMsg: string) => {
    if (!handle401(error)) {
      toast({
        title: error?.response?.data?.message || defaultMsg,
        variant: "destructive",
      })
    }
  }

  return {
    /**
     * 获取列表（分页）
     */
    async list(params: QueryParams = {}): Promise<PaginatedResponse<T>> {
      try {
        const listPath = config.api.list?.path || "/list"
        const response = await axios.get(`${basePath}${listPath}`, {
          params,
          headers: getHeaders(),
        })
        return response.data
      } catch (error: any) {
        showError(error, "获取列表失败")
        throw error
      }
    },

    /**
     * 获取单条记录
     */
    async get(id: string | number): Promise<T> {
      try {
        const getPath = config.api.get?.path || ""
        const response = await axios.get(`${basePath}${getPath}/${id}`, {
          headers: getHeaders(),
        })
        return response.data
      } catch (error: any) {
        showError(error, "获取详情失败")
        throw error
      }
    },

    /**
     * 创建记录
     */
    async create(data: Partial<T>): Promise<T> {
      try {
        const createPath = config.api.create?.path || ""
        const response = await axios.post(`${basePath}${createPath}`, data, {
          headers: getHeaders(),
        })
        toast({ title: "创建成功" })
        return response.data
      } catch (error: any) {
        showError(error, "创建失败")
        throw error
      }
    },

    /**
     * 更新记录
     */
    async update(id: string | number, data: Partial<T>): Promise<T> {
      try {
        const updatePath = config.api.update?.path || ""
        const response = await axios.put(`${basePath}${updatePath}/${id}`, data, {
          headers: getHeaders(),
        })
        toast({ title: "更新成功" })
        return response.data
      } catch (error: any) {
        showError(error, "更新失败")
        throw error
      }
    },

    /**
     * 删除记录
     */
    async delete(id: string | number): Promise<void> {
      try {
        const deletePath = config.api.delete?.path || ""
        await axios.delete(`${basePath}${deletePath}/${id}`, {
          headers: getHeaders(),
        })
        toast({ title: "删除成功" })
      } catch (error: any) {
        showError(error, "删除失败")
        throw error
      }
    },

    /**
     * 批量启用
     */
    async batchEnable(ids: (string | number)[]): Promise<void> {
      if (!config.api.batchEnable) {
        throw new Error("该资源不支持批量启用")
      }
      try {
        await axios.post(
          `${API_BASE}${config.api.batchEnable.path}`,
          { ids },
          { headers: getHeaders() }
        )
        toast({ title: "批量启用成功" })
      } catch (error: any) {
        showError(error, "批量启用失败")
        throw error
      }
    },

    /**
     * 批量停用
     */
    async batchDisable(ids: (string | number)[]): Promise<void> {
      if (!config.api.batchDisable) {
        throw new Error("该资源不支持批量停用")
      }
      try {
        await axios.post(
          `${API_BASE}${config.api.batchDisable.path}`,
          { ids },
          { headers: getHeaders() }
        )
        toast({ title: "批量停用成功" })
      } catch (error: any) {
        showError(error, "批量停用失败")
        throw error
      }
    },

    /**
     * 批量删除
     */
    async batchDelete(ids: (string | number)[]): Promise<void> {
      if (!config.api.batchDelete) {
        throw new Error("该资源不支持批量删除")
      }
      try {
        await axios.post(
          `${API_BASE}${config.api.batchDelete.path}`,
          { ids },
          { headers: getHeaders() }
        )
        toast({ title: "批量删除成功" })
      } catch (error: any) {
        showError(error, "批量删除失败")
        throw error
      }
    },

    /**
     * 下载模板
     */
    async downloadTemplate(): Promise<void> {
      if (!config.api.template) {
        throw new Error("该资源不支持下载模板")
      }
      try {
        const token = getToken()
        const response = await axios({
          url: `${API_BASE}${config.api.template.path}`,
          method: "GET",
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const blob = new Blob([response.data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `${config.name}模板.xlsx`
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        toast({ title: "模板下载成功" })
      } catch (error: any) {
        showError(error, "下载模板失败")
        throw error
      }
    },

    /**
     * 导入数据
     */
    async import(file: File): Promise<ImportResult> {
      if (!config.api.import) {
        throw new Error("该资源不支持导入")
      }
      try {
        const formData = new FormData()
        formData.append("file", file)
        const token = getToken()
        const response = await axios.post(
          `${API_BASE}${config.api.import.path}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        toast({ title: `导入成功: ${response.data.success} 条` })
        return response.data
      } catch (error: any) {
        showError(error, "导入失败")
        throw error
      }
    },

    /**
     * 导出数据
     */
    async export(params: QueryParams = {}): Promise<void> {
      if (!config.api.export) {
        throw new Error("该资源不支持导出")
      }
      try {
        const token = getToken()
        const response = await axios({
          url: `${API_BASE}${config.api.export.path}`,
          method: "GET",
          params,
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const blob = new Blob([response.data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `${config.name}_${new Date().toISOString().slice(0, 10)}.xlsx`
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        toast({ title: "导出成功" })
      } catch (error: any) {
        showError(error, "导出失败")
        throw error
      }
    },

    /**
     * 关联选择器搜索
     */
    async searchRelation(
      resourceKey: string,
      keyword: string,
      searchField: string = "keyword"
    ): Promise<any[]> {
      try {
        // 将 resourceKey 转换为 API 路径格式
        const pathKey = resourceKey
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()
          .replace(/^-/, "")
        const response = await axios.get(`${API_BASE}/${pathKey}s/list`, {
          params: {
            [searchField]: keyword,
            pageSize: 50,
          },
          headers: getHeaders(),
        })
        return response.data?.data || []
      } catch (error: any) {
        if (!handle401(error)) {
          console.error("搜索关联数据失败", error)
        }
        return []
      }
    },
  }
}

export type ResourceApi<T = any> = ReturnType<typeof createResourceApi<T>>
