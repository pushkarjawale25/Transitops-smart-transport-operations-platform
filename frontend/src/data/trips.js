export const mockTrips = [
  { id: 'T001', source: 'Mumbai, MH', destination: 'Pune, MH', vehicleId: 'V002', driverId: 'D002', cargoWeight: 12000, plannedDistance: 180, revenue: 45000, dispatchDate: '2026-07-10', status: 'Dispatched' },
  { id: 'T002', source: 'Delhi, DL', destination: 'Jaipur, RJ', vehicleId: 'V006', driverId: 'D005', cargoWeight: 8000, plannedDistance: 280, revenue: 62000, dispatchDate: '2026-07-11', status: 'Dispatched' },
  { id: 'T003', source: 'Bangalore, KA', destination: 'Chennai, TN', vehicleId: 'V001', driverId: 'D001', cargoWeight: 20000, plannedDistance: 350, revenue: 85000, dispatchDate: '2026-07-08', status: 'Completed' },
  { id: 'T004', source: 'Ahmedabad, GJ', destination: 'Surat, GJ', vehicleId: 'V003', driverId: 'D006', cargoWeight: 5000, plannedDistance: 270, revenue: 38000, dispatchDate: '2026-07-09', status: 'Completed' },
  { id: 'T005', source: 'Hyderabad, TS', destination: 'Vijayawada, AP', vehicleId: 'V005', driverId: 'D008', cargoWeight: 14000, plannedDistance: 275, revenue: 55000, dispatchDate: '2026-07-12', status: 'Draft' },
  { id: 'T006', source: 'Chennai, TN', destination: 'Coimbatore, TN', vehicleId: 'V007', driverId: 'D010', cargoWeight: 18000, plannedDistance: 500, revenue: 110000, dispatchDate: '2026-07-05', status: 'Completed' },
  { id: 'T007', source: 'Kolkata, WB', destination: 'Patna, BR', vehicleId: 'V009', driverId: 'D003', cargoWeight: 800, plannedDistance: 600, revenue: 28000, dispatchDate: '2026-07-13', status: 'Draft' },
  { id: 'T008', source: 'Pune, MH', destination: 'Nagpur, MH', vehicleId: 'V001', driverId: 'D001', cargoWeight: 16000, plannedDistance: 610, revenue: 72000, dispatchDate: '2026-07-02', status: 'Cancelled' },
]

export const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled']
