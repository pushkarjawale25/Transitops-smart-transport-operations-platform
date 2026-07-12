import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Download, Receipt } from 'lucide-react';
import type { Expense, ExpenseCategory } from '@/types';
import { formatCurrency, formatDate, downloadCSV } from '@/utils/format';
import { cn } from '@/lib/utils';

const empty: Omit<Expense, 'id'> = { category: 'Fuel', amount: 0, description: '', date: '', vehicleId: undefined };

const categoryTone: Record<ExpenseCategory, string> = {
  Fuel: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Toll: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Miscellaneous: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
};

export function ExpensesPage() {
  const { expenses, vehicles, addExpense, updateExpense, deleteExpense } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<Omit<Expense, 'id'>>(empty);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = expenses.filter((e) => categoryFilter === 'all' || e.category === categoryFilter);

  const openAdd = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (e: Expense) => { setEditing(e); const { id: _id, ...rest } = e; setForm(rest); setDialogOpen(true); };
  const save = () => { if (editing) updateExpense(editing.id, form); else addExpense(form); setDialogOpen(false); };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = (cat: ExpenseCategory) => expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);

  const columns: Column[] = [
    {
      key: 'category', header: 'Category', sortable: true, sortValue: (e) => e.category,
      render: (e) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/40">
            <Receipt className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </div>
          <Badge variant="outline" className={cn('border-transparent', categoryTone[e.category as ExpenseCategory])}>{e.category}</Badge>
        </div>
      ),
    },
    { key: 'description', header: 'Description', render: (e) => <span className="text-sm">{e.description}</span> },
    { key: 'amount', header: 'Amount', sortable: true, sortValue: (e) => e.amount, render: (e) => <span className="font-semibold">{formatCurrency(e.amount)}</span> },
    { key: 'date', header: 'Date', sortable: true, sortValue: (e) => e.date, render: (e) => formatDate(e.date) },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(e.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Expense Management"
        description="Track and categorize operational expenses."
        actions={<Button onClick={openAdd} className="h-9"><Plus className="h-4 w-4 mr-1.5" /> Add Expense</Button>}
      />

      <div className="mb-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(total)}</p>
        </div>
        {(['Fuel', 'Toll', 'Maintenance', 'Miscellaneous'] as ExpenseCategory[]).map((cat) => (
          <div key={cat} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{cat}</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(byCategory(cat))}</p>
          </div>
        ))}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={['description']}
        searchPlaceholder="Search expenses..."
        getRowId={(e) => e.id}
        filters={[
          { label: 'Category', value: categoryFilter, onChange: setCategoryFilter, options: [
            { label: 'All Categories', value: 'all' }, { label: 'Fuel', value: 'Fuel' },
            { label: 'Toll', value: 'Toll' }, { label: 'Maintenance', value: 'Maintenance' },
            { label: 'Miscellaneous', value: 'Miscellaneous' },
          ]},
        ]}
        toolbar={
          <Button variant="outline" size="sm" onClick={() => downloadCSV('expenses.csv', filtered as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>{editing ? 'Update expense details' : 'Record a new expense'}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Expense Type</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fuel">Fuel</SelectItem><SelectItem value="Toll">Toll</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Expense description..." /></div>
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Vehicle (optional)</Label>
              <Select value={form.vehicleId ?? 'none'} onValueChange={(v) => setForm({ ...form, vehicleId: v === 'none' ? undefined : v })}>
                <SelectTrigger><SelectValue placeholder="No vehicle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No vehicle</SelectItem>
                  {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registration} — {v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.description || !form.date}>{editing ? 'Save Changes' : 'Add Expense'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Expense?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteExpense(deleteId); setDeleteId(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
