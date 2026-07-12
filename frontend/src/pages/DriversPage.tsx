import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge, driverStatusTone, safetyScoreTone } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Download, AlertTriangle } from 'lucide-react';
import type { Driver, DriverStatus, LicenseCategory } from '@/types';
import { formatDate, daysUntil, downloadCSV } from '@/utils/format';
import { cn } from '@/lib/utils';

const empty: Omit<Driver, 'id'> = {
  name: '', licenseNumber: '', licenseCategory: 'C', licenseExpiry: '',
  contact: '', safetyScore: 80, status: 'Available',
};

export function DriversPage() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState<Omit<Driver, 'id'>>(empty);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = drivers.filter((d) => statusFilter === 'all' || d.status === statusFilter);

  const openAdd = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (d: Driver) => { setEditing(d); const { id: _id, ...rest } = d; setForm(rest); setDialogOpen(true); };
  const save = () => { if (editing) updateDriver(editing.id, form); else addDriver(form); setDialogOpen(false); };

  const isExpiringSoon = (iso: string) => {
    const days = daysUntil(iso);
    return days <= 30 && days >= 0;
  };
  const isExpired = (iso: string) => daysUntil(iso) < 0;

  const columns: Column[] = [
    {
      key: 'name', header: 'Driver', sortable: true, sortValue: (d) => d.name,
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-semibold">
            {d.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{d.name}</p>
            <p className="text-xs text-muted-foreground">{d.contact}</p>
          </div>
        </div>
      ),
    },
    { key: 'licenseNumber', header: 'License #', sortable: true, sortValue: (d) => d.licenseNumber, render: (d) => d.licenseNumber },
    { key: 'licenseCategory', header: 'Category', render: (d) => <Badge variant="outline" className="font-mono">{d.licenseCategory}</Badge> },
    {
      key: 'licenseExpiry', header: 'License Expiry', sortable: true, sortValue: (d) => d.licenseExpiry,
      render: (d) => {
        const expired = isExpired(d.licenseExpiry);
        const soon = isExpiringSoon(d.licenseExpiry);
        return (
          <div className="flex items-center gap-1.5">
            <span className={cn(expired ? 'text-red-600 font-medium' : soon ? 'text-amber-600 font-medium' : '')}>
              {formatDate(d.licenseExpiry)}
            </span>
            {(expired || soon) && (
              <span className={cn('flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded',
                expired ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400')}>
                <AlertTriangle className="h-3 w-3" /> {expired ? 'Expired' : `${daysUntil(d.licenseExpiry)}d`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'safetyScore', header: 'Safety Score', sortable: true, sortValue: (d) => d.safetyScore,
      render: (d) => (
        <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
          safetyScoreTone(d.safetyScore) === 'green' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
          safetyScoreTone(d.safetyScore) === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
          safetyScoreTone(d.safetyScore) === 'red' && 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
        )}>
          {d.safetyScore}/100
        </span>
      ),
    },
    { key: 'status', header: 'Status', sortable: true, sortValue: (d) => d.status, render: (d) => <StatusBadge status={d.status} tone={driverStatusTone(d.status)} /> },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(d.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Driver Management"
        description="Track driver licenses, safety scores, and availability."
        actions={<Button onClick={openAdd} className="h-9"><Plus className="h-4 w-4 mr-1.5" /> Add Driver</Button>}
      />

      {/* Expiring license alert */}
      {drivers.some((d) => isExpired(d.licenseExpiry) || isExpiringSoon(d.licenseExpiry)) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Some drivers have licenses expiring within 30 days or already expired. Review below.
        </div>
      )}

      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={['name', 'licenseNumber', 'contact']}
        searchPlaceholder="Search drivers..."
        getRowId={(d) => d.id}
        filters={[
          { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [
            { label: 'All Status', value: 'all' }, { label: 'Available', value: 'Available' },
            { label: 'On Trip', value: 'On Trip' }, { label: 'Off Duty', value: 'Off Duty' },
            { label: 'Suspended', value: 'Suspended' },
          ]},
        ]}
        toolbar={
          <Button variant="outline" size="sm" onClick={() => downloadCSV('drivers.csv', filtered as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
            <DialogDescription>{editing ? 'Update driver information' : 'Register a new driver'}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Driver Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" /></div>
            <div className="space-y-1.5"><Label>License Number</Label><Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} placeholder="DL-12345" /></div>
            <div className="space-y-1.5"><Label>License Category</Label>
              <Select value={form.licenseCategory} onValueChange={(v) => setForm({ ...form, licenseCategory: v as LicenseCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['A', 'B', 'C', 'C+E', 'D'] as LicenseCategory[]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>License Expiry Date</Label><Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Contact Number</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+91 98xxxxxxx" /></div>
            <div className="space-y-1.5"><Label>Safety Score (0-100)</Label><Input type="number" min={0} max={100} value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: +e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DriverStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem><SelectItem value="On Trip">On Trip</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem><SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name || !form.licenseNumber}>{editing ? 'Save Changes' : 'Add Driver'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Driver?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteDriver(deleteId); setDeleteId(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
