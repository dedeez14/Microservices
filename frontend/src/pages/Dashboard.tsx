
import { useTransactionSummary, useInventory, useWarehouses } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Package, TrendingUp, TrendingDown, Warehouse } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import SystemIntegrationPanel from '../components/SystemIntegrationPanel'

export function Dashboard() {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  const { data: summary } = useTransactionSummary({
    startDate: firstDayOfMonth.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  })

  const { data: inventory } = useInventory({ limit: 10 })
  const { data: warehouses } = useWarehouses()

  const summaryData = summary?.data?.summary || []
  const inboundData = summaryData.find(s => s._id === 'INBOUND')
  const outboundData = summaryData.find(s => s._id === 'OUTBOUND')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview sistem warehouse untuk bulan {today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouse</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses?.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Warehouse aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory?.pagination?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">Item inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barang Masuk</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inboundData?.totalQuantity || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(inboundData?.totalValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barang Keluar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outboundData?.totalQuantity || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(outboundData?.totalValue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Inventory Terbaru</CardTitle>
            <CardDescription>
              Daftar inventory yang baru diupdate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventory?.data?.slice(0, 5).map((item) => (
              <div key={item._id} className="flex items-center">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {item.product.sku} • {item.warehouse.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.quantity.available} {item.quantity.unit}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.cost.totalValue}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ringkasan Bulan Ini</CardTitle>
            <CardDescription>
              Transaksi inventory bulan {today.toLocaleDateString('id-ID', { month: 'long' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Transaksi</span>
                <span className="text-sm font-bold">{summary?.data?.totalTransactions || 0}</span>
              </div>
              
              {inboundData && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Barang Masuk</span>
                  <span className="text-sm font-medium">{inboundData.totalTransactions}</span>
                </div>
              )}
              
              {outboundData && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">Barang Keluar</span>
                  <span className="text-sm font-medium">{outboundData.totalTransactions}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Last updated: {formatDate(new Date())}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Integration Panel */}
      <div className="mt-8">
        <SystemIntegrationPanel />
      </div>
    </div>
  )
}
