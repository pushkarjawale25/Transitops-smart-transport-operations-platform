import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge, maintenanceStatusTone } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Download, Wrench } from 'lucide-react';
import type { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '@/types';
import { formatCurrency, formatDate, downloadCSV } from '@/utils/format';

const empty: Omit<MaintenanceRecord, 'id'> = {
  vehicleId: '', type: 'Preventive', description: '', cost: 0,
  startDate: '', endDate: null, status: 'Scheduled',
};

export function MaintenancePage() {
  const { maintenance, vehicles, addMaintenance, updateMaintenance, deleteMaintenance } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [form, setForm] = useState<Omit<MaintenanceRecord, 'id'>>(empty);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = maintenance.filter((m) => statusFilter === 'all' || m.status === statusFilter);

  const openAdd = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (m: MaintenanceRecord) => {
    setEditing(m);
    const { id: _id, ...rest } = m;
    setForm(rest);
    setDialogOpen(true);
  };

  const save = () => {
    if (editing) updateMaintenance(editing.id, form);
    else addMaintenance(form);
    setDialogOpen(false);
  };

  const vehicleLabel = (id: string) => {
    const v = vehicles.find((v) => v.id === id);
    return v ? `${v.registration} — ${v.name}` : 'Unknown';
  };

  const columns: Column[] = [
    {
      key: 'vehicle', header: 'Vehicle', sortable: true, sortValue: (m) => vehicleLabel(m.vehicleId),
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/15">
            <Wrench className="h-4 w-4 text-amber-600" />
          </div>
          <span className="font-medium">{vehicleLabel(m.vehicleId)}</span>
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortable: true, sortValue: (m) => m.type, render: (m) => m.type },
    { key: 'description', header: 'Description', render: (m) => <span className="text-sm text-muted-foreground line-clamp-1">{m.description}</span> },
    { key: 'cost', header: 'Cost', sortable: true, sortValue: (m) => m.cost, render: (m) => formatCurrency(m.cost) },
    { key: 'startDate', header: 'Start Date', sortable: true, sortValue: (m) => m.startDate, render: (m) => formatDate(m.startDate) },
    { key: 'endDate', header: 'End Date', render: (m) => m.endDate ? formatDate(m.endDate) : '—' },
    { key: 'status', header: 'Status', sortable: true, sortValue: (m) => m.status, render: (m) => <StatusBadge status={m.status} tone={maintenanceStatusTone(m.status)} /> },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1">
          {m.status !== 'Completed' && (
            <Button variant="ghost" size="sm" className="text-emerald-600 h-8" onClick={() => updateMaintenance(m.id, { status: 'Completed', endDate: new Date().toISOString().slice(0, 10) })}>
              Close
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(m.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track and manage vehicle maintenance schedules and costs."
        actions={<Button onClick={openAdd} className="h-9"><Plus className="h-4 w-4 mr-1.5" /> New Record</Button>}
      />

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10 px-4 py-2.5 text-sm text-blue-800 dark:text-blue-400">
        Creating a maintenance record sets the vehicle status to "In Shop". Closing maintenance restores the vehicle to "Available" (unless retired).
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={['description']}
        searchPlaceholder="Search maintenance records..."
        getRowId={(m) => m.id}
        filters={[
          { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [
            { label: 'All Status', value: 'all' }, { label: 'Scheduled', value: 'Scheduled' },
            { label: 'In Progress', value: 'In Progress' }, { label: 'Completed', value: 'Completed' },
          ]},
        ]}
        toolbar={
          <Button variant="outline" size="sm" onClick={() => downloadCSV('maintenance.csv', filtered as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Maintenance Record' : 'New Maintenance Record'}</DialogTitle>
            <DialogDescription>{editing ? 'Update maintenance details' : 'Creating maintenance will set the vehicle to "In Shop"'}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2"><Label>Vehicle</Label>
              <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registration} — {v.name} ({v.status})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Maintenance Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MaintenanceType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventive">Preventive</SelectItem><SelectItem value="Corrective">Corrective</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem><SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Cost (₹)</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: +e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the maintenance work..." rows={3} /></div>
            <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={form.endDate ?? ''} onChange={(e) => setForm({ ...form, endDate: e.target.value || null })} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as MaintenanceStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem><SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.vehicleId || !form.startDate}>{editing ? 'Save Changes' : 'Create Record'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Record?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteMaintenance(deleteId); setDeleteId(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
