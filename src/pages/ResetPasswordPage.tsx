import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import resetBg from '../assets/backgrounds/reset-bg.png';
import logo from '../assets/backgrounds/Logo.png';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('reset_token') || '';
    setResetToken(stored);
    if (!stored) {
      toast.warning('Session expired. Please restart the reset process.');
      navigate('/forgot-password');
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetToken) return toast.error('Reset token missing');
    if (!password || !confirm) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      sessionStorage.removeItem('reset_token');
      sessionStorage.removeItem('reset_email');
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
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
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
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
          background: `url(${resetBg}) center/cover no-repeat`,
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
          maxWidth: '480px',
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
                width: '120px', 
                height: '120px', 
                background: 'rgba(255, 255, 255, 0.08)', 
                backdropFilter: 'blur(15px)',
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                padding: '10px',
                overflow: 'hidden'
              }}>
                <img src={logo} alt="Travelora Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>New Password</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Create a secure password for your account.</p>
          </motion.div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>New Password</label>
              <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                <Lock className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ color: '#fff', paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Confirm Password</label>
              <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <ShieldCheck className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                <input
                  type={showConfirm ? "text" : "password"}
                  className="form-input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={{ color: '#fff', paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                {loading ? <span className="btn-spinner" /> : <>Update & Sign In <ArrowRight size={20} /></>}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}