import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { DEFAULT_CONFIG, API_CONFIG, getServiceConfig, SERVICES_CONFIG } from './config'
import { requestInterceptor, responseInterceptor } from './interceptors'
import type { ApiResponse, RequestConfig } from './types'

// 创建axios实例
class HttpRequest {
  private instance: AxiosInstance
  private retryCount: number = 0
  private serviceName: string

  constructor(serviceName?: keyof typeof SERVICES_CONFIG, config?: AxiosRequestConfig) {
    // 如果指定了服务名，使用对应的配置；否则使用默认配置
    const serviceConfig = serviceName ? getServiceConfig(serviceName) : DEFAULT_CONFIG
    
    this.instance = axios.create({
      ...serviceConfig,
      ...config,
    })
    
    this.serviceName = serviceName || 'main'
    this.setupInterceptors()
  }

  // 设置拦截器
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      requestInterceptor.onFulfilled,
      requestInterceptor.onRejected
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      responseInterceptor.onFulfilled,
      responseInterceptor.onRejected
    )
  }

  // 重试机制
  private async retryRequest(config: AxiosRequestConfig): Promise<any> {
    if (this.retryCount < API_CONFIG.RETRY_COUNT) {
      this.retryCount++
      console.log(`🔄 Retrying request (${this.retryCount}/${API_CONFIG.RETRY_COUNT}):`, config.url)
      
      // 延迟重试
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY))
      
      return this.instance.request(config)
    }
    throw new Error('请求重试次数已达上限')
  }

  // 通用请求方法
  async request<T = any>(
    config: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      this.retryCount = 0
      const response = await this.instance.request<ApiResponse<T>>(config)
      return response as any
    } catch (error: any) {
      // 网络错误或超时错误进行重试
      if (
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        (error.response && [502, 503, 504].includes(error.response.status))
      ) {
        try {
          return await this.retryRequest(config)
        } catch (retryError) {
          throw retryError
        }
      }
      throw error
    }
  }

  // GET请求
  get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...config,
    })
  }

  // POST请求
  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    })
  }

  // PUT请求
  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    })
  }

  // DELETE请求
  delete<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      params,
      ...config,
    })
  }

  // PATCH请求
  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    })
  }

  // 文件上传
  upload<T = any>(
    url: string,
    file: File | FormData,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    }

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    })
  }

  // 下载文件
  download(
    url: string,
    params?: any,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    return this.instance.request({
      method: 'GET',
      url,
      params,
      responseType: 'blob',
      ...config,
    }).then(response => {
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    })
  }
}

// 创建多个服务实例
export const httpInstances = {
  main: new HttpRequest('main'),
  user: new HttpRequest('user'),
  file: new HttpRequest('file'),
  payment: new HttpRequest('payment'),
}

// 创建服务实例的工厂函数
export const createHttpInstance = (serviceName: keyof typeof SERVICES_CONFIG, config?: AxiosRequestConfig) => {
  return new HttpRequest(serviceName, config)
}

// 默认实例（主服务）
const http = httpInstances.main

// 导出实例和类
export { HttpRequest }
export default http