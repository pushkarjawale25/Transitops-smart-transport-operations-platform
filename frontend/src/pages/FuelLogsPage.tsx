import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Download, Fuel } from 'lucide-react';
import type { FuelLog } from '@/types';
import { formatCurrency, formatNumber, formatDate, downloadCSV } from '@/utils/format';

const empty: Omit<FuelLog, 'id'> = { vehicleId: '', liters: 0, cost: 0, date: '', odometerKm: 0 };

export function FuelLogsPage() {
  const { fuelLogs, vehicles, addFuelLog, updateFuelLog, deleteFuelLog } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<FuelLog | null>(null);
  const [form, setForm] = useState<Omit<FuelLog, 'id'>>(empty);

  const openAdd = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (f: FuelLog) => { setEditing(f); const { id: _id, ...rest } = f; setForm(rest); setDialogOpen(true); };
  const save = () => { if (editing) updateFuelLog(editing.id, form); else addFuelLog(form); setDialogOpen(false); };

  const vehicleLabel = (id: string) => {
    const v = vehicles.find((v) => v.id === id);
    return v ? `${v.registration}` : 'Unknown';
  };

  const totalLiters = fuelLogs.reduce((s, f) => s + f.liters, 0);
  const totalCost = fuelLogs.reduce((s, f) => s + f.cost, 0);

  const columns: Column[] = [
    {
      key: 'vehicle', header: 'Vehicle', sortable: true, sortValue: (f) => vehicleLabel(f.vehicleId),
      render: (f) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
            <Fuel className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-medium">{vehicleLabel(f.vehicleId)}</span>
        </div>
      ),
    },
    { key: 'liters', header: 'Liters', sortable: true, sortValue: (f) => f.liters, render: (f) => `${formatNumber(f.liters)} L` },
    { key: 'cost', header: 'Cost', sortable: true, sortValue: (f) => f.cost, render: (f) => formatCurrency(f.cost) },
    { key: 'date', header: 'Date', sortable: true, sortValue: (f) => f.date, render: (f) => formatDate(f.date) },
    { key: 'odometerKm', header: 'Odometer', sortable: true, sortValue: (f) => f.odometerKm, render: (f) => `${formatNumber(f.odometerKm)} km` },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (f) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(f.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Fuel Management"
        description="Track fuel consumption and costs across your fleet."
        actions={<Button onClick={openAdd} className="h-9"><Plus className="h-4 w-4 mr-1.5" /> Add Fuel Log</Button>}
      />

      <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Liters</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(totalLiters)} L</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Fuel Cost</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalCost)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Avg Price / Liter</p>
          <p className="text-2xl font-bold mt-1">{totalLiters > 0 ? formatCurrency(totalCost / totalLiters) : '—'}</p>
        </div>
      </div>

      <DataTable
        data={fuelLogs}
        columns={columns}
        searchKeys={['vehicleId']}
        searchPlaceholder="Search fuel logs..."
        getRowId={(f) => f.id}
        toolbar={
          <Button variant="outline" size="sm" onClick={() => downloadCSV('fuel-logs.csv', fuelLogs as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Fuel Log' : 'Add Fuel Log'}</DialogTitle>
            <DialogDescription>{editing ? 'Update fuel log details' : 'Record a new fuel entry'}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2"><Label>Vehicle</Label>
              <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registration} — {v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Fuel Quantity (L)</Label><Input type="number" value={form.liters} onChange={(e) => setForm({ ...form, liters: +e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Fuel Cost (₹)</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: +e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Odometer (km)</Label><Input type="number" value={form.odometerKm} onChange={(e) => setForm({ ...form, odometerKm: +e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.vehicleId || !form.date}>{editing ? 'Save Changes' : 'Add Fuel Log'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Fuel Log?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteFuelLog(deleteId); setDeleteId(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
