import { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '../../components/Sidebar';
import { reviewService, type Review } from '../../services/reviewService';
import { toast } from 'react-toastify';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // '' | 'true' | 'false'
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (filter !== '') params.approved = filter;
      const result = await reviewService.getAll(params);
      setReviews(result.reviews);
      setTotal(result.total);
    } finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    try {
      const updated = await reviewService.approve(id);
      setReviews(prev => prev.map(r => r._id === updated._id ? updated : r));
      toast.success('Review approved');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    }
  };
  const reject = async (id: string) => {
    try {
      const updated = await reviewService.reject(id);
      setReviews(prev => prev.map(r => r._id === updated._id ? updated : r));
      toast.success('Review rejected');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    }
  };
  const del = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewService.deleteAdmin(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success('Review deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const renderStars = (n: number) => '⭐'.repeat(Math.min(5, Math.max(1, n)));

  return (
    <AdminSidebar>
      <div className="topbar">
        <div><div className="topbar-title">⭐ Reviews</div><div className="topbar-sub">Moderate user reviews</div></div>
      </div>
      <div className="page-body">
        <div className="content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="card-title">All Reviews</div>
              <div className="card-subtitle">{total} reviews</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <select
                className="form-input"
                style={{
                  height: '42px',
                  padding: '0 32px 0 14px',
                  maxWidth: 180,
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  appearance: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '14px',
                  margin: 0
                }}
                value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1); }}
              >
                <option value="" style={{ backgroundColor: '#000000', color: '#ffffff' }}>All Reviews</option>
                <option value="false" style={{ backgroundColor: '#000000', color: '#ffffff' }}>⏳ Pending</option>
                <option value="true" style={{ backgroundColor: '#000000', color: '#ffffff' }}>✅ Approved</option>
              </select>

              {/* View Toggle Slider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '42px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  width: 'calc(50% - 4px)',
                  height: 'calc(100% - 8px)',
                  background: 'var(--primary)',
                  borderRadius: '6px',
                  top: '4px',
                  left: viewMode === 'list' ? '4px' : 'calc(50%)',
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 0
                }} />
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    background: 'transparent',
                    border: 'none',
                    color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    zIndex: 1,
                    transition: 'color 0.3s'
                  }}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    background: 'transparent',
                    border: 'none',
                    color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    zIndex: 1,
                    transition: 'color 0.3s'
                  }}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div> : (
            <>
              {viewMode === 'list' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.user?.name ?? 'Anonymous'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>on {(r.package as { title: string })?.title ?? '—'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.85rem' }}>{renderStars(r.rating)} ({r.rating}/5)</span>
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: r.approved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: r.approved ? '#34d399' : '#fbbf24' }}>
                            {r.approved ? '✅ Approved' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                      {r.title && <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.88rem' }}>"{r.title}"</div>}
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{r.comment}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        {!r.approved && <button onClick={() => approve(r._id)} style={actionBtn('#10b981')}>✅ Approve</button>}
                        {r.approved && <button onClick={() => reject(r._id)} style={actionBtn('#f59e0b')}>⊘ Reject</button>}
                        <button onClick={() => del(r._id)} style={actionBtn('#ef4444')}>🗑 Delete</button>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No reviews found</div>}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 16 }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.user?.name ?? 'Anonymous'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>on {(r.package as { title: string })?.title ?? '—'}</div>
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: r.approved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: r.approved ? '#34d399' : '#fbbf24' }}>
                          {r.approved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: '1.1rem' }}>{renderStars(r.rating)}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 6 }}>({r.rating}/5)</span>
                      </div>

                      <div style={{ flex: 1 }}>
                        {r.title && <div style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.95rem' }}>"{r.title}"</div>}
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{r.comment}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!r.approved && <button onClick={() => approve(r._id)} style={{ ...actionBtn('#10b981'), padding: '4px 8px' }} title="Approve">✅</button>}
                          {r.approved && <button onClick={() => reject(r._id)} style={{ ...actionBtn('#f59e0b'), padding: '4px 8px' }} title="Reject">⊘</button>}
                          <button onClick={() => del(r._id)} style={{ ...actionBtn('#ef4444'), padding: '4px 8px' }} title="Delete">🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No reviews found</div>}
                </div>
              )}
            </>
          )}

          {total > 15 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>← Prev</button>
              <span style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} style={pageBtn}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}

const actionBtn = (color: string): React.CSSProperties => ({ background: color + '22', border: `1px solid ${color}44`, borderRadius: 8, padding: '5px 12px', color, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 });
const pageBtn: React.CSSProperties = { padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' };
