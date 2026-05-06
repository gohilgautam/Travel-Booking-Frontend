import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';
import logo from '../../Logo/Gemini_Generated_Image_swb8yswb8yswb8ys.png';
import forgotBg from '../assets/backgrounds/forgot-bg.png';

export default function ForgotPasswordPage() {
  const { forgotPassword, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Recovery OTP sent to your email');
      setStep('otp');
      setCountdown(30);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send recovery OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('OTP resent successfully');
      setCountdown(60);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the verification code');
    setLoading(true);
    try {
      const resetToken = await verifyOtp(email, otp);
      sessionStorage.setItem('reset_token', resetToken);
      sessionStorage.setItem('reset_email', email);
      toast.success('Identity verified');
      navigate('/reset-password');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${forgotBg})` }}>
      <div className="auth-scene">
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-1" style={{ background: 'rgba(99, 102, 241, 0.2)' }} />
        <div className="auth-orb auth-orb-2" style={{ background: 'rgba(6, 182, 212, 0.15)' }} />
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          </div>
          <span className="auth-logo-text">Security</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 className="auth-title">Forgot Password</h1>
              <p className="auth-subtitle">No worries! Enter your email and we'll send you a recovery code.</p>

              <form onSubmit={submitEmail}>
                <div className="form-group">
                  <label className="form-label">Recovery Email</label>
                  <div className="form-input-wrap">
                    <Mail className="form-input-icon" size={18} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : <>Send Recovery Code <ArrowRight size={20} /></>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="auth-title">Verify Identity</h1>
              <p className="auth-subtitle">We've sent a 6-digit code to <b>{email}</b></p>

              <form onSubmit={submitOtp}>
                <div className="form-group">
                  <label className="form-label">Verification Code</label>
                  <div className="form-input-wrap">
                    <KeyRound className="form-input-icon" size={18} />
                    <input
                      className="form-input"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : <>Verify & Continue <ArrowRight size={20} /></>}
                </button>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  {countdown > 0 ? (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Resend available in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="auth-link"
                      disabled={loading}
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                    >
                      <RefreshCw size={14} /> Resend Verification Code
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="auth-link-row" style={{ marginTop: 32 }}>
          <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <ChevronLeft size={16} /> Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
