import { useState } from 'react'
import { Plus, Search, Trash2, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, Pagination } from '@/components/ui/Table'
import { useApp } from '@/context/AppContext'
import { formatCurrency, formatDate, exportToCSV } from '@/utils/helpers'

const EXPENSE_TYPES = ['Fuel', 'Toll', 'Maintenance', 'Miscellaneous']
const EMPTY = { type: 'Fuel', amount: '', description: '', date: '' }

const TYPE_VARIANT = { Fuel: 'default', Toll: 'secondary', Maintenance: 'warning', Miscellaneous: 'outline' }

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useApp()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const PAGE_SIZE = 10

  const filtered = expenses.filter(e => {
    const match = e.description.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || e.type === filterType
    return match && matchType
  })
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const total = filtered.reduce((s, e) => s + e.amount, 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    addExpense({ ...form, amount: Number(form.amount) })
    setModalOpen(false)
    setForm(EMPTY)
  }

  const byType = EXPENSE_TYPES.map(t => ({ type: t, total: expenses.filter(e => e.type === t).reduce((s, e) => s + e.amount, 0) }))

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Category', render: v => <Badge variant={TYPE_VARIANT[v] || 'secondary'}>{v}</Badge> },
    { key: 'amount', label: 'Amount', sortable: true, render: v => formatCurrency(v) },
    { key: 'description', label: 'Description', render: v => <span className="text-xs text-muted-foreground">{v}</span> },
    { key: 'date', label: 'Date', render: v => formatDate(v) },
    {
      key: 'id', label: 'Actions', render: (id) => (
        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(id)} className="text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {/* Category breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {byType.map(({ type, total: t }) => (
          <div key={type} className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{type}</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(t)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }} className="w-40">
          <option value="all">All Types</option>
          {EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered, 'expenses')}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" onClick={() => { setForm(EMPTY); setModalOpen(true) }}>
          <Plus className="h-3.5 w-3.5" /> Add Expense
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-medium">Total: <span className="text-primary font-bold">{formatCurrency(total)}</span></p>
          <p className="text-xs text-muted-foreground">{filtered.length} records</p>
        </div>
        <Table columns={columns} data={paginated} />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="5000" required />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." required />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Expense" className="max-w-sm">
        <p className="text-sm text-muted-foreground mb-4">Delete this expense record?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteExpense(deleteConfirm); setDeleteConfirm(null) }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
