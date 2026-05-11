import api, { API_BASE_URL } from './api';
import type { TravelPackage } from './packages';

export type Booking = {
  _id: string;
  user?: { _id: string; name: string; email: string };
  package: Pick<TravelPackage, '_id' | 'title' | 'images' | 'price'> | TravelPackage;
  travelDate: string;
  numberOfTravelers: number;
  totalAmount: number;
  discountAmount?: number;
  finalAmount?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  createdAt: string;
  payment?: any;
};

export async function createBooking(payload: {
  packageId: string;
  travelDate: string;
  numberOfTravelers: number;
  couponCode?: string;
  specialRequests?: string;
}) {
  const { data } = await api.post('/bookings', payload);
  return data?.data as Booking;
}

export async function getMyBookings() {
  const { data } = await api.get('/bookings/mine');
  return data?.data as Booking[];
}

export async function cancelBooking(id: string) {
  const { data } = await api.put(`/bookings/${id}/cancel`);
  return data?.data as Booking;
}

export function getInvoiceUrl(id: string, token: string | null) {
  return `${API_BASE_URL}/bookings/${id}/invoice?token=${token}`;
}

