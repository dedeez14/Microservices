import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { X, Package, Warehouse } from 'lucide-react'

interface CreateInventoryItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function CreateInventoryItemModal({ isOpen, onClose, onSubmit }: CreateInventoryItemModalProps) {
  const [formData, setFormData] = useState({
    warehouse: '',
    location: '',
    product: {
      sku: '',
      name: '',
      description: '',
      category: '',
      brand: '',
      upc: ''
    },
    batch: {
      number: '',
      manufacturingDate: '',
      expiryDate: '',
      supplier: ''
    },
    quantity: {
      available: '',
      unit: 'pcs'
    },
    cost: {
      unitCost: '',
      currency: 'IDR'
    },
    tracking: {
      lotNumber: '',
      barcode: ''
    },
    thresholds: {
      reorderPoint: '',
      reorderQuantity: '',
      minQuantity: ''
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      warehouse: '',
      location: '',
      product: {
        sku: '',
        name: '',
        description: '',
        category: '',
        brand: '',
        upc: ''
      },
      batch: {
        number: '',
        manufacturingDate: '',
        expiryDate: '',
        supplier: ''
      },
      quantity: {
        available: '',
        unit: 'pcs'
      },
      cost: {
        unitCost: '',
        currency: 'IDR'
      },
      tracking: {
        lotNumber: '',
        barcode: ''
      },
      thresholds: {
        reorderPoint: '',
        reorderQuantity: '',
        minQuantity: ''
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Tambah Item Inventory Baru
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Warehouse & Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Warehouse className="w-4 h-4 mr-2" />
                  Lokasi Penyimpanan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warehouse *
                    </label>
                    <select
                      required
                      value={formData.warehouse}
                      onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Warehouse</option>
                      <option value="sw001">Simple Warehouse (SW001)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi *
                    </label>
                    <select
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Lokasi</option>
                      <option value="a01-01-01">Aisle A, Rack 1, Shelf 1</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Informasi Produk</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="PROD001"
                      value={formData.product.sku}
                      onChange={(e) => setFormData({
                        ...formData, 
                        product: {...formData.product, sku: e.target.value.toUpperCase()}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sample Product"
                      value={formData.product.name}
                      onChange={(e) => setFormData({
                        ...formData, 
                        product: {...formData.product, name: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      placeholder="Deskripsi produk..."
                      value={formData.product.description}
                      onChange={(e) => setFormData({
                        ...formData, 
                        product: {...formData.product, description: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori *
                    </label>
                    <select
                      required
                      value={formData.product.category}
                      onChange={(e) => setFormData({
                        ...formData, 
                        product: {...formData.product, category: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Food">Food</option>
                      <option value="Books">Books</option>
                      <option value="Toys">Toys</option>
                      <option value="Home">Home</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      placeholder="Brand Name"
                      value={formData.product.brand}
                      onChange={(e) => setFormData({
                        ...formData, 
                        product: {...formData.product, brand: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Kuantitas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Tersedia *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="100"
                      value={formData.quantity.available}
                      onChange={(e) => setFormData({
                        ...formData, 
                        quantity: {...formData.quantity, available: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      required
                      value={formData.quantity.unit}
                      onChange={(e) => setFormData({
                        ...formData, 
                        quantity: {...formData.quantity, unit: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilogram</option>
                      <option value="lbs">Pounds</option>
                      <option value="ton">Ton</option>
                      <option value="liter">Liter</option>
                      <option value="gallon">Gallon</option>
                      <option value="box">Box</option>
                      <option value="pallet">Pallet</option>
                      <option value="case">Case</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cost */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Harga</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga per Unit
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="50000"
                      value={formData.cost.unitCost}
                      onChange={(e) => setFormData({
                        ...formData, 
                        cost: {...formData.cost, unitCost: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Uang
                    </label>
                    <select
                      value={formData.cost.currency}
                      onChange={(e) => setFormData({
                        ...formData, 
                        cost: {...formData.cost, currency: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="IDR">IDR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Batch & Tracking */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Batch & Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      placeholder="BATCH001"
                      value={formData.batch.number}
                      onChange={(e) => setFormData({
                        ...formData, 
                        batch: {...formData.batch, number: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      placeholder="Supplier Name"
                      value={formData.batch.supplier}
                      onChange={(e) => setFormData({
                        ...formData, 
                        batch: {...formData.batch, supplier: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Expire
                    </label>
                    <input
                      type="date"
                      value={formData.batch.expiryDate}
                      onChange={(e) => setFormData({
                        ...formData, 
                        batch: {...formData.batch, expiryDate: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      placeholder="1234567890123"
                      value={formData.tracking.barcode}
                      onChange={(e) => setFormData({
                        ...formData, 
                        tracking: {...formData.tracking, barcode: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Thresholds */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Threshold Stok</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stok
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="10"
                      value={formData.thresholds.minQuantity}
                      onChange={(e) => setFormData({
                        ...formData, 
                        thresholds: {...formData.thresholds, minQuantity: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Point
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="20"
                      value={formData.thresholds.reorderPoint}
                      onChange={(e) => setFormData({
                        ...formData, 
                        thresholds: {...formData.thresholds, reorderPoint: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="100"
                      value={formData.thresholds.reorderQuantity}
                      onChange={(e) => setFormData({
                        ...formData, 
                        thresholds: {...formData.thresholds, reorderQuantity: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit">
                  <Package className="w-4 h-4 mr-2" />
                  Simpan Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
