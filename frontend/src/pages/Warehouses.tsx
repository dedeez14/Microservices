import { useState } from 'react'
import { useWarehouses } from '@/hooks/useApi'
import { CreateWarehouseModal } from '@/components/CreateWarehouseModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Warehouse, 
  MapPin, 
  Plus, 
  Edit, 
  Eye,
  Building2,
  Package,
  Activity,
  Phone,
  Mail,
  Clock
} from 'lucide-react'

export function Warehouses() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: warehouses, isLoading } = useWarehouses()
  
  const warehousesData = warehouses?.data || []

const handleCreateWarehouse = async (data: any) => {
    try {
        const response = await fetch('/api/warehouses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            throw new Error('Failed to create warehouse')
        }
        setShowCreateModal(false)
        // Optionally: refresh warehouses data here if your hook supports it
    } catch (error) {
        console.error('Error creating warehouse:', error)
        alert('Gagal membuat warehouse')
    }
}

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Warehouse Management</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
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
          <h2 className="text-3xl font-bold tracking-tight">Warehouse Management</h2>
          <p className="text-muted-foreground">
            Kelola warehouse dan lokasi penyimpanan
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Warehouse
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehousesData.length}</div>
            <p className="text-xs text-muted-foreground">Warehouse aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Lokasi tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Capacity</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehousesData.reduce((sum, w) => sum + (w.capacity?.maxVolume || 0), 0)} m³
            </div>
            <p className="text-xs text-muted-foreground">Total kapasitas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Weight</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehousesData.reduce((sum, w) => sum + (w.capacity?.maxWeight || 0), 0)} kg
            </div>
            <p className="text-xs text-muted-foreground">Kapasitas berat</p>
          </CardContent>
        </Card>
      </div>

      {/* Warehouses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {warehousesData.map((warehouse) => (
          <Card key={warehouse._id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Warehouse className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <p className="text-sm text-gray-500">Code: {warehouse.code}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {typeof warehouse.location === 'string' ? warehouse.location : `${warehouse.location?.address}, ${warehouse.location?.city}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">+62 811 234 567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{warehouse.code.toLowerCase()}@warehouse.com</span>
                </div>
              </div>

              {/* Capacity Info */}
              {warehouse.capacity && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Volume:</span>
                    <span className="font-medium">{warehouse.capacity.maxVolume} m³</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Weight:</span>
                    <span className="font-medium">{warehouse.capacity.maxWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{warehouse.capacity.unit}</span>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Active</span>
                </div>
                
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>24/7</span>
                </div>
              </div>

              {/* Description */}
              {warehouse.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">{warehouse.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {warehousesData.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada warehouse
            </h3>
            <p className="text-gray-500 mb-4">
              Mulai dengan menambahkan warehouse pertama Anda
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Warehouse
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Warehouse Modal */}
      <CreateWarehouseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateWarehouse}
      />
    </div>
  )
}

export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan</h2>
        <p className="text-muted-foreground">
          Laporan dan analitik sistem warehouse
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Halaman Laporan
          </h3>
          <p className="text-gray-500">
            Halaman ini akan menampilkan berbagai laporan:
          </p>
          <ul className="text-left max-w-md mx-auto mt-4 space-y-2 text-sm text-gray-600">
            <li>• Laporan transaksi harian/bulanan</li>
            <li>• Analisis pergerakan stok</li>
            <li>• Laporan nilai inventory</li>
            <li>• Grafik tren barang masuk/keluar</li>
            <li>• Export ke Excel/PDF</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
