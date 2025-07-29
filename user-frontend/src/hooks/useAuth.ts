import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/lib/api/auth'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import type { 
  LoginCredentials, 
  RegisterData, 
  ChangePasswordData
} from '@/types'

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  twoFactor: () => [...authKeys.all, '2fa'] as const,
}

// Get current user
export function useCurrentUser() {
  const { isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Login mutation
export function useLogin() {
  const { login } = useAuth()
  
  return useMutation({
    mutationFn: async (data: LoginCredentials) => {
      await login(data.identifier, data.password, data.twoFactorCode)
    },
    onSuccess: () => {
      // Handled in auth context
    },
    onError: (error: any) => {
      // Error handling is done in auth context
      console.error('Login mutation error:', error)
    },
  })
}

// Register mutation
export function useRegister() {
  const { register } = useAuth()
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      await register(data)
    },
    onSuccess: () => {
      // Success message handled in auth context
    },
    onError: (error: any) => {
      // Error handling is done in auth context
      console.error('Register mutation error:', error)
    },
  })
}

// Logout mutation
export function useLogout() {
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear()
    },
    onError: (error: any) => {
      console.error('Logout error:', error)
      // Force clear queries even on error
      queryClient.clear()
    },
  })
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => 
      authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
    },
  })
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => 
      authService.forgotPassword(data),
    onSuccess: () => {
      toast.success('Password reset email sent')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
    },
  })
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string; confirmPassword: string }) => 
      authService.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset password'
      toast.error(message)
    },
  })
}

// Email verification
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      toast.success('Email verified successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to verify email'
      toast.error(message)
    },
  })
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: () => authService.resendVerificationEmail(),
    onSuccess: () => {
      toast.success('Verification email sent')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send verification email'
      toast.error(message)
    },
  })
}

// Two-Factor Authentication
export function useSetup2FA() {
  return useQuery({
    queryKey: authKeys.twoFactor(),
    queryFn: () => authService.setup2FA(),
    enabled: false, // Only run when manually triggered
  })
}

export function useVerify2FA() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { token: string; password?: string }) => 
      authService.verify2FA(data),
    onSuccess: () => {
      toast.success('Two-factor authentication enabled')
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to verify 2FA'
      toast.error(message)
    },
  })
}

export function useDisable2FA() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { password: string; token: string }) => 
      authService.disable2FA(data),
    onSuccess: () => {
      toast.success('Two-factor authentication disabled')
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to disable 2FA'
      toast.error(message)
    },
  })
}

export function useGenerate2FABackupCodes() {
  return useMutation({
    mutationFn: () => authService.generateBackupCodes(),
    onSuccess: () => {
      toast.success('Backup codes generated')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate backup codes'
      toast.error(message)
    },
  })
}
