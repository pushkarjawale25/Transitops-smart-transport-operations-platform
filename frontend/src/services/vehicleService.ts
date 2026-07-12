import api from './api';
import type { Vehicle, VehicleStatus, VehicleType } from '@/types';

// ─── Shape returned by the backend ───────────────────────────────────────────
interface BackendVehicle {
  _id: string;
  registrationNumber: string;
  vehicleName: string;
  type: VehicleType;
  capacity: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region?: string;
}

/** Map backend field names → frontend Vehicle type */
function normalise(v: BackendVehicle): Vehicle {
  return {
    id: v._id,
    registration: v.registrationNumber,
    name: v.vehicleName,
    type: v.type,
    maxLoadKg: v.capacity,
    odometerKm: v.odometer,
    acquisitionCost: v.acquisitionCost,
    status: v.status,
    region: v.region ?? 'North',
  };
}

/** Map frontend Vehicle shape → backend create/update payload */
function denormalise(v: Partial<Omit<Vehicle, 'id'>>) {
  return {
    ...(v.registration !== undefined && { registrationNumber: v.registration }),
    ...(v.name !== undefined && { vehicleName: v.name }),
    ...(v.type !== undefined && { type: v.type }),
    ...(v.maxLoadKg !== undefined && { capacity: v.maxLoadKg }),
    ...(v.odometerKm !== undefined && { odometer: v.odometerKm }),
    ...(v.acquisitionCost !== undefined && { acquisitionCost: v.acquisitionCost }),
    ...(v.status !== undefined && { status: v.status }),
    ...(v.region !== undefined && { region: v.region }),
  };
}

export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    const { data } = await api.get<{ vehicles: BackendVehicle[] }>('/vehicles');
    return data.vehicles.map(normalise);
  },

  async create(v: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const { data } = await api.post<{ vehicle: BackendVehicle }>('/vehicles', denormalise(v));
    return normalise(data.vehicle);
  },

  async update(id: string, v: Partial<Omit<Vehicle, 'id'>>): Promise<Vehicle> {
    const { data } = await api.put<{ vehicle: BackendVehicle }>(`/vehicles/${id}`, denormalise(v));
    return normalise(data.vehicle);
  },

  async retire(id: string): Promise<void> {
    await api.patch(`/vehicles/${id}/retire`);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },
};
