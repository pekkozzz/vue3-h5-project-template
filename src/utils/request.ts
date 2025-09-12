// 需要先安装 axios 依赖: npm install axios @types/axios
/*
1，支持切换baseurl
2，响应拦截器处理各种错误，未登录的重定向
3，请求拦截器添加token
4，添加loading
5，typescript类型支持
6，模块化管理
*/
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { toCustomerLogin } from './jump'

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_KALAMINI_API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 不同端token设置可能不一样（面客、员工端）
instance.interceptors.request.use(
  (config) => {
    const cookies:any = document.cookie
    const token = cookies.match(/token=([^;]*)/) && cookies.match(/token=([^;]*)/)[1]
    if (token) {
      config.headers['x-token'] = token
      config.headers['HK-Auth-User-Token'] = token
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 不同端返回数据格式可能不一样（面客、员工端）
instance.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      if (res.code === 401) {
        console.log('未登录')
        toCustomerLogin()
      }
      return Promise.reject(new Error(res.message || '未知错误'))
    }
    return res
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toCustomerLogin()
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error(`未知错误: ${error.response.status}`)
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('网络错误，请检查您的网络连接')
    } else {
      // 请求配置有误
      console.error('请求配置错误:', error.message)
    }

    return Promise.reject(error)
  }
)

// 封装GET请求
export function get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.get(url, { params, ...config })
}

// 封装POST请求
export function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.post(url, data, config)
}

// 封装PUT请求
export function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.put(url, data, config)
}

// 封装DELETE请求
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return instance.delete(url, config)
}

// 导出axios实例
export default instance
