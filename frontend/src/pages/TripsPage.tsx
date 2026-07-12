import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge, tripStatusTone } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Download, Route, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Trip, TripStatus } from '@/types';
import { formatCurrency, formatNumber, formatDate, daysUntil, downloadCSV } from '@/utils/format';
import { cn } from '@/lib/utils';

const empty: Omit<Trip, 'id'> = {
  source: '', destination: '', vehicleId: '', driverId: '', cargoKg: 0,
  plannedDistanceKm: 0, revenue: 0, dispatchDate: '', status: 'Draft',
};

export function TripsPage() {
  const { trips, vehicles, drivers, addTrip, updateTrip, deleteTrip } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState<Omit<Trip, 'id'>>(empty);
  const [validation, setValidation] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  // ── ELIGIBILITY RULES ──
  // Only "Available" vehicles can be assigned to a new trip.
  // (Retired, In Shop, and On Trip vehicles are hidden.)
  const eligibleVehicles = useMemo(
    () => vehicles.filter((v) => v.status === 'Available'),
    [vehicles]
  );

  // Only "Available" drivers with a non-expired license can be assigned.
  // (Suspended, On Trip, and expired-license drivers are hidden.)
  const eligibleDrivers = useMemo(
    () => drivers.filter((d) => d.status === 'Available' && daysUntil(d.licenseExpiry) >= 0),
    [drivers]
  );

  const filtered = trips.filter((t) => statusFilter === 'all' || t.status === statusFilter);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setValidation(null);
    setDialogOpen(true);
  };

  const openEdit = (t: Trip) => {
    setEditing(t);
    const { id: _id, ...rest } = t;
    setForm(rest);
    setValidation(null);
    setDialogOpen(true);
  };

  // ── VALIDATION ──
  // Check all business rules before saving the trip.
  const validate = (): boolean => {
    setValidation(null);

    // Rule 1: must pick a vehicle and driver
    if (!form.vehicleId) { setValidation('Please select a vehicle.'); return false; }
    if (!form.driverId) { setValidation('Please select a driver.'); return false; }

    // Rule 2: cargo weight must not exceed vehicle capacity
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    if (!vehicle) { setValidation('Selected vehicle is not available.'); return false; }
    if (form.cargoKg > vehicle.maxLoadKg) {
      setValidation(`Cargo weight (${formatNumber(form.cargoKg)} kg) exceeds vehicle capacity (${formatNumber(vehicle.maxLoadKg)} kg).`);
      return false;
    }

    // Rule 3: driver must have a valid (non-expired) license
    const driver = drivers.find((d) => d.id === form.driverId);
    if (!driver) { setValidation('Selected driver is not available.'); return false; }
    if (daysUntil(driver.licenseExpiry) < 0) { setValidation('Selected driver has an expired license.'); return false; }

    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await updateTrip(editing.id, form);
      else await addTrip(form);
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save trip.';
      setValidation(msg);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: TripStatus) => {
    try {
      await updateTrip(id, { status });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.';
      alert(msg);
    }
  };

  const columns: Column[] = [
    {
      key: 'route', header: 'Route', sortable: true, sortValue: (t) => t.source,
      render: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
            <Route className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{t.source} → {t.destination}</p>
            <p className="text-xs text-muted-foreground">{formatDate(t.dispatchDate)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'vehicle', header: 'Vehicle',
      render: (t) => {
        const v = vehicles.find((v) => v.id === t.vehicleId);
        return v ? <span className="text-sm">{v.registration}</span> : '—';
      },
    },
    {
      key: 'driver', header: 'Driver',
      render: (t) => {
        const d = drivers.find((d) => d.id === t.driverId);
        return d ? <span className="text-sm">{d.name}</span> : '—';
      },
    },
    { key: 'cargoKg', header: 'Cargo', sortable: true, sortValue: (t) => t.cargoKg, render: (t) => `${formatNumber(t.cargoKg)} kg` },
    { key: 'plannedDistanceKm', header: 'Distance', sortable: true, sortValue: (t) => t.plannedDistanceKm, render: (t) => `${formatNumber(t.plannedDistanceKm)} km` },
    { key: 'revenue', header: 'Revenue', sortable: true, sortValue: (t) => t.revenue, render: (t) => formatCurrency(t.revenue) },
    { key: 'status', header: 'Status', sortable: true, sortValue: (t) => t.status, render: (t) => <StatusBadge status={t.status} tone={tripStatusTone(t.status)} /> },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          {t.status === 'Draft' && (
            <Button variant="ghost" size="sm" className="text-blue-600 h-8" onClick={() => changeStatus(t.id, 'Dispatched')}>Dispatch</Button>
          )}
          {t.status === 'Dispatched' && (
            <>
              <Button variant="ghost" size="sm" className="text-emerald-600 h-8" onClick={() => changeStatus(t.id, 'Completed')}>Complete</Button>
              <Button variant="ghost" size="sm" className="text-red-600 h-8" onClick={() => changeStatus(t.id, 'Cancelled')}>Cancel</Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(t.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Trip Management"
        description="Plan, dispatch, and track trips across your fleet."
        actions={<Button onClick={openAdd} className="h-9"><Plus className="h-4 w-4 mr-1.5" /> New Trip</Button>}
      />

      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={['source', 'destination']}
        searchPlaceholder="Search by route..."
        getRowId={(t) => t.id}
        filters={[
          { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [
            { label: 'All Status', value: 'all' }, { label: 'Draft', value: 'Draft' },
            { label: 'Dispatched', value: 'Dispatched' }, { label: 'Completed', value: 'Completed' },
            { label: 'Cancelled', value: 'Cancelled' },
          ]},
        ]}
        toolbar={
          <Button variant="outline" size="sm" onClick={() => downloadCSV('trips.csv', filtered as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Trip' : 'Create New Trip'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update trip details' : 'Only available vehicles and drivers with valid licenses can be selected.'}
            </DialogDescription>
          </DialogHeader>

          {validation && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {validation}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Source Location</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Pune" /></div>
            <div className="space-y-1.5"><Label>Destination Location</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Mumbai" /></div>
            <div className="space-y-1.5"><Label>Vehicle</Label>
              <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {editing ? (
                    vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registration} — {v.name} ({v.status})</SelectItem>)
                  ) : eligibleVehicles.length > 0 ? (
                    eligibleVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registration} — {v.name} ({formatNumber(v.maxLoadKg)} kg)</SelectItem>)
                  ) : (
                    <SelectItem value="none" disabled>No available vehicles</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Driver</Label>
              <Select value={form.driverId} onValueChange={(v) => setForm({ ...form, driverId: v })}>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {editing ? (
                    drivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.status})</SelectItem>)
                  ) : eligibleDrivers.length > 0 ? (
                    eligibleDrivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.licenseNumber}</SelectItem>)
                  ) : (
                    <SelectItem value="none" disabled>No available drivers</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cargo Weight (kg)</Label>
              <Input type="number" value={form.cargoKg} onChange={(e) => setForm({ ...form, cargoKg: +e.target.value })} placeholder="0" />
              {form.vehicleId && (() => {
                const v = vehicles.find((v) => v.id === form.vehicleId);
                if (!v) return null;
                const over = form.cargoKg > v.maxLoadKg;
                return (
                  <p className={cn('text-xs flex items-center gap-1', over ? 'text-red-600' : 'text-muted-foreground')}>
                    {over ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                    Max capacity: {formatNumber(v.maxLoadKg)} kg {over && '— exceeds limit!'}
                  </p>
                );
              })()}
            </div>
            <div className="space-y-1.5"><Label>Planned Distance (km)</Label><Input type="number" value={form.plannedDistanceKm} onChange={(e) => setForm({ ...form, plannedDistanceKm: +e.target.value })} placeholder="0" /></div>
            <div className="space-y-1.5"><Label>Revenue (₹)</Label><Input type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: +e.target.value })} placeholder="0" /></div>
            <div className="space-y-1.5"><Label>Dispatch Date</Label><Input type="date" value={form.dispatchDate} onChange={(e) => setForm({ ...form, dispatchDate: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TripStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem><SelectItem value="Dispatched">Dispatched</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.source || !form.destination || !form.vehicleId || !form.driverId}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Trip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Trip?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteTrip(deleteId); setDeleteId(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
