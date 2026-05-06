import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { PageLoader } from '../components/Loader';
import { cancelBooking, getMyBookings, type Booking } from '../services/bookings';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Users,
  FileText, XCircle, Clock, CheckCircle2, 
  AlertCircle, ArrowRight 
} from 'lucide-react';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetalert';

const statusConfig: Record<string, { bg: string; color: string; icon: any }> = {
  confirmed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: CheckCircle2 },
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', icon: Clock },
  cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', icon: XCircle },
  refunded: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', icon: AlertCircle },
};

export default function BookingHistoryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookings();
      setItems(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id: string) => {
    const result = await showConfirmAlert(
      'Cancel this trip?',
      'Are you sure you want to cancel your booking? This action might be subject to cancellation fees.',
      'Yes, Cancel Booking'
    );

    if (result.isConfirmed) {
      try {
        await cancelBooking(id);
        showSuccessAlert('Success', 'Your booking has been cancelled. A refund will be initiated if applicable.');
        load();
      } catch (err: any) {
        showErrorAlert('Error', err?.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  return (
    <Sidebar>
      <div className="topbar">
        <div>
          <div className="topbar-title">📋 My Bookings</div>
          <div className="topbar-sub">Manage your upcoming and past adventures.</div>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="auth-error" style={{ borderRadius: 16 }}>⚠️ {error}</div>}

        {loading ? (
          <PageLoader />
        ) : (
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="content-card" 
                style={{ 
                  textAlign: 'center', padding: '100px 40px', borderRadius: 32,
                  background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' 
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: 20 }}>✈️</div>
                <h2 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 12 }}>No adventures found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                  You haven't booked any trips yet. Start exploring our handpicked packages and create unforgettable memories.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '14px 28px', borderRadius: 16 }}
                  onClick={() => navigate('/packages')}
                >
                  Find a Package <ArrowRight size={20} style={{ marginLeft: 8 }} />
                </motion.button>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {items.map((b, idx) => {
                  const pkg = b.package as any;
                  const status = statusConfig[b.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="content-card"
                      style={{ 
                        padding: 0, borderRadius: 24, overflow: 'hidden',
                        display: 'flex', 
                        flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
                        alignItems: 'stretch', gap: 0,
                        border: '1px solid var(--border)',
                        transition: 'transform 0.3s ease, border-color 0.3s ease'
                      }}
                    >
                      {/* Status Accent Bar */}
                      <div style={{ width: 6, background: status.color }} />
                      
                      {/* Image (Thumbnail) */}
                      <div style={{ 
                        width: window.innerWidth < 1024 ? '100%' : 160, 
                        height: window.innerWidth < 1024 ? 180 : 'auto',
                        background: pkg?.images?.[0]?.url ? `url(${pkg.images[0].url}) center/cover` : 'linear-gradient(135deg,#6366f1,#06b6d4)',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: window.innerWidth < 1024 
                            ? 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)'
                            : 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)'
                        }} />
                      </div>

                      {/* Content */}
                      <div style={{ 
                        flex: 1, 
                        padding: window.innerWidth < 768 ? 20 : 24, 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: window.innerWidth < 768 ? 20 : 32, 
                        alignItems: 'center' 
                      }}>
                        
                        <div style={{ flex: '1 1 200px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Package</div>
                          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{pkg?.title || 'Unknown Package'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
                            <Calendar size={14} /> {new Date(b.travelDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        <div style={{ flex: window.innerWidth < 768 ? '1 1 100px' : '0 0 120px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Travelers</div>
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={16} /> {b.numberOfTravelers} {b.numberOfTravelers === 1 ? 'Person' : 'People'}
                          </div>
                        </div>

                        <div style={{ flex: window.innerWidth < 768 ? '1 1 140px' : '0 0 150px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Paid</div>
                          <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--primary-light)' }}>
                            ₹{Number(b.finalAmount ?? b.totalAmount).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div style={{ flex: window.innerWidth < 768 ? '1 1 140px' : '0 0 140px' }}>
                          <div style={{ 
                            padding: '8px 16px', borderRadius: 16, background: status.bg, color: status.color,
                            display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '0.8rem',
                            textTransform: 'uppercase', letterSpacing: '0.05em', width: 'fit-content'
                          }}>
                            <StatusIcon size={14} /> {b.status}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ 
                          flex: window.innerWidth < 1024 ? '1 1 100%' : '0 0 240px', 
                          display: 'flex', 
                          gap: 10, 
                          justifyContent: window.innerWidth < 1024 ? 'flex-start' : 'flex-end',
                          marginTop: window.innerWidth < 1024 ? 12 : 0
                        }}>
                          {b.status !== 'cancelled' && (
                            <motion.a
                              whileHover={{ scale: 1.05, background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)' }}
                              whileTap={{ scale: 0.95 }}
                              href={`http://localhost:5000/api/bookings/${b._id}/invoice?token=${token}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                flex: 1, padding: '12px 20px', borderRadius: 16,
                                border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff', textDecoration: 'none', textAlign: 'center',
                                fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              <FileText size={18} /> <span>Invoice</span>
                            </motion.a>
                          )}
                          
                          {b.status !== 'cancelled' && b.status !== 'refunded' && (
                            <motion.button
                              whileHover={{ scale: 1.05, background: 'rgba(239, 68, 68, 0.1)' }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancel(b._id)}
                              style={{
                                flex: 1, padding: '10px 16px', borderRadius: 14,
                                border: '1px solid rgba(239, 68, 68, 0.2)', background: 'transparent',
                                color: '#ef4444', cursor: 'pointer',
                                fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                              }}
                            >
                              <XCircle size={16} /> Cancel
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </Sidebar>
  );
}
