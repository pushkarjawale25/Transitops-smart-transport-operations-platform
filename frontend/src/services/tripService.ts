import api from './api';
import type { Trip, TripStatus } from '@/types';

interface BackendTrip {
  _id: string;
  source: string;
  destination: string;
  vehicle: string | { _id: string; registrationNumber: string; vehicleName: string };
  driver: string | { _id: string; name: string; licenseNumber: string };
  cargoWeight: number;
  plannedDistance: number;
  revenue?: number;
  dispatchDate?: string;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
}

function resolveId(ref: string | { _id: string }): string {
  return typeof ref === 'string' ? ref : ref._id;
}

function normalise(t: BackendTrip): Trip {
  return {
    id: t._id,
    source: t.source,
    destination: t.destination,
    vehicleId: resolveId(t.vehicle as string | { _id: string }),
    driverId: resolveId(t.driver as string | { _id: string }),
    cargoKg: t.cargoWeight,
    plannedDistanceKm: t.plannedDistance,
    revenue: t.revenue ?? 0,
    dispatchDate: t.dispatchDate ? new Date(t.dispatchDate).toISOString().split('T')[0] : '',
    status: t.status,
  };
}

function denormalise(t: Partial<Omit<Trip, 'id'>>) {
  return {
    ...(t.source !== undefined && { source: t.source }),
    ...(t.destination !== undefined && { destination: t.destination }),
    ...(t.vehicleId !== undefined && { vehicle: t.vehicleId }),
    ...(t.driverId !== undefined && { driver: t.driverId }),
    ...(t.cargoKg !== undefined && { cargoWeight: t.cargoKg }),
    ...(t.plannedDistanceKm !== undefined && { plannedDistance: t.plannedDistanceKm }),
    ...(t.revenue !== undefined && { revenue: t.revenue }),
    ...(t.dispatchDate !== undefined && { dispatchDate: t.dispatchDate }),
  };
}

export const tripService = {
  async getAll(): Promise<Trip[]> {
    const { data } = await api.get<{ trips: BackendTrip[] }>('/trips');
    return data.trips.map(normalise);
  },

  async create(t: Omit<Trip, 'id'>): Promise<Trip> {
    const { data } = await api.post<{ trip: BackendTrip }>('/trips', denormalise(t));
    return normalise(data.trip);
  },

  async dispatch(id: string): Promise<Trip> {
    const { data } = await api.patch<{ trip: BackendTrip }>(`/trips/${id}/dispatch`);
    return normalise(data.trip);
  },

  async complete(id: string, actualDistance?: number, fuelConsumed?: number): Promise<Trip> {
    const { data } = await api.patch<{ trip: BackendTrip }>(`/trips/${id}/complete`, {
      actualDistance,
      fuelConsumed,
    });
    return normalise(data.trip);
  },

  async cancel(id: string): Promise<void> {
    await api.patch(`/trips/${id}/cancel`);
  },
};
