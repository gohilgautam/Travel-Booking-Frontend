import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AdminSidebar } from '../../components/Sidebar';
import api from '../../services/api';
import type { User } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, UserPlus, Mail, Lock, Trash2, 
  UserCheck, UserX, ShieldAlert,  RefreshCw 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { PageLoader } from '../../components/Loader';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/admin/admins');
      setAdmins(r.data?.data ?? []);
    } catch (err) {
      toast.error('Failed to load admin list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !name || !password) return toast.error('Please fill all fields');
    
    setProcessing(true);
    try {
      await api.post('/admin/admins', { email, name, password });
      toast.success('Admin created successfully');
      setEmail('');
      setName('');
      setPassword('');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create admin');
    } finally {
      setProcessing(false);
    }
  };

  const toggleStatus = async (admin: User) => {
    setProcessing(true);
    try {
      const endpoint = admin.isBlocked ? `/admin/admins/${admin._id}/activate` : `/admin/admins/${admin._id}/deactivate`;
      await api.patch(endpoint);
      toast.info(`Admin ${admin.isBlocked ? 'activated' : 'deactivated'}`);
      await load();
    } catch (err: any) {
      toast.error('Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  const removeAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to remove this admin? Their role will be reverted to user.')) return;
    setProcessing(true);
    try {
      await api.delete(`/admin/admins/${id}`);
      toast.success('Admin role removed');
      await load();
    } catch (err) {
      toast.error('Failed to remove admin');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <AdminSidebar>
      <div className="topbar">
        <div>
          <div className="topbar-title">🛡️ Admin Management</div>
          <div className="topbar-sub">Super admin command center for managing administrative access.</div>
        </div>
      </div>

      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 32, alignItems: 'start' }}>
        
        {/* Registration Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="content-card"
          style={{ position: 'sticky', top: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
              <UserPlus size={20} />
            </div>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Add Administrator</h3>
          </div>

          <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 44 }}
                  placeholder="e.g. John Doe"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 44 }}
                  placeholder="admin@travelora.com"
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 44 }}
                  type="password"
                  placeholder="••••••••"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              className="btn-primary" 
              type="submit" 
              disabled={processing}
              style={{ padding: '14px', borderRadius: 14, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {processing ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              Authorize Administrator
            </button>
          </form>
        </motion.div>

        {/* Admin List Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="content-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                <ShieldAlert size={20} />
              </div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Authorized Admins</h3>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 20 }}>
              {admins.length} Total
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence mode="popLayout">
              {admins.map((admin, idx) => (
                <motion.div
                  key={admin._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ 
                    padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 16
                  }}
                >
                  {/* Avatar Circle */}
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 14, 
                    background: admin.role === 'superadmin' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {admin.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{admin.name}</span>
                      <span style={{ 
                        fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '2px 8px', borderRadius: 6, background: admin.role === 'superadmin' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                        color: admin.role === 'superadmin' ? '#f59e0b' : '#818cf8'
                      }}>
                        {admin.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>{admin.email}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {admin.role !== 'superadmin' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.05)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleStatus(admin)}
                          title={admin.isBlocked ? 'Activate' : 'Deactivate'}
                          style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: admin.isBlocked ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          {admin.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, background: 'rgba(239,68,68,0.1)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeAdmin(admin._id)}
                          title="Remove Admin Role"
                          style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AdminSidebar>
  );
}
