import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  inventoryTransactionService,
  inventoryService,
  warehouseService,
  locationService,
} from '@/services/api'
import type {
  TransactionFilters,
  CreateInboundTransaction,
  CreateOutboundTransaction,
} from '@/types'

export const useInventoryTransactions = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['inventory-transactions', filters],
    queryFn: () => inventoryTransactionService.getTransactions(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 429) return false
      return failureCount < 2
    },
  })
}

// Transaction queries
export const useTransactions = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => inventoryTransactionService.getTransactions(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 429) return false
      return failureCount < 2
    },
  })
}

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => inventoryTransactionService.getTransactionById(id),
    enabled: !!id,
  })
}

export const useTransactionSummary = (filters: {
  startDate: string
  endDate: string
  warehouse?: string
  type?: string
}) => {
  return useQuery({
    queryKey: ['transaction-summary', filters],
    queryFn: () => inventoryTransactionService.getTransactionSummary(filters),
    enabled: !!(filters.startDate && filters.endDate),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 429) return false
      return failureCount < 2
    },
  })
}

// Transaction mutations
export const useCreateInboundTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (transaction: CreateInboundTransaction) =>
      inventoryTransactionService.createInboundTransaction(transaction),
    onSuccess: () => {
      toast.success('Barang masuk berhasil dicatat')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mencatat barang masuk')
    },
  })
}

export const useCreateOutboundTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (transaction: CreateOutboundTransaction) =>
      inventoryTransactionService.createOutboundTransaction(transaction),
    onSuccess: () => {
      toast.success('Barang keluar berhasil dicatat')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mencatat barang keluar')
    },
  })
}

export const useCancelTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason, cancelledBy }: {
      id: string
      reason: string
      cancelledBy: { userId: string; userName: string }
    }) => inventoryTransactionService.cancelTransaction(id, reason, cancelledBy),
    onSuccess: () => {
      toast.success('Transaksi berhasil dibatalkan')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membatalkan transaksi')
    },
  })
}

// Inventory queries
export const useInventory = (filters: any = {}) => {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => inventoryService.getInventory(filters),
  })
}

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoryService.getInventoryById(id),
    enabled: !!id,
  })
}

// Warehouse queries
export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getWarehouses(),
  })
}

export const useWarehouse = (id: string) => {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: () => warehouseService.getWarehouseById(id),
    enabled: !!id,
  })
}

// Location queries
export const useLocations = (warehouseId?: string) => {
  return useQuery({
    queryKey: ['locations', warehouseId],
    queryFn: () => locationService.getLocations(warehouseId),
  })
}

export const useLocation = (id: string) => {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.getLocationById(id),
    enabled: !!id,
  })
}

// Alias for backward compatibility - use the enhanced version
export const useInventoryItems = useInventory
