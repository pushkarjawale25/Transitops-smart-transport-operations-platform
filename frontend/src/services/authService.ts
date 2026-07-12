import api from './api';
import type { User, Role } from '@/types';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: Role;
    status: string;
  };
}

interface MeResponse {
  success: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    role: Role;
  };
}

/** Normalise backend user shape → frontend User type */
function normaliseUser(u: LoginResponse['user'] | MeResponse['user']): User {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    return { token: data.token, user: normaliseUser(data.user) };
  },

  async me(): Promise<User> {
    const { data } = await api.get<MeResponse>('/auth/me');
    return normaliseUser(data.user);
  },
};
