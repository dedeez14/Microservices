import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/api/auth'
import { isTokenExpired } from '@/lib/utils'
import type { User, AuthTokens } from '@/types'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (identifier: string, password: string, twoFactorCode?: string) => Promise<void>
  register: (data: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateUser: (user: User) => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!tokens

  // Load user and tokens from localStorage on init
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedAccessToken = localStorage.getItem('accessToken')
        const storedRefreshToken = localStorage.getItem('refreshToken')

        if (storedUser && storedAccessToken && storedRefreshToken) {
          const parsedUser = JSON.parse(storedUser)
          const tokensData = {
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
            expiresIn: '24h', // Default value
          }

          // Check if access token is expired
          if (isTokenExpired(storedAccessToken)) {
            // Try to refresh token
            try {
              await refreshTokens()
            } catch (error) {
              // Refresh failed, clear auth state
              clearAuthState()
            }
          } else {
            setUser(parsedUser)
            setTokens(tokensData)
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        clearAuthState()
      } finally {
        setIsLoading(false)
      }
    }

    loadAuthState()
  }, [])

  const clearAuthState = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const setAuthState = (userData: User, tokensData: AuthTokens) => {
    setUser(userData)
    setTokens(tokensData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('accessToken', tokensData.accessToken)
    localStorage.setItem('refreshToken', tokensData.refreshToken)
  }

  const login = async (identifier: string, password: string, twoFactorCode?: string) => {
    try {
      setIsLoading(true)
      const response = await authService.login({
        identifier,
        password,
        twoFactorCode,
      })

      if (response.success && response.data) {
        setAuthState(response.data.user, response.data.tokens)
        toast.success('Welcome back!')
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber?: string
  }) => {
    try {
      setIsLoading(true)
      const response = await authService.register(data)

      if (response.success) {
        toast.success('Account created successfully! Please check your email for verification.')
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      const message = error.response?.data?.message || error.message || 'Registration failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      
      // Call logout API if we have a token
      if (tokens?.accessToken) {
        try {
          await authService.logout()
        } catch (error) {
          // Ignore logout API errors
          console.warn('Logout API error:', error)
        }
      }

      clearAuthState()
      toast.success('Logged out successfully')
    } catch (error: any) {
      console.error('Logout error:', error)
      // Still clear local state even if API call fails
      clearAuthState()
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTokens = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken')
      if (!storedRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refreshToken({
        refreshToken: storedRefreshToken,
      })

      if (response.success && response.data) {
        const newTokens = response.data.tokens
        setTokens(newTokens)
        localStorage.setItem('accessToken', newTokens.accessToken)
        localStorage.setItem('refreshToken', newTokens.refreshToken)
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error: any) {
      console.error('Token refresh error:', error)
      clearAuthState()
      throw error
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const checkAuth = async () => {
    try {
      if (!tokens?.accessToken) {
        return
      }

      // Check if token is expired
      if (isTokenExpired(tokens.accessToken)) {
        await refreshTokens()
      }

      // Get current user data
      const response = await authService.getCurrentUser()
      if (response.success && response.data) {
        updateUser(response.data)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      clearAuthState()
    }
  }

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken: refreshTokens,
    updateUser,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
