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
          <div className="card-header">
            <div>
              <div className="card-title">All Users</div>
              <div className="card-subtitle">{total} total users</div>
            </div>
            <input
              className="form-input"
              style={{ paddingLeft: 14, maxWidth: 260 }}
              placeholder="🔍 Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {loading ? (
            <PageLoader />
          ) : (
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
