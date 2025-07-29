export const APP_NAME = 'User Management System'
export const APP_VERSION = '1.0.0'

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
export const API_TIMEOUT = 10000

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Authentication
export const TOKEN_STORAGE_KEY = 'accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'
export const USER_STORAGE_KEY = 'user'

// Password Requirements
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_REQUIREMENTS = [
  'At least 8 characters long',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one number',
  'At least one special character',
]

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DELETED: 'deleted',
} as const

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
  [USER_STATUS.PENDING]: 'Pending',
  [USER_STATUS.DELETED]: 'Deleted',
} as const

// Audit Log Categories
export const AUDIT_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  ROLE_MANAGEMENT: 'ROLE_MANAGEMENT',
  SYSTEM: 'SYSTEM',
  DATA_ACCESS: 'DATA_ACCESS',
  SECURITY: 'SECURITY',
} as const

export const AUDIT_CATEGORY_LABELS = {
  [AUDIT_CATEGORIES.AUTHENTICATION]: 'Authentication',
  [AUDIT_CATEGORIES.USER_MANAGEMENT]: 'User Management',
  [AUDIT_CATEGORIES.ROLE_MANAGEMENT]: 'Role Management',
  [AUDIT_CATEGORIES.SYSTEM]: 'System',
  [AUDIT_CATEGORIES.DATA_ACCESS]: 'Data Access',
  [AUDIT_CATEGORIES.SECURITY]: 'Security',
} as const

// Audit Log Severity
export const AUDIT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export const AUDIT_SEVERITY_LABELS = {
  [AUDIT_SEVERITY.LOW]: 'Low',
  [AUDIT_SEVERITY.MEDIUM]: 'Medium',
  [AUDIT_SEVERITY.HIGH]: 'High',
  [AUDIT_SEVERITY.CRITICAL]: 'Critical',
} as const

// Audit Log Status
export const AUDIT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  WARNING: 'WARNING',
} as const

export const AUDIT_STATUS_LABELS = {
  [AUDIT_STATUS.SUCCESS]: 'Success',
  [AUDIT_STATUS.FAILURE]: 'Failure',
  [AUDIT_STATUS.WARNING]: 'Warning',
} as const

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  ROLES: '/roles',
  AUDIT: '/audit',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  TWO_FACTOR: '/2fa',
} as const

// Permissions
export const PERMISSIONS = {
  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage-roles',
  USER_MANAGE_STATUS: 'user:manage-status',

  // Role permissions
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_MANAGE_PERMISSIONS: 'role:manage-permissions',

  // Audit permissions
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',

  // System permissions
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_SETTINGS: 'system:settings',
} as const

// Default Roles
export const DEFAULT_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact an administrator.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact an administrator.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_ALREADY_EXISTS: 'This username is already taken.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  REGISTER_SUCCESS: 'Account created successfully. Please verify your email.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  USER_CREATED: 'User created successfully.',
  USER_UPDATED: 'User updated successfully.',
  USER_DELETED: 'User deleted successfully.',
  ROLE_CREATED: 'Role created successfully.',
  ROLE_UPDATED: 'Role updated successfully.',
  ROLE_DELETED: 'Role deleted successfully.',
  TWO_FACTOR_ENABLED: 'Two-factor authentication enabled successfully.',
  TWO_FACTOR_DISABLED: 'Two-factor authentication disabled successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
} as const

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  DATETIME: 'MMM d, yyyy h:mm a',
  TIME: 'h:mm a',
  ISO: 'yyyy-MM-dd',
} as const

// Chart Colors
export const CHART_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6B7280', // gray-500
]

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  TABLE_SETTINGS: 'table-settings',
  DASHBOARD_SETTINGS: 'dashboard-settings',
} as const
