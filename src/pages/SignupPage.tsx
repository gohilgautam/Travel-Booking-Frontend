import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify'; 
import signupBg from '../assets/backgrounds/signup-bg.png';
import { 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Phone
} from 'lucide-react';
import logo from '../assets/backgrounds/Logo.png';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
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
      toast.success('Welcome to Travelora! Account created.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
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
      padding: '40px 20px',
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
          background: `url(${signupBg}) center/cover no-repeat`,
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
          padding: '40px 50px',
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
            style={{ marginBottom: '32px', textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
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
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px', color: '#fff' }}>Join the Club</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Start your global adventure today.</p>
          </motion.div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Full Name</label>
              <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                <User className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Amelia Earhart"
                  style={{ color: '#fff' }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-mobile">
              <motion.div variants={itemVariants} className="form-group">
                <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email</label>
                <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                  <Mail className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john@example.com"
                    style={{ color: '#fff' }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="form-group">
                <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Phone Number</label>
                <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                  <Phone className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (234) 567-8900"
                    style={{ color: '#fff' }}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
              </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-mobile">
              <motion.div variants={itemVariants} className="form-group">
                <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Password</label>
                <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                  <Lock className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    style={{ color: '#fff' }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="form-group">
                <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Confirm</label>
                <div className="form-input-wrap" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '100px' }}>
                  <ShieldCheck className="form-input-icon" size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    style={{ color: '#fff' }}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} style={{ marginTop: '10px' }}>
              <motion.button  
                type="submit"  
                className="btn-primary"  
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800 }}
              >
                {loading ? <span className="btn-spinner" /> : <>Create Account <ArrowRight size={20} /></>}
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '10px' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .form-row-mobile {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}} />
    </div>
  );
}