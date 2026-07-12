import { useState } from 'react'
import { Plus, Search, CheckCircle, Trash2, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, Pagination } from '@/components/ui/Table'
import { useApp } from '@/context/AppContext'
import { formatCurrency, formatDate, exportToCSV } from '@/utils/helpers'
import { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } from '@/data/maintenance'

const EMPTY = { vehicleId: '', type: 'Scheduled Service', description: '', cost: '', startDate: '', endDate: '' }

export default function MaintenancePage() {
  const { maintenance, vehicles, addMaintenance, closeMaintenance, deleteMaintenance } = useApp()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const PAGE_SIZE = 8

  const allVehicles = vehicles.filter(v => v.status !== 'Retired')
  const getVehicleName = (id) => vehicles.find(v => v.id === id)?.name || id

  const filtered = maintenance.filter(m => {
    const match = getVehicleName(m.vehicleId).toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || m.status === filterStatus
    return match && matchStatus
  })
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSubmit = (e) => {
    e.preventDefault()
    addMaintenance({ ...form, cost: Number(form.cost) })
    setModalOpen(false)
    setForm(EMPTY)
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'vehicleId', label: 'Vehicle', render: v => getVehicleName(v) },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description', render: v => <span className="text-xs text-muted-foreground truncate max-w-xs block">{v}</span> },
    { key: 'cost', label: 'Cost', sortable: true, render: v => formatCurrency(v) },
    { key: 'startDate', label: 'Start', render: v => formatDate(v) },
    { key: 'endDate', label: 'End', render: v => formatDate(v) },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: 'Actions', render: (id, row) => (
        <div className="flex gap-1">
          {row.status === 'In Progress' && (
            <Button variant="ghost" size="icon" title="Mark Complete" onClick={() => closeMaintenance(id)}>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(id)} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search maintenance..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="w-40">
          <option value="all">All Statuses</option>
          {MAINTENANCE_STATUSES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered, 'maintenance')}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" onClick={() => { setForm(EMPTY); setModalOpen(true) }}>
          <Plus className="h-3.5 w-3.5" /> Add Maintenance
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={paginated} />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Maintenance">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Vehicle</Label>
              <Select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} required>
                <option value="">Select vehicle...</option>
                {allVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Maintenance Type</Label>
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {MAINTENANCE_TYPES.map(t => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cost (₹)</Label>
              <Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="25000" required />
            </div>
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>End Date (Est.)</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the maintenance work..." required />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
            ⚠️ Creating maintenance will change the vehicle status to <strong>In Shop</strong>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Maintenance</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Record" className="max-w-sm">
        <p className="text-sm text-muted-foreground mb-4">Delete this maintenance record?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteMaintenance(deleteConfirm); setDeleteConfirm(null) }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
