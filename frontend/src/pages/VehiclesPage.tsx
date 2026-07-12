import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
// Column is a simple interface — no generics needed.
import { StatusBadge, vehicleStatusTone } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Download, Truck } from 'lucide-react';
import type { Vehicle, VehicleStatus, VehicleType } from '@/types';
import { formatCurrency, formatNumber, downloadCSV } from '@/utils/format';

const empty: Omit<Vehicle, 'id'> = {
  registration: '', name: '', type: 'Truck', maxLoadKg: 0, odometerKm: 0,
  acquisitionCost: 0, status: 'Available', region: 'North',
};

export function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<Omit<Vehicle, 'id'>>(empty);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== 'all' && v.type !== typeFilter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    const { id: _id, ...rest } = v;
    setForm(rest);
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setApiError(null);
    try {
      if (editing) await updateVehicle(editing.id, form);
      else await addVehicle(form);
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save vehicle.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column[] = [
    {
      key: 'registration', header: 'Registration', sortable: true, sortValue: (v) => v.registration,
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
            <Truck className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{v.registration}</p>
            <p className="text-xs text-muted-foreground">{v.name}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortable: true, sortValue: (v) => v.type, render: (v) => v.type },
    { key: 'maxLoadKg', header: 'Max Load', sortable: true, sortValue: (v) => v.maxLoadKg, render: (v) => `${formatNumber(v.maxLoadKg)} kg` },
    { key: 'odometerKm', header: 'Odometer', sortable: true, sortValue: (v) => v.odometerKm, render: (v) => `${formatNumber(v.odometerKm)} km` },
    { key: 'acquisitionCost', header: 'Acquisition Cost', sortable: true, sortValue: (v) => v.acquisitionCost, render: (v) => formatCurrency(v.acquisitionCost) },
    { key: 'region', header: 'Region', render: (v) => v.region },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: (v) => v.status,
      render: (v) => <StatusBadge status={v.status} tone={vehicleStatusTone(v.status)} />,
    },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(v.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        description="Manage your fleet vehicles, capacity, and status."
        actions={
          <Button onClick={openAdd} className="h-9"><Plus className="h-4 w-4 mr-1.5" /> Add Vehicle</Button>
        }
      />

      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={['registration', 'name']}
        searchPlaceholder="Search by registration or name..."
        getRowId={(v) => v.id}
        filters={[
          { label: 'Type', value: typeFilter, onChange: setTypeFilter, options: [
            { label: 'All Types', value: 'all' }, { label: 'Truck', value: 'Truck' },
            { label: 'Van', value: 'Van' }, { label: 'Bus', value: 'Bus' },
            { label: 'Trailer', value: 'Trailer' }, { label: 'Refrigerated', value: 'Refrigerated' },
          ]},
          { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [
            { label: 'All Status', value: 'all' }, { label: 'Available', value: 'Available' },
            { label: 'On Trip', value: 'On Trip' }, { label: 'In Shop', value: 'In Shop' },
            { label: 'Retired', value: 'Retired' },
          ]},
        ]}
        toolbar={
          <Button variant="outline" size="sm" onClick={() => downloadCSV('vehicles.csv', filtered as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        }
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
            <DialogDescription>{editing ? 'Update vehicle details' : 'Register a new vehicle in the fleet'}</DialogDescription>
          </DialogHeader>
          {apiError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              <span>⚠ {apiError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Registration Number</Label><Input value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} placeholder="TRK-1001" /></div>
            <div className="space-y-1.5"><Label>Vehicle Name / Model</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Volvo FH16" /></div>
            <div className="space-y-1.5"><Label>Vehicle Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as VehicleType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck">Truck</SelectItem><SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem><SelectItem value="Trailer">Trailer</SelectItem>
                  <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Region</Label>
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="North">North</SelectItem><SelectItem value="South">South</SelectItem>
                  <SelectItem value="East">East</SelectItem><SelectItem value="West">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Max Load Capacity (kg)</Label><Input type="number" value={form.maxLoadKg} onChange={(e) => setForm({ ...form, maxLoadKg: +e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Odometer (km)</Label><Input type="number" value={form.odometerKm} onChange={(e) => setForm({ ...form, odometerKm: +e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Acquisition Cost (₹)</Label><Input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: +e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem><SelectItem value="On Trip">On Trip</SelectItem>
                  <SelectItem value="In Shop">In Shop</SelectItem><SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.registration || !form.name}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Vehicle?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { if (deleteId) { try { await deleteVehicle(deleteId); } catch {} } setDeleteId(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
