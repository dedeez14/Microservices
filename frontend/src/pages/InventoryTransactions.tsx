import { useState } from 'react'
import { Plus, Filter, Download, Eye } from 'lucide-react'
import { useTransactions } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { CreateTransactionModal } from '@/components/CreateTransactionModal'
import { TransactionFilters } from '@/components/TransactionFilters'
import type { TransactionFilters as TFilters, TransactionType } from '@/types'

export function InventoryTransactions() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType>('INBOUND')
  const [filters, setFilters] = useState<TFilters>({
    page: 1,
    limit: 20
  })

  const { data: transactions, isLoading } = useTransactions(filters)

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type: string) => {
    const typeColors = {
      INBOUND: 'bg-blue-100 text-blue-800',
      OUTBOUND: 'bg-orange-100 text-orange-800',
      ADJUSTMENT: 'bg-purple-100 text-purple-800',
      TRANSFER_IN: 'bg-indigo-100 text-indigo-800',
      TRANSFER_OUT: 'bg-pink-100 text-pink-800',
    }
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'
  }

  const handleCreateTransaction = (type: TransactionType) => {
    setTransactionType(type)
    setShowCreateModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transaksi Inventory</h2>
          <p className="text-muted-foreground">
            Kelola pencatatan barang masuk dan barang keluar
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => handleCreateTransaction('INBOUND')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Barang Masuk
          </Button>
          <Button
            onClick={() => handleCreateTransaction('OUTBOUND')}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Barang Keluar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Transaksi</CardTitle>
              <CardDescription>
                Total: {transactions?.pagination?.totalItems || 0} transaksi
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nilai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions?.data?.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.transactionNumber}
                          </div>
                          <div className="flex space-x-1 mt-1">
                            <span className={cn(
                              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                              getTypeBadge(transaction.type)
                            )}>
                              {transaction.type === 'INBOUND' ? 'Masuk' : 
                               transaction.type === 'OUTBOUND' ? 'Keluar' : 
                               transaction.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {transaction.product.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.abs(transaction.quantity.change).toLocaleString()} {transaction.quantity.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.quantity.change > 0 ? '+' : ''}{transaction.quantity.change}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.cost?.totalCost ? 
                          formatCurrency(transaction.cost.totalCost, transaction.cost.currency) : 
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          getStatusBadge(transaction.status)
                        )}>
                          {transaction.status === 'PENDING' ? 'Menunggu' :
                           transaction.status === 'CONFIRMED' ? 'Dikonfirmasi' :
                           transaction.status === 'CANCELLED' ? 'Dibatalkan' :
                           transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!transactions?.data || transactions.data.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {transactions?.pagination && transactions.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
              <div className="flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
                  disabled={!transactions.pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
                  disabled={!transactions.pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((transactions.pagination.currentPage - 1) * transactions.pagination.itemsPerPage) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(
                        transactions.pagination.currentPage * transactions.pagination.itemsPerPage,
                        transactions.pagination.totalItems
                      )}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{transactions.pagination.totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
                      disabled={!transactions.pagination.hasPrevPage}
                      className="rounded-r-none"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
                      disabled={!transactions.pagination.hasNextPage}
                      className="rounded-l-none"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        type={transactionType}
      />
    </div>
  )
}
