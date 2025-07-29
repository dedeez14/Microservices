import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { AppLauncher } from '@/components/AppLauncher'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/pages/Dashboard'
import { InventoryTransactions } from '@/pages/InventoryTransactions'
import { Inventory } from '@/pages/Inventory'
import { Warehouses } from '@/pages/Warehouses'
import { Reports } from '@/pages/Reports'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AppLauncher />} />
        <Route path="/login" element={<LoginForm />} />
        
        {/* Protected warehouse management routes */}
        <Route path="/warehouse/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<InventoryTransactions />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
