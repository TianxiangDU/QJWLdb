import axios, { AxiosError, AxiosInstance } from "axios"
import { ApiResponse, PaginatedResult, ResourceApi } from "@/types/resource"

// Token 管理
const TOKEN_KEY = "qjwl_token"
const USER_KEY = "qjwl_user"

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const removeToken = () => localStorage.removeItem(TOKEN_KEY)

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}
export const setUser = (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user))
export const removeUser = () => localStorage.removeItem(USER_KEY)

export const logout = () => {
  removeToken()
  removeUser()
  window.location.href = "/login"
}

// API 错误类型
export class ApiError extends Error {
  code: string
  traceId?: string
  details?: any

  constructor(message: string, code: string, traceId?: string, details?: any) {
    super(message)
    this.code = code
    this.traceId = traceId
    this.details = details
    this.name = "ApiError"
  }
}

// 创建 axios 实例
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: "/api/v1",
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  // 请求拦截器
  client.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
      if (error.response) {
        const { status, data } = error.response

        // 401 未授权
        if (status === 401) {
          logout()
          return Promise.reject(new ApiError("登录已过期", "UNAUTHORIZED"))
        }

        // 服务端错误
        if (data && data.code) {
          return Promise.reject(
            new ApiError(data.message, data.code, data.traceId, data.details)
          )
        }
      }

      return Promise.reject(new ApiError(error.message || "网络错误", "NETWORK_ERROR"))
    }
  )

  return client
}

export const apiClient = createApiClient()

/**
 * 创建资源 API
 */
export function createResourceApi<T>(basePath: string): ResourceApi<T> {
  return {
    list: async (params) => {
      const { data } = await apiClient.get(`${basePath}/list`, { params })
      return data as PaginatedResult<T>
    },

    get: async (id) => {
      const { data } = await apiClient.get(`${basePath}/${id}`)
      return data as ApiResponse<T>
    },

    create: async (payload) => {
      const { data } = await apiClient.post(basePath, payload)
      return data as ApiResponse<T>
    },

    update: async (id, payload) => {
      const { data } = await apiClient.put(`${basePath}/${id}`, payload)
      return data as ApiResponse<T>
    },

    delete: async (id) => {
      await apiClient.delete(`${basePath}/${id}`)
    },

    batchEnable: async (ids) => {
      // 确保 ids 都是数字类型
      const numericIds = ids.map((id: string | number) => Number(id))
      await apiClient.post(`${basePath}/batch/enable`, { ids: numericIds })
    },

    batchDisable: async (ids) => {
      // 确保 ids 都是数字类型
      const numericIds = ids.map((id: string | number) => Number(id))
      await apiClient.post(`${basePath}/batch/disable`, { ids: numericIds })
    },

    batchDelete: async (ids) => {
      // 确保 ids 都是数字类型
      const numericIds = ids.map((id: string | number) => Number(id))
      await apiClient.post(`${basePath}/batch/delete`, { ids: numericIds })
    },

    downloadTemplate: async () => {
      const response = await apiClient.get(`${basePath}/template`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${basePath.split("/").pop()}_template.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },

    import: async (file) => {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await apiClient.post(`${basePath}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },

    export: async (params) => {
      const response = await apiClient.get(`${basePath}/export`, {
        params,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `${basePath.split("/").pop()}_${new Date().toISOString().slice(0, 10)}.xlsx`
      )
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  }
}

// 认证 API
export const authApi = {
  login: async (username: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", { username, password })
    return data
  },

  register: async (username: string, password: string, nickname?: string) => {
    const { data } = await apiClient.post("/auth/register", {
      username,
      password,
      nickname,
    })
    return data
  },

  profile: async () => {
    const { data } = await apiClient.get("/auth/profile")
    return data
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const { data } = await apiClient.post("/auth/change-password", {
      oldPassword,
      newPassword,
    })
    return data
  },
}

// Meta API
export const metaApi = {
  getTables: async () => {
    const { data } = await apiClient.get("/meta/tables")
    return data
  },

  getTableDetail: async (tableName: string) => {
    const { data } = await apiClient.get(`/meta/tables/${tableName}`)
    return data
  },

  downloadDataDict: async () => {
    const response = await apiClient.get("/meta/dict.xlsx", {
      responseType: "blob",
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `data-dict-${new Date().toISOString().slice(0, 10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

// 文件上传 API
export const fileApi = {
  upload: async (file: File, category?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    if (category) {
      formData.append("category", category)
    }
    const { data } = await apiClient.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },
}
