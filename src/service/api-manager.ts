import type { AxiosRequestConfig } from 'axios'
import { httpInstances, createHttpInstance, HttpRequest } from './request'
import { SERVICES_CONFIG } from './config'
import type { ApiResponse } from './types'

// API模块基类
export abstract class BaseApiModule {
  protected http: HttpRequest
  
  constructor(serviceName: keyof typeof SERVICES_CONFIG = 'main', config?: AxiosRequestConfig) {
    // 优先使用预创建的实例，如果需要自定义配置则创建新实例
    if (config) {
      this.http = createHttpInstance(serviceName, config)
    } else {
      this.http = httpInstances[serviceName]
    }
  }

  // 通用的错误处理方法
  protected handleError(error: any, context?: string): never {
    const message = context ? `${context}: ${error.message}` : error.message
    console.error(`[${this.constructor.name}] ${message}`, error)
    throw error
  }

  // 通用的请求包装方法
  protected async request<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    context?: string
  ): Promise<T> {
    try {
      const response = await requestFn()
      return response.data
    } catch (error) {
      this.handleError(error, context)
    }
  }
}

// API模块管理器
export class ApiManager {
  private static modules = new Map<string, BaseApiModule>()
  
  // 注册API模块
  static register<T extends BaseApiModule>(name: string, moduleClass: new (...args: any[]) => T, ...args: any[]): T {
    const instance = new moduleClass(...args)
    this.modules.set(name, instance)
    return instance
  }
  
  // 获取API模块
  static get<T extends BaseApiModule>(name: string): T {
    const module = this.modules.get(name) as T
    if (!module) {
      throw new Error(`API module '${name}' not found. Please register it first.`)
    }
    return module
  }
  
  // 检查模块是否已注册
  static has(name: string): boolean {
    return this.modules.has(name)
  }
  
  // 移除API模块
  static remove(name: string): boolean {
    return this.modules.delete(name)
  }
  
  // 获取所有已注册的模块名称
  static getRegisteredModules(): string[] {
    return Array.from(this.modules.keys())
  }
  
  // 清空所有模块
  static clear(): void {
    this.modules.clear()
  }
}

// 装饰器：自动注册API模块
export function ApiModule(name: string, serviceName?: keyof typeof SERVICES_CONFIG) {
  return function <T extends new (...args: any[]) => BaseApiModule>(constructor: T) {
    // 在类定义完成后自动注册
    setTimeout(() => {
      if (!ApiManager.has(name)) {
        ApiManager.register(name, constructor, serviceName)
      }
    }, 0)
    
    return constructor
  }
}

// 便捷的创建API模块的工厂函数
export function createApiModule<T extends BaseApiModule>(
  name: string,
  moduleClass: new (...args: any[]) => T,
  serviceName?: keyof typeof SERVICES_CONFIG,
  config?: AxiosRequestConfig
): T {
  return ApiManager.register(name, moduleClass, serviceName, config)
}