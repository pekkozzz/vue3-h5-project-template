// 导出核心模块
export { default as http, HttpRequest, httpInstances, createHttpInstance } from './request'
export { TokenManager } from './interceptors'
export { BaseApiModule, ApiManager, ApiModule, createApiModule } from './api-manager'
export * from './types'
export * from './config'

// 导出业务API模块
export { userApi, userService } from './modules/user'
export { fileApi, fileService } from './modules/file'
export type * from './modules/user'
export type * from './modules/file'

// 导入默认实例
import http from './request'
import { userService } from './modules/user'
import { fileService } from './modules/file'

// 统一的API对象（保持向后兼容）
export const api = {
  // 用户相关API
  user: userService,
  
  // 文件相关API
  file: fileService,
  
  // 通用CRUD操作（使用默认http实例）
  crud: {
    // 获取列表
    getList: <T>(url: string, params?: any) => 
      http.get<T[]>(url, params).then(res => res.data),
    
    // 获取详情
    getDetail: <T>(url: string, id: string | number) => 
      http.get<T>(`${url}/${id}`).then(res => res.data),
    
    // 创建
    create: <T>(url: string, data: any) => 
      http.post<T>(url, data).then(res => res.data),
    
    // 更新
    update: <T>(url: string, id: string | number, data: any) => 
      http.put<T>(`${url}/${id}`, data).then(res => res.data),
    
    // 删除
    delete: (url: string, id: string | number) => 
      http.delete(`${url}/${id}`).then(res => res.data),
  },
}

// 默认导出http实例
export default http