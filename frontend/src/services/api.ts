import api from '@/lib/api'
import type {
  InventoryTransaction,
  TransactionFilters,
  CreateInboundTransaction,
  CreateOutboundTransaction,
  Inventory,
  Warehouse,
  Location,
  ApiResponse,
  PaginatedResponse,
  TransactionSummary,
} from '@/types'

export const inventoryTransactionService = {
  // Get all transactions with filters
  getTransactions: async (filters: TransactionFilters = {}): Promise<PaginatedResponse<InventoryTransaction>> => {
    const { data } = await api.get('/inventory-transactions', { params: filters })
    return data
  },

  // Get transaction by ID
  getTransactionById: async (id: string): Promise<ApiResponse<InventoryTransaction>> => {
    const { data } = await api.get(`/inventory-transactions/${id}`)
    return data
  },

  // Create inbound transaction
  createInboundTransaction: async (transaction: CreateInboundTransaction): Promise<ApiResponse<InventoryTransaction>> => {
    const { data } = await api.post('/inventory-transactions/inbound', transaction)
    return data
  },

  // Create outbound transaction
  createOutboundTransaction: async (transaction: CreateOutboundTransaction): Promise<ApiResponse<InventoryTransaction>> => {
    const { data } = await api.post('/inventory-transactions/outbound', transaction)
    return data
  },

  // Get transaction summary
  getTransactionSummary: async (filters: {
    startDate: string
    endDate: string
    warehouse?: string
    type?: string
  }): Promise<ApiResponse<{ summary: TransactionSummary[]; totalTransactions: number; filters: any; generatedAt: string }>> => {
    const { data } = await api.get('/inventory-transactions/summary', { params: filters })
    return data
  },

  // Cancel transaction
  cancelTransaction: async (id: string, reason: string, cancelledBy: { userId: string; userName: string }): Promise<ApiResponse<InventoryTransaction>> => {
    const { data } = await api.put(`/inventory-transactions/${id}/cancel`, { reason, cancelledBy })
    return data
  },
}

export const inventoryService = {
  // Get all inventory
  getInventory: async (filters: any = {}): Promise<PaginatedResponse<Inventory>> => {
    // Remove empty string parameters
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    const { data } = await api.get('/inventory', { params: cleanFilters })
    return data
  },

  // Get inventory by ID
  getInventoryById: async (id: string): Promise<ApiResponse<Inventory>> => {
    const { data } = await api.get(`/inventory/${id}`)
    return data
  },
}

export const warehouseService = {
  // Get all warehouses
  getWarehouses: async (): Promise<ApiResponse<Warehouse[]>> => {
    const { data } = await api.get('/warehouses')
    return data
  },

  // Get warehouse by ID
  getWarehouseById: async (id: string): Promise<ApiResponse<Warehouse>> => {
    const { data } = await api.get(`/warehouses/${id}`)
    return data
  },
}

export const locationService = {
  // Get all locations
  getLocations: async (warehouseId?: string): Promise<ApiResponse<Location[]>> => {
    const params = warehouseId ? { warehouse: warehouseId } : {}
    const { data } = await api.get('/locations', { params })
    return data
  },

  // Get location by ID
  getLocationById: async (id: string): Promise<ApiResponse<Location>> => {
    const { data } = await api.get(`/locations/${id}`)
    return data
  },
}
