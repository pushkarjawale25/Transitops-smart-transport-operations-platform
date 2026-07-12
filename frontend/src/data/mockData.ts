import type {
  Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, Expense,
  AppNotification, Activity, User,
} from '@/types';

export const mockUsers: (User & { password: string })[] = [
  { id: 'u1', name: 'Rohit Sharma', email: 'manager@transitops.in', password: 'demo1234', role: 'Fleet Manager' },
  { id: 'u2', name: 'Seema Kulkarni', email: 'dispatcher@transitops.in', password: 'demo1234', role: 'Dispatcher' },
  { id: 'u3', name: 'Vijay Singh', email: 'safety@transitops.in', password: 'demo1234', role: 'Safety Officer' },
  { id: 'u4', name: 'Priya Iyer', email: 'finance@transitops.in', password: 'demo1234', role: 'Financial Analyst' },
];

export const mockVehicles: Vehicle[] = [
  { id: 'v1', registration: 'MH12AB4589', name: 'Tata Ace Gold', type: 'Truck', maxLoadKg: 750, odometerKm: 98000, acquisitionCost: 550000, status: 'Available', region: 'Maharashtra' },
  { id: 'v2', registration: 'MH14CX9021', name: 'Tata Intra V50', type: 'Truck', maxLoadKg: 1700, odometerKm: 76000, acquisitionCost: 875000, status: 'On Trip', region: 'Maharashtra' },
  { id: 'v3', registration: 'MH43DF7812', name: 'Tata 407 Gold', type: 'Truck', maxLoadKg: 2500, odometerKm: 112000, acquisitionCost: 1250000, status: 'In Shop', region: 'Maharashtra' },
  { id: 'v4', registration: 'KA01MN4421', name: 'Mahindra Supro Maxitruck', type: 'Truck', maxLoadKg: 1700, odometerKm: 54000, acquisitionCost: 750000, status: 'Available', region: 'Karnataka' },
  { id: 'v5', registration: 'DL01TR9874', name: 'Ashok Leyland Dost+', type: 'Truck', maxLoadKg: 2500, odometerKm: 82000, acquisitionCost: 850000, status: 'On Trip', region: 'Delhi' },
  { id: 'v6', registration: 'GJ05RT6543', name: 'Eicher Pro 2049', type: 'Truck', maxLoadKg: 4900, odometerKm: 103000, acquisitionCost: 1800000, status: 'Available', region: 'Gujarat' },
  { id: 'v7', registration: 'MH12CK3390', name: 'BharatBenz 1217R', type: 'Truck', maxLoadKg: 7200, odometerKm: 94000, acquisitionCost: 3200000, status: 'Available', region: 'Maharashtra' },
  { id: 'v8', registration: 'KA02XY1234', name: 'Tata Signa 3118', type: 'Truck', maxLoadKg: 18000, odometerKm: 148000, acquisitionCost: 4500000, status: 'In Shop', region: 'Karnataka' },
  { id: 'v9', registration: 'DL05GH5678', name: 'Ashok Leyland 2820', type: 'Truck', maxLoadKg: 18000, odometerKm: 135000, acquisitionCost: 3200000, status: 'Available', region: 'Delhi' },
  { id: 'v10', registration: 'RJ14PQ5678', name: 'Eicher Pro 3015', type: 'Truck', maxLoadKg: 17000, odometerKm: 126000, acquisitionCost: 3200000, status: 'On Trip', region: 'Rajasthan' },
];

export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Ramesh Patil', licenseNumber: 'MH12-202345', licenseCategory: 'C+E', licenseExpiry: '2027-08-09', contact: '+91 9876543210', safetyScore: 92, status: 'Available' },
  { id: 'd2', name: 'Suresh Shinde', licenseNumber: 'MH14-203456', licenseCategory: 'C', licenseExpiry: '2026-11-12', contact: '+91 9823456789', safetyScore: 88, status: 'On Trip' },
  { id: 'd3', name: 'Mahesh Pawar', licenseNumber: 'MH43-204567', licenseCategory: 'C+E', licenseExpiry: '2028-01-25', contact: '+91 9765432109', safetyScore: 90, status: 'Available' },
  { id: 'd4', name: 'Amit Jadhav', licenseNumber: 'KA01-205678', licenseCategory: 'C', licenseExpiry: '2026-09-30', contact: '+91 9956123450', safetyScore: 85, status: 'Off Duty' },
  { id: 'd5', name: 'Rahul Chavan', licenseNumber: 'DL01-206789', licenseCategory: 'C', licenseExpiry: '2026-12-05', contact: '+91 9887766554', safetyScore: 83, status: 'Available' },
  { id: 'd6', name: 'Ganesh More', licenseNumber: 'GJ05-207890', licenseCategory: 'C+E', licenseExpiry: '2027-04-15', contact: '+91 9812345670', safetyScore: 89, status: 'Available' },
  { id: 'd7', name: 'Santosh Kadam', licenseNumber: 'MH12-208901', licenseCategory: 'C', licenseExpiry: '2026-10-18', contact: '+91 9898989898', safetyScore: 87, status: 'On Trip' },
  { id: 'd8', name: 'Pravin Deshmukh', licenseNumber: 'GJ05-209012', licenseCategory: 'C+E', licenseExpiry: '2028-05-20', contact: '+91 9765123487', safetyScore: 94, status: 'Available' },
  { id: 'd9', name: 'Vijay Yadav', licenseNumber: 'RJ14-210123', licenseCategory: 'C', licenseExpiry: '2027-02-05', contact: '+91 9922334455', safetyScore: 91, status: 'Off Duty' },
  { id: 'd10', name: 'Sunil Sharma', licenseNumber: 'TN01-211234', licenseCategory: 'C', licenseExpiry: '2026-08-14', contact: '+91 9871234560', safetyScore: 88, status: 'Available' },
  { id: 'd11', name: 'Akash Verma', licenseNumber: 'MP09-212345', licenseCategory: 'C+E', licenseExpiry: '2027-03-22', contact: '+91 9865432190', safetyScore: 86, status: 'Available' },
  { id: 'd12', name: 'Nitin Gupta', licenseNumber: 'DL05-213456', licenseCategory: 'C', licenseExpiry: '2027-05-10', contact: '+91 9815566778', safetyScore: 84, status: 'On Trip' },
  { id: 'd13', name: 'Rajesh Singh', licenseNumber: 'HR26-214567', licenseCategory: 'C', licenseExpiry: '2028-06-30', contact: '+91 9870987654', safetyScore: 79, status: 'Available' },
  { id: 'd14', name: 'Manoj Kumar', licenseNumber: 'UP32-215678', licenseCategory: 'C+E', licenseExpiry: '2027-12-18', contact: '+91 9900112233', safetyScore: 92, status: 'Available' },
  { id: 'd15', name: 'Deepak Joshi', licenseNumber: 'TN07-216789', licenseCategory: 'C', licenseExpiry: '2026-09-28', contact: '+91 9797979797', safetyScore: 82, status: 'Suspended' },
];

export const mockTrips: Trip[] = [
  { id: 't1', source: 'Pune', destination: 'Mumbai', vehicleId: 'v1', driverId: 'd1', cargoKg: 650, plannedDistanceKm: 150, revenue: 85000, dispatchDate: '2026-07-10', status: 'Dispatched' },
  { id: 't2', source: 'Mumbai', destination: 'Nashik', vehicleId: 'v2', driverId: 'd2', cargoKg: 1600, plannedDistanceKm: 165, revenue: 92000, dispatchDate: '2026-07-11', status: 'Dispatched' },
  { id: 't3', source: 'Pune', destination: 'Hyderabad', vehicleId: 'v4', driverId: 'd4', cargoKg: 1500, plannedDistanceKm: 560, revenue: 240000, dispatchDate: '2026-07-12', status: 'Dispatched' },
  { id: 't4', source: 'Nagpur', destination: 'Indore', vehicleId: 'v6', driverId: 'd6', cargoKg: 4700, plannedDistanceKm: 450, revenue: 360000, dispatchDate: '2026-07-05', status: 'Completed' },
  { id: 't5', source: 'Bengaluru', destination: 'Chennai', vehicleId: 'v5', driverId: 'd5', cargoKg: 11800, plannedDistanceKm: 350, revenue: 310000, dispatchDate: '2026-07-06', status: 'Completed' },
  { id: 't6', source: 'Ahmedabad', destination: 'Surat', vehicleId: 'v8', driverId: 'd7', cargoKg: 5600, plannedDistanceKm: 270, revenue: 135000, dispatchDate: '2026-07-14', status: 'Draft' },
  { id: 't7', source: 'Delhi', destination: 'Jaipur', vehicleId: 'v9', driverId: 'd10', cargoKg: 17200, plannedDistanceKm: 280, revenue: 325000, dispatchDate: '2026-07-08', status: 'Cancelled' },
  { id: 't8', source: 'Mumbai', destination: 'Bengaluru', vehicleId: 'v10', driverId: 'd12', cargoKg: 14500, plannedDistanceKm: 980, revenue: 620000, dispatchDate: '2026-07-09', status: 'Dispatched' },
  { id: 't9', source: 'Hyderabad', destination: 'Chennai', vehicleId: 'v3', driverId: 'd3', cargoKg: 2200, plannedDistanceKm: 625, revenue: 248000, dispatchDate: '2026-07-13', status: 'Draft' },
];

export const mockMaintenance: MaintenanceRecord[] = [
  { id: 'm1', vehicleId: 'v3', type: 'Preventive', description: 'Engine oil change and filter replacement', cost: 4500, startDate: '2026-07-09', endDate: null, status: 'In Progress' },
  { id: 'm2', vehicleId: 'v8', type: 'Corrective', description: 'Brake system overhaul and alignment', cost: 18000, startDate: '2026-07-07', endDate: null, status: 'In Progress' },
  { id: 'm3', vehicleId: 'v1', type: 'Inspection', description: 'Annual safety inspection and paperwork', cost: 2500, startDate: '2026-06-20', endDate: '2026-06-21', status: 'Completed' },
  { id: 'm4', vehicleId: 'v5', type: 'Preventive', description: 'Tire rotation, wash and minor checks', cost: 300, startDate: '2026-06-15', endDate: '2026-06-15', status: 'Completed' },
];

export const mockFuelLogs: FuelLog[] = [
  { id: 'f1', vehicleId: 'v1', liters: 60, cost: 5760, date: '2026-07-01', odometerKm: 98000 },
  { id: 'f2', vehicleId: 'v2', liters: 120, cost: 11520, date: '2026-07-03', odometerKm: 76000 },
  { id: 'f3', vehicleId: 'v5', liters: 210, cost: 20160, date: '2026-07-05', odometerKm: 82000 },
  { id: 'f4', vehicleId: 'v6', liters: 175, cost: 16800, date: '2026-07-06', odometerKm: 103000 },
  { id: 'f5', vehicleId: 'v9', liters: 250, cost: 24000, date: '2026-07-08', odometerKm: 135000 },
  { id: 'f6', vehicleId: 'v1', liters: 65, cost: 6240, date: '2026-07-10', odometerKm: 98250 },
  { id: 'f7', vehicleId: 'v10', liters: 80, cost: 7680, date: '2026-07-11', odometerKm: 126000 },
];

export const mockExpenses: Expense[] = [
  { id: 'e1', category: 'Fuel', amount: 5760, description: 'Diesel refill - MH12AB4589', date: '2026-07-01', vehicleId: 'v1' },
  { id: 'e2', category: 'Toll', amount: 850, description: 'Mumbai-Pune toll', date: '2026-07-10', vehicleId: 'v1' },
  { id: 'e3', category: 'Maintenance', amount: 4500, description: 'Oil change - MH14CX9021', date: '2026-07-09', vehicleId: 'v3' },
  { id: 'e4', category: 'Miscellaneous', amount: 500, description: 'Driver allowance - Ramesh Patil', date: '2026-07-04' },
  { id: 'e5', category: 'Fuel', amount: 11520, description: 'Diesel refill - MH43DF7812', date: '2026-07-03', vehicleId: 'v2' },
  { id: 'e6', category: 'Toll', amount: 850, description: 'Nagpur-Indore toll', date: '2026-07-11', vehicleId: 'v6' },
  { id: 'e7', category: 'Maintenance', amount: 18000, description: 'Brake overhaul - KA01MN4421', date: '2026-07-07', vehicleId: 'v8' },
  { id: 'e8', category: 'Maintenance', amount: 300, description: 'Vehicle wash - DL01TR9874', date: '2026-07-06', vehicleId: 'v5' },
  { id: 'e9', category: 'Maintenance', amount: 2500, description: 'Minor repair - GJ05RT6543', date: '2026-07-09', vehicleId: 'v6' },
  { id: 'e10', category: 'Maintenance', amount: 18000, description: 'Tyre replacement - RJ14PQ5678', date: '2026-07-12', vehicleId: 'v9' },
];

export const mockNotifications: AppNotification[] = [
  { id: 'n1', title: 'License Expiring', message: 'Mahesh Pawar license expires on 25/07/2026', type: 'warning', date: '2026-07-12T08:00:00Z', read: false },
  { id: 'n2', title: 'Maintenance Overdue', message: 'Tata 407 Gold MH43DF7812 has been in shop for 3 days', type: 'error', date: '2026-07-12T06:30:00Z', read: false },
  { id: 'n3', title: 'Trip Completed', message: 'Trip #t4 Nagpur → Indore marked completed', type: 'success', date: '2026-07-06T14:00:00Z', read: true },
  { id: 'n4', title: 'New Vehicle Added', message: 'BharatBenz 1217R GJ05RT6543 registered', type: 'info', date: '2026-07-02T10:00:00Z', read: true },
];

export const mockActivities: Activity[] = [
  { id: 'a1', action: 'Dispatched Trip', detail: 'Trip #t1 Pune → Mumbai', user: 'Amit Jadhav', date: '2026-07-10T09:15:00Z' },
  { id: 'a2', action: 'Completed Trip', detail: 'Trip #t4 Nagpur → Indore', user: 'Ramesh Patil', date: '2026-07-06T16:00:00Z' },
  { id: 'a3', action: 'Created Maintenance', detail: 'Tata 407 Gold oil change', user: 'Suresh Shinde', date: '2026-07-09T08:00:00Z' },
  { id: 'a4', action: 'Added Fuel Log', detail: 'MH12AB4589 - 60L', user: 'Mahesh Pawar', date: '2026-07-10T12:00:00Z' },
  { id: 'a5', action: 'Updated Driver', detail: 'Sunil Sharma assigned to trip', user: 'Priya Iyer', date: '2026-07-08T11:00:00Z' },
];
