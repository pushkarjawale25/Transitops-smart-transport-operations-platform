export type Role = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type VehicleType = 'Truck' | 'Van' | 'Bus' | 'Trailer' | 'Refrigerated';

export interface Vehicle {
  id: string;
  registration: string;
  name: string;
  type: VehicleType;
  maxLoadKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region: string;
}

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
export type LicenseCategory = 'A' | 'B' | 'C' | 'C+E' | 'D';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: LicenseCategory;
  licenseExpiry: string; // ISO date
  contact: string;
  safetyScore: number;
  status: DriverStatus;
}

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoKg: number;
  plannedDistanceKm: number;
  revenue: number;
  dispatchDate: string;
  status: TripStatus;
}

export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed';
export type MaintenanceType = 'Preventive' | 'Corrective' | 'Inspection' | 'Emergency';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  cost: number;
  startDate: string;
  endDate: string | null;
  status: MaintenanceStatus;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
  odometerKm: number;
}

export type ExpenseCategory = 'Fuel' | 'Toll' | 'Maintenance' | 'Miscellaneous';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  vehicleId?: string;
}

export interface FuelPrices {
  city: string;
  diesel: number;
  petrol: number;
  cng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

export interface Activity {
  id: string;
  action: string;
  detail: string;
  user: string;
  date: string;
}
