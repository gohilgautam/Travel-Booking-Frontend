import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { http } from '../services/http';
import { toast } from 'react-toastify';
import { 
  User, Mail, Phone, Lock, Camera, 
  ShieldCheck, Save, Key, UserCircle, MapPin
} from 'lucide-react';

export default function ProfilePage() {
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
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Please fill all password fields');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setPassLoading(true);
    try {
      await http.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <Sidebar>
      <div className="topbar">
        <div>
          <div className="topbar-title">👤 Account Settings</div>
          <div className="topbar-sub">Update your personal information and keep your account secure.</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexWrap: 'wrap' }}>
          
          {/* General Information Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="content-card" 
            style={{ borderRadius: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 10, background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', borderRadius: 12 }}>
                <UserCircle size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>General Information</h3>
            </div>

            {/* Avatar Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: 100, height: 100, borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', border: '4px solid var(--border)'
                }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                  ) : (
                    <User size={50} color="#fff" />
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--primary)', color: '#fff',
                    border: '3px solid var(--bg-dark)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Camera size={16} />
                </motion.button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{name || 'Traveler'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user?.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user?.role || 'User'} Member
                </div>
                {user?.createdAt && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} /> Full Name
                </label>
                <input 
                  className="form-input" 
                  style={{ borderRadius: 12 }}
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} /> Email Address
                </label>
                <input 
                  className="form-input" 
                  style={{ borderRadius: 12, opacity: 0.6, cursor: 'not-allowed' }}
                  value={user?.email || ''} 
                  disabled 
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={12} /> Email cannot be changed for security reasons
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} /> Phone Number
                </label>
                <input 
                  className="form-input" 
                  style={{ borderRadius: 12 }}
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} /> Location / Address
                </label>
                <input 
                  className="form-input" 
                  style={{ borderRadius: 12 }}
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="City, Country"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary" 
                disabled={loading} 
                onClick={updateProfile} 
                style={{ width: '100%', height: 50, borderRadius: 14, marginTop: 10 }}
              >
                {loading ? <span className="btn-spinner" /> : <><Save size={18} style={{ marginRight: 8 }} /> Save Changes</>}
              </motion.button>
            </div>
          </motion.div>

          {/* Security Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="content-card" 
            style={{ borderRadius: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 12 }}>
                <Lock size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Password & Security</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Current Password</label>
                <div className="form-input-wrap">
                  <Lock className="form-input-icon" size={16} />
                  <input 
                    className="form-input" 
                    type="password" 
                    style={{ borderRadius: 12 }}
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
                <div className="form-input-wrap">
                  <Key className="form-input-icon" size={16} />
                  <input 
                    className="form-input" 
                    type="password" 
                    style={{ borderRadius: 12 }}
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <div className="form-input-wrap">
                  <ShieldCheck className="form-input-icon" size={16} />
                  <input 
                    className="form-input" 
                    type="password" 
                    style={{ borderRadius: 12 }}
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary" 
                disabled={passLoading} 
                onClick={handleResetPassword} 
                style={{ 
                  width: '100%', height: 50, borderRadius: 14, marginTop: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' 
                }}
              >
                {passLoading ? <span className="btn-spinner" /> : 'Update Password'}
              </motion.button>

              <div style={{ marginTop: 12, padding: 20, borderRadius: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <ShieldCheck size={24} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>Password Security</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Make sure your password is at least 8 characters long and includes numbers or special characters for better protection.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </Sidebar>
  );
}