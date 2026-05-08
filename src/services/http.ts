import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'travel-booking-backend-blue.vercel.app/api';

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('travel_auth') || localStorage.getItem('travel_auth');
  if (raw) {
    try {
      const { token } = JSON.parse(raw) as { token?: string };
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // ignore
    }
  }
  return config;
});

