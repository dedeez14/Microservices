import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { X, Package, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useInventoryItems, useCreateInboundTransaction, useCreateOutboundTransaction } from '@/hooks/useApi'
import type { TransactionType, CreateInboundTransaction, CreateOutboundTransaction, PartyType, QualityStatus } from '@/types'

interface CreateTransactionModalProps {
  open: boolean
  onClose: () => void
  type: TransactionType
}

const inboundSchema = z.object({
  inventoryId: z.string().min(1, 'Pilih inventory item'),
  quantity: z.number().min(1, 'Quantity harus lebih dari 0'),
  unitCost: z.number().min(0, 'Unit cost harus 0 atau lebih'),
  currency: z.string().default('IDR'),
  referenceType: z.string().min(1, 'Tipe referensi wajib diisi'),
  referenceNumber: z.string().optional(),
  referenceDate: z.string().min(1, 'Tanggal referensi wajib diisi'),
  partyType: z.enum(['SUPPLIER', 'CUSTOMER', 'INTERNAL', 'OTHER']).default('SUPPLIER'),
  partyName: z.string().min(1, 'Nama party wajib diisi'),
  partyCode: z.string().optional(),
  partyEmail: z.string().email().optional().or(z.literal('')),
  partyPhone: z.string().optional(),
  batchNumber: z.string().optional(),
  manufactureDate: z.string().optional(),
  expiryDate: z.string().optional(),
  qualityStatus: z.enum(['GOOD', 'DAMAGED', 'EXPIRED', 'QUARANTINE']).default('GOOD'),
  qualityInspector: z.string().optional(),
  qualityNotes: z.string().optional(),
  reason: z.string().min(1, 'Alasan wajib diisi'),
  notes: z.string().optional(),
})

const outboundSchema = z.object({
  inventoryId: z.string().min(1, 'Pilih inventory item'),
  quantity: z.number().min(1, 'Quantity harus lebih dari 0'),
  unitCost: z.number().min(0, 'Unit cost harus 0 atau lebih').optional(),
  currency: z.string().default('IDR'),
  referenceType: z.string().min(1, 'Tipe referensi wajib diisi'),
  referenceNumber: z.string().optional(),
  referenceDate: z.string().min(1, 'Tanggal referensi wajib diisi'),
  partyType: z.enum(['SUPPLIER', 'CUSTOMER', 'INTERNAL', 'OTHER']).default('CUSTOMER'),
  partyName: z.string().min(1, 'Nama party wajib diisi'),
  partyCode: z.string().optional(),
  partyEmail: z.string().email().optional().or(z.literal('')),
  partyPhone: z.string().optional(),
  batchNumber: z.string().optional(),
  qualityStatus: z.enum(['GOOD', 'DAMAGED', 'EXPIRED', 'QUARANTINE']).default('GOOD'),
  qualityNotes: z.string().optional(),
  reason: z.string().min(1, 'Alasan wajib diisi'),
  notes: z.string().optional(),
})

type InboundFormData = z.infer<typeof inboundSchema>
type OutboundFormData = z.infer<typeof outboundSchema>

export function CreateTransactionModal({ open, onClose, type }: CreateTransactionModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { data: inventoryItems, isLoading: loadingInventory } = useInventoryItems()
  const createInbound = useCreateInboundTransaction()
  const createOutbound = useCreateOutboundTransaction()

  const isInbound = type === 'INBOUND'
  const schema = isInbound ? inboundSchema : outboundSchema
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<InboundFormData | OutboundFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: 'IDR',
      partyType: isInbound ? 'SUPPLIER' : 'CUSTOMER',
      qualityStatus: 'GOOD',
      referenceDate: new Date().toISOString().split('T')[0],
    }
  })

  const selectedInventoryId = watch('inventoryId')
  const selectedInventory = inventoryItems?.data?.find(item => item._id === selectedInventoryId)

  useEffect(() => {
    if (!open) {
      reset()
      setShowAdvanced(false)
    }
  }, [open, reset])

  const onSubmit = async (data: InboundFormData | OutboundFormData) => {
    try {
      const baseTransaction = {
        inventoryId: data.inventoryId,
        quantity: data.quantity,
        reference: {
          type: data.referenceType,
          number: data.referenceNumber || '',
          date: data.referenceDate,
        },
        party: {
          type: data.partyType as PartyType,
          name: data.partyName,
          code: data.partyCode || '',
          contact: {
            email: data.partyEmail || '',
            phone: data.partyPhone || '',
          },
        },
        reason: data.reason,
        notes: data.notes || '',
        createdBy: {
          userId: 'current-user', // This should come from auth context
          userName: 'Current User', // This should come from auth context
        },
      }

      if (isInbound) {
        const inboundData = data as InboundFormData
        const transaction: CreateInboundTransaction = {
          ...baseTransaction,
          cost: {
            unitCost: inboundData.unitCost,
            currency: inboundData.currency,
          },
          batch: inboundData.batchNumber ? {
            number: inboundData.batchNumber,
            manufactureDate: inboundData.manufactureDate,
            expiryDate: inboundData.expiryDate,
          } : undefined,
          quality: {
            status: inboundData.qualityStatus as QualityStatus,
            inspector: inboundData.qualityInspector,
            notes: inboundData.qualityNotes,
          },
        }
        
        await createInbound.mutateAsync(transaction)
        toast.success('Transaksi barang masuk berhasil dibuat')
      } else {
        const outboundData = data as OutboundFormData
        const transaction: CreateOutboundTransaction = {
          ...baseTransaction,
          cost: outboundData.unitCost ? {
            unitCost: outboundData.unitCost,
            currency: outboundData.currency,
          } : undefined,
          batch: outboundData.batchNumber ? {
            number: outboundData.batchNumber,
          } : undefined,
          quality: {
            status: outboundData.qualityStatus as QualityStatus,
            notes: outboundData.qualityNotes,
          },
        }
        
        await createOutbound.mutateAsync(transaction)
        toast.success('Transaksi barang keluar berhasil dibuat')
      }

      onClose()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal membuat transaksi')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {isInbound ? (
                    <ArrowUp className="h-6 w-6 text-green-600 mr-2" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-red-600 mr-2" />
                  )}
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isInbound ? 'Buat Transaksi Barang Masuk' : 'Buat Transaksi Barang Keluar'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Inventory Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Item Inventory *
                  </label>
                  <select
                    {...register('inventoryId')}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loadingInventory}
                  >
                    <option value="">Pilih item inventory...</option>
                    {inventoryItems?.data?.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.product.name} - {item.product.sku} (Stok: {item.quantity.available})
                      </option>
                    ))}
                  </select>
                  {errors.inventoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.inventoryId.message}</p>
                  )}
                </div>

                {/* Selected Item Info */}
                {selectedInventory && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium">{selectedInventory.product.name}</p>
                        <p className="text-sm text-gray-500">
                          SKU: {selectedInventory.product.sku} | 
                          Stok Tersedia: {selectedInventory.quantity.available} {selectedInventory.quantity.unit} |
                          Warehouse: {selectedInventory.warehouse.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      {...register('quantity', { valueAsNumber: true })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Masukkan quantity"
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                    )}
                  </div>

                  {/* Unit Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost {isInbound ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('unitCost', { valueAsNumber: true })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Masukkan unit cost"
                    />
                    {errors.unitCost && (
                      <p className="text-red-500 text-sm mt-1">{errors.unitCost.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Reference Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Referensi *
                    </label>
                    <select
                      {...register('referenceType')}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Pilih tipe referensi...</option>
                      <option value="PURCHASE_ORDER">Purchase Order</option>
                      <option value="SALES_ORDER">Sales Order</option>
                      <option value="INVOICE">Invoice</option>
                      <option value="RECEIPT">Receipt</option>
                      <option value="MANUAL">Manual</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {errors.referenceType && (
                      <p className="text-red-500 text-sm mt-1">{errors.referenceType.message}</p>
                    )}
                  </div>

                  {/* Reference Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Referensi *
                    </label>
                    <input
                      type="date"
                      {...register('referenceDate')}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.referenceDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.referenceDate.message}</p>
                    )}
                  </div>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Referensi
                  </label>
                  <input
                    type="text"
                    {...register('referenceNumber')}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Masukkan nomor referensi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Party Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Party
                    </label>
                    <select
                      {...register('partyType')}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="SUPPLIER">Supplier</option>
                      <option value="CUSTOMER">Customer</option>
                      <option value="INTERNAL">Internal</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Party Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Party *
                    </label>
                    <input
                      type="text"
                      {...register('partyName')}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Masukkan nama party"
                    />
                    {errors.partyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.partyName.message}</p>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan *
                  </label>
                  <input
                    type="text"
                    {...register('reason')}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={isInbound ? "Alasan barang masuk (e.g., Pembelian, Return)" : "Alasan barang keluar (e.g., Penjualan, Damaged)"}
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
                  )}
                </div>

                {/* Advanced Options Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {showAdvanced ? 'Sembunyikan' : 'Tampilkan'} Opsi Lanjutan
                  </button>
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Party Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kode Party
                        </label>
                        <input
                          type="text"
                          {...register('partyCode')}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Kode party"
                        />
                      </div>

                      {/* Quality Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status Kualitas
                        </label>
                        <select
                          {...register('qualityStatus')}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="GOOD">Good</option>
                          <option value="DAMAGED">Damaged</option>
                          <option value="EXPIRED">Expired</option>
                          <option value="QUARANTINE">Quarantine</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Party Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Party
                        </label>
                        <input
                          type="email"
                          {...register('partyEmail')}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="email@example.com"
                        />
                        {errors.partyEmail && (
                          <p className="text-red-500 text-sm mt-1">{errors.partyEmail.message}</p>
                        )}
                      </div>

                      {/* Party Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telepon Party
                        </label>
                        <input
                          type="text"
                          {...register('partyPhone')}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Nomor telepon"
                        />
                      </div>
                    </div>

                    {/* Batch Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Batch
                      </label>
                      <input
                        type="text"
                        {...register('batchNumber')}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nomor batch"
                      />
                    </div>

                    {isInbound && (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Manufacture Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Produksi
                          </label>
                          <input
                            type="date"
                            {...register('manufactureDate')}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        {/* Expiry Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Kedaluwarsa
                          </label>
                          <input
                            type="date"
                            {...register('expiryDate')}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}

                    {isInbound && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Inspector Kualitas
                        </label>
                        <input
                          type="text"
                          {...register('qualityInspector')}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Nama inspector"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan Kualitas
                      </label>
                      <textarea
                        {...register('qualityNotes')}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows={2}
                        placeholder="Catatan kualitas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan Tambahan
                      </label>
                      <textarea
                        {...register('notes')}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                        placeholder="Catatan tambahan"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                disabled={isSubmitting || createInbound.isPending || createOutbound.isPending}
                className={`w-full sm:w-auto sm:ml-3 ${
                  isInbound 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting || createInbound.isPending || createOutbound.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  `Buat Transaksi ${isInbound ? 'Masuk' : 'Keluar'}`
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Batal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
