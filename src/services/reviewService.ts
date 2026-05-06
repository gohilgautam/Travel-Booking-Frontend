import api from './api';

export interface Review {
  _id: string;
  user?: { _id: string; name: string; avatar?: string };
  package?: { _id: string; title: string };
  rating: number;
  title?: string;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export const reviewService = {
  // Admin side
  getAll: async (params?: Record<string, string | number>) => {
    const { data } = await api.get('/admin/reviews', { params });
    return { reviews: data?.data as Review[], total: data?.total as number };
  },
  approve: async (id: string) => {
    const { data } = await api.patch(`/admin/reviews/${id}/approve`);
    return data?.data as Review;
  },
  reject: async (id: string) => {
    const { data } = await api.patch(`/admin/reviews/${id}/reject`);
    return data?.data as Review;
  },
  deleteAdmin: async (id: string) => {
    await api.delete(`/admin/reviews/${id}`);
  },

  // User side (nested under package)
  getByPackage: async (packageId: string) => {
    const { data } = await api.get(`/packages/${packageId}/reviews`);
    return data?.data as Review[];
  },
  create: async (packageId: string, reviewData: { rating: number; comment: string }) => {
    const { data } = await api.post(`/packages/${packageId}/reviews`, reviewData);
    return data?.data as Review;
  },
  update: async (packageId: string, reviewId: string, reviewData: { rating: number; comment: string }) => {
    const { data } = await api.put(`/packages/${packageId}/reviews/${reviewId}`, reviewData);
    return data?.data as Review;
  },
  delete: async (packageId: string, reviewId: string) => {
    await api.delete(`/packages/${packageId}/reviews/${reviewId}`);
  },
};
