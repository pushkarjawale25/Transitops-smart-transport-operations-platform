import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, AlertTriangle, Download, Shield } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, Pagination } from '@/components/ui/Table'
import { useApp } from '@/context/AppContext'
import { formatDate, isLicenseExpired, isLicenseExpiringSoon, getDaysUntilExpiry, exportToCSV } from '@/utils/helpers'
import { DRIVER_STATUSES, LICENSE_CATEGORIES } from '@/data/drivers'

const EMPTY = { name: '', licenseNumber: '', licenseCategory: 'HMV', licenseExpiry: '', contact: '', safetyScore: 80, status: 'Available' }

function SafetyBadge({ score }) {
  const variant = score >= 90 ? 'success' : score >= 75 ? 'default' : score >= 60 ? 'warning' : 'destructive'
  return <Badge variant={variant}><Shield className="h-2.5 w-2.5" />{score}</Badge>
}

function LicenseCell({ expiry }) {
  const expired = isLicenseExpired(expiry)
  const soon = isLicenseExpiringSoon(expiry)
  const days = getDaysUntilExpiry(expiry)
  if (expired) return <span className="text-destructive text-xs font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Expired</span>
  if (soon) return <span className="text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{formatDate(expiry)} ({days}d)</span>
  return <span className="text-xs">{formatDate(expiry)}</span>
}

export default function DriversPage() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useApp()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const PAGE_SIZE = 8

  const filtered = drivers.filter(d => {
    const match = d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return match && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModalOpen(true) }
  const openEdit = (d) => { setForm({ ...d }); setEditing(d.id); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) updateDriver(editing, { ...form, safetyScore: Number(form.safetyScore) })
    else addDriver({ ...form, safetyScore: Number(form.safetyScore) })
    closeModal()
  }

  const expiringCount = drivers.filter(d => isLicenseExpiringSoon(d.licenseExpiry) || isLicenseExpired(d.licenseExpiry)).length

  const columns = [
    { key: 'name', label: 'Driver Name', sortable: false },
    { key: 'licenseNumber', label: 'License No.' },
    { key: 'licenseCategory', label: 'Category' },
    { key: 'licenseExpiry', label: 'Expiry', render: v => <LicenseCell expiry={v} /> },
    { key: 'contact', label: 'Contact' },
    { key: 'safetyScore', label: 'Safety', sortable: true, render: v => <SafetyBadge score={v} /> },
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
      {expiringCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-medium">{expiringCount} driver license{expiringCount > 1 ? 's' : ''} expired or expiring within 30 days</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search drivers..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="w-40">
          <option value="all">All Statuses</option>
          {DRIVER_STATUSES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered.map(d => ({ ...d, licenseExpiry: formatDate(d.licenseExpiry) })), 'drivers')}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" /> Add Driver
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={paginated} />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>License Number</Label>
              <Input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>License Category</Label>
              <Select value={form.licenseCategory} onChange={e => setForm(f => ({ ...f, licenseCategory: e.target.value }))}>
                {LICENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>License Expiry Date</Label>
              <Input type="date" value={form.licenseExpiry} onChange={e => setForm(f => ({ ...f, licenseExpiry: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Number</Label>
              <Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Safety Score (0-100)</Label>
              <Input type="number" min="0" max="100" value={form.safetyScore} onChange={e => setForm(f => ({ ...f, safetyScore: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {DRIVER_STATUSES.map(s => <option key={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Add Driver'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Driver" className="max-w-sm">
        <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this driver?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteDriver(deleteConfirm); setDeleteConfirm(null) }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
