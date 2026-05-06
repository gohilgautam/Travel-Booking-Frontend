import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'superadmin';
  isBlocked: boolean;
  createdAt: string;
}

export const userService = {
  getAll: async (params?: Record<string, string | number>) => {
    const { data } = await api.get('/admin/users', { params });
    return { users: data?.data as User[], total: data?.total as number };
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data?.data as { user: User; bookings: unknown[] };
  },
  update: async (id: string, payload: Partial<User>) => {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data?.data as User;
  },
  delete: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },
  block: async (id: string) => {
    const { data } = await api.patch(`/admin/users/${id}/block`);
    return data?.data as User;
  },
  unblock: async (id: string) => {
    const { data } = await api.patch(`/admin/users/${id}/unblock`);
    return data?.data as User;
  },
};
