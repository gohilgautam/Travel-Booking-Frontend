import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import logo from '../../Logo/Gemini_Generated_Image_swb8yswb8yswb8ys.png';
import loginbg from '../assets/backgrounds/login-bg.png';


const particles = [
  { top: '15%', left: '10%', size: 4, dur: 7, delay: 0, tx: 30, ty: -40 },
  { top: '70%', left: '8%', size: 3, dur: 9, delay: -2, tx: -20, ty: -50 },
  { top: '40%', left: '85%', size: 5, dur: 6, delay: -1, tx: 25, ty: -30 },
  { top: '80%', left: '75%', size: 3, dur: 8, delay: -3, tx: -30, ty: 20 },
  { top: '25%', left: '60%', size: 4, dur: 10, delay: -5, tx: 40, ty: -20 },
  { top: '60%', left: '50%', size: 2, dur: 7, delay: -4, tx: -15, ty: -35 },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your credentials');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to Travelora!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `var(--auth-overlay), url(${loginbg})` }}>
      {/* 3D Dynamic Background */}
      <div className="auth-scene">
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="auth-particle"
            animate={{
              x: [0, p.tx, 0],
              y: [0, p.ty, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
            }}
          />
        ))}

        <div className="globe-wrap">
          <motion.div 
            className="globe"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <div className="globe-ring globe-ring-1" />
            <div className="globe-ring globe-ring-2" />
            <div className="globe-ring globe-ring-3" />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="auth-logo">
          <motion.div 
            className="auth-logo-icon"
            whileHover={{ rotate: 180 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          </motion.div>
          <span className="auth-logo-text">Travelora</span>
        </div>

        <motion.h1 
          className="auth-title"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          Welcome Back
        </motion.h1>
        <motion.p 
          className="auth-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your next adventure is just a login away.
        </motion.p>

        <form onSubmit={handleSubmit}>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="form-label">Email or Phone</label>
            <div className="form-input-wrap">
              <Mail className="form-input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Email or phone number"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <Lock className="form-input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </motion.div>

          <motion.div 
            className="auth-link-row" 
            style={{ marginBottom: 24, justifyContent: 'flex-end' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/forgot-password" title='forgot password' className="auth-link" style={{ fontSize: '0.85rem' }}>
              Forgot password?
            </Link>
          </motion.div>

          <motion.button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              <>
                Continue Journey <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <motion.div 
          className="auth-link-row" 
          style={{ marginTop: 32, fontSize: '0.9rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>New explorer?</span>{' '}
          <Link to="/signup" className="auth-link" style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
            Start your journey
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
