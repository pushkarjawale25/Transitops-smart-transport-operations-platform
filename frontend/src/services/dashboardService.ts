import api from './api';

export interface DashboardMetrics {
  totalVehicles: number;
  vehiclesOnTrip: number;
  vehiclesAvailable: number;
  vehiclesInShop: number;
  vehiclesRetired: number;
  totalDrivers: number;
  driversOnTrip: number;
  activeTrips: number;
  totalTripsToday: number;
  monthlyFuelCost: number;
  monthlyMaintenanceCost: number;
  totalExpenses: number;
  expiredLicenses: number;
}

export interface VehicleReport {
  vehicleId: string;
  registrationNumber: string;
  vehicleName: string;
  type: string;
  status: string;
  acquisitionCost: number;
  totalTrips: number;
  totalDistance: number;
  fuelCost: number;
  maintenanceCost: number;
  expenseCost: number;
  totalCost: number;
  totalFuelLiters: number;
  fuelEfficiency: number;
  roi: number;
}

export interface ReportsSummary {
  totalVehicles: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalExpenseCost: number;
  totalOperationalCost: number;
}

export const dashboardService = {
  async getDashboard() {
    const { data } = await api.get('/dashboard');
    return data;
  },

  async getReports(): Promise<{ summary: ReportsSummary; vehicleReports: VehicleReport[] }> {
    const { data } = await api.get('/dashboard/reports');
    return data;
  },

  async exportCSV(): Promise<Blob> {
    const response = await api.get('/dashboard/export/csv', { responseType: 'blob' });
    return response.data;
  },
};
