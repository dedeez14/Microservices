import { useState } from 'react'
import { useTransactionSummary, useInventoryTransactions } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  Package,
  DollarSign,
  Activity,
  Filter,
  FileText,
  PieChart,
  LineChart
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [selectedReport, setSelectedReport] = useState('overview')

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useTransactionSummary({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  })

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useInventoryTransactions({
    page: 1,
    limit: 100,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  })

//   console.log('Transactions:', transactions)
//   console.log('Summary:', summary)

  const summaryData = summary?.data?.summary || []
  const transactionsData = transactions?.data || []
  const inboundData = summaryData.find(s => s._id === 'INBOUND')
  const outboundData = summaryData.find(s => s._id === 'OUTBOUND')

  // Calculate additional metrics
  const totalTransactions = summary?.data?.totalTransactions || 0
  const totalValue = (inboundData?.totalValue || 0) + (outboundData?.totalValue || 0)
  const netQuantity = (inboundData?.totalQuantity || 0) - (outboundData?.totalQuantity || 0)
  const avgTransactionValue = totalTransactions > 0 ? totalValue / totalTransactions : 0

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'inventory', name: 'Inventory Analysis', icon: Package },
    { id: 'transactions', name: 'Transaction Details', icon: Activity },
    { id: 'financial', name: 'Financial Report', icon: DollarSign },
  ]

  const handleExport = () => {
    // Export functionality would be implemented here
    alert('Export functionality akan diimplementasikan')
  }

  return (
    <div className="space-y-6">
      {/* Error Handling */}
      {(summaryError || transactionsError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <Activity className="h-4 w-4" />
              <span className="font-medium">
                Error loading data: {summaryError?.message || transactionsError?.message || 'Rate limit exceeded. Please wait a moment.'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(summaryLoading || transactionsLoading) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span>Loading reports...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan & Analitik</h2>
          <p className="text-muted-foreground">
            Analisis performa warehouse dan inventory
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Periode Laporan
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="self-center">sampai</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <Button>
                <Filter className="w-4 h-4 mr-2" />
                Update Laporan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <Button
              key={type.id}
              variant={selectedReport === type.id ? 'default' : 'outline'}
              onClick={() => setSelectedReport(type.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{type.name}</span>
            </Button>
          )
        })}
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  Periode {formatDate(new Date(dateRange.startDate))} - {formatDate(new Date(dateRange.endDate))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Rata-rata: {formatCurrency(avgTransactionValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Quantity</CardTitle>
                <Package className={`h-4 w-4 ${netQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netQuantity >= 0 ? '+' : ''}{netQuantity}
                </div>
                <p className="text-xs text-muted-foreground">
                  {netQuantity >= 0 ? 'Surplus' : 'Deficit'} inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalTransactions > 0 ? Math.round((outboundData?.totalTransactions || 0) / totalTransactions * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Perputaran barang</p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Barang Masuk</span>
                </CardTitle>
                <CardDescription>Ringkasan transaksi inbound</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {inboundData ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Transaksi:</span>
                      <span className="font-medium">{inboundData.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Quantity:</span>
                      <span className="font-medium">{inboundData.totalQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Nilai:</span>
                      <span className="font-medium text-green-600">{formatCurrency(inboundData.totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rata-rata per Transaksi:</span>
                      <span className="font-medium">
                        {formatCurrency(inboundData.totalValue / inboundData.totalTransactions)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Tidak ada data barang masuk</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span>Barang Keluar</span>
                </CardTitle>
                <CardDescription>Ringkasan transaksi outbound</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {outboundData ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Transaksi:</span>
                      <span className="font-medium">{outboundData.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Quantity:</span>
                      <span className="font-medium">{outboundData.totalQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Nilai:</span>
                      <span className="font-medium text-red-600">{formatCurrency(outboundData.totalValue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rata-rata per Transaksi:</span>
                      <span className="font-medium">
                        {outboundData.totalTransactions > 0 ? formatCurrency((outboundData.totalValue || 0) / outboundData.totalTransactions) : 'Rp 0'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Tidak ada data barang keluar</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Transaction Details Report */}
      {selectedReport === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Detail Transaksi</span>
            </CardTitle>
            <CardDescription>
              Daftar detail transaksi periode {formatDate(new Date(dateRange.startDate))} - {formatDate(new Date(dateRange.endDate))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionsData.slice(0, 10).map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      transaction.type === 'INBOUND' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'INBOUND' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.transactionNumber}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.product.name} • {transaction.warehouse.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(new Date(transaction.transactionDate))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {transaction.quantity.change > 0 ? '+' : ''}{transaction.quantity.change} {transaction.quantity.unit}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(transaction.cost?.totalCost || 0)}
                    </p>
                  </div>
                </div>
              ))}
              
              {transactionsData.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada transaksi pada periode ini</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Analysis */}
      {selectedReport === 'inventory' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Distribusi Inventory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-2" />
                  <p>Chart akan diimplementasikan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="w-5 h-5" />
                <span>Trend Pergerakan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <LineChart className="w-12 h-12 mx-auto mb-2" />
                  <p>Chart akan diimplementasikan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Report */}
      {selectedReport === 'financial' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Laporan Keuangan</span>
            </CardTitle>
            <CardDescription>
              Analisis finansial inventory dan warehouse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">Nilai Inventory</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Inbound Value:</span>
                    <span className="font-medium text-green-600">{formatCurrency(inboundData?.totalValue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Outbound Value:</span>
                    <span className="font-medium text-red-600">{formatCurrency(outboundData?.totalValue || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Value:</span>
                    <span className={`font-medium ${
                      (inboundData?.totalValue || 0) - (outboundData?.totalValue || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency((inboundData?.totalValue || 0) - (outboundData?.totalValue || 0))}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Analisis Biaya</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Cost per Unit (Inbound):</span>
                    <span className="font-medium">
                      {(inboundData?.totalQuantity || 0) > 0 
                        ? formatCurrency((inboundData?.totalValue || 0) / (inboundData?.totalQuantity || 1))
                        : 'Rp 0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Cost per Unit (Outbound):</span>
                    <span className="font-medium">
                      {(outboundData?.totalQuantity || 0) > 0 
                        ? formatCurrency((outboundData?.totalValue || 0) / (outboundData?.totalQuantity || 1))
                        : 'Rp 0'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Inventory Turnover:</span>
                    <span className="font-medium">
                      {(inboundData?.totalQuantity || 0) > 0 
                        ? Math.round((outboundData?.totalQuantity || 0) / (inboundData?.totalQuantity || 1) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
