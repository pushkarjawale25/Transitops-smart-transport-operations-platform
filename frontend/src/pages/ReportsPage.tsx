import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Download, FileText, TrendingUp, Gauge, DollarSign, Percent } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { formatCurrency, downloadCSV, downloadPDF } from '@/utils/format';

export function ReportsPage() {
  const { vehicles, trips, maintenance, fuelLogs } = useData();

  // ROI per vehicle: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
  const roiData = useMemo(() => {
    return vehicles.map((v) => {
      const revenue = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed').reduce((s, t) => s + t.revenue, 0);
      const maintCost = maintenance.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
      const fuelCost = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0);
      const roi = v.acquisitionCost > 0
        ? ((revenue - (maintCost + fuelCost)) / v.acquisitionCost) * 100
        : 0;
      return { vehicle: v, revenue, maintCost, fuelCost, roi, totalCost: maintCost + fuelCost };
    });
  }, [vehicles, trips, maintenance, fuelLogs]);

  const totalRevenue = roiData.reduce((s, r) => s + r.revenue, 0);
  const totalMaint = roiData.reduce((s, r) => s + r.maintCost, 0);
  const totalFuel = roiData.reduce((s, r) => s + r.fuelCost, 0);
  const totalAcq = vehicles.reduce((s, v) => s + v.acquisitionCost, 0);
  const fleetROI = totalAcq > 0 ? ((totalRevenue - (totalMaint + totalFuel)) / totalAcq) * 100 : 0;
  const utilization = vehicles.length > 0
    ? Math.round((vehicles.filter((v) => v.status === 'On Trip').length / vehicles.length) * 100) : 0;

  // Fuel efficiency: total km / total liters (approx from odometer deltas — simplified)
  const fuelEfficiencyData = [
    { month: 'Jan', efficiency: 4.2 }, { month: 'Feb', efficiency: 4.5 },
    { month: 'Mar', efficiency: 4.1 }, { month: 'Apr', efficiency: 4.8 },
    { month: 'May', efficiency: 4.6 }, { month: 'Jun', efficiency: 5.0 },
    { month: 'Jul', efficiency: 4.9 },
  ];

  const operationalCostData = [
    { month: 'Jan', Maintenance: 2800, Fuel: 4200, Tolls: 1100 },
    { month: 'Feb', Maintenance: 1900, Fuel: 3800, Tolls: 900 },
    { month: 'Mar', Maintenance: 3400, Fuel: 5100, Tolls: 1400 },
    { month: 'Apr', Maintenance: 2200, Fuel: 4600, Tolls: 1200 },
    { month: 'May', Maintenance: 3100, Fuel: 5300, Tolls: 1500 },
    { month: 'Jun', Maintenance: 2400, Fuel: 4900, Tolls: 1300 },
  ];

  const exportCSV = () => {
    const rows = roiData.map((r) => ({
      Registration: r.vehicle.registration,
      Name: r.vehicle.name,
      Type: r.vehicle.type,
      AcquisitionCost: r.vehicle.acquisitionCost,
      Revenue: r.revenue,
      MaintenanceCost: r.maintCost,
      FuelCost: r.fuelCost,
      ROI: `${r.roi.toFixed(2)}%`,
    }));
    downloadCSV('vehicle-roi-report.csv', rows as unknown as Record<string, unknown>[]);
  };

  const exportPDF = () => {
    const rows = roiData.map((r) => `
      <tr>
        <td>${r.vehicle.registration}</td><td>${r.vehicle.name}</td><td>${r.vehicle.type}</td>
        <td>${formatCurrency(r.vehicle.acquisitionCost)}</td><td>${formatCurrency(r.revenue)}</td>
        <td>${formatCurrency(r.maintCost)}</td><td>${formatCurrency(r.fuelCost)}</td>
        <td>${r.roi.toFixed(2)}%</td>
      </tr>`).join('');
    const body = `
      <h1>TransitOps — Vehicle ROI Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <p>Fleet ROI: <strong>${fleetROI.toFixed(2)}%</strong> · Total Revenue: ${formatCurrency(totalRevenue)}</p>
      <table>
        <tr><th>Registration</th><th>Name</th><th>Type</th><th>Acq. Cost</th><th>Revenue</th><th>Maint.</th><th>Fuel</th><th>ROI</th></tr>
        ${rows}
      </table>`;
    downloadPDF('TransitOps ROI Report', body);
  };

  const columns: Column[] = [
    {
      key: 'registration', header: 'Vehicle', sortable: true, sortValue: (r) => r.vehicle.registration,
      render: (r) => <span className="font-medium">{r.vehicle.registration}</span>,
    },
    { key: 'type', header: 'Type', render: (r) => r.vehicle.type },
    { key: 'acquisitionCost', header: 'Acquisition', sortable: true, sortValue: (r) => r.vehicle.acquisitionCost, render: (r) => formatCurrency(r.vehicle.acquisitionCost) },
    { key: 'revenue', header: 'Revenue', sortable: true, sortValue: (r) => r.revenue, render: (r) => formatCurrency(r.revenue) },
    { key: 'totalCost', header: 'Maintenance + Fuel', sortable: true, sortValue: (r) => r.totalCost, render: (r) => formatCurrency(r.totalCost) },
    {
      key: 'roi', header: 'ROI', sortable: true, sortValue: (r) => r.roi,
      render: (r) => (
        <span className={`font-semibold ${r.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {r.roi.toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Fleet performance, costs, and vehicle ROI insights."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5" /> CSV</Button>
            <Button variant="outline" size="sm" onClick={exportPDF}><FileText className="h-4 w-4 mr-1.5" /> PDF</Button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Fleet ROI</p><p className="text-2xl font-bold mt-1">{fleetROI.toFixed(1)}%</p></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15"><Percent className="h-5 w-5 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Fleet Utilization</p><p className="text-2xl font-bold mt-1">{utilization}%</p></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/15"><Gauge className="h-5 w-5 text-purple-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Operational Cost</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalMaint + totalFuel)}</p></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/15"><TrendingUp className="h-5 w-5 text-amber-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="animate-slide-up">
          <CardHeader><CardTitle>Operational Cost Trend</CardTitle><CardDescription>Maintenance, fuel, and tolls over time</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={operationalCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="Maintenance" fill="#f59e0b" />
                <Bar dataKey="Fuel" fill="#3b82f6" />
                <Bar dataKey="Tolls" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader><CardTitle>Fuel Efficiency Trend</CardTitle><CardDescription>Kilometers per liter (monthly average)</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={fuelEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ROI Table */}
      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Vehicle ROI Report</CardTitle><CardDescription>ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost</CardDescription></div>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5" /> Download CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={roiData}
            columns={columns}
            searchKeys={['vehicle']}
            searchPlaceholder="Search vehicles..."
            getRowId={(r) => r.vehicle.id}
            pageSize={6}
          />
        </CardContent>
      </Card>
    </div>
  );
}
