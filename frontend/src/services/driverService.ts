import api from './api';
import type { Driver, DriverStatus, LicenseCategory } from '@/types';

interface BackendDriver {
  _id: string;
  name: string;
  licenseNumber: string;
  licenseCategory?: LicenseCategory;
  expiryDate: string;
  phone: string;
  contact?: string;
  safetyScore: number;
  status: DriverStatus;
}

function normalise(d: BackendDriver): Driver {
  return {
    id: d._id,
    name: d.name,
    licenseNumber: d.licenseNumber,
    licenseCategory: d.licenseCategory ?? 'C',
    licenseExpiry: d.expiryDate ? new Date(d.expiryDate).toISOString().split('T')[0] : '',
    contact: d.contact ?? d.phone,
    safetyScore: d.safetyScore,
    status: d.status,
  };
}

function denormalise(d: Partial<Omit<Driver, 'id'>>) {
  return {
    ...(d.name !== undefined && { name: d.name }),
    ...(d.licenseNumber !== undefined && { licenseNumber: d.licenseNumber }),
    ...(d.licenseCategory !== undefined && { licenseCategory: d.licenseCategory }),
    ...(d.licenseExpiry !== undefined && { expiryDate: d.licenseExpiry }),
    ...(d.contact !== undefined && { phone: d.contact, contact: d.contact }),
    ...(d.safetyScore !== undefined && { safetyScore: d.safetyScore }),
    ...(d.status !== undefined && { status: d.status }),
  };
}

export const driverService = {
  async getAll(): Promise<Driver[]> {
    const { data } = await api.get<{ drivers: BackendDriver[] }>('/drivers');
    return data.drivers.map(normalise);
  },

  async create(d: Omit<Driver, 'id'>): Promise<Driver> {
    const { data } = await api.post<{ driver: BackendDriver }>('/drivers', denormalise(d));
    return normalise(data.driver);
  },

  async update(id: string, d: Partial<Omit<Driver, 'id'>>): Promise<Driver> {
    const { data } = await api.put<{ driver: BackendDriver }>(`/drivers/${id}`, denormalise(d));
    return normalise(data.driver);
  },

  async suspend(id: string): Promise<void> {
    await api.patch(`/drivers/${id}/suspend`);
  },

  async reactivate(id: string): Promise<void> {
    await api.patch(`/drivers/${id}/reactivate`);
  },

  async renewLicense(id: string, expiryDate: string): Promise<void> {
    await api.patch(`/drivers/${id}/renew-license`, { expiryDate });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/drivers/${id}`);
  },
};
