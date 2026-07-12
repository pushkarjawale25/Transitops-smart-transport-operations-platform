import { useState } from 'react'
import { Plus, Search, Trash2, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table, Pagination } from '@/components/ui/Table'
import { useApp } from '@/context/AppContext'
import { formatCurrency, formatDate, exportToCSV } from '@/utils/helpers'

const EMPTY = { vehicleId: '', quantity: '', cost: '', date: '', odometer: '' }

export default function FuelPage() {
  const { fuelLogs, vehicles, addFuelLog, deleteFuelLog } = useApp()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const PAGE_SIZE = 10

  const getVehicleName = (id) => vehicles.find(v => v.id === id)?.name || id

  const filtered = fuelLogs.filter(f => {
    return getVehicleName(f.vehicleId).toLowerCase().includes(search.toLowerCase()) ||
      f.vehicleId.toLowerCase().includes(search.toLowerCase())
  })
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalFuel = filtered.reduce((s, f) => s + f.quantity, 0)
  const totalCost = filtered.reduce((s, f) => s + f.cost, 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    addFuelLog({ ...form, quantity: Number(form.quantity), cost: Number(form.cost), odometer: Number(form.odometer) })
    setModalOpen(false)
    setForm(EMPTY)
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'vehicleId', label: 'Vehicle', render: v => getVehicleName(v) },
    { key: 'quantity', label: 'Quantity (L)', sortable: true, render: v => `${v} L` },
    { key: 'cost', label: 'Cost', sortable: true, render: v => formatCurrency(v) },
    { key: 'date', label: 'Date', render: v => formatDate(v) },
    { key: 'odometer', label: 'Odometer (km)', sortable: true, render: v => v.toLocaleString() },
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
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Fuel</p>
          <p className="text-2xl font-bold mt-1">{totalFuel.toLocaleString()} L</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Cost</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalCost)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Cost/L</p>
          <p className="text-2xl font-bold mt-1">{totalFuel ? formatCurrency(Math.round(totalCost / totalFuel)) : '—'}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search fuel logs..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered, 'fuel_logs')}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" onClick={() => { setForm(EMPTY); setModalOpen(true) }}>
          <Plus className="h-3.5 w-3.5" /> Add Log
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={paginated} />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Fuel Log">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Vehicle</Label>
              <Select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} required>
                <option value="">Select vehicle...</option>
                {vehicles.filter(v => v.status !== 'Retired').map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantity (Liters)</Label>
              <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="100" required />
            </div>
            <div className="space-y-1.5">
              <Label>Cost (₹)</Label>
              <Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="9000" required />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Odometer (km)</Label>
              <Input type="number" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: e.target.value }))} placeholder="50000" required />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Fuel Log</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Log" className="max-w-sm">
        <p className="text-sm text-muted-foreground mb-4">Delete this fuel log entry?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteFuelLog(deleteConfirm); setDeleteConfirm(null) }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
