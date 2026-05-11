import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import loginBg from '../assets/backgrounds/login-bg.png';
import logo from '../assets/backgrounds/Logo.png';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setLoading(true);
      try {
        await googleLogin(credentialResponse.credential);
        toast.success('Welcome to Travelora with Google!');
        navigate('/dashboard');
      } catch (err: any) {
        toast.error('Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
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
          background: `url(${loginBg}) center/cover no-repeat`,
          filter: 'blur(8px)', // Added blur effect
          transform: 'scale(1.1)', // Prevent white edges from blur
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
                borderRadius: '20%', // Reverting to circle
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
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>Welcome Back</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Sign in to continue your journey.</p>
          </motion.div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email or Phone</label>
              <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                <Mail className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="explorer@travelora.com"
                  style={{ color: '#fff' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.8)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                <Lock className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  style={{ color: '#fff', paddingRight: '50px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                {loading ? <span className="btn-spinner" /> : <>Continue Journey <ArrowRight size={20} /></>}
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="auth-divider" style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="google-btn-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Login Failed')}
                  theme="filled_black"
                  shape="pill"
                  width="380"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '24px' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
                New explorer?{' '}
                <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>
                  Start your journey
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}