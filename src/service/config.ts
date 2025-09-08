import type { AxiosRequestConfig } from 'axios'

// 服务配置类型
export interface ServiceConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

// 多服务配置
export const SERVICES_CONFIG = {
  // 主要业务API
  main: {
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  },
  // 用户服务API
  user: {
    baseURL: import.meta.env.VITE_USER_API_BASE_URL || '/user-api',
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  },
  // 文件服务API
  file: {
    baseURL: import.meta.env.VITE_FILE_API_BASE_URL || '/file-api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  },
  // 支付服务API
  payment: {
    baseURL: import.meta.env.VITE_PAYMENT_API_BASE_URL || '/payment-api',
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  },
} as const

// API基础配置
export const API_CONFIG = {
  // 重试次数
  RETRY_COUNT: 3,
  
  // 重试延迟时间（毫秒）
  RETRY_DELAY: 1000,
}

// 获取服务配置
export const getServiceConfig = (serviceName: keyof typeof SERVICES_CONFIG): AxiosRequestConfig => {
  const config = SERVICES_CONFIG[serviceName]
  if (!config) {
    throw new Error(`Service config not found: ${serviceName}`)
  }
  return config
}

// 默认请求配置（使用主服务）
export const DEFAULT_CONFIG: AxiosRequestConfig = getServiceConfig('main')

// 状态码映射
export const STATUS_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// 错误消息映射
export const ERROR_MESSAGES = {
  [STATUS_CODE.UNAUTHORIZED]: '登录已过期，请重新登录',
  [STATUS_CODE.FORBIDDEN]: '没有权限访问该资源',
  [STATUS_CODE.NOT_FOUND]: '请求的资源不存在',
  [STATUS_CODE.SERVER_ERROR]: '服务器内部错误',
  [STATUS_CODE.BAD_GATEWAY]: '网关错误',
  [STATUS_CODE.SERVICE_UNAVAILABLE]: '服务暂不可用',
  NETWORK_ERROR: '网络连接异常，请检查网络设置',
  TIMEOUT: '请求超时，请稍后重试',
  UNKNOWN: '未知错误，请稍后重试',
} as const