import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge, tripStatusTone } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Truck, CheckCircle2, Wrench, Route, Clock, Users, Gauge, DollarSign,
  Activity as ActivityIcon,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, RadialBarChart, RadialBar,
} from 'recharts';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function DashboardPage() {
  const { vehicles, drivers, trips, expenses, activities } = useData();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (regionFilter !== 'all' && v.region !== regionFilter) return false;
      return true;
    });
  }, [vehicles, typeFilter, statusFilter, regionFilter]);

  const activeVehicles = filteredVehicles.filter((v) => v.status === 'On Trip').length;
  const availableVehicles = filteredVehicles.filter((v) => v.status === 'Available').length;
  const inMaintenance = filteredVehicles.filter((v) => v.status === 'In Shop').length;
  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter((d) => d.status === 'On Trip' || d.status === 'Available').length;
  const utilization = filteredVehicles.length > 0
    ? Math.round((activeVehicles / filteredVehicles.length) * 100) : 0;
  const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Chart data
  const vehicleStatusData = [
    { name: 'Available', value: filteredVehicles.filter((v) => v.status === 'Available').length },
    { name: 'On Trip', value: filteredVehicles.filter((v) => v.status === 'On Trip').length },
    { name: 'In Shop', value: filteredVehicles.filter((v) => v.status === 'In Shop').length },
    { name: 'Retired', value: filteredVehicles.filter((v) => v.status === 'Retired').length },
  ].filter((d) => d.value > 0);

  const monthlyExpenses = [
    { month: 'Jan', Fuel: 4200, Toll: 1100, Maintenance: 2800, Misc: 600 },
    { month: 'Feb', Fuel: 3800, Toll: 900, Maintenance: 1900, Misc: 400 },
    { month: 'Mar', Fuel: 5100, Toll: 1400, Maintenance: 3400, Misc: 800 },
    { month: 'Apr', Fuel: 4600, Toll: 1200, Maintenance: 2200, Misc: 500 },
    { month: 'May', Fuel: 5300, Toll: 1500, Maintenance: 3100, Misc: 700 },
    { month: 'Jun', Fuel: 4900, Toll: 1300, Maintenance: 2400, Misc: 600 },
    { month: 'Jul', Fuel: 1521, Toll: 215, Maintenance: 4050, Misc: 75 },
  ];

  const fuelEfficiency = [
    { month: 'Jan', kmpl: 4.2 },
    { month: 'Feb', kmpl: 4.5 },
    { month: 'Mar', kmpl: 4.1 },
    { month: 'Apr', kmpl: 4.8 },
    { month: 'May', kmpl: 4.6 },
    { month: 'Jun', kmpl: 5.0 },
    { month: 'Jul', kmpl: 4.9 },
  ];

  const utilizationData = [{ name: 'Utilization', value: utilization, fill: '#3b82f6' }];

  const recentTrips = trips.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your fleet operations."
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Truck">Truck</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Bus">Bus</SelectItem>
                <SelectItem value="Trailer">Trailer</SelectItem>
                <SelectItem value="Refrigerated">Refrigerated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="On Trip">On Trip</SelectItem>
                <SelectItem value="In Shop">In Shop</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="West">West</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Vehicles" value={activeVehicles} icon={<Truck className="h-6 w-6 text-white" />} gradient="bg-gradient-to-br from-blue-600 to-blue-800" trend={{ value: '12%', up: true }} />
        <KpiCard title="Available Vehicles" value={availableVehicles} icon={<CheckCircle2 className="h-6 w-6 text-white" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <KpiCard title="In Maintenance" value={inMaintenance} icon={<Wrench className="h-6 w-6 text-white" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
        <KpiCard title="Active Trips" value={activeTrips} icon={<Route className="h-6 w-6 text-white" />} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" trend={{ value: '8%', up: true }} />
        <KpiCard title="Pending Trips" value={pendingTrips} icon={<Clock className="h-6 w-6 text-white" />} gradient="bg-gradient-to-br from-slate-500 to-slate-700" />
        <KpiCard title="Drivers On Duty" value={driversOnDuty} icon={<Users className="h-6 w-6 text-white" />} gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" />
        <KpiCard title="Fleet Utilization" value={`${utilization}%`} icon={<Gauge className="h-6 w-6 text-white" />} gradient="bg-gradient-to-br from-purple-500 to-purple-700" />
        <KpiCard title="Total Operational Cost" value={formatCurrency(totalCost)} icon={<DollarSign className="h-6 w-6 text-white" />} gradient="bg-gradient-to-br from-rose-500 to-rose-700" trend={{ value: '5%', up: false }} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vehicle Status Pie */}
        <Card className="animate-slide-up">
          <CardHeader><CardTitle>Vehicle Status Distribution</CardTitle><CardDescription>Current fleet breakdown</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={vehicleStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {vehicleStatusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Expense Bar */}
        <Card className="animate-slide-up">
          <CardHeader><CardTitle>Monthly Expenses</CardTitle><CardDescription>Cost breakdown by category</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="Fuel" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Toll" stackId="a" fill="#10b981" />
                <Bar dataKey="Maintenance" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Misc" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuel Efficiency Line */}
        <Card className="animate-slide-up">
          <CardHeader><CardTitle>Fuel Efficiency</CardTitle><CardDescription>Kilometers per liter (monthly avg)</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={fuelEfficiency}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="kmpl" stroke="#3b82f6" strokeWidth={2} fill="url(#fuelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Utilization Radial */}
        <Card className="animate-slide-up">
          <CardHeader><CardTitle>Fleet Utilization</CardTitle><CardDescription>Percentage of vehicles on active trips</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart innerRadius="50%" outerRadius="90%" data={utilizationData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#3b82f6" background />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: 28, fontWeight: 700 }}>
                  {utilization}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 animate-slide-up">
          <CardHeader><CardTitle>Recent Trips</CardTitle><CardDescription>Latest trip activity</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrips.map((t) => {
                const v = vehicles.find((v) => v.id === t.vehicleId);
                const d = drivers.find((d) => d.id === t.driverId);
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15 shrink-0">
                        <Route className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.source} → {t.destination}</p>
                        <p className="text-xs text-muted-foreground">{v?.registration} · {d?.name} · {formatDate(t.dispatchDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold">{formatCurrency(t.revenue)}</span>
                      <StatusBadge status={t.status} tone={tripStatusTone(t.status)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader><CardTitle className="flex items-center gap-2"><ActivityIcon className="h-4 w-4" /> Activity Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 6).map((a, i) => (
                <div key={a.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15 text-xs font-semibold text-blue-600 shrink-0">
                      {a.user.charAt(0)}
                    </div>
                    {i < 5 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.detail}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(a.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
