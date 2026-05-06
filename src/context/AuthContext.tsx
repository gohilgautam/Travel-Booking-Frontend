import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { http } from '../services/http';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin' | 'superadmin';
  avatar?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<string>; // returns resetToken
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('travel_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { token?: string; user?: User };
        if (parsed?.token) setToken(parsed.token);
        if (parsed?.user) setUser(parsed.user);
      } catch {
        sessionStorage.removeItem('travel_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    const { data } = await http.post('/auth/login', { email: emailOrPhone, password });
    const nextToken: string = data?.token;
    const nextUser: User = data?.user;
    setToken(nextToken);
    setUser(nextUser);
    sessionStorage.setItem('travel_auth', JSON.stringify({ token: nextToken, user: nextUser }));
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    const { data } = await http.post('/auth/register', { name, email, password, phone });
    const nextToken: string = data?.token;
    const nextUser: User = data?.user;
    setToken(nextToken);
    setUser(nextUser);
    sessionStorage.setItem('travel_auth', JSON.stringify({ token: nextToken, user: nextUser }));
  };

  const forgotPassword = async (email: string) => {
    await http.post('/auth/forgot-password', { email });
  };

  const verifyOtp = async (email: string, otp: string) => {
    const { data } = await http.post('/auth/verify-otp', { email, otp });
    return data?.resetToken as string;
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    await http.post('/auth/reset-password', { resetToken, newPassword });
  };

  const refreshMe = async () => {
    if (!token) return;
    const { data } = await http.get('/auth/me');
    const nextUser: User = data?.user;
    setUser(nextUser);
    sessionStorage.setItem('travel_auth', JSON.stringify({ token, user: nextUser }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('travel_auth');
    localStorage.removeItem('travel_auth'); // Just in case it was there
    // Clear other session related data if any
    localStorage.removeItem('recent_admin_paths');
    localStorage.removeItem('recent_user_paths');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, forgotPassword, verifyOtp, resetPassword, refreshMe, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
