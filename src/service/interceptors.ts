import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { STATUS_CODE, ERROR_MESSAGES } from './config'
import type { ApiResponse } from './types'

// Token管理
export class TokenManager {
  private static readonly TOKEN_KEY = 'access_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
  }
}

// 请求拦截器
export const requestInterceptor = {
  onFulfilled: (config: InternalAxiosRequestConfig) => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    // 添加token
    const token = TokenManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 打印请求日志（开发环境）
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data,
        headers: config.headers,
      })
    }

    return config
  },
  onRejected: (error: any) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  },
}

// 响应拦截器
export const responseInterceptor = {
  onFulfilled: (response: AxiosResponse<ApiResponse>) => {
    // 打印响应日志（开发环境）
    if (import.meta.env.DEV) {
      console.log('✅ Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      })
    }

    const { data } = response

    // 检查业务状态码
    if (data.code === STATUS_CODE.SUCCESS) {
      // 返回修改后的response，将data替换为业务数据
      return {
        ...response,
        data: data
      }
    }

    // 处理业务错误
    const error = new Error(data.message || '请求失败')
    ;(error as any).code = data.code
    ;(error as any).response = response
    return Promise.reject(error)
  },
  onRejected: (error: any) => {
    console.error('❌ Response Error:', error)

    // 网络错误
    if (!error.response) {
      const networkError = new Error(ERROR_MESSAGES.NETWORK_ERROR)
      ;(networkError as any).code = 'NETWORK_ERROR'
      return Promise.reject(networkError)
    }

    const { status } = error.response

    // 处理HTTP状态码错误
    switch (status) {
      case STATUS_CODE.UNAUTHORIZED:
        // 清除token并跳转到登录页
        TokenManager.removeToken()
        // 这里可以添加路由跳转逻辑
        // router.push('/login')
        break
      case STATUS_CODE.FORBIDDEN:
        // 权限不足
        break
      case STATUS_CODE.NOT_FOUND:
        // 资源不存在
        break
      case STATUS_CODE.SERVER_ERROR:
      case STATUS_CODE.BAD_GATEWAY:
      case STATUS_CODE.SERVICE_UNAVAILABLE:
        // 服务器错误
        break
    }

    // 创建统一的错误对象
    const message = ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN
    const customError = new Error(message)
    ;(customError as any).code = status
    ;(customError as any).response = error.response

    return Promise.reject(customError)
  },
}