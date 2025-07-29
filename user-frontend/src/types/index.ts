export interface User {
  id: string
  username: string
  email: string
  profile: {
    firstName: string
    lastName: string
    phoneNumber?: string
    bio?: string
    dateOfBirth?: string
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
    avatar?: string
  }
  roles: Role[]
  permissions: string[]
  status: 'active' | 'inactive' | 'pending' | 'deleted'
  emailVerified: boolean
  lastLoginAt?: string
  preferences: {
    language?: string
    timezone?: string
    theme?: 'light' | 'dark' | 'auto'
    notifications?: {
      email?: boolean
      push?: boolean
      security?: boolean
    }
  }
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  level: number
  parentRole?: string
  isSystemRole: boolean
  isSystem: boolean
  status: 'active' | 'inactive'
  userCount?: number
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  userId?: string
  username?: string
  userRole?: string
  action: string
  category: 'AUTHENTICATION' | 'USER_MANAGEMENT' | 'ROLE_MANAGEMENT' | 'SYSTEM' | 'DATA_ACCESS' | 'SECURITY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  resource: string
  method: string
  endpoint: string
  ipAddress: string
  userAgent: string
  description: string
  metadata?: Record<string, any>
  status: 'SUCCESS' | 'FAILURE' | 'WARNING'
  errorMessage?: string
  timestamp: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export interface LoginCredentials {
  identifier: string
  password: string
  twoFactorCode?: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordData {
  password: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  bio?: string
  dateOfBirth?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  preferences?: {
    language?: string
    timezone?: string
    theme?: 'light' | 'dark' | 'auto'
    notifications?: {
      email?: boolean
      push?: boolean
      security?: boolean
    }
  }
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  roles?: string[]
  status?: 'active' | 'inactive' | 'pending'
}

export interface UpdateUserData {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  roles?: string[]
  status?: 'active' | 'inactive' | 'pending' | 'deleted'
}

export interface CreateRoleData {
  name: string
  description?: string
  permissions?: string[]
  level?: number
  parentRole?: string
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: string[]
  level?: number
  parentRole?: string
  status?: 'active' | 'inactive'
}

export interface UserSession {
  id: string
  deviceType: string
  userAgent: string
  ip: string
  createdAt: string
  lastUsed: string
  isCurrentSession: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserQueryParams extends PaginationParams {
  status?: string
  role?: string
}

export interface AuditQueryParams extends PaginationParams {
  action?: string
  category?: string
  severity?: string
  status?: string
  userId?: string
  resource?: string
  startDate?: string
  endDate?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    [key: string]: T[] | {
      current: number
      pages: number
      total: number
      hasNext: boolean
      hasPrev: boolean
    }
    pagination: {
      current: number
      pages: number
      total: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: any[]
}

export interface UserStats {
  total: number
  active: number
  recent: number
  statusBreakdown: Array<{ _id: string; count: number }>
  roleBreakdown: Array<{ _id: string; count: number }>
}

export interface RoleStats {
  totalRoles: number
  systemRoles: number
  customRoles: number
  roleUsage: Array<{
    roleId: string
    roleName: string
    userCount: number
    activeUserCount: number
  }>
}

export interface AuditStats {
  period: string
  totalActivity: number
  failedLogins: number
  passwordResets: number
  actionBreakdown: Array<{ _id: string; count: number }>
  categoryBreakdown: Array<{ _id: string; count: number }>
  severityBreakdown: Array<{ _id: string; count: number }>
  statusBreakdown: Array<{ _id: string; count: number }>
  dailyActivity: Array<{
    _id: string
    count: number
    successCount: number
    failureCount: number
  }>
  topUsers: Array<{
    userId: string
    username: string
    count: number
  }>
}

export interface Theme {
  mode: 'light' | 'dark' | 'auto'
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  security: boolean
}

export interface AppSettings {
  theme: Theme
  notifications: NotificationSettings
  language: string
  timezone: string
}

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
  manualEntryKey: string
}

export interface PermissionCategory {
  [category: string]: string[]
}

export interface RoleHierarchy extends Role {
  children: RoleHierarchy[]
}

export interface DashboardStats {
  users: UserStats
  roles: RoleStats
  audit: AuditStats
}

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  timestamp: string
  read: boolean
}
