
import type { TransactionFilters as TFilters } from '@/types'

interface TransactionFiltersProps {
  filters: TFilters
  onFiltersChange: (filters: TFilters) => void
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jenis Transaksi
        </label>
        <select
          value={filters.type || ''}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as any || undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Semua</option>
          <option value="INBOUND">Barang Masuk</option>
          <option value="OUTBOUND">Barang Keluar</option>
          <option value="ADJUSTMENT">Penyesuaian</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any || undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Semua</option>
          <option value="PENDING">Menunggu</option>
          <option value="CONFIRMED">Dikonfirmasi</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Mulai
        </label>
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Akhir
        </label>
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  )
}
