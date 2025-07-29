import { apiClient } from '@/lib/api'
import type { 
  AuditLog, 
  ApiResponse, 
  PaginatedResponse,
  AuditQueryParams,
  AuditStats
} from '@/types'

export const auditService = {
  // Get audit logs with pagination and filters
  async getAuditLogs(params?: AuditQueryParams): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.action) queryParams.append('action', params.action)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.severity) queryParams.append('severity', params.severity)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.resource) queryParams.append('resource', params.resource)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const url = `/api/users/audit${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(url)
  },

  // Get audit log by ID
  async getAuditLogById(id: string): Promise<ApiResponse<AuditLog>> {
    return apiClient.get(`/api/users/audit/${id}`)
  },

  // Get audit statistics
  async getAuditStats(params?: {
    period?: 'day' | 'week' | 'month' | 'year'
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<AuditStats>> {
    const queryParams = new URLSearchParams()
    if (params?.period) queryParams.append('period', params.period)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)

    const url = `/api/users/audit/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(url)
  },

  // Get audit activity timeline
  async getActivityTimeline(params?: {
    userId?: string
    days?: number
    granularity?: 'hour' | 'day' | 'week'
  }): Promise<ApiResponse<Array<{
    date: string
    count: number
    successCount: number
    failureCount: number
    actions: Array<{
      action: string
      count: number
    }>
  }>>> {
    const queryParams = new URLSearchParams()
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.days) queryParams.append('days', params.days.toString())
    if (params?.granularity) queryParams.append('granularity', params.granularity)

    const url = `/audit/timeline${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(url)
  },

  // Get user activity summary
  async getUserActivity(userId: string, params?: {
    days?: number
    limit?: number
  }): Promise<ApiResponse<{
    totalActions: number
    recentActions: AuditLog[]
    actionBreakdown: Array<{
      action: string
      count: number
      lastPerformed: string
    }>
    dailyActivity: Array<{
      date: string
      count: number
    }>
  }>> {
    const queryParams = new URLSearchParams()
    if (params?.days) queryParams.append('days', params.days.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const url = `/audit/users/${userId}/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(url)
  },

  // Get security events
  async getSecurityEvents(params?: {
    severity?: 'HIGH' | 'CRITICAL'
    days?: number
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    const queryParams = new URLSearchParams()
    queryParams.append('category', 'SECURITY')
    if (params?.severity) queryParams.append('severity', params.severity)
    if (params?.days) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - params.days)
      queryParams.append('startDate', startDate.toISOString())
    }
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const url = `/audit${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(url)
  },

  // Export audit logs
  async exportAuditLogs(params?: AuditQueryParams): Promise<void> {
    const queryParams = new URLSearchParams()
    if (params?.action) queryParams.append('action', params.action)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.severity) queryParams.append('severity', params.severity)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.resource) queryParams.append('resource', params.resource)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)

    const url = `/audit/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.download(url, 'audit-logs.csv')
  },

  // Get failed login attempts
  async getFailedLoginAttempts(params?: {
    days?: number
    threshold?: number
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<{
    ipAddress: string
    username?: string
    attempts: number
    lastAttempt: string
    blocked: boolean
  }>>> {
    const queryParams = new URLSearchParams()
    queryParams.append('action', 'LOGIN_FAILED')
    if (params?.days) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - params.days)
      queryParams.append('startDate', startDate.toISOString())
    }
    if (params?.threshold) queryParams.append('threshold', params.threshold.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    return apiClient.get(`/audit/failed-logins${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
  },

  // Get audit summary for dashboard
  async getDashboardSummary(): Promise<ApiResponse<{
    todayActions: number
    weekActions: number
    failedLogins: number
    securityEvents: number
    topActions: Array<{
      action: string
      count: number
    }>
    recentActivity: AuditLog[]
  }>> {
    return apiClient.get('/audit/dashboard')
  }
}
