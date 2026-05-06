import api from './api';

export interface TravelPackage {
  _id: string;
  title: string;
  destination: string;
  country: string;
  duration: number;
  price: number;
  originalPrice?: number;
  emoji?: string;
  gradient?: string;
  images?: Array<{ url: string; public_id: string }>;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  includes?: string[];
  category?: string;
  location?: string;
  available?: boolean;
  active?: boolean;
  seats?: number;
  featured?: boolean;
  description?: string;
  createdAt?: string;
}

export const packageService = {
  getAll: async (params?: Record<string, string | number>) => {
    const { data } = await api.get('/packages', { params: { includeInactive: 'true', ...params } });
    return data?.data as TravelPackage[];
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/packages/${id}`);
    return data?.data as TravelPackage;
  },
  create: async (payload: FormData) => {
    const { data } = await api.post('/packages', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data?.data as TravelPackage;
  },
  update: async (id: string, payload: FormData | Partial<TravelPackage>) => {
    const isFormData = payload instanceof FormData;
    const { data } = await api.put(`/packages/${id}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return data?.data as TravelPackage;
  },
  delete: async (id: string) => {
    await api.delete(`/packages/${id}`);
  },
  toggleFeatured: async (id: string) => {
    const { data } = await api.patch(`/packages/${id}/featured`);
    return data?.data as TravelPackage;
  },
  toggleStatus: async (id: string) => {
    const { data } = await api.patch(`/packages/${id}/toggle-status`);
    return data?.data as TravelPackage;
  },
};
