import api from './api';
import type { FuelLog } from '@/types';

interface BackendFuelLog {
  _id: string;
  vehicle: string | { _id: string; registrationNumber: string };
  liters: number;
  cost: number;
  date?: string;
  odometerKm?: number;
}

function resolveId(ref: string | { _id: string }): string {
  return typeof ref === 'string' ? ref : ref._id;
}

function normalise(f: BackendFuelLog): FuelLog {
  return {
    id: f._id,
    vehicleId: resolveId(f.vehicle as string | { _id: string }),
    liters: f.liters,
    cost: f.cost,
    date: f.date ? new Date(f.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    odometerKm: f.odometerKm ?? 0,
  };
}

export const fuelService = {
  async getAll(): Promise<FuelLog[]> {
    const { data } = await api.get<{ logs: BackendFuelLog[] }>('/fuel');
    return data.logs.map(normalise);
  },

  async create(f: Omit<FuelLog, 'id'>): Promise<FuelLog> {
    const { data } = await api.post<{ fuelLog: BackendFuelLog }>('/fuel', {
      vehicle: f.vehicleId,
      liters: f.liters,
      cost: f.cost,
      date: f.date,
      odometerKm: f.odometerKm,
    });
    return normalise(data.fuelLog);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/fuel/${id}`);
  },
};
