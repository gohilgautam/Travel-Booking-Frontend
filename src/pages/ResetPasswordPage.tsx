import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import logo from '../../Logo/Gemini_Generated_Image_swb8yswb8yswb8ys.png';
import resetBg from '../assets/backgrounds/reset-bg.png';

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

  return (
    <div className="auth-page" style={{ backgroundImage: `var(--auth-overlay), url(${resetBg})` }}>
      <div className="auth-scene">
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-3" style={{ background: 'rgba(99, 102, 241, 0.1)' }} />
      </div>

      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          </div>
          <span className="auth-logo-text">Identity</span>
        </div>

        <h1 className="auth-title">New Password</h1>
        <p className="auth-subtitle">Create a secure password to protect your account.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="form-input-wrap">
              <Lock className="form-input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="form-input-wrap">
              <ShieldCheck className="form-input-icon" size={18} />
              <input
                type={showConfirm ? "text" : "password"}
                className="form-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '24px' }}
          >
            {loading ? <span className="btn-spinner" /> : <>Update & Sign In <ArrowRight size={20} /></>}
          </motion.button>
        </form>

        <div className="mt-8 p-4 rounded-2xl border border-white/5 bg-white/5">
          <p className="text-xs text-slate-400 flex items-start gap-3">
            <HelpCircle size={16} className="text-indigo-400 shrink-0" />
            <span>Use a unique password with at least 8 characters, including numbers and symbols for maximum security.</span>
          </p>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .password-toggle-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.6;
          transition: all 0.2s;
        }
        .password-toggle-btn:hover {
          opacity: 1;
          color: var(--primary-light);
        }
        .form-input {
          padding-right: 48px !important;
        }
      `}} />
    </div>
  );
}