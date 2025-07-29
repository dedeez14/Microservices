import { useState, useEffect } from 'react'
import { useInventory } from '@/hooks/useApi'
import { useDebounce } from '@/hooks/useDebounce'
import { CreateInventoryItemModal } from '@/components/CreateInventoryItemModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Boxes
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function Inventory() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Debounce search term to avoid too many API calls (wait 500ms after user stops typing)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])
  
  const { data: inventory, isLoading } = useInventory({ 
    page: currentPage, 
    limit: 20,
    search: debouncedSearchTerm,
    warehouse: selectedWarehouse 
  })

  const inventoryData = inventory?.data || []
  const pagination = inventory?.pagination || {}

  // Calculate summary stats
  const totalItems = inventoryData.length
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.cost?.totalValue || 0), 0)
  const lowStockItems = inventoryData.filter(item => item.quantity.available < 10).length

  const getStockStatus = (available: number) => {
    if (available < 10) return { status: 'Low Stock', color: 'text-red-600 bg-red-50', icon: AlertTriangle }
    if (available < 50) return { status: 'Medium Stock', color: 'text-yellow-600 bg-yellow-50', icon: TrendingDown }
    return { status: 'Good Stock', color: 'text-green-600 bg-green-50', icon: TrendingUp }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Kelola inventory dan stok barang warehouse
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Item dalam inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Nilai total inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Item dengan stok rendah</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <Boxes className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(inventoryData.map(item => item.warehouse?._id))].length}
            </div>
            <p className="text-xs text-muted-foreground">Warehouse aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama produk, SKU, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              {isLoading && debouncedSearchTerm ? (
                <span className="animate-pulse">Mencari...</span>
              ) : (
                searchTerm && searchTerm !== debouncedSearchTerm ? (
                  <span className="animate-pulse">Mengetik...</span>
                ) : null
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse
                  </label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Warehouse</option>
                    {[...new Set(inventoryData.map(item => item.warehouse?.name))].map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Semua Kategori</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="food">Food</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Stok
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Semua Status</option>
                    <option value="low">Stok Rendah</option>
                    <option value="medium">Stok Medium</option>
                    <option value="good">Stok Baik</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Inventory</CardTitle>
          <CardDescription>
            Total {(pagination as any)?.totalItems || 0} item inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryData.map((item) => {
              const stockInfo = getStockStatus(item.quantity.available)
              const StockIcon = stockInfo.icon

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                          <StockIcon className="w-3 h-3 mr-1" />
                          {stockInfo.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>SKU: {item.product.sku}</span>
                        <span>•</span>
                        <span>{item.warehouse?.name}</span>
                        <span>•</span>
                        <span>{item.location?.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.product.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {item.quantity.available} {item.quantity.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.quantity.reserved > 0 && `${item.quantity.reserved} reserved`}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(item.cost?.totalValue || 0)}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {(pagination as any)?.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-700">
                Menampilkan {(((pagination as any)?.currentPage - 1) * (pagination as any)?.itemsPerPage) + 1} sampai{' '}
                {Math.min((pagination as any)?.currentPage * (pagination as any)?.itemsPerPage, (pagination as any)?.totalItems)} dari{' '}
                {(pagination as any)?.totalItems} item
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!(pagination as any)?.hasPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!(pagination as any)?.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Inventory Item Modal */}
      <CreateInventoryItemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => {
          console.log('Creating inventory item:', data)
          // TODO: Implement actual API call
          setShowCreateModal(false)
        }}
      />
    </div>
  )
}
