import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data?.user;
  },
  updateProfile: async (formData: FormData) => {
    const { data } = await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data?.user;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  verifyOtp: async (email: string, otp: string) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data?.resetToken as string;
  },
  resetPassword: async (resetToken: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', { resetToken, newPassword });
    return data;
  },
};
