export const mockMaintenance = [
  { id: 'M001', vehicleId: 'V004', type: 'Engine Repair', description: 'Full engine overhaul and oil change', cost: 85000, startDate: '2026-07-05', endDate: '2026-07-15', status: 'In Progress' },
  { id: 'M002', vehicleId: 'V010', type: 'Tyre Replacement', description: 'All six tyres replacement', cost: 42000, startDate: '2026-07-10', endDate: '2026-07-12', status: 'In Progress' },
  { id: 'M003', vehicleId: 'V001', type: 'Scheduled Service', description: '50,000 km scheduled service', cost: 12000, startDate: '2026-06-20', endDate: '2026-06-22', status: 'Completed' },
  { id: 'M004', vehicleId: 'V003', type: 'Brake Service', description: 'Front and rear brake pad replacement', cost: 18000, startDate: '2026-06-28', endDate: '2026-06-30', status: 'Completed' },
  { id: 'M005', vehicleId: 'V007', type: 'AC Repair', description: 'Cabin air conditioning unit repair', cost: 25000, startDate: '2026-07-01', endDate: '2026-07-03', status: 'Completed' },
]

export const MAINTENANCE_TYPES = ['Scheduled Service', 'Engine Repair', 'Tyre Replacement', 'Brake Service', 'AC Repair', 'Electrical', 'Body Work', 'Other']
export const MAINTENANCE_STATUSES = ['Scheduled', 'In Progress', 'Completed']
