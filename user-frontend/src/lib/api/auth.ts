import { apiClient } from '@/lib/api'
import type { 
  LoginCredentials as LoginRequest, 
  RegisterData as RegisterRequest, 
  ApiResponse, 
  User,
  ChangePasswordData as ChangePasswordRequest,
  ResetPasswordData as ResetPasswordRequest,
  TwoFactorSetup as Setup2FAResponse,
  AuthTokens
} from '@/types'

interface ForgotPasswordRequest {
  email: string
}

interface Verify2FARequest {
  token: string
  password?: string
}

interface RefreshTokenRequest {
  refreshToken: string
}

interface LoginResponse {
  user: User
  tokens: AuthTokens
}

export const authService = {
  // Authentication
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/api/auth/login', data)
  },

  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return apiClient.post('/api/auth/register', data)
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post('/api/auth/logout')
  },

  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/api/auth/refresh-token', data)
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get('/api/auth/me')
  },

  // Password management
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.put('/api/auth/change-password', data)
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post('/api/auth/forgot-password', data)
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post('/api/auth/reset-password', data)
  },

  // Email verification
  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    return apiClient.post('/api/auth/verify-email', { token })
  },

  async resendVerificationEmail(): Promise<ApiResponse<null>> {
    return apiClient.post('/api/auth/resend-verification')
  },

  // Two-Factor Authentication
  async setup2FA(): Promise<ApiResponse<Setup2FAResponse>> {
    return apiClient.post('/api/auth/2fa/setup')
  },

  async verify2FA(data: Verify2FARequest): Promise<ApiResponse<null>> {
    return apiClient.post('/api/auth/2fa/verify', data)
  },

  async disable2FA(data: { password: string; token: string }): Promise<ApiResponse<null>> {
    return apiClient.post('/api/auth/2fa/disable', data)
  },

  async generateBackupCodes(): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return apiClient.post('/api/auth/2fa/backup-codes')
  },

  async verify2FABackupCode(data: { backupCode: string }): Promise<ApiResponse<null>> {
    return apiClient.post('/api/auth/2fa/verify-backup', data)
  }
}
