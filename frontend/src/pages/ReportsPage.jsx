import { useMemo } from 'react'
import { Download, FileText, TrendingUp, DollarSign, Fuel, Activity } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { formatCurrency, exportToCSV } from '@/utils/helpers'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value) : p.value}</p>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const { vehicles, trips, maintenance, fuelLogs, expenses } = useApp()

  const vehicleROI = useMemo(() => {
    return vehicles.filter(v => v.status !== 'Retired').map(v => {
      const vTrips = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed')
      const revenue = vTrips.reduce((s, t) => s + t.revenue, 0)
      const maintCost = maintenance.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0)
      const fuelCost = fuelLogs.filter(f => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0)
      const roi = v.acquisitionCost > 0 ? ((revenue - (maintCost + fuelCost)) / v.acquisitionCost * 100).toFixed(1) : 0
      return { name: v.registrationNumber, revenue, maintCost, fuelCost, roi: Number(roi), acquisitionCost: v.acquisitionCost }
    }).sort((a, b) => b.roi - a.roi)
  }, [vehicles, trips, maintenance, fuelLogs])

  const expenseByType = useMemo(() => {
    const map = {}
    expenses.forEach(e => { map[e.type] = (map[e.type] || 0) + e.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [expenses])

  const monthlyRevenue = useMemo(() => {
    const map = {}
    trips.filter(t => t.status === 'Completed').forEach(t => {
      const m = t.dispatchDate.slice(0, 7)
      map[m] = (map[m] || 0) + t.revenue
    })
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue })).sort((a, b) => a.month.localeCompare(b.month))
  }, [trips])

  const fleetUtil = vehicles.filter(v => v.status !== 'Retired')
  const onTripCount = fleetUtil.filter(v => v.status === 'On Trip').length
  const utilPct = fleetUtil.length ? Math.round((onTripCount / fleetUtil.length) * 100) : 0
  const totalRevenue = trips.filter(t => t.status === 'Completed').reduce((s, t) => s + t.revenue, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  const handleExportROI = () => exportToCSV(vehicleROI, 'vehicle_roi_report')

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="sm" onClick={handleExportROI}>
          <Download className="h-3.5 w-3.5" /> Export ROI CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(expenses, 'expenses_report')}>
          <FileText className="h-3.5 w-3.5" /> Export Expenses
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <FileText className="h-3.5 w-3.5" /> Print / PDF
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-success rounded-xl flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Revenue</p>
              <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-danger rounded-xl flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Expenses</p>
              <p className="text-lg font-bold">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Fleet Utilization</p>
              <p className="text-lg font-bold">{utilPct}%</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-warning rounded-xl flex items-center justify-center">
              <Fuel className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Net P&L</p>
              <p className={`text-lg font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(totalRevenue - totalExpenses)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Vehicle ROI (%)</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={vehicleROI} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="roi" name="ROI %" fill="#3b82f6" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseByType} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {expenseByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader><CardTitle>Monthly Revenue (Completed Trips)</CardTitle></CardHeader>
        <CardContent className="pb-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle ROI Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Vehicle', 'Acquisition', 'Revenue', 'Maint. Cost', 'Fuel Cost', 'ROI'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vehicleROI.map(v => (
                  <tr key={v.name} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3">{formatCurrency(v.acquisitionCost)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(v.revenue)}</td>
                    <td className="px-4 py-3 text-amber-600">{formatCurrency(v.maintCost)}</td>
                    <td className="px-4 py-3 text-blue-600">{formatCurrency(v.fuelCost)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${v.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{v.roi}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
