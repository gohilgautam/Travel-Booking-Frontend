import api from './api';

export interface Coupon {
  _id: string;
  code: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  minAmount?: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  applicablePackages?: string[];
  applicableCategories?: string[];
}

export const couponService = {
  getAll: async () => {
    const { data } = await api.get('/admin/coupons');
    return data?.data as Coupon[];
  },
  validate: async (code: string, amount: number) => {
    const { data } = await api.post('/coupons/validate', { code, amount });
    return data;
  },
  create: async (payload: Partial<Coupon>) => {
    const { data } = await api.post('/admin/coupons', payload);
    return data?.data as Coupon;
  },
  update: async (id: string, payload: Partial<Coupon>) => {
    const { data } = await api.put(`/admin/coupons/${id}`, payload);
    return data?.data as Coupon;
  },
  delete: async (id: string) => {
    await api.delete(`/admin/coupons/${id}`);
  },
};
