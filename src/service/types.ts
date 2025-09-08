// API响应数据类型定义
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 请求配置类型
export interface RequestConfig {
  showLoading?: boolean
  showError?: boolean
  timeout?: number
}

// 分页参数类型
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页响应类型
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 上传文件响应类型
export interface UploadResponse {
  url: string
  filename: string
  size: number
}