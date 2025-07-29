import { apiClient } from '@/lib/api'
import type { 
  Role, 
  CreateRoleData as CreateRoleRequest, 
  UpdateRoleData as UpdateRoleRequest, 
  ApiResponse, 
  PaginatedResponse,
  RoleStats,
  RoleHierarchy
} from '@/types'

export const roleService = {
  // Get roles with pagination and filters
  async getRoles(params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const url = `/api/users/roles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(url)
  },

  // Get role by ID
  async getRoleById(id: string): Promise<ApiResponse<Role>> {
    return apiClient.get(`/api/users/roles/${id}`)
  },

  // Create new role
  async createRole(data: CreateRoleRequest): Promise<ApiResponse<Role>> {
    return apiClient.post('/api/users/roles', data)
  },

  // Update role
  async updateRole(id: string, data: UpdateRoleRequest): Promise<ApiResponse<Role>> {
    return apiClient.put(`/api/users/roles/${id}`, data)
  },

  // Delete role
  async deleteRole(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/api/users/roles/${id}`)
  },

  // Get role hierarchy
  async getRoleHierarchy(): Promise<ApiResponse<RoleHierarchy[]>> {
    return apiClient.get('/api/users/roles/hierarchy')
  },

  // Get role permissions
  async getRolePermissions(id: string): Promise<ApiResponse<string[]>> {
    return apiClient.get(`/api/users/roles/${id}/permissions`)
  },

  // Update role permissions
  async updateRolePermissions(id: string, permissions: string[]): Promise<ApiResponse<Role>> {
    return apiClient.put(`/roles/${id}/permissions`, { permissions })
  },

  // Get available permissions
  async getAvailablePermissions(): Promise<ApiResponse<{
    [category: string]: Array<{
      name: string
      description: string
      resource: string
      action: string
    }>
  }>> {
    return apiClient.get('/roles/permissions/available')
  },

  // Get role statistics
  async getRoleStats(): Promise<ApiResponse<RoleStats>> {
    return apiClient.get('/roles/stats')
  },

  // Bulk operations
  async bulkDeleteRoles(roleIds: string[]): Promise<ApiResponse<null>> {
    return apiClient.delete('/roles/bulk', { data: { roleIds } })
  },

  // Clone role
  async cloneRole(id: string, newName: string): Promise<ApiResponse<Role>> {
    return apiClient.post(`/roles/${id}/clone`, { name: newName })
  },

  // Get users with specific role
  async getUsersByRole(roleId: string, params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)

    const url = `/roles/${roleId}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(url)
  },

  // Assign role to users
  async assignRoleToUsers(roleId: string, userIds: string[]): Promise<ApiResponse<null>> {
    return apiClient.post(`/roles/${roleId}/assign`, { userIds })
  },

  // Remove role from users
  async removeRoleFromUsers(roleId: string, userIds: string[]): Promise<ApiResponse<null>> {
    return apiClient.post(`/roles/${roleId}/remove`, { userIds })
  }
}
