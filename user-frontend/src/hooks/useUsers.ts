import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/api/users'
import toast from 'react-hot-toast'
import type { 
  CreateUserData, 
  UpdateUserData, 
  UserQueryParams
} from '@/types'

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
}

// Get users with pagination and filters
export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Get user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  })
}

// Get user statistics
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userService.getUserStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateUserData) => userService.createUser(data),
    onSuccess: () => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => 
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update user'
      toast.error(message)
    },
  })
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete user'
      toast.error(message)
    },
  })
}

// Bulk delete users mutation
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userIds: string[]) => userService.bulkDeleteUsers(userIds),
    onSuccess: () => {
      toast.success('Users deleted successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete users'
      toast.error(message)
    },
  })
}

// User status mutations
export function useActivateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: (_, id) => {
      toast.success('User activated successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to activate user'
      toast.error(message)
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: (_, id) => {
      toast.success('User deactivated successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to deactivate user'
      toast.error(message)
    },
  })
}

export function useLockUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => userService.lockUser(id),
    onSuccess: (_, id) => {
      toast.success('User locked successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to lock user'
      toast.error(message)
    },
  })
}

export function useUnlockUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => userService.unlockUser(id),
    onSuccess: (_, id) => {
      toast.success('User unlocked successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to unlock user'
      toast.error(message)
    },
  })
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      avatar?: File
    }) => userService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    },
  })
}

// Upload avatar mutation
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      toast.success('Avatar uploaded successfully')
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to upload avatar'
      toast.error(message)
    },
  })
}

// Export users
export function useExportUsers() {
  return useMutation({
    mutationFn: (params?: UserQueryParams) => userService.exportUsers(params),
    onSuccess: () => {
      toast.success('Users exported successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to export users'
      toast.error(message)
    },
  })
}

// Import users
export function useImportUsers() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (file: File) => userService.importUsers(file),
    onSuccess: (response) => {
      if (response.data) {
        toast.success(`Imported ${response.data.imported} users successfully`)
        if (response.data.failed > 0) {
          toast.error(`${response.data.failed} users failed to import`)
        }
      }
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to import users'
      toast.error(message)
    },
  })
}
