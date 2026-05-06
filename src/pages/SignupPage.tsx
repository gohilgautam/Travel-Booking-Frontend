import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import logo from '../../Logo/Gemini_Generated_Image_swb8yswb8yswb8ys.png';
import signupBg from '../assets/backgrounds/signup-bg.png';

const particles = [
  { top: '20%', left: '12%', size: 3, dur: 8, delay: 0, tx: -25, ty: -45 },
  { top: '65%', left: '6%', size: 5, dur: 7, delay: -2, tx: 30, ty: -30 },
  { top: '35%', left: '80%', size: 4, dur: 9, delay: -1, tx: -20, ty: -40 },
  { top: '75%', left: '70%', size: 3, dur: 6, delay: -4, tx: 25, ty: 15 },
  { top: '10%', left: '55%', size: 5, dur: 11, delay: -5, tx: -35, ty: -25 },
  { top: '55%', left: '45%', size: 2, dur: 8, delay: -3, tx: 20, ty: -40 },
];

export default function SignupPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirm) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, phone);
      toast.success('Account created successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${signupBg})` }}>
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

        <div className="globe-wrap" style={{ left: '-120px', right: 'unset' }}>
          <motion.div  
            className="globe"
            animate={{ rotate: -360 }}
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
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="auth-logo">
          <motion.div  
            className="auth-logo-icon"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          </motion.div>
          <span className="auth-logo-text">Travelora</span>
        </div>

        <motion.h1 className="auth-title">Join the Journey</motion.h1>
        <motion.p className="auth-subtitle">Create your explorer account and start traveling.</motion.p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-wrap">
              <User className="form-input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Explorer Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrap">
              <Mail className="form-input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="explorer@travelora.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="form-input-wrap">
              <span className="form-input-icon" style={{ fontSize: '18px' }}>📞</span>
              <input
                type="text"
                className="form-input"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrap">
                <Lock className="form-input-icon" size={18} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm</label>
              <div className="form-input-wrap">
                <ShieldCheck className="form-input-icon" size={18} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
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
            {loading ? <span className="btn-spinner" /> : <>Create Explorer Account <ArrowRight size={20} /></>}
          </motion.button>
        </form>

        <div className="auth-link-row" style={{ marginTop: 32, fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account?</span>{' '}
          <Link to="/login" className="auth-link" style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
            Sign in here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
