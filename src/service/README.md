# Axios 网络请求封装

这是一个基于 axios 的网络请求封装，提供了完整的 TypeScript 支持和丰富的功能。

## 功能特性

- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **请求/响应拦截器** - 自动添加 token、统一错误处理
- ✅ **自动重试机制** - 网络错误自动重试
- ✅ **Token 管理** - 自动 token 存储和刷新
- ✅ **文件上传/下载** - 支持文件操作
- ✅ **请求日志** - 开发环境下的详细日志
- ✅ **错误处理** - 统一的错误处理机制

## 快速开始

### 基础用法

```typescript
import http from '@/service'

// GET 请求
const getUserList = async () => {
  try {
    const response = await http.get('/users')
    console.log(response.data)
  } catch (error) {
    console.error('请求失败:', error.message)
  }
}

// POST 请求
const createUser = async (userData: any) => {
  try {
    const response = await http.post('/users', userData)
    console.log('创建成功:', response.data)
  } catch (error) {
    console.error('创建失败:', error.message)
  }
}
```

### 使用预定义的 API

```typescript
import { api } from '@/service'

// 用户登录
const login = async () => {
  try {
    const response = await api.user.login({
      username: 'admin',
      password: '123456'
    })
    console.log('登录成功:', response.data)
  } catch (error) {
    console.error('登录失败:', error.message)
  }
}

// 文件上传
const uploadFile = async (file: File) => {
  try {
    const response = await api.upload.uploadFile(file)
    console.log('上传成功:', response.data)
  } catch (error) {
    console.error('上传失败:', error.message)
  }
}
```

### Token 管理

```typescript
import { TokenManager } from '@/service'

// 设置 token
TokenManager.setToken('your-access-token')

// 获取 token
const token = TokenManager.getToken()

// 清除 token
TokenManager.removeToken()
```

### 文件下载

```typescript
import http from '@/service'

// 下载文件
const downloadFile = async () => {
  try {
    await http.download('/files/download/123', {}, 'filename.pdf')
  } catch (error) {
    console.error('下载失败:', error.message)
  }
}
```

## 配置说明

### 环境变量配置

在 `.env` 文件中配置 API 基础地址：

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:3000/api

# 生产环境
VITE_API_BASE_URL=https://api.example.com
```

### 自定义配置

```typescript
import { HttpRequest } from '@/service'

// 创建自定义实例
const customHttp = new HttpRequest({
  baseURL: 'https://custom-api.com',
  timeout: 15000,
  headers: {
    'Custom-Header': 'value'
  }
})
```

## 错误处理

封装会自动处理以下错误：

- **401 未授权** - 自动清除 token 并跳转登录页
- **403 权限不足** - 显示权限错误提示
- **404 资源不存在** - 显示资源不存在提示
- **5xx 服务器错误** - 显示服务器错误提示
- **网络错误** - 自动重试机制

## 类型定义

```typescript
// API 响应格式
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 请求配置
interface RequestConfig {
  showLoading?: boolean
  showError?: boolean
  timeout?: number
}
```

## 注意事项

1. 所有请求都会自动添加 `Authorization` 头部（如果有 token）
2. GET 请求会自动添加时间戳防止缓存
3. 开发环境下会打印详细的请求/响应日志
4. 网络错误和服务器错误会自动重试（最多 3 次）
5. 文件上传会自动设置 `Content-Type` 为 `multipart/form-data`

## 扩展使用

你可以根据项目需求在 `src/service/index.ts` 中添加更多的 API 定义：

```typescript
export const api = {
  // 添加你的业务 API
  product: {
    getList: (params?: any) => http.get('/products', params),
    getDetail: (id: string) => http.get(`/products/${id}`),
    create: (data: any) => http.post('/products', data),
    update: (id: string, data: any) => http.put(`/products/${id}`, data),
    delete: (id: string) => http.delete(`/products/${id}`),
  }
}
```