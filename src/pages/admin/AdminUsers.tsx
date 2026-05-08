import { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '../../components/Sidebar';
import { userService, type User } from '../../services/userService';
import type { Booking } from '../../services/bookingService';
import { PageLoader } from '../../components/Loader';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<{ user: User; bookings: Booking[] } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (search) params.search = search;
      const result = await userService.getAll(params);
      setUsers(result.users);
      setTotal(result.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const viewUser = async (id: string) => {
    setModalLoading(true);
    try {
      const data = await userService.getById(id);
      setSelectedUser(data as { user: User; bookings: Booking[] });
    } finally { setModalLoading(false); }
  };

  const toggleBlock = async (user: User) => {
    const updated = user.isBlocked ? await userService.unblock(user._id) : await userService.block(user._id);
    setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their bookings?')) return;
    await userService.delete(id);
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  return (
    <AdminSidebar>
      {selectedUser && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700 }}>👤 User Details</h2>
              <button onClick={() => setSelectedUser(null)} style={closeBtn}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700 }}>
                {selectedUser.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{selectedUser.user.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedUser.user.email}</div>
                {selectedUser.user.phone && <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>📞 {selectedUser.user.phone}</div>}
              </div>
              <span style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: selectedUser.user.isBlocked ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: selectedUser.user.isBlocked ? '#f87171' : '#34d399' }}>
                {selectedUser.user.isBlocked ? '🔒 Blocked' : '✅ Active'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>BOOKING HISTORY</div>
            {(selectedUser.bookings as Booking[]).length === 0
              ? <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No bookings yet</div>
              : (selectedUser.bookings as Booking[]).slice(0, 8).map((b) => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span>{(b.package as { title: string })?.title ?? '—'}</span>
                  <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>₹{b.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      <div className="topbar">
        <div><div className="topbar-title">👥 Users</div><div className="topbar-sub">Manage all platform users</div></div>
      </div>

      <div className="page-body">
        <div className="content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="card-title">All Users</div>
              <div className="card-subtitle">{total} total users</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                className="form-input"
                style={{ 
                  height: '42px', 
                  paddingLeft: 14, 
                  maxWidth: 260, 
                  margin: 0,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  background: '#000000',
                  color: '#ffffff'
                }}
                placeholder="🔍 Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
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

          {loading ? (
            <PageLoader />
          ) : (
            <>
              {viewMode === 'list' ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>User</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                          </td>
                          <td>
                            <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: u.role === 'admin' || u.role === 'superadmin' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)', color: u.role === 'admin' || u.role === 'superadmin' ? '#818cf8' : '#22d3ee' }}>{u.role}</span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                          <td>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: u.isBlocked ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: u.isBlocked ? '#f87171' : '#34d399' }}>
                              {u.isBlocked ? '🔒 Blocked' : '✅ Active'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button onClick={() => viewUser(u._id)} style={actionBtn('#6366f1')} disabled={modalLoading}>👁 View</button>
                              <button onClick={() => toggleBlock(u)} style={actionBtn(u.isBlocked ? '#10b981' : '#f59e0b')}>
                                {u.isBlocked ? '✓ Unblock' : '⊘ Block'}
                              </button>
                              <button onClick={() => deleteUser(u._id)} style={actionBtn('#ef4444')}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No users found</div>}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
                  {users.map(u => (
                    <div key={u._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{u.name}</div>
                            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600, background: u.role === 'admin' || u.role === 'superadmin' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)', color: u.role === 'admin' || u.role === 'superadmin' ? '#818cf8' : '#22d3ee' }}>{u.role}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>✉️ {u.email}</div>
                      {u.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>📞 {u.phone}</div>}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>📅 Joined: {new Date(u.createdAt).toLocaleDateString('en-IN')}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: u.isBlocked ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: u.isBlocked ? '#f87171' : '#34d399' }}>
                          {u.isBlocked ? '🔒 Blocked' : '✅ Active'}
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => viewUser(u._id)} style={{...actionBtn('#6366f1'), width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}} disabled={modalLoading} title="View Details">👁</button>
                          <button onClick={() => toggleBlock(u)} style={{...actionBtn(u.isBlocked ? '#10b981' : '#f59e0b'), width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}} title={u.isBlocked ? 'Unblock' : 'Block'}>
                            {u.isBlocked ? '✓' : '⊘'}
                          </button>
                          <button onClick={() => deleteUser(u._id)} style={{...actionBtn('#ef4444'), width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}} title="Delete">🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No users found</div>}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {total > 15 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>← Prev</button>
              <span style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Page {page} of {Math.ceil(total / 15)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} style={pageBtn}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modal: React.CSSProperties = { background: '#141428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 40px 80px rgba(0,0,0,0.6)' };
const closeBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const pageBtn: React.CSSProperties = { padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' };
const actionBtn = (color: string): React.CSSProperties => ({ background: color + '22', border: `1px solid ${color}44`, borderRadius: 8, padding: '4px 9px', color, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' });
