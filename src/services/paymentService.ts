import api from './api';

export interface Payment {
  _id: string;
  booking: { _id: string; totalAmount: number; numberOfTravelers: number };
  user?: { _id: string; name: string; email: string };
  package?: { _id: string; title: string };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  refundId?: string;
  createdAt: string;
}

export const paymentService = {
  initiateOrder: async (bookingId: string) => {
    const { data } = await api.post('/payments/create-order', { bookingId });
    return data?.data;
  },
  verify: async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    bookingId: string;
  }) => {
    const { data } = await api.post('/payments/verify', payload);
    return data;
  },
  getAll: async (params?: Record<string, string | number>) => {
    const { data } = await api.get('/payments', { params });
    return { payments: data?.data as Payment[], total: data?.total as number };
  },
  refund: async (paymentId: string) => {
    const { data } = await api.post(`/payments/${paymentId}/refund`);
    return data;
  },
};
