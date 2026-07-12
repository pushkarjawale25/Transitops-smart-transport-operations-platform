import { createContext, useContext, useState, useCallback } from 'react'
import { mockVehicles } from '@/data/vehicles'
import { mockDrivers } from '@/data/drivers'
import { mockTrips } from '@/data/trips'
import { mockMaintenance } from '@/data/maintenance'
import { generateId } from '@/utils/helpers'

const AppContext = createContext(null)

const mockFuelLogs = [
  { id: 'F001', vehicleId: 'V001', quantity: 120, cost: 10800, date: '2026-07-10', odometer: 142100 },
  { id: 'F002', vehicleId: 'V002', quantity: 95, cost: 8550, date: '2026-07-09', odometer: 98300 },
  { id: 'F003', vehicleId: 'V005', quantity: 110, cost: 9900, date: '2026-07-08', odometer: 215600 },
  { id: 'F004', vehicleId: 'V006', quantity: 88, cost: 7920, date: '2026-07-07', odometer: 89100 },
  { id: 'F005', vehicleId: 'V007', quantity: 145, cost: 13050, date: '2026-07-06', odometer: 301800 },
  { id: 'F006', vehicleId: 'V003', quantity: 72, cost: 6480, date: '2026-07-05', odometer: 67000 },
  { id: 'F007', vehicleId: 'V009', quantity: 45, cost: 4050, date: '2026-07-04', odometer: 41000 },
]

const mockExpenses = [
  { id: 'E001', type: 'Fuel', amount: 10800, description: 'Diesel refill for V001', date: '2026-07-10' },
  { id: 'E002', type: 'Toll', amount: 1250, description: 'Mumbai-Pune expressway toll', date: '2026-07-10' },
  { id: 'E003', type: 'Maintenance', amount: 85000, description: 'Engine overhaul V004', date: '2026-07-05' },
  { id: 'E004', type: 'Fuel', amount: 8550, description: 'Diesel refill for V002', date: '2026-07-09' },
  { id: 'E005', type: 'Miscellaneous', amount: 3500, description: 'Driver accommodation', date: '2026-07-08' },
  { id: 'E006', type: 'Toll', amount: 2100, description: 'Delhi-Jaipur highway toll', date: '2026-07-11' },
  { id: 'E007', type: 'Maintenance', amount: 42000, description: 'Tyre replacement V010', date: '2026-07-10' },
  { id: 'E008', type: 'Fuel', amount: 9900, description: 'Diesel refill for V005', date: '2026-07-08' },
]

export function AppProvider({ children }) {
  const [vehicles, setVehicles] = useState(mockVehicles)
  const [drivers, setDrivers] = useState(mockDrivers)
  const [trips, setTrips] = useState(mockTrips)
  const [maintenance, setMaintenance] = useState(mockMaintenance)
  const [fuelLogs, setFuelLogs] = useState(mockFuelLogs)
  const [expenses, setExpenses] = useState(mockExpenses)

  // ─── Vehicles ────────────────────────────────────────────
  const addVehicle = useCallback((v) => setVehicles(prev => [...prev, { ...v, id: 'V' + generateId() }]), [])
  const updateVehicle = useCallback((id, data) => setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v)), [])
  const deleteVehicle = useCallback((id) => setVehicles(prev => prev.filter(v => v.id !== id)), [])
  const updateVehicleStatus = useCallback((id, status) => setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v)), [])

  // ─── Drivers ─────────────────────────────────────────────
  const addDriver = useCallback((d) => setDrivers(prev => [...prev, { ...d, id: 'D' + generateId() }]), [])
  const updateDriver = useCallback((id, data) => setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d)), [])
  const deleteDriver = useCallback((id) => setDrivers(prev => prev.filter(d => d.id !== id)), [])
  const updateDriverStatus = useCallback((id, status) => setDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d)), [])

  // ─── Trips ────────────────────────────────────────────────
  const addTrip = useCallback((t) => setTrips(prev => [...prev, { ...t, id: 'T' + generateId(), status: 'Draft' }]), [])
  const updateTrip = useCallback((id, data) => setTrips(prev => prev.map(t => t.id === id ? { ...t, ...data } : t)), [])
  const deleteTrip = useCallback((id) => setTrips(prev => prev.filter(t => t.id !== id)), [])

  const dispatchTrip = useCallback((id) => {
    const trip = trips.find(t => t.id === id)
    if (!trip) return
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'Dispatched' } : t))
    updateVehicleStatus(trip.vehicleId, 'On Trip')
    updateDriverStatus(trip.driverId, 'On Trip')
  }, [trips, updateVehicleStatus, updateDriverStatus])

  const completeTrip = useCallback((id) => {
    const trip = trips.find(t => t.id === id)
    if (!trip) return
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed' } : t))
    const vehicle = vehicles.find(v => v.id === trip.vehicleId)
    if (vehicle && vehicle.status !== 'Retired') updateVehicleStatus(trip.vehicleId, 'Available')
    updateDriverStatus(trip.driverId, 'Available')
  }, [trips, vehicles, updateVehicleStatus, updateDriverStatus])

  const cancelTrip = useCallback((id) => {
    const trip = trips.find(t => t.id === id)
    if (!trip) return
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'Cancelled' } : t))
    if (trip.status === 'Dispatched') {
      updateVehicleStatus(trip.vehicleId, 'Available')
      updateDriverStatus(trip.driverId, 'Available')
    }
  }, [trips, updateVehicleStatus, updateDriverStatus])

  // ─── Maintenance ──────────────────────────────────────────
  const addMaintenance = useCallback((m) => {
    const newM = { ...m, id: 'M' + generateId(), status: 'In Progress' }
    setMaintenance(prev => [...prev, newM])
    updateVehicleStatus(m.vehicleId, 'In Shop')
  }, [updateVehicleStatus])

  const closeMaintenance = useCallback((id) => {
    const m = maintenance.find(x => x.id === id)
    if (!m) return
    setMaintenance(prev => prev.map(x => x.id === id ? { ...x, status: 'Completed' } : x))
    const vehicle = vehicles.find(v => v.id === m.vehicleId)
    if (vehicle && vehicle.status !== 'Retired') updateVehicleStatus(m.vehicleId, 'Available')
  }, [maintenance, vehicles, updateVehicleStatus])

  const deleteMaintenance = useCallback((id) => setMaintenance(prev => prev.filter(m => m.id !== id)), [])

  // ─── Fuel / Expenses ──────────────────────────────────────
  const addFuelLog = useCallback((f) => setFuelLogs(prev => [...prev, { ...f, id: 'F' + generateId() }]), [])
  const deleteFuelLog = useCallback((id) => setFuelLogs(prev => prev.filter(f => f.id !== id)), [])

  const addExpense = useCallback((e) => setExpenses(prev => [...prev, { ...e, id: 'E' + generateId() }]), [])
  const deleteExpense = useCallback((id) => setExpenses(prev => prev.filter(e => e.id !== id)), [])

  return (
    <AppContext.Provider value={{
      vehicles, addVehicle, updateVehicle, deleteVehicle, updateVehicleStatus,
      drivers, addDriver, updateDriver, deleteDriver, updateDriverStatus,
      trips, addTrip, updateTrip, deleteTrip, dispatchTrip, completeTrip, cancelTrip,
      maintenance, addMaintenance, closeMaintenance, deleteMaintenance,
      fuelLogs, addFuelLog, deleteFuelLog,
      expenses, addExpense, deleteExpense,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
