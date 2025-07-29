import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { X, MapPin, Building2, Phone } from 'lucide-react'

interface CreateWarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function CreateWarehouseModal({ isOpen, onClose, onSubmit }: CreateWarehouseModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'distribution',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'Indonesia',
      zipCode: ''
    },
    capacity: {
      totalArea: '',
      usableArea: '',
      unit: 'sqm',
      maxWeight: '',
      weightUnit: 'kg'
    },
    contact: {
      manager: {
        name: '',
        email: '',
        phone: ''
      }
    },
    features: {
      hasLoadingDock: false,
      hasColdStorage: false,
      hasSecuritySystem: false,
      hasFireSafety: false,
      hasClimatControl: false,
      hasRacking: false
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'distribution',
      location: {
        address: '',
        city: '',
        state: '',
        country: 'Indonesia',
        zipCode: ''
      },
      capacity: {
        totalArea: '',
        usableArea: '',
        unit: 'sqm',
        maxWeight: '',
        weightUnit: 'kg'
      },
      contact: {
        manager: {
          name: '',
          email: '',
          phone: ''
        }
      },
      features: {
        hasLoadingDock: false,
        hasColdStorage: false,
        hasSecuritySystem: false,
        hasFireSafety: false,
        hasClimatControl: false,
        hasRacking: false
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
              <Building2 className="w-5 h-5 mr-2" />
              Tambah Warehouse Baru
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Informasi Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Warehouse *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="SW001"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Warehouse *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Warehouse Jakarta Pusat"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      placeholder="Deskripsi warehouse..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Warehouse
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="distribution">Distribution</option>
                      <option value="storage">Storage</option>
                      <option value="fulfillment">Fulfillment</option>
                      <option value="cross_dock">Cross Dock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Lokasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jl. Sudirman No. 123"
                      value={formData.location.address}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, address: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kota *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jakarta"
                      value={formData.location.city}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, city: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provinsi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="DKI Jakarta"
                      value={formData.location.state}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, state: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      placeholder="12345"
                      value={formData.location.zipCode}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, zipCode: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Kapasitas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Area (m²)
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={formData.capacity.totalArea}
                      onChange={(e) => setFormData({
                        ...formData, 
                        capacity: {...formData.capacity, totalArea: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area Terpakai (m²)
                    </label>
                    <input
                      type="number"
                      placeholder="800"
                      value={formData.capacity.usableArea}
                      onChange={(e) => setFormData({
                        ...formData, 
                        capacity: {...formData.capacity, usableArea: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Weight (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="5000"
                      value={formData.capacity.maxWeight}
                      onChange={(e) => setFormData({
                        ...formData, 
                        capacity: {...formData.capacity, maxWeight: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Kontak Manager
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Manager
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.contact.manager.name}
                      onChange={(e) => setFormData({
                        ...formData, 
                        contact: {
                          ...formData.contact,
                          manager: {...formData.contact.manager, name: e.target.value}
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="manager@company.com"
                      value={formData.contact.manager.email}
                      onChange={(e) => setFormData({
                        ...formData, 
                        contact: {
                          ...formData.contact,
                          manager: {...formData.contact.manager, email: e.target.value}
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telepon
                    </label>
                    <input
                      type="tel"
                      placeholder="+62123456789"
                      value={formData.contact.manager.phone}
                      onChange={(e) => setFormData({
                        ...formData, 
                        contact: {
                          ...formData.contact,
                          manager: {...formData.contact.manager, phone: e.target.value}
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Fitur Warehouse</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    hasLoadingDock: 'Loading Dock',
                    hasColdStorage: 'Cold Storage',
                    hasSecuritySystem: 'Security System',
                    hasFireSafety: 'Fire Safety',
                    hasClimatControl: 'Climate Control',
                    hasRacking: 'Racking System'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.features[key as keyof typeof formData.features]}
                        onChange={(e) => setFormData({
                          ...formData, 
                          features: {...formData.features, [key]: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit">
                  <Building2 className="w-4 h-4 mr-2" />
                  Simpan Warehouse
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
