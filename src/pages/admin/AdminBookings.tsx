import { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '../../components/Sidebar';
import { bookingService, type Booking } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { showConfirmAlert } from '../../utils/sweetalert';

const STATUSES = ['pending', 'confirmed', 'cancelled', 'refunded', 'completed'];

const statusStyle = (s: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    completed: { bg: 'rgba(6,182,212,0.15)', color: '#22d3ee' },
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    refunded: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  };
  return { padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, ...(map[s] ?? { bg: 'rgba(255,255,255,0.06)', color: '#fff' }) };
};

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const result = await bookingService.getAll(params);
      setBookings(result.bookings);
      setTotal(result.total);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    if (status === 'cancelled') {
      const result = await showConfirmAlert(
        'Cancel Booking?',
        'Are you sure you want to cancel this booking? This will notify the user and may trigger a refund process.',
        'Yes, Cancel It'
      );
      if (!result.isConfirmed) return;
    }

    setUpdatingId(id);
    try {
      const updated = await bookingService.updateStatus(id, status);
      setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
      toast.success(`Status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminSidebar>
      <div className="topbar">
        <div><div className="topbar-title">📋 Bookings</div><div className="topbar-sub">Manage all travel bookings</div></div>
      </div>
      <div className="page-body">
        <div className="content-card">
          <div className="card-header">
            <div>
              <div className="card-title">All Bookings</div>
              <div className="card-subtitle">{total} total bookings</div>
            </div>
            <div style={{ position: 'relative', maxWidth: 180 }}>
              <select
                className="form-input"
                style={{
                  width: '100%',
                  padding: '10px 32px 10px 14px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '1px solid #4f46e5',
                  borderRadius: '12px',
                  appearance: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '14px'
                }}
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                  All Statuses
                </option>
                {STATUSES.map(s => (
                  <option
                    key={s}
                    value={s}
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  >
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>User</th><th>Package</th><th>Travel Date</th><th>Travellers</th><th>Amount</th><th>Status</th><th>Invoice</th><th>Change Status</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{b.user?.name ?? '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.user?.email}</div>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {(b.package as { title: string })?.title ?? '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(b.travelDate).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'center' }}>👤 {b.numberOfTravelers}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{b.totalAmount.toLocaleString('en-IN')}</td>
                      <td><span style={statusStyle(b.status)}>{b.status}</span></td>
                      <td>
                        {b.status !== 'cancelled' && b.status !== 'pending' ? (
                          <a
                            href={bookingService.getInvoiceUrl(b._id, token)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: 'rgba(99,102,241,0.12)',
                              border: '1px solid rgba(99,102,241,0.25)',
                              borderRadius: 10,
                              padding: '6px 12px',
                              color: '#818cf8',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.2s ease',
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            Invoice
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={b.status}
                          onChange={e => changeStatus(b._id, e.target.value)}
                          disabled={updatingId === b._id}
                          style={{
                            background: '#1a1d23',
                            border: '1px solid #334155',
                            borderRadius: 8,
                            padding: '4px 24px 4px 8px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 8px center',
                            backgroundSize: '12px'
                          }}
                        >
                          {STATUSES.map(s => (
                            <option
                              key={s}
                              value={s}
                              style={{ background: '#1a1d23', color: '#ffffff' }}
                            >
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No bookings found</div>}
            </div>
          )}

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

const pageBtn: React.CSSProperties = { padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' };
