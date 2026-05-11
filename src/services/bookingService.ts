import api, { API_BASE_URL } from './api';

export interface Booking {
  _id: string;
  user?: { _id: string; name: string; email: string; phone?: string };
  package?: { _id: string; title: string; destination?: string; price?: number; emoji?: string };
  travelDate: string;
  numberOfTravelers: number;
  totalAmount: number;
  discountAmount?: number;
  finalAmount?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'completed';
  specialRequests?: string;
  couponCode?: string;
  assignedAdmin?: { _id: string; name: string; email: string };
  payment?: { _id: string; razorpayPaymentId?: string; status?: string };
  createdAt: string;
}

export const bookingService = {
  create: async (payload: {
    packageId: string;
    travelDate: string;
    numberOfTravelers: number;
    couponCode?: string;
    specialRequests?: string;
  }) => {
    const { data } = await api.post('/bookings', payload);
    return data?.data as Booking;
  },
  getMyBookings: async () => {
    const { data } = await api.get('/bookings/mine');
    return data?.data as Booking[];
  },
  getAll: async (params?: Record<string, string | number>) => {
    const { data } = await api.get('/admin/bookings', { params });
    return { bookings: data?.data as Booking[], total: data?.total as number };
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/admin/bookings/${id}/status`, { status });
    return data?.data as Booking;
  },
  cancel: async (id: string) => {
    const { data } = await api.put(`/bookings/${id}/cancel`);
    return data?.data as Booking;
  },
  assignAdmin: async (id: string, adminId: string) => {
    const { data } = await api.patch(`/admin/bookings/${id}/assign`, { adminId });
    return data?.data as Booking;
  },
  getInvoiceUrl: (id: string, token: string | null) => {
    return `${API_BASE_URL}/bookings/${id}/invoice?token=${token}`;
  },
};
