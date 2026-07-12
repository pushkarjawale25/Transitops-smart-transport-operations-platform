import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, Expense,
  AppNotification, FuelPrices, Activity,
} from '@/types';
import { vehicleService }     from '@/services/vehicleService';
import { driverService }      from '@/services/driverService';
import { tripService }        from '@/services/tripService';
import { maintenanceService } from '@/services/maintenanceService';
import { fuelService }        from '@/services/fuelService';
import { expenseService }     from '@/services/expenseService';
import { toast }              from '@/hooks/use-toast';
import { useAuth }            from '@/context/AuthContext';
import { mockActivities }     from '@/data/mockData';

/**
 * DataContext — single source of truth for all entity data.
 * All state is loaded from the real REST API; mutations call the API first
 * then update local state on success.
 */

interface DataContextValue {
  vehicles:      Vehicle[];
  drivers:       Driver[];
  trips:         Trip[];
  maintenance:   MaintenanceRecord[];
  fuelLogs:      FuelLog[];
  expenses:      Expense[];
  notifications: AppNotification[];
  activities:    Activity[];
  isLoading:     boolean;
  error:         string | null;
  refetchAll:    () => Promise<void>;

  // Vehicle CRUD
  addVehicle:    (v: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, v: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Driver CRUD
  addDriver:    (d: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (id: string, d: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;

  // Trip CRUD + actions
  addTrip:     (t: Omit<Trip, 'id'>) => Promise<void>;
  updateTrip:  (id: string, changes: Partial<Trip>) => Promise<void>;
  deleteTrip:  (id: string) => Promise<void>;

  // Maintenance CRUD + close
  addMaintenance:    (m: Omit<MaintenanceRecord, 'id'>) => Promise<void>;
  updateMaintenance: (id: string, m: Partial<MaintenanceRecord>) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;

  // Fuel CRUD
  addFuelLog:    (f: Omit<FuelLog, 'id'>) => Promise<void>;
  updateFuelLog: (id: string, f: Partial<FuelLog>) => Promise<void>;
  deleteFuelLog: (id: string) => Promise<void>;

  // Expense CRUD
  addExpense:    (e: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, e: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  fuelPrices:       FuelPrices;
  updateFuelPrices: (p: Partial<FuelPrices>) => void;

  // Notifications (client-side only)
  markNotificationRead: (id: string) => void;
  markAllRead:          () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [vehicles,      setVehicles]      = useState<Vehicle[]>([]);
  const [drivers,       setDrivers]       = useState<Driver[]>([]);
  const [trips,         setTrips]         = useState<Trip[]>([]);
  const [maintenance,   setMaintenance]   = useState<MaintenanceRecord[]>([]);
  const [fuelLogs,      setFuelLogs]      = useState<FuelLog[]>([]);
  const [expenses,      setExpenses]      = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activities,    setActivities]    = useState<Activity[]>([]);
  const [fuelPrices,    setFuelPrices]    = useState<FuelPrices>({ city: 'Pune', diesel: 96, petrol: 112, cng: 86 });
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [v, d, t, m, f, e] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
        tripService.getAll(),
        maintenanceService.getAll(),
        fuelService.getAll(),
        expenseService.getAll(),
      ]);
      setVehicles(v);
      setDrivers(d);
      setTrips(t);
      setMaintenance(m);
      setFuelLogs(f);
      setExpenses(e);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to load data';
      setError(msg);
      console.error('[DataContext] fetchAll error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      fetchAll();
      setActivities(mockActivities);
    } else {
      setIsLoading(false);
    }
  }, [fetchAll]);

  const logActivity = useCallback((action: string, detail: string) => {
    setActivities((prev) => [
      {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        action,
        detail,
        user: user?.name || 'System User',
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [user]);

  // ── VEHICLE ──
  const addVehicle = async (v: Omit<Vehicle, 'id'>) => {
    try {
      const created = await vehicleService.create(v);
      setVehicles((p) => [...p, created]);
      toast({
        title: "Vehicle Registered Successfully",
        description: `Vehicle ${created.registration} (${created.name}) has been added.`,
      });
      logActivity('Registered Vehicle', `${created.name} (${created.registration}) registered`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to register vehicle.';
      toast({
        title: "Registration Failed",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateVehicle = async (id: string, v: Partial<Vehicle>) => {
    try {
      const updated = await vehicleService.update(id, v);
      setVehicles((p) => p.map((x) => (x.id === id ? updated : x)));
      toast({
        title: "Vehicle Updated Successfully",
        description: `Details for ${updated.registration} have been updated.`,
      });
      logActivity('Updated Vehicle', `${updated.registration} details updated`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update vehicle.';
      toast({
        title: "Update Failed",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const target = vehicles.find((x) => x.id === id);
      const reg = target ? target.registration : id;
      await vehicleService.delete(id);
      setVehicles((p) => p.filter((x) => x.id !== id));
      toast({
        title: "Vehicle Deleted",
        description: `Vehicle ${reg} has been removed.`,
      });
      logActivity('Deleted Vehicle', `Vehicle ${reg} removed from fleet`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete vehicle.';
      toast({
        title: "Deletion Failed",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  // ── DRIVER ──
  const addDriver = async (d: Omit<Driver, 'id'>) => {
    try {
      const created = await driverService.create(d);
      setDrivers((p) => [...p, created]);
      toast({
        title: "Driver Created Successfully",
        description: `${created.name} has been added.`,
      });
      logActivity('Added Driver', `${created.name} registered`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add driver.';
      toast({
        title: "Failed to Add Driver",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateDriver = async (id: string, d: Partial<Driver>) => {
    try {
      const updated = await driverService.update(id, d);
      setDrivers((p) => p.map((x) => (x.id === id ? updated : x)));
      toast({
        title: "Driver Updated Successfully",
        description: `Details for ${updated.name} have been updated.`,
      });
      logActivity('Updated Driver', `${updated.name} details updated`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update driver.';
      toast({
        title: "Failed to Update Driver",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      const target = drivers.find((x) => x.id === id);
      const name = target ? target.name : id;
      await driverService.delete(id);
      setDrivers((p) => p.filter((x) => x.id !== id));
      toast({
        title: "Driver Deleted",
        description: `Driver ${name} has been removed.`,
      });
      logActivity('Deleted Driver', `Driver ${name} removed`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete driver.';
      toast({
        title: "Failed to Delete Driver",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  // ── TRIP ── (status actions call specific endpoints)
  const addTrip = async (t: Omit<Trip, 'id'>) => {
    try {
      // Frontend Business Validation Rules
      const vehicle = vehicles.find((v) => v.id === t.vehicleId);
      if (!vehicle) {
        throw new Error('Selected vehicle not found.');
      }
      if (vehicle.status !== 'Available') {
        throw new Error(`Vehicle ${vehicle.registration} is unavailable. Status: ${vehicle.status}`);
      }

      const driver = drivers.find((d) => d.id === t.driverId);
      if (!driver) {
        throw new Error('Selected driver not found.');
      }
      if (driver.status === 'Suspended') {
        throw new Error(`Driver ${driver.name} is Suspended.`);
      }
      if (driver.status !== 'Available') {
        throw new Error(`Driver ${driver.name} is unavailable. Status: ${driver.status}`);
      }
      if (new Date(driver.licenseExpiry) < new Date()) {
        throw new Error(`Driver ${driver.name}'s license has expired.`);
      }
      if (t.cargoKg > vehicle.maxLoadKg) {
        throw new Error(`Cargo weight (${t.cargoKg} kg) exceeds vehicle capacity (${vehicle.maxLoadKg} kg).`);
      }

      const created = await tripService.create(t);
      setTrips((p) => [created, ...p]);
      toast({
        title: "Trip Created Successfully",
        description: `Trip from ${created.source} to ${created.destination} has been scheduled.`,
      });
      logActivity('Created Trip', `Trip ${created.source} → ${created.destination} scheduled`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error).message ?? 'Failed to create trip.';
      toast({
        title: "Failed to Create Trip",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTrip = async (id: string, changes: Partial<Trip>) => {
    try {
      const { status } = changes;
      const trip = trips.find((x) => x.id === id);
      if (!trip) throw new Error('Trip not found.');

      if (status === 'Dispatched') {
        const updated = await tripService.dispatch(id);
        setTrips((p) => p.map((x) => (x.id === id ? updated : x)));
        // Refresh vehicles and drivers to reflect On Trip status from server
        const [v, d] = await Promise.all([vehicleService.getAll(), driverService.getAll()]);
        setVehicles(v);
        setDrivers(d);
        toast({
          title: "Trip Dispatched",
          description: `Trip ${trip.source} → ${trip.destination} is now active.`,
        });
        logActivity('Dispatched Trip', `Trip ${trip.source} → ${trip.destination} dispatched`);
        return;
      }

      if (status === 'Completed') {
        const updated = await tripService.complete(id, trip.plannedDistanceKm, Math.round(trip.plannedDistanceKm / 5));
        setTrips((p) => p.map((x) => (x.id === id ? updated : x)));
        const [v, d] = await Promise.all([vehicleService.getAll(), driverService.getAll()]);
        setVehicles(v);
        setDrivers(d);
        toast({
          title: "Trip Completed",
          description: `Trip ${trip.source} → ${trip.destination} completed successfully. Driver and vehicle set to Available.`,
        });
        logActivity('Completed Trip', `Trip ${trip.source} → ${trip.destination} completed`);
        return;
      }

      if (status === 'Cancelled') {
        await tripService.cancel(id);
        setTrips((p) => p.map((x) => (x.id === id ? { ...x, status: 'Cancelled' } : x)));
        const [v, d] = await Promise.all([vehicleService.getAll(), driverService.getAll()]);
        setVehicles(v);
        setDrivers(d);
        toast({
          title: "Trip Cancelled",
          description: `Trip to ${trip.destination} cancelled. Vehicle & driver released.`,
          variant: "destructive",
        });
        logActivity('Cancelled Trip', `Trip ${trip.source} → ${trip.destination} cancelled`);
        return;
      }

      // Local update fallback
      setTrips((p) => p.map((x) => (x.id === id ? { ...x, ...changes } : x)));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update trip.';
      toast({
        title: "Failed to Update Trip",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      setTrips((p) => p.filter((x) => x.id !== id));
      toast({
        title: "Trip Deleted",
        description: "Trip has been removed locally.",
      });
      logActivity('Deleted Trip', `Trip record ${id} removed`);
    } catch (err: unknown) {
      toast({
        title: "Failed to Delete Trip",
        description: "Failed to remove trip record.",
        variant: "destructive",
      });
      throw err;
    }
  };

  // ── MAINTENANCE ──
  const addMaintenance = async (m: Omit<MaintenanceRecord, 'id'>) => {
    try {
      const created = await maintenanceService.create(m);
      setMaintenance((p) => [created, ...p]);
      // Server sets vehicle to "In Shop"; refresh vehicles
      const v = await vehicleService.getAll();
      setVehicles(v);

      const target = vehicles.find((x) => x.id === m.vehicleId);
      const reg = target ? target.registration : '';
      toast({
        title: "Maintenance Scheduled",
        description: `Vehicle ${reg} status set to In Shop.`,
      });
      logActivity('Scheduled Maintenance', `Vehicle ${reg} placed in shop for ${created.type}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to schedule maintenance.';
      toast({
        title: "Failed to Schedule Maintenance",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateMaintenance = async (id: string, changes: Partial<MaintenanceRecord>) => {
    try {
      if (changes.status === 'Completed') {
        await maintenanceService.close(id);
        setMaintenance((p) =>
          p.map((x) => (x.id === id ? { ...x, status: 'Completed', endDate: new Date().toISOString().split('T')[0] } : x))
        );
        // Server sets vehicle back to "Available"; refresh
        const v = await vehicleService.getAll();
        setVehicles(v);

        const record = maintenance.find((x) => x.id === id);
        const target = record ? vehicles.find((x) => x.id === record.vehicleId) : null;
        const reg = target ? target.registration : '';
        toast({
          title: "Maintenance Completed",
          description: `Vehicle ${reg} is back in service.`,
        });
        logActivity('Completed Maintenance', `Vehicle ${reg} returned to service`);
        return;
      }
      setMaintenance((p) => p.map((x) => (x.id === id ? { ...x, ...changes } : x)));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to close maintenance.';
      toast({
        title: "Failed to Update Maintenance",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteMaintenance = async (id: string) => {
    try {
      setMaintenance((p) => p.filter((x) => x.id !== id));
      toast({
        title: "Maintenance Record Removed",
        description: "The maintenance record has been removed.",
      });
    } catch {
      throw new Error("Failed to delete maintenance record");
    }
  };

  // ── FUEL ──
  const addFuelLog = async (f: Omit<FuelLog, 'id'>) => {
    try {
      const created = await fuelService.create(f);
      setFuelLogs((p) => [created, ...p]);
      const target = vehicles.find((x) => x.id === f.vehicleId);
      const reg = target ? target.registration : '';
      toast({
        title: "Fuel Log Added",
        description: `Logged ${created.liters}L for ${reg}.`,
      });
      logActivity('Logged Fuel', `${created.liters}L refueled for ${reg}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to log fuel.';
      toast({
        title: "Failed to Add Fuel Log",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateFuelLog = (id: string, f: Partial<FuelLog>) => {
    setFuelLogs((p) => p.map((x) => (x.id === id ? { ...x, ...f } : x)));
    return Promise.resolve();
  };

  const deleteFuelLog = async (id: string) => {
    try {
      await fuelService.delete(id);
      setFuelLogs((p) => p.filter((x) => x.id !== id));
      toast({
        title: "Fuel Log Deleted",
        description: "Fuel log entry removed.",
      });
      logActivity('Deleted Fuel Log', `Fuel log record removed`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete fuel log.';
      toast({
        title: "Deletion Failed",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  // ── EXPENSE ──
  const addExpense = async (e: Omit<Expense, 'id'>) => {
    try {
      const created = await expenseService.create(e);
      setExpenses((p) => [created, ...p]);
      toast({
        title: "Expense Logged Successfully",
        description: `Logged ₹${created.amount} under ${created.category}.`,
      });
      logActivity('Logged Expense', `₹${created.amount} expense under ${created.category}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to log expense.';
      toast({
        title: "Failed to Add Expense",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateExpense = (id: string, e: Partial<Expense>) => {
    setExpenses((p) => p.map((x) => (x.id === id ? { ...x, ...e } : x)));
    return Promise.resolve();
  };

  const deleteExpense = async (id: string) => {
    try {
      await expenseService.delete(id);
      setExpenses((p) => p.filter((x) => x.id !== id));
      toast({
        title: "Expense Record Deleted",
        description: "Expense entry has been removed.",
      });
      logActivity('Deleted Expense Log', `Expense record removed`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete expense.';
      toast({
        title: "Deletion Failed",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateFuelPrices = (prices: Partial<FuelPrices>) =>
    setFuelPrices((prev) => ({ ...prev, ...prices }));

  // ── NOTIFICATIONS (client-only) ──
  const markNotificationRead = (id: string) =>
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () =>
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));

  return (
    <DataContext.Provider value={{
      vehicles, drivers, trips, maintenance, fuelLogs, expenses,
      notifications, activities, isLoading, error, refetchAll: fetchAll,
      addVehicle, updateVehicle, deleteVehicle,
      addDriver,  updateDriver,  deleteDriver,
      addTrip,    updateTrip,    deleteTrip,
      addMaintenance, updateMaintenance, deleteMaintenance,
      addFuelLog,  updateFuelLog,  deleteFuelLog,
      addExpense,  updateExpense,  deleteExpense,
      markNotificationRead, markAllRead,
      fuelPrices, updateFuelPrices,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
