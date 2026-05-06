import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { fetchPackages, type TravelPackage } from '../services/packages';
import { addToWishlist } from '../services/wishlist';
import { LayoutGrid, List, MapPin, Clock, Star, Heart, ArrowRight, Tag, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { CardSkeleton, ListSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';

type ViewMode = 'grid' | 'list';

/* ── Wishlist heart with animation ──────────────── */
function WishlistBtn({ id }: { id: string }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await addToWishlist(id);
      setLiked(true);
      toast.success('Added to wishlist!');
    } catch {
      toast.error('Could not add to wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handle}
      whileTap={{ scale: 0.8 }}
      title="Add to wishlist"
      style={{
        width: 40, height: 40, borderRadius: '50%',
        border: liked ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border)',
        background: liked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
        color: liked ? '#ef4444' : 'var(--text-secondary)',
        cursor: 'pointer', fontSize: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s ease', flexShrink: 0,
      }}
    >
      <Heart size={16} fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'currentColor'} />
    </motion.button>
  );
}

/* ── Stars ──────────────────────────────────────── */
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

/* ── GRID CARD ──────────────────────────────────── */
function GridCard({ p, onNavigate }: { p: TravelPackage; onNavigate: (id: string) => void }) {
  const price = p.discountPrice ?? p.price;
  const hero = p.images?.[0]?.url;
  const hasDiscount = p.discountPrice && p.discountPrice < p.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      onClick={() => onNavigate(p._id)}
    >
      {/* Hero image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{
          width: '100%', height: '100%',
          background: hero ? `url(${hero}) center/cover no-repeat` : 'linear-gradient(135deg,#6366f1,#06b6d4)',
          transition: 'transform 0.5s ease',
        }} className="pkg-img" />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(5,5,10,0.7) 0%, transparent 55%)',
        }} />
        {/* Top row badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {p.category && (
            <span style={{
              background: 'rgba(99,102,241,0.85)', color: '#fff',
              padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 4,
              textTransform: 'capitalize',
            }}>
              <Tag size={10} /> {p.category}
            </span>
          )}
          <div onClick={e => e.stopPropagation()}>
            <WishlistBtn id={p._id} />
          </div>
        </div>
        {/* Price badge on image bottom */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            ₹{Number(price).toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through', marginTop: 2 }}>
              ₹{Number(p.price).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
          {p.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 4 }}>
          <MapPin size={13} style={{ color: '#6366f1', flexShrink: 0 }} />
          <span>{p.destination}{p.location ? ` · ${p.location}` : ''}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          {p.duration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Clock size={12} style={{ color: '#06b6d4' }} /> {p.duration} days
            </span>
          )}
          <Stars rating={p.rating} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={e => { e.stopPropagation(); onNavigate(p._id); }}
            style={{
              flex: 1, padding: '10px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.88rem',
              transition: 'background 0.2s',
            }}
          >
            Details
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={e => { e.stopPropagation(); onNavigate(p._id); }}
            style={{
              flex: 1.4, padding: '10px', borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.88rem',
              boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            Book <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── LIST ROW ──────────────────────────────────── */
function ListRow({ p, onNavigate }: { p: TravelPackage; onNavigate: (id: string) => void }) {
  const price = p.discountPrice ?? p.price;
  const hero = p.images?.[0]?.url;
  const hasDiscount = p.discountPrice && p.discountPrice < p.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex', 
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        alignItems: 'stretch',
        marginBottom: 12,
        transition: 'border-color 0.3s ease',
      }}
      onClick={() => onNavigate(p._id)}
    >
      {/* Thumbnail */}
      <div style={{
        width: window.innerWidth < 768 ? '100%' : 180, 
        height: window.innerWidth < 768 ? 160 : 'auto',
        flexShrink: 0,
        background: hero ? `url(${hero}) center/cover no-repeat` : 'linear-gradient(135deg,#6366f1,#06b6d4)',
        position: 'relative',
      }}>
        {p.category && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(99,102,241,0.85)', color: '#fff',
            padding: '3px 9px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700,
            backdropFilter: 'blur(8px)', textTransform: 'capitalize',
          }}>
            {p.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.title}</div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            <MapPin size={13} style={{ color: '#6366f1' }} />
            {p.destination}{p.location ? ` · ${p.location}` : ''}
          </span>
          {p.duration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
              <Clock size={12} style={{ color: '#06b6d4' }} /> {p.duration} days
            </span>
          )}
          <Stars rating={p.rating} />
        </div>

        {p.description && (
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {p.description}
          </p>
        )}
      </div>

      {/* Right: price + actions */}
      <div style={{
        flexShrink: 0, padding: '18px 20px',
        display: 'flex', 
        flexDirection: window.innerWidth < 768 ? 'row' : 'column', 
        alignItems: window.innerWidth < 768 ? 'center' : 'flex-end', 
        justifyContent: window.innerWidth < 768 ? 'space-between' : 'center', 
        gap: 10,
        borderLeft: window.innerWidth < 768 ? 'none' : '1px solid var(--border)',
        borderTop: window.innerWidth < 768 ? '1px solid var(--border)' : 'none',
        minWidth: window.innerWidth < 768 ? '100%' : 180,
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary-light)' }}>
            ₹{Number(price).toLocaleString('en-IN')}
          </div>
          {hasDiscount && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
              ₹{Number(p.price).toLocaleString('en-IN')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div onClick={e => e.stopPropagation()}>
            <WishlistBtn id={p._id} />
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={e => { e.stopPropagation(); onNavigate(p._id); }}
            style={{
              padding: '9px 18px', borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.88rem',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            Book <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── MAIN PAGE ──────────────────────────────────── */
export default function PackagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem('pkg_view') as ViewMode) || 'grid'
  );

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'price_asc' | 'price_desc' | 'rating_desc'>('price_asc');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true); setError('');
      try {
        const data = await fetchPackages({
          search: search || undefined,
          category: category || undefined,
          sort,
          minPrice: minPrice === '' ? undefined : minPrice,
          maxPrice: maxPrice === '' ? undefined : maxPrice,
        });
        if (!cancelled) setItems(data || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load packages.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [search, category, sort, minPrice, maxPrice]);

  const visible = useMemo(() => items.filter(p => p.active !== false), [items]);

  const setView = (v: ViewMode) => {
    setViewMode(v);
    localStorage.setItem('pkg_view', v);
  };

  const selectStyle: React.CSSProperties = {
    padding: '10px 32px 10px 14px',
    backgroundColor: '#1e1b4b',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    appearance: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    width: '100%',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '14px',
    outline: 'none',
  };

  return (
    <Sidebar>
      {/* Topbar */}
      <div className="topbar" style={{ 
        background: 'var(--topbar-bg, rgba(15,15,26,0.8))', 
        padding: window.innerWidth < 768 ? '12px 16px' : '16px 32px',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
        gap: 16
      }}>
        <div>
          <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: window.innerWidth < 768 ? '1.2rem' : '1.5rem' }}>👋</span>
            <div>
              <div style={{ fontSize: window.innerWidth < 768 ? '1.1rem' : '1.3rem', fontWeight: 800 }}>Hello, {user?.name?.split(' ')[0] || 'Traveler'}!</div>
              <div className="topbar-sub" style={{ margin: 0, fontSize: '0.75rem' }}>Where do you want to go next?</div>
            </div>
          </div>
        </div>
        {/* View toggle */}
        <div style={{
          display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)', borderRadius: 12, padding: 4,
          alignSelf: window.innerWidth < 768 ? 'flex-end' : 'auto'
        }}>
          {(['grid', 'list'] as ViewMode[]).map(v => (
            <motion.button
              key={v}
              onClick={() => setView(v)}
              whileTap={{ scale: 0.93 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.82rem',
                background: viewMode === v ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'transparent',
                color: viewMode === v ? '#fff' : 'var(--text-secondary)',
                boxShadow: viewMode === v ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {v === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
              {v === 'grid' ? 'Grid' : 'List'}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="page-body" style={{ padding: window.innerWidth < 768 ? '16px' : '32px' }}>
        {/* Filters */}
        <div className="content-card" style={{ marginBottom: 24, padding: window.innerWidth < 768 ? '16px' : '24px', borderRadius: 24 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Search */}
            <div className="form-group" style={{ marginBottom: 0, flex: '2 1 300px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Search size={14} /> Search Destinations
              </label>
              <div className="form-input-wrap">
                <input
                  className="form-input"
                  style={{ borderRadius: 14, paddingLeft: 16 }}
                  placeholder="E.g. Bali, Maldives, Paris..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filters Group */}
            <div style={{ display: 'flex', gap: 12, flex: '3 1 600px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 150 }}>
                <label className="form-label">Category</label>
                <select style={{ ...selectStyle, borderRadius: 14 }} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="adventure">Adventure</option>
                  <option value="beach">Beach</option>
                  <option value="mountains">Mountains</option>
                  <option value="heritage">Heritage</option>
                  <option value="city">City</option>
                  <option value="wildlife">Wildlife</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 150 }}>
                <label className="form-label">Sort By</label>
                <select style={{ ...selectStyle, borderRadius: 14 }} value={sort} onChange={e => setSort(e.target.value as any)}>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Best Rated First</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200, display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Min ₹</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Min"
                    style={{ padding: '10px 14px', borderRadius: 14 }}
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Max ₹</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Max"
                    style={{ padding: '10px 14px', borderRadius: 14 }}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results count & View switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          {!loading && !error && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
              Showing {visible.length} dream destinations
            </div>
          )}
          {loading && <div className="skeleton" style={{ width: 150, height: 20 }} />}
        </div>

        {error && <div className="auth-error" style={{ borderRadius: 16 }}>⚠️ {error}</div>}

        {/* Loading Skeletons */}
        {loading && (
          <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 } : {}}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              viewMode === 'grid' ? <CardSkeleton key={i} /> : <ListSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏝️</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No packages found</div>
            <div style={{ fontSize: '0.9rem', marginTop: 4 }}>Try adjusting your filters</div>
          </div>
        )}

        {/* Grid view */}
        {!loading && !error && visible.length > 0 && viewMode === 'grid' && (
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            <AnimatePresence>
              {visible.map(p => (
                <GridCard key={p._id} p={p} onNavigate={id => navigate(`/packages/${id}`)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* List view */}
        {!loading && !error && visible.length > 0 && viewMode === 'list' && (
          <motion.div layout>
            <AnimatePresence>
              {visible.map(p => (
                <ListRow key={p._id} p={p} onNavigate={id => navigate(`/packages/${id}`)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <style>{`
        .pkg-img { transition: transform 0.5s ease; }
        *:hover > .pkg-img { transform: scale(1.06); }
      `}</style>
    </Sidebar>
  );
}
