import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';
import forgotBg from '../assets/backgrounds/forgot-bg.png';
import logo from '../assets/backgrounds/Logo.png';

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120 } }
  } as const;

  return (
    <div className="auth-page" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      {/* Full Screen Background Image with Blur */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 15, ease: "easeOut" }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `url(${forgotBg}) center/cover no-repeat`,
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
          zIndex: 0
        }}
      />

      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
      }} />

      {/* Glassmorphic Form Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '550px',
          padding: '50px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ width: '100%' }}>
          <motion.div
            variants={itemVariants}
            className="auth-header"
            style={{ marginBottom: '40px', textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}>
                <img src={logo} alt="Travelora Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>
              {step === 'email' ? 'Forgot Password?' : 'Verify Identity'}
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {step === 'email'
                ? "Enter your email to receive a recovery code."
                : `We've sent a code to your email.`}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email-form"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: -20 }}
                onSubmit={submitEmail}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <motion.div variants={itemVariants} className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Recovery Email</label>
                  <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                    <Mail className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="explorer@travelora.com"
                      style={{ color: '#fff' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} style={{ marginTop: '10px' }}>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: '100%', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800 }}
                  >
                    {loading ? <span className="btn-spinner" /> : <>Send Recovery Code <ArrowRight size={20} /></>}
                  </motion.button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: 20 }}
                onSubmit={submitOtp}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <motion.div variants={itemVariants} className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Verification Code</label>
                  <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                    <KeyRound className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                    <input
                      className="form-input"
                      placeholder="Enter 6-digit code"
                      style={{ color: '#fff' }}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} style={{ marginTop: '10px' }}>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: '100%', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800 }}
                  >
                    {loading ? <span className="btn-spinner" /> : <>Verify & Continue <ArrowRight size={20} /></>}
                  </motion.button>
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
                  {countdown > 0 ? (
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                      Resend available in <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                    >
                      <RefreshCw size={14} /> Resend Verification Code
                    </button>
                  )}
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ textAlign: 'center', marginTop: '32px' }}
          >
            <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
              <ChevronLeft size={16} /> Back to login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
