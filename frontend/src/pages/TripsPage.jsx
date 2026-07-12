import { useState } from 'react'
import { Plus, Search, Play, CheckCircle, XCircle, Trash2, Download, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, Pagination } from '@/components/ui/Table'
import { useApp } from '@/context/AppContext'
import { formatCurrency, formatDate, isLicenseExpired, exportToCSV } from '@/utils/helpers'
import { TRIP_STATUSES } from '@/data/trips'

const EMPTY = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '', revenue: '', dispatchDate: '' }

export default function TripsPage() {
  const { trips, vehicles, drivers, addTrip, deleteTrip, dispatchTrip, completeTrip, cancelTrip } = useApp()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const PAGE_SIZE = 8

  // Eligible vehicles for trip creation
  const eligibleVehicles = vehicles.filter(v => v.status === 'Available')
  const eligibleDrivers = drivers.filter(d =>
    d.status === 'Available' && !isLicenseExpired(d.licenseExpiry)
  )

  const filtered = trips.filter(t => {
    const match = t.source.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return match && matchStatus
  })
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openAdd = () => { setForm(EMPTY); setFormError(''); setModalOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    const vehicle = vehicles.find(v => v.id === form.vehicleId)
    if (vehicle && Number(form.cargoWeight) > vehicle.maxCapacity) {
      setFormError(`Cargo weight (${form.cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxCapacity} kg)`)
      return
    }
    addTrip({ ...form, cargoWeight: Number(form.cargoWeight), plannedDistance: Number(form.plannedDistance), revenue: Number(form.revenue) })
    setModalOpen(false)
  }

  const getVehicleName = (id) => vehicles.find(v => v.id === id)?.name || id
  const getDriverName = (id) => drivers.find(d => d.id === id)?.name || id

  const columns = [
    { key: 'id', label: 'Trip ID' },
    { key: 'source', label: 'From', render: (v, r) => <span className="text-xs">{v}</span> },
    { key: 'destination', label: 'To', render: (v, r) => <span className="text-xs">{v}</span> },
    { key: 'vehicleId', label: 'Vehicle', render: v => <span className="text-xs">{getVehicleName(v)}</span> },
    { key: 'driverId', label: 'Driver', render: v => <span className="text-xs">{getDriverName(v)}</span> },
    { key: 'cargoWeight', label: 'Cargo (kg)', render: v => v.toLocaleString() },
    { key: 'revenue', label: 'Revenue', render: v => formatCurrency(v) },
    { key: 'dispatchDate', label: 'Date', render: v => formatDate(v) },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: 'Actions', render: (id, row) => (
        <div className="flex gap-1">
          {row.status === 'Draft' && (
            <Button variant="ghost" size="icon" title="Dispatch" onClick={() => dispatchTrip(id)}>
              <Play className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          )}
          {row.status === 'Dispatched' && (
            <>
              <Button variant="ghost" size="icon" title="Complete" onClick={() => completeTrip(id)}>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              </Button>
              <Button variant="ghost" size="icon" title="Cancel" onClick={() => cancelTrip(id)}>
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </>
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
          <Input placeholder="Search trips..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="w-40">
          <option value="all">All Statuses</option>
          {TRIP_STATUSES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered, 'trips')}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" /> New Trip
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={paginated} />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Trip">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Source Location</Label>
              <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Mumbai, MH" required />
            </div>
            <div className="space-y-1.5">
              <Label>Destination</Label>
              <Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Pune, MH" required />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} required>
                <option value="">Select vehicle...</option>
                {eligibleVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.registrationNumber}) — {v.maxCapacity.toLocaleString()}kg</option>
                ))}
              </Select>
              {eligibleVehicles.length === 0 && <p className="text-xs text-amber-600">No available vehicles</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Driver</Label>
              <Select value={form.driverId} onChange={e => setForm(f => ({ ...f, driverId: e.target.value }))} required>
                <option value="">Select driver...</option>
                {eligibleDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — Score: {d.safetyScore}</option>
                ))}
              </Select>
              {eligibleDrivers.length === 0 && <p className="text-xs text-amber-600">No eligible drivers</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Cargo Weight (kg)</Label>
              <Input type="number" value={form.cargoWeight} onChange={e => setForm(f => ({ ...f, cargoWeight: e.target.value }))} placeholder="5000" required />
              {form.vehicleId && form.cargoWeight && (
                <p className="text-xs text-muted-foreground">
                  Vehicle capacity: {vehicles.find(v => v.id === form.vehicleId)?.maxCapacity?.toLocaleString()}kg
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Planned Distance (km)</Label>
              <Input type="number" value={form.plannedDistance} onChange={e => setForm(f => ({ ...f, plannedDistance: e.target.value }))} placeholder="300" required />
            </div>
            <div className="space-y-1.5">
              <Label>Revenue (₹)</Label>
              <Input type="number" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} placeholder="50000" required />
            </div>
            <div className="space-y-1.5">
              <Label>Dispatch Date</Label>
              <Input type="date" value={form.dispatchDate} onChange={e => setForm(f => ({ ...f, dispatchDate: e.target.value }))} required />
            </div>
          </div>
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{formError}
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Trip</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Trip" className="max-w-sm">
        <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this trip record?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteTrip(deleteConfirm); setDeleteConfirm(null) }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
