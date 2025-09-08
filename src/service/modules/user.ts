import { BaseApiModule, ApiModule } from '../api-manager'
import type { PaginationParams, PaginationResponse } from '../types'

// 用户相关的类型定义
export interface User {
  id: string
  username: string
  email: string
  phone?: string
  avatar?: string
  nickname?: string
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
  updatedAt: string
}

export interface LoginParams {
  username: string
  password: string
  captcha?: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
  expiresIn: number
}

export interface RegisterParams {
  username: string
  password: string
  email: string
  phone?: string
  captcha: string
}

export interface UpdateUserParams {
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export interface ResetPasswordParams {
  email: string
  code: string
  newPassword: string
}

// 用户API模块
@ApiModule('user', 'user')
export class UserApi extends BaseApiModule {
  /**
   * 用户登录
   */
  async login(params: LoginParams): Promise<LoginResponse> {
    return this.request(
      () => this.http.post<LoginResponse>('/auth/login', params),
      '用户登录'
    )
  }

  /**
   * 用户注册
   */
  async register(params: RegisterParams): Promise<User> {
    return this.request(
      () => this.http.post<User>('/auth/register', params),
      '用户注册'
    )
  }

  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    return this.request(
      () => this.http.post<void>('/auth/logout'),
      '退出登录'
    )
  }

  /**
   * 刷新token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return this.request(
      () => this.http.post<LoginResponse>('/auth/refresh', { refreshToken }),
      '刷新token'
    )
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    return this.request(
      () => this.http.get<User>('/user/profile'),
      '获取用户信息'
    )
  }

  /**
   * 更新用户信息
   */
  async updateProfile(params: UpdateUserParams): Promise<User> {
    return this.request(
      () => this.http.put<User>('/user/profile', params),
      '更新用户信息'
    )
  }

  /**
   * 修改密码
   */
  async changePassword(params: ChangePasswordParams): Promise<void> {
    return this.request(
      () => this.http.put<void>('/user/password', params),
      '修改密码'
    )
  }

  /**
   * 重置密码
   */
  async resetPassword(params: ResetPasswordParams): Promise<void> {
    return this.request(
      () => this.http.post<void>('/auth/reset-password', params),
      '重置密码'
    )
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string): Promise<void> {
    return this.request(
      () => this.http.post<void>('/auth/send-code', { email }),
      '发送验证码'
    )
  }

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<{ url: string }> {
    return this.request(
      () => this.http.upload<{ url: string }>('/user/avatar', file),
      '上传头像'
    )
  }

  /**
   * 获取用户列表（管理员功能）
   */
  async getUserList(params: PaginationParams & {
    keyword?: string
    status?: User['status']
  }): Promise<PaginationResponse<User>> {
    return this.request(
      () => this.http.get<PaginationResponse<User>>('/admin/users', params),
      '获取用户列表'
    )
  }

  /**
   * 获取用户详情（管理员功能）
   */
  async getUserDetail(userId: string): Promise<User> {
    return this.request(
      () => this.http.get<User>(`/admin/users/${userId}`),
      '获取用户详情'
    )
  }

  /**
   * 更新用户状态（管理员功能）
   */
  async updateUserStatus(userId: string, status: User['status']): Promise<void> {
    return this.request(
      () => this.http.put<void>(`/admin/users/${userId}/status`, { status }),
      '更新用户状态'
    )
  }

  /**
   * 删除用户（管理员功能）
   */
  async deleteUser(userId: string): Promise<void> {
    return this.request(
      () => this.http.delete<void>(`/admin/users/${userId}`),
      '删除用户'
    )
  }
}

// 创建用户API实例
export const userApi = new UserApi('user')

// 导出便捷的函数式API
export const userService = {
  // 认证相关
  login: (params: LoginParams) => userApi.login(params),
  register: (params: RegisterParams) => userApi.register(params),
  logout: () => userApi.logout(),
  refreshToken: (refreshToken: string) => userApi.refreshToken(refreshToken),
  
  // 用户信息相关
  getCurrentUser: () => userApi.getCurrentUser(),
  updateProfile: (params: UpdateUserParams) => userApi.updateProfile(params),
  changePassword: (params: ChangePasswordParams) => userApi.changePassword(params),
  resetPassword: (params: ResetPasswordParams) => userApi.resetPassword(params),
  sendVerificationCode: (email: string) => userApi.sendVerificationCode(email),
  uploadAvatar: (file: File) => userApi.uploadAvatar(file),
  
  // 管理员功能
  getUserList: (params: PaginationParams & { keyword?: string; status?: User['status'] }) => 
    userApi.getUserList(params),
  getUserDetail: (userId: string) => userApi.getUserDetail(userId),
  updateUserStatus: (userId: string, status: User['status']) => 
    userApi.updateUserStatus(userId, status),
  deleteUser: (userId: string) => userApi.deleteUser(userId),
}