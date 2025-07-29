import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import RolesPage from './pages/RolesPage'
import AuditPage from './pages/AuditPage'
import SystemStatusPage from './pages/SystemStatusPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import TwoFactorPage from './pages/TwoFactorPage'

// Layout
import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401, 403, 404
        if (error?.response?.status === 401 || 
            error?.response?.status === 403 || 
            error?.response?.status === 404) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={
                  <AuthLayout>
                    <LoginPage />
                  </AuthLayout>
                } />
                <Route path="/register" element={
                  <AuthLayout>
                    <RegisterPage />
                  </AuthLayout>
                } />
                <Route path="/forgot-password" element={
                  <AuthLayout>
                    <ForgotPasswordPage />
                  </AuthLayout>
                } />
                <Route path="/reset-password" element={
                  <AuthLayout>
                    <ResetPasswordPage />
                  </AuthLayout>
                } />
                <Route path="/verify-email" element={
                  <AuthLayout>
                    <VerifyEmailPage />
                  </AuthLayout>
                } />

                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Navigate to="/dashboard" replace />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute permissions={['user:read']}>
                    <DashboardLayout>
                      <UsersPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/roles" element={
                  <ProtectedRoute permissions={['role:read']}>
                    <DashboardLayout>
                      <RolesPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/audit" element={
                  <ProtectedRoute permissions={['audit:read']}>
                    <DashboardLayout>
                      <AuditPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/system-status" element={
                  <ProtectedRoute permissions={['system:read']}>
                    <DashboardLayout>
                      <SystemStatusPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/2fa" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TwoFactorPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>

      {/* React Query Devtools */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default App
