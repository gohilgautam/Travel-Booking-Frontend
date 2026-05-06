import { http } from './http';

export async function createRazorpayOrder(bookingId: string) {
  const { data } = await http.post('/payments/create-order', { bookingId });
  return data as {
    success: boolean;
    orderId: string;
    amount: number;
    currency: string;
    paymentId: string;
  };
}

export async function verifyRazorpayPayment(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { data } = await http.post('/payments/verify', payload);
  return data;
}

