import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { getWishlist, removeWishlistItem, type WishlistItem } from '../services/wishlist';
import { MapPin, Clock, Star, Trash2, ArrowRight, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { CardSkeleton } from '../components/Skeletons';

/* ── Stars Component ──────────────────────────────── */
function Stars({ rating }: { rating?: number }) {
  const r = Math.round(rating ?? 0);
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} fill={i <= r ? '#f59e0b' : 'none'} stroke={i <= r ? '#f59e0b' : '#475569'} />
      ))}
      {rating ? <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: 3 }}>{rating.toFixed(1)}</span> : null}
    </div>
  );
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWishlist();
      setItems(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await removeWishlistItem(id);
      setItems(prev => prev.filter(item => item._id !== id));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  return (
    <Sidebar>
      <div className="topbar" style={{ padding: window.innerWidth < 768 ? '16px' : '20px 32px' }}>
        <div>
          <div className="topbar-title" style={{ fontSize: window.innerWidth < 768 ? '1.2rem' : '1.5rem' }}>❤️ My Wishlist</div>
          <div className="topbar-sub" style={{ fontSize: '0.8rem' }}>Your curated collection of dream destinations.</div>
        </div>
      </div>

      <div className="page-body" style={{ padding: window.innerWidth < 768 ? '16px' : '32px' }}>
        {error && <div className="auth-error">⚠️ {error}</div>}

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="content-card" 
                style={{ 
                  textAlign: 'center', 
                  padding: '80px 40px',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 20,
                  border: '1px dashed var(--border)'
                }}
              >
                <div style={{ 
                  width: 80, height: 80, 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: 10
                }}>
                  <Heart size={40} style={{ color: '#ef4444' }} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 8, color: 'var(--text-primary)' }}>No saved packages</h2>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
                    Your wishlist is feeling a bit lonely. Explore our handpicked travel packages and save your favorites here.
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 24px', borderRadius: 14 }} 
                  onClick={() => navigate('/packages')}
                >
                  Explore Packages <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: 24 
                }}
              >
                {items.map((w) => {
                  const p = w.package as any;
                  if (!p) return null;
                  const price = p.discountPrice ?? p.price;
                  const hero = p.images?.[0]?.url;
                  
                  return (
                    <motion.div 
                      key={w._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="pkg-card content-card"
                      style={{ overflow: 'hidden', padding: 0 }}
                    >
                      {/* Image Wrap */}
                      <div className="pkg-img-wrap" style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                        <div 
                          className="pkg-img"
                          style={{
                            width: '100%',
                            height: '100%',
                            background: hero ? `url(${hero}) center/cover` : 'linear-gradient(135deg,#6366f1,#06b6d4)',
                          }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                        }} />
                        <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                           <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                            ₹{Number(price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: 20 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>{p.title}</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
                          <MapPin size={14} style={{ color: 'var(--primary-light)' }} />
                          <span>{p.destination}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                          {p.duration && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <Clock size={14} style={{ color: 'var(--secondary)' }} /> {p.duration} days
                            </span>
                          )}
                          <Stars rating={p.rating} />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary"
                            style={{ flex: 1, marginTop: 0, borderRadius: 12 }}
                            onClick={() => navigate(`/packages/${p._id}`)}
                          >
                            View Details
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: 12,
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              background: 'rgba(239, 68, 68, 0.05)',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => handleRemove(w._id)}
                            title="Remove from wishlist"
                          >
                            <Trash2 size={20} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </Sidebar>
  );
}
