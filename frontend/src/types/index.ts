export type TransactionType = 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT'
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'
export type QualityStatus = 'GOOD' | 'DAMAGED' | 'EXPIRED' | 'QUARANTINE'
export type PartyType = 'SUPPLIER' | 'CUSTOMER' | 'INTERNAL' | 'OTHER'

export interface BaseEntity {
  _id: string
  createdAt: string
  updatedAt: string
}

export interface Warehouse extends BaseEntity {
  code: string
  name: string
  description?: string
  location: {
    address: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  capacity: {
    maxVolume: number
    maxWeight: number
    unit: string
  }
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
}

export interface Location extends BaseEntity {
  code: string
  name: string
  warehouse: string
  zone?: string
  aisle?: string
  rack?: string
  shelf?: string
  bin?: string
  capacity: {
    maxVolume: number
    maxWeight: number
    unit: string
  }
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  }
  status: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED' | 'MAINTENANCE'
}

export interface Product {
  sku: string
  name: string
  description?: string
  category: string
  brand?: string
  upc?: string
}

export interface Inventory extends BaseEntity {
  warehouse: Warehouse
  location: Location
  product: Product
  quantity: {
    available: number
    reserved: number
    committed: number
    damaged: number
    unit: string
  }
  cost: {
    avgUnitCost: number
    totalValue: number
    currency: string
  }
  batch?: {
    number: string
    manufactureDate: string
    expiryDate: string
  }
  status: 'ACTIVE' | 'INACTIVE'
  lastTransaction?: string
}

export interface InventoryTransaction extends BaseEntity {
  transactionNumber: string
  type: TransactionType
  warehouse: Warehouse
  location: Location
  inventory: Inventory
  product: Product
  quantity: {
    previous: number
    change: number
    current: number
    unit: string
  }
  cost?: {
    unitCost: number
    totalCost: number
    currency: string
  }
  reference?: {
    type: string
    number: string
    date: string
  }
  party?: {
    type: PartyType
    name: string
    code?: string
    contact?: {
      email: string
      phone: string
    }
  }
  batch?: {
    number: string
    manufactureDate?: string
    expiryDate?: string
  }
  quality?: {
    status: QualityStatus
    inspector?: string
    notes?: string
  }
  reason: string
  notes?: string
  status: TransactionStatus
  createdBy: {
    userId: string
    userName: string
  }
  confirmedBy?: {
    userId: string
    userName: string
  }
  cancelledBy?: {
    userId: string
    userName: string
  }
  transactionDate: string
}

export interface TransactionSummary {
  _id: string
  totalTransactions: number
  totalQuantity: number
  totalValue: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
    nextPage: number | null
    prevPage: number | null
  }
}

export interface TransactionFilters {
  page?: number
  limit?: number
  warehouse?: string
  location?: string
  type?: TransactionType
  status?: TransactionStatus
  sku?: string
  startDate?: string
  endDate?: string
}

export interface CreateInboundTransaction {
  inventoryId: string
  quantity: number
  cost: {
    unitCost: number
    currency?: string
  }
  reference: {
    type: string
    number?: string
    date: string
  }
  party: {
    type?: PartyType
    name: string
    code?: string
    contact?: {
      email?: string
      phone?: string
    }
  }
  batch?: {
    number?: string
    manufactureDate?: string
    expiryDate?: string
  }
  quality?: {
    status?: QualityStatus
    inspector?: string
    notes?: string
  }
  reason: string
  notes?: string
  createdBy: {
    userId: string
    userName: string
  }
}

export interface CreateOutboundTransaction {
  inventoryId: string
  quantity: number
  cost?: {
    unitCost?: number
    currency?: string
  }
  reference: {
    type: string
    number?: string
    date: string
  }
  party: {
    type?: PartyType
    name: string
    code?: string
    contact?: {
      email?: string
      phone?: string
    }
  }
  batch?: {
    number?: string
  }
  quality?: {
    status?: QualityStatus
    notes?: string
  }
  reason: string
  notes?: string
  createdBy: {
    userId: string
    userName: string
  }
}
