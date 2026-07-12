import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Filter, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, Pagination } from '@/components/ui/Table'
import { useApp } from '@/context/AppContext'
import { formatCurrency, exportToCSV } from '@/utils/helpers'
import { VEHICLE_TYPES, VEHICLE_STATUSES } from '@/data/vehicles'

const EMPTY = { registrationNumber: '', name: '', type: 'Heavy Truck', maxCapacity: '', odometer: '', acquisitionCost: '', status: 'Available' }

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useApp()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const PAGE_SIZE = 8

  const filtered = vehicles.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || v.type === filterType
    const matchStatus = filterStatus === 'all' || v.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModalOpen(true) }
  const openEdit = (v) => { setForm({ ...v }); setEditing(v.id); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) updateVehicle(editing, { ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost) })
    else addVehicle({ ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost) })
    closeModal()
  }

  const columns = [
    { key: 'registrationNumber', label: 'Reg. Number', sortable: false },
    { key: 'name', label: 'Vehicle', sortable: false },
    { key: 'type', label: 'Type', sortable: false },
    { key: 'maxCapacity', label: 'Max Load (kg)', sortable: true, render: v => v.toLocaleString() },
    { key: 'odometer', label: 'Odometer (km)', sortable: true, render: v => v.toLocaleString() },
    { key: 'acquisitionCost', label: 'Acq. Cost', sortable: true, render: v => formatCurrency(v) },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: 'Actions', render: (id, row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search vehicles..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }} className="w-40">
          <option value="all">All Types</option>
          {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
        </Select>
        <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="w-40">
          <option value="all">All Statuses</option>
          {VEHICLE_STATUSES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered, 'vehicles')}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" /> Add Vehicle
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table columns={columns} data={paginated} />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Registration Number</Label>
              <Input value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} placeholder="MH12AB1234" required />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Name / Model</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tata Prima 4928.S" required />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Type</Label>
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {VEHICLE_STATUSES.map(s => <option key={s}>{s}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Max Capacity (kg)</Label>
              <Input type="number" value={form.maxCapacity} onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))} placeholder="15000" required />
            </div>
            <div className="space-y-1.5">
              <Label>Odometer (km)</Label>
              <Input type="number" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: e.target.value }))} placeholder="50000" required />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Acquisition Cost (₹)</Label>
              <Input type="number" value={form.acquisitionCost} onChange={e => setForm(f => ({ ...f, acquisitionCost: e.target.value }))} placeholder="2500000" required />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Add Vehicle'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Vehicle" className="max-w-sm">
        <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this vehicle? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteVehicle(deleteConfirm); setDeleteConfirm(null) }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
