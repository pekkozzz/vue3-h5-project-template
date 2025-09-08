import { BaseApiModule, ApiModule } from '../api-manager'
import type { PaginationParams, PaginationResponse, UploadResponse } from '../types'

// 文件相关的类型定义
export interface FileInfo {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

export interface UploadOptions {
  folder?: string
  maxSize?: number
  allowedTypes?: string[]
  generateThumbnail?: boolean
}

export interface BatchUploadResult {
  success: UploadResponse[]
  failed: Array<{
    file: string
    error: string
  }>
}

// 文件API模块
@ApiModule('file', 'file')
export class FileApi extends BaseApiModule {
  /**
   * 上传单个文件
   */
  async uploadFile(file: File, options?: UploadOptions): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
        }
      })
    }

    return this.request(
      () => this.http.upload<UploadResponse>('/upload', formData),
      '上传文件'
    )
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(files: File[], options?: UploadOptions): Promise<BatchUploadResult> {
    const formData = new FormData()
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
        }
      })
    }

    return this.request(
      () => this.http.upload<BatchUploadResult>('/upload/batch', formData),
      '批量上传文件'
    )
  }

  /**
   * 获取文件列表
   */
  async getFileList(params: PaginationParams & {
    folder?: string
    mimeType?: string
    keyword?: string
  }): Promise<PaginationResponse<FileInfo>> {
    return this.request(
      () => this.http.get<PaginationResponse<FileInfo>>('/files', params),
      '获取文件列表'
    )
  }

  /**
   * 获取文件详情
   */
  async getFileDetail(fileId: string): Promise<FileInfo> {
    return this.request(
      () => this.http.get<FileInfo>(`/files/${fileId}`),
      '获取文件详情'
    )
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<void> {
    return this.request(
      () => this.http.delete<void>(`/files/${fileId}`),
      '删除文件'
    )
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(fileIds: string[]): Promise<void> {
    return this.request(
      () => this.http.post<void>('/files/batch-delete', { fileIds }),
      '批量删除文件'
    )
  }

  /**
   * 下载文件
   */
  async downloadFile(fileId: string, filename?: string): Promise<void> {
    try {
      await this.http.download(`/files/${fileId}/download`, {}, filename)
    } catch (error) {
      this.handleError(error, '下载文件')
    }
  }

  /**
   * 获取文件下载链接
   */
  async getDownloadUrl(fileId: string, expiresIn?: number): Promise<{ url: string; expiresAt: string }> {
    return this.request(
      () => this.http.get<{ url: string; expiresAt: string }>(`/files/${fileId}/download-url`, { expiresIn }),
      '获取下载链接'
    )
  }

  /**
   * 重命名文件
   */
  async renameFile(fileId: string, newName: string): Promise<FileInfo> {
    return this.request(
      () => this.http.put<FileInfo>(`/files/${fileId}/rename`, { filename: newName }),
      '重命名文件'
    )
  }

  /**
   * 移动文件到指定文件夹
   */
  async moveFile(fileId: string, targetFolder: string): Promise<FileInfo> {
    return this.request(
      () => this.http.put<FileInfo>(`/files/${fileId}/move`, { folder: targetFolder }),
      '移动文件'
    )
  }

  /**
   * 复制文件
   */
  async copyFile(fileId: string, targetFolder?: string): Promise<FileInfo> {
    return this.request(
      () => this.http.post<FileInfo>(`/files/${fileId}/copy`, { folder: targetFolder }),
      '复制文件'
    )
  }

  /**
   * 获取文件夹列表
   */
  async getFolders(): Promise<Array<{ name: string; path: string; fileCount: number }>> {
    return this.request(
      () => this.http.get<Array<{ name: string; path: string; fileCount: number }>>('/folders'),
      '获取文件夹列表'
    )
  }

  /**
   * 创建文件夹
   */
  async createFolder(name: string, parentPath?: string): Promise<{ name: string; path: string }> {
    return this.request(
      () => this.http.post<{ name: string; path: string }>('/folders', { name, parentPath }),
      '创建文件夹'
    )
  }

  /**
   * 删除文件夹
   */
  async deleteFolder(folderPath: string): Promise<void> {
    return this.request(
      () => this.http.delete<void>('/folders', { path: folderPath }),
      '删除文件夹'
    )
  }
}

// 创建文件API实例
export const fileApi = new FileApi('file')

// 导出便捷的函数式API
export const fileService = {
  // 文件上传
  uploadFile: (file: File, options?: UploadOptions) => fileApi.uploadFile(file, options),
  uploadFiles: (files: File[], options?: UploadOptions) => fileApi.uploadFiles(files, options),
  
  // 文件管理
  getFileList: (params: PaginationParams & { folder?: string; mimeType?: string; keyword?: string }) => 
    fileApi.getFileList(params),
  getFileDetail: (fileId: string) => fileApi.getFileDetail(fileId),
  deleteFile: (fileId: string) => fileApi.deleteFile(fileId),
  deleteFiles: (fileIds: string[]) => fileApi.deleteFiles(fileIds),
  
  // 文件操作
  downloadFile: (fileId: string, filename?: string) => fileApi.downloadFile(fileId, filename),
  getDownloadUrl: (fileId: string, expiresIn?: number) => fileApi.getDownloadUrl(fileId, expiresIn),
  renameFile: (fileId: string, newName: string) => fileApi.renameFile(fileId, newName),
  moveFile: (fileId: string, targetFolder: string) => fileApi.moveFile(fileId, targetFolder),
  copyFile: (fileId: string, targetFolder?: string) => fileApi.copyFile(fileId, targetFolder),
  
  // 文件夹管理
  getFolders: () => fileApi.getFolders(),
  createFolder: (name: string, parentPath?: string) => fileApi.createFolder(name, parentPath),
  deleteFolder: (folderPath: string) => fileApi.deleteFolder(folderPath),
}