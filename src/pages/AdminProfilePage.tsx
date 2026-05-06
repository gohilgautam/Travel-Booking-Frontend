import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AdminSidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { http } from '../services/http';
import { toast } from 'react-toastify';
import { 
  User, Mail, Phone, Lock, Camera, 
  ShieldCheck, Save, Key, MapPin,
  ShieldAlert, Award, Activity, Fingerprint,
  RefreshCw, Shield
} from 'lucide-react';

export default function AdminProfilePage() {
  const { user, refreshMe } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAddress(user?.address || '');
    setAvatarPreview(user?.avatar || null);
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const updateProfile = async () => {
    if (!name) return toast.error('Name is required');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('phone', phone);
      form.append('address', address);
      if (avatar) form.append('avatar', avatar);
      
      await http.put('/auth/profile', form);
      await refreshMe();
      toast.success('System identity updated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Security verification required');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Cipher mismatch: Check passwords');
    }

    setPassLoading(true);
    try {
      await http.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Security credentials rotated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Credential rotation failed.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <AdminSidebar>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8'
          }}>
            <Fingerprint size={28} />
          </div>
          <div>
            <div className="topbar-title">Authority Profile</div>
            <div className="topbar-sub">Administrative core and security protocols.</div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          
          {/* Identity Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '350px 1fr', 
            gap: 32, 
            alignItems: 'start' 
          }}>
            
            {/* Admin ID Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(15, 15, 26, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 32,
                padding: 32,
                border: '1px solid rgba(99, 102, 241, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{
                position: 'absolute', top: -100, right: -100,
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent)',
                filter: 'blur(40px)'
              }} />
              
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 24px' }}>
                  <div style={{ 
                    width: '100%', height: '100%', borderRadius: 32, 
                    background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                    padding: 4, position: 'relative'
                  }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', background: '#0a0a10' }}>
                      {avatarPreview ? (
                        <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Admin" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                          <ShieldAlert size={60} />
                        </div>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute', bottom: -10, right: -10,
                      width: 44, height: 44, borderRadius: 14,
                      background: '#fff', color: '#000',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Camera size={20} />
                  </motion.button>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                </div>

                <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 6, color: '#fff' }}>{name}</h2>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 12, background: 'rgba(99,102,241,0.1)',
                  color: '#818cf8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.05em', marginBottom: 24
                }}>
                  <Award size={14} /> Level {user?.role === 'superadmin' ? '01' : '02'} Admin
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                  <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Access Role</div>
                    <div style={{ color: '#fff', fontWeight: 700 }}>{user?.role?.toUpperCase()} AUTHORITY</div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>System Since</div>
                    <div style={{ color: '#fff', fontWeight: 700 }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'INITIAL_BOOT'}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="content-card"
              style={{ borderRadius: 32, padding: 32 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <Activity size={20} style={{ color: '#10b981' }} />
                <h3 style={{ margin: 0, fontWeight: 800 }}>Profile Credentials</h3>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', 
                gap: 24 
              }}>
                <div className="form-group">
                  <label className="form-label">Administrative Name</label>
                  <div className="form-input-wrap">
                    <User className="form-input-icon" size={16} />
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">System Email (Primary)</label>
                  <div className="form-input-wrap">
                    <Mail className="form-input-icon" size={16} />
                    <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Security Phone</label>
                  <div className="form-input-wrap">
                    <Phone className="form-input-icon" size={16} />
                    <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Command Station</label>
                  <div className="form-input-wrap">
                    <MapPin className="form-input-icon" size={16} />
                    <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                onClick={updateProfile}
                disabled={loading}
                className="btn-primary"
                style={{ 
                  marginTop: 12, height: 56, borderRadius: 16, 
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none'
                }}
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} style={{ marginRight: 8 }} /> Sync Changes</>}
              </motion.button>
            </motion.div>
          </div>

          {/* Security & Reset Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="content-card"
            style={{ 
              borderRadius: 32, padding: 40,
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(239, 68, 68, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ 
                  width: 50, height: 50, borderRadius: 16, background: 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
                }}>
                  <Shield size={28} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem' }}>Credential Rotation</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Protect your admin access with high-entropy passwords.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width: 30, height: 6, borderRadius: 3, background: i <= 4 ? '#10b981' : 'rgba(255,255,255,0.1)' }} />
                ))}
                <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>STRONG</span>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr 1fr', 
              gap: 24, 
              alignItems: 'end' 
            }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.5)' }}>Current Secret</label>
                <div className="form-input-wrap">
                  <Lock className="form-input-icon" size={16} />
                  <input 
                    className="form-input" 
                    type={showPass ? "text" : "password"} 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={{ borderRadius: 14, background: 'rgba(0,0,0,0.2)' }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.5)' }}>New Access Key</label>
                <div className="form-input-wrap">
                  <Key className="form-input-icon" size={16} />
                  <input 
                    className="form-input" 
                    type={showPass ? "text" : "password"} 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ borderRadius: 14, background: 'rgba(0,0,0,0.2)' }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.5)' }}>Confirm Cipher</label>
                <div className="form-input-wrap">
                  <ShieldCheck className="form-input-icon" size={16} />
                  <input 
                    className="form-input" 
                    type={showPass ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ borderRadius: 14, background: 'rgba(0,0,0,0.2)' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: window.innerWidth < 600 ? 'stretch' : 'center', 
              flexDirection: window.innerWidth < 600 ? 'column' : 'row',
              gap: 20,
              marginTop: 32 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)} style={{ cursor: 'pointer' }} />
                <span>Show cleartext password</span>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetPassword}
                disabled={passLoading}
                style={{ 
                  padding: '16px 32px', borderRadius: 16, 
                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer',
                  fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12,
                  justifyContent: 'center',
                  fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}
              >
                {passLoading ? <RefreshCw className="animate-spin" size={20} /> : <><RefreshCw size={20} /> Rotate Credentials</>}
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AdminSidebar>
  );
}
