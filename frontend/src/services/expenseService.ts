import api from './api';
import type { Expense, ExpenseCategory } from '@/types';

// Backend uses: Toll, Repair, Parking, Insurance, Other
// Frontend uses: Fuel, Toll, Maintenance, Miscellaneous
const categoryToBackend: Record<ExpenseCategory, string> = {
  Fuel: 'Other',
  Toll: 'Toll',
  Maintenance: 'Repair',
  Miscellaneous: 'Other',
};
const categoryFromBackend: Record<string, ExpenseCategory> = {
  Toll: 'Toll',
  Repair: 'Maintenance',
  Parking: 'Miscellaneous',
  Insurance: 'Miscellaneous',
  Other: 'Miscellaneous',
};

interface BackendExpense {
  _id: string;
  vehicle?: string | { _id: string; registrationNumber: string };
  category: string;
  amount: number;
  description?: string;
  date?: string;
}

function resolveId(ref: string | { _id: string } | undefined): string | undefined {
  if (!ref) return undefined;
  return typeof ref === 'string' ? ref : ref._id;
}

function normalise(e: BackendExpense): Expense {
  return {
    id: e._id,
    vehicleId: resolveId(e.vehicle),
    category: categoryFromBackend[e.category] ?? 'Miscellaneous',
    amount: e.amount,
    description: e.description ?? '',
    date: e.date ? new Date(e.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const { data } = await api.get<{ expenses: BackendExpense[] }>('/expenses');
    return data.expenses.map(normalise);
  },

  async create(e: Omit<Expense, 'id'>): Promise<Expense> {
    const { data } = await api.post<{ expense: BackendExpense }>('/expenses', {
      vehicle: e.vehicleId,
      category: categoryToBackend[e.category],
      amount: e.amount,
      description: e.description,
      date: e.date,
    });
    return normalise(data.expense);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
