import { useMemo, useState } from 'react'
import { Truck, Users, Route, AlertTriangle, TrendingUp, DollarSign, Activity, CheckCircle } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { formatCurrency } from '@/utils/helpers'

const VEHICLE_STATUS_COLORS = {
  Available: '#10b981',
  'On Trip': '#3b82f6',
  'In Shop': '#f59e0b',
  Retired: '#6b7280',
}

const MONTHLY_EXPENSES = [
  { month: 'Jan', Fuel: 85000, Maintenance: 42000, Toll: 12000, Misc: 8000 },
  { month: 'Feb', Fuel: 92000, Maintenance: 18000, Toll: 15000, Misc: 6000 },
  { month: 'Mar', Fuel: 78000, Maintenance: 95000, Toll: 11000, Misc: 9000 },
  { month: 'Apr', Fuel: 110000, Maintenance: 32000, Toll: 18000, Misc: 7000 },
  { month: 'May', Fuel: 98000, Maintenance: 28000, Toll: 14000, Misc: 11000 },
  { month: 'Jun', Fuel: 115000, Maintenance: 55000, Toll: 16000, Misc: 8000 },
  { month: 'Jul', Fuel: 59750, Maintenance: 127000, Toll: 3350, Misc: 3500 },
]

const FUEL_EFFICIENCY = [
  { week: 'W1', avgKmL: 4.8, target: 5.0 },
  { week: 'W2', avgKmL: 5.1, target: 5.0 },
  { week: 'W3', avgKmL: 4.6, target: 5.0 },
  { week: 'W4', avgKmL: 4.9, target: 5.0 },
  { week: 'W5', avgKmL: 5.3, target: 5.0 },
  { week: 'W6', avgKmL: 5.0, target: 5.0 },
]

const UTILIZATION = [
  { month: 'Jan', utilization: 68 }, { month: 'Feb', utilization: 72 },
  { month: 'Mar', utilization: 65 }, { month: 'Apr', utilization: 80 },
  { month: 'May', utilization: 78 }, { month: 'Jun', utilization: 82 },
  { month: 'Jul', utilization: 75 },
]

function KpiCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 opacity-5 ${gradient}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { vehicles, drivers, trips, expenses } = useApp()
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const kpis = useMemo(() => {
    const active = vehicles.filter(v => v.status === 'On Trip').length
    const avail = vehicles.filter(v => v.status === 'Available').length
    const inShop = vehicles.filter(v => v.status === 'In Shop').length
    const activeTrips = trips.filter(t => t.status === 'Dispatched').length
    const pending = trips.filter(t => t.status === 'Draft').length
    const onDuty = drivers.filter(d => d.status === 'On Trip').length
    const utilization = Math.round((active / vehicles.filter(v => v.status !== 'Retired').length) * 100) || 0
    const totalCost = expenses.reduce((s, e) => s + e.amount, 0)
    return { active, avail, inShop, activeTrips, pending, onDuty, utilization, totalCost }
  }, [vehicles, drivers, trips, expenses])

  const vehicleStatusData = useMemo(() => {
    const counts = {}
    vehicles.forEach(v => { counts[v.status] = (counts[v.status] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [vehicles])

  const recentTrips = trips.slice().reverse().slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="h-8 text-xs rounded-lg border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Vehicle Types</option>
          <option value="Heavy Truck">Heavy Truck</option>
          <option value="Medium Truck">Medium Truck</option>
          <option value="Light Truck">Light Truck</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-8 text-xs rounded-lg border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">Last updated: Jul 12, 2026</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Active Vehicles" value={kpis.active} subtitle="Currently on trips" icon={Truck} gradient="gradient-primary" />
        <KpiCard title="Available" value={kpis.avail} subtitle="Ready to dispatch" icon={CheckCircle} gradient="gradient-success" />
        <KpiCard title="In Maintenance" value={kpis.inShop} subtitle="In shop / repair" icon={AlertTriangle} gradient="gradient-warning" />
        <KpiCard title="Active Trips" value={kpis.activeTrips} subtitle="In progress" icon={Route} gradient="gradient-info" />
        <KpiCard title="Pending Trips" value={kpis.pending} subtitle="Awaiting dispatch" icon={Activity} gradient="gradient-purple" />
        <KpiCard title="Drivers On Duty" value={kpis.onDuty} subtitle="Currently driving" icon={Users} gradient="gradient-primary" />
        <KpiCard title="Fleet Utilization" value={`${kpis.utilization}%`} subtitle="Active vehicle rate" icon={TrendingUp} gradient="gradient-success" />
        <KpiCard title="Total Op. Cost" value={formatCurrency(kpis.totalCost)} subtitle="All categories" icon={DollarSign} gradient="gradient-danger" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie */}
        <Card>
          <CardHeader><CardTitle>Vehicle Status</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {vehicleStatusData.map((entry, i) => (
                    <Cell key={i} fill={VEHICLE_STATUS_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
              {vehicleStatusData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: VEHICLE_STATUS_COLORS[d.name] }} />
                  <span className="text-xs text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fuel Efficiency */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Fuel Efficiency (km/L)</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={FUEL_EFFICIENCY}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[4, 6]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgKmL" name="Actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Expenses */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Expenses (₹)</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_EXPENSES}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Fuel" name="Fuel" fill="#3b82f6" radius={[2,2,0,0]} />
                <Bar dataKey="Maintenance" name="Maintenance" fill="#f59e0b" radius={[2,2,0,0]} />
                <Bar dataKey="Toll" name="Toll" fill="#8b5cf6" radius={[2,2,0,0]} />
                <Bar dataKey="Misc" name="Misc" fill="#6b7280" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Utilization */}
        <Card>
          <CardHeader><CardTitle>Fleet Utilization (%)</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={UTILIZATION}>
                <defs>
                  <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[50, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="utilization" name="Utilization" stroke="#3b82f6" strokeWidth={2} fill="url(#utilGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader><CardTitle>Recent Trips</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTrips.map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.source} → {t.destination}</p>
                  <p className="text-xs text-muted-foreground">{t.id} · {t.dispatchDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(t.revenue)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' :
                    t.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-600' :
                    t.status === 'Draft' ? 'bg-slate-500/10 text-slate-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
