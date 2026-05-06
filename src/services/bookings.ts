import { http } from './http';
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
  const { data } = await http.post('/bookings', payload);
  return data?.data as Booking;
}

export async function getMyBookings() {
  const { data } = await http.get('/bookings/mine');
  return data?.data as Booking[];
}

export async function cancelBooking(id: string) {
  const { data } = await http.put(`/bookings/${id}/cancel`);
  return data?.data as Booking;
}

