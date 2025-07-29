import { apiClient } from '@/lib/api'
import type { 
  User, 
  CreateUserData as CreateUserRequest, 
  UpdateUserData as UpdateUserRequest, 
  ApiResponse, 
  PaginatedResponse,
  UserQueryParams as UserFilters
} from '@/types'

export const userService = {
  // Get users with pagination and filters
  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.role) queryParams.append('role', params.role)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const url = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(url)
  },

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/api/users/${id}`)
  },

  // Create new user
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post('/api/users', data)
  },

  // Update user
  async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put(`/api/users/${id}`, data)
  },

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/api/users/${id}`)
  },

  // Bulk operations
  async bulkDeleteUsers(userIds: string[]): Promise<ApiResponse<null>> {
    return apiClient.delete('/api/users/bulk', { data: { userIds } })
  },

  async bulkUpdateUsers(updates: Array<{ id: string; data: Partial<UpdateUserRequest> }>): Promise<ApiResponse<User[]>> {
    return apiClient.put('/api/users/bulk', { updates })
  },

  // User status management
  async activateUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.patch(`/api/users/${id}/activate`)
  },

  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.patch(`/api/users/${id}/deactivate`)
  },

  async lockUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.patch(`/api/users/${id}/lock`)
  },

  async unlockUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.patch(`/api/users/${id}/unlock`)
  },

  // Profile management
  async updateProfile(data: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    avatar?: File
  }): Promise<ApiResponse<User>> {
    if (data.avatar) {
      // Upload avatar first
      const formData = new FormData()
      formData.append('avatar', data.avatar)
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'avatar' && value) {
          formData.append(key, value.toString())
        }
      })

      return apiClient.post('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      return apiClient.put('/api/users/profile', data)
    }
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    return apiClient.upload('/api/users/avatar', file)
  },

  // User statistics
  async getUserStats(): Promise<ApiResponse<{
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    lockedUsers: number
    usersByRole: Record<string, number>
    recentRegistrations: number
  }>> {
    return apiClient.get('/api/users/stats')
  },

  // Export users
  async exportUsers(params?: UserFilters): Promise<void> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.role) queryParams.append('role', params.role)
    if (params?.status) queryParams.append('status', params.status)

    const url = `/api/users/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.download(url, 'users.csv')
  },

  // Import users
  async importUsers(file: File): Promise<ApiResponse<{
    imported: number
    failed: number
    errors: string[]
  }>> {
    return apiClient.upload('/api/users/import', file)
  }
}
