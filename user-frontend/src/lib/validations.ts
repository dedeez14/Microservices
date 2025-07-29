import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  phoneNumber: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const verify2FASchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
})

// User schemas
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  phoneNumber: z.string().optional(),
  roles: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
})

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long').optional(),
  phoneNumber: z.string().optional(),
  roles: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'deleted']).optional(),
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long').optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  dateOfBirth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  preferences: z.object({
    language: z.string().optional(),
    timezone: z.string().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      security: z.boolean().optional(),
    }).optional(),
  }).optional(),
})

// Role schemas
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(50, 'Role name is too long')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Role name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string().max(200, 'Description is too long').optional(),
  permissions: z.array(z.string()).optional(),
  level: z.number().min(1, 'Level must be at least 1').max(100, 'Level must be at most 100').optional(),
  parentRole: z.string().optional(),
})

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(50, 'Role name is too long')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Role name can only contain letters, numbers, spaces, hyphens, and underscores')
    .optional(),
  description: z.string().max(200, 'Description is too long').optional(),
  permissions: z.array(z.string()).optional(),
  level: z.number().min(1, 'Level must be at least 1').max(100, 'Level must be at most 100').optional(),
  parentRole: z.string().optional(),
})

// Settings schemas
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.string(),
  timezone: z.string(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    security: z.boolean(),
  }),
})

// Search and filter schemas
export const userFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'deleted']).optional(),
  role: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const auditFilterSchema = z.object({
  search: z.string().optional(),
  action: z.string().optional(),
  category: z.enum(['AUTHENTICATION', 'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'SYSTEM', 'DATA_ACCESS', 'SECURITY']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['SUCCESS', 'FAILURE', 'WARNING']).optional(),
  userId: z.string().optional(),
  resource: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// Bulk operation schemas
export const bulkUserOperationSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user must be selected'),
  action: z.enum(['activate', 'deactivate', 'delete', 'lock', 'unlock']),
})

export const bulkRoleOperationSchema = z.object({
  roleIds: z.array(z.string()).min(1, 'At least one role must be selected'),
  action: z.enum(['delete']),
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'File must be an image (JPEG, PNG, GIF, or WebP)'
    ),
})

export const csvUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => file.type === 'text/csv' || file.name.endsWith('.csv'),
      'File must be a CSV file'
    ),
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type Verify2FAFormData = z.infer<typeof verify2FASchema>
export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type CreateRoleFormData = z.infer<typeof createRoleSchema>
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
export type UserFilterFormData = z.infer<typeof userFilterSchema>
export type AuditFilterFormData = z.infer<typeof auditFilterSchema>
export type BulkUserOperationFormData = z.infer<typeof bulkUserOperationSchema>
export type BulkRoleOperationFormData = z.infer<typeof bulkRoleOperationSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
export type CsvUploadFormData = z.infer<typeof csvUploadSchema>
