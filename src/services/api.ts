import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-travel-booking-8l0s.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
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

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('travel_auth');
      localStorage.removeItem('travel_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
