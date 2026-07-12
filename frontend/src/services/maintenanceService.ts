import api from './api';
import type { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '@/types';

interface BackendMaintenance {
  _id: string;
  vehicle: string | { _id: string; registrationNumber: string; vehicleName: string };
  maintenanceType: string;
  description?: string;
  cost: number;
  status: 'Open' | 'Closed';
  date?: string;
  closedAt?: string;
}

const typeMap: Record<string, MaintenanceType> = {
  'Oil Change': 'Preventive',
  'Brake Repair': 'Corrective',
  'Tyre Change': 'Preventive',
  'Battery Replacement': 'Corrective',
  'General Service': 'Inspection',
  'Other': 'Corrective',
  'Emergency': 'Emergency',
};

const reverseTypeMap: Record<MaintenanceType, string> = {
  'Preventive': 'General Service',
  'Corrective': 'Brake Repair',
  'Inspection': 'General Service',
  'Emergency': 'Other',
};

function resolveId(ref: string | { _id: string }): string {
  return typeof ref === 'string' ? ref : ref._id;
}

function normalise(m: BackendMaintenance): MaintenanceRecord {
  const status: MaintenanceStatus = m.status === 'Closed' ? 'Completed' : 'In Progress';
  return {
    id: m._id,
    vehicleId: resolveId(m.vehicle as string | { _id: string }),
    type: typeMap[m.maintenanceType] ?? 'Corrective',
    description: m.description ?? '',
    cost: m.cost,
    startDate: m.date ? new Date(m.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: m.closedAt ? new Date(m.closedAt).toISOString().split('T')[0] : null,
    status,
  };
}

export const maintenanceService = {
  async getAll(): Promise<MaintenanceRecord[]> {
    const { data } = await api.get<{ maintenance: BackendMaintenance[] }>('/maintenance');
    return data.maintenance.map(normalise);
  },

  async create(m: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    const { data } = await api.post<{ maintenance: BackendMaintenance }>('/maintenance', {
      vehicle: m.vehicleId,
      maintenanceType: reverseTypeMap[m.type] ?? 'Other',
      description: m.description,
      cost: m.cost,
      date: m.startDate,
    });
    return normalise(data.maintenance);
  },

  async close(id: string): Promise<void> {
    await api.patch(`/maintenance/${id}/close`);
  },
};
