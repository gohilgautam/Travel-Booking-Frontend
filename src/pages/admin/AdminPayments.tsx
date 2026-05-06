import { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '../../components/Sidebar';
import { paymentService, type Payment } from '../../services/paymentService';

const statusStyle = (s: string): React.CSSProperties => {
  const map: Record<string, [string, string]> = {
    paid:     ['rgba(16,185,129,0.15)', '#34d399'],
    created:  ['rgba(245,158,11,0.15)', '#fbbf24'],
    failed:   ['rgba(239,68,68,0.15)', '#f87171'],
    refunded: ['rgba(139,92,246,0.15)', '#a78bfa'],
  };
  const [bg, color] = map[s] ?? ['rgba(255,255,255,0.06)', '#fff'];
  return { padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: bg, color };
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await paymentService.getAll({ page, limit: 15 });
      setPayments(result.payments);
      setTotal(result.total);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleRefund = async (id: string) => {
    if (!confirm('Issue refund for this payment?')) return;
    setRefundingId(id);
    try {
      await paymentService.refund(id);
      setPayments(prev => prev.map(p => p._id === id ? { ...p, status: 'refunded' } : p));
    } finally { setRefundingId(null); }
  };

  return (
    <AdminSidebar>
      <div className="topbar">
        <div><div className="topbar-title">💳 Payments</div><div className="topbar-sub">Payment history and refunds</div></div>
      </div>
      <div className="page-body">
        <div className="content-card">
          <div className="card-header">
            <div>
              <div className="card-title">Payment History</div>
              <div className="card-subtitle">{total} transactions</div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>User</th><th>Package</th><th>Razorpay ID</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.user?.name ?? '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.user?.email}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{p.package?.title ?? '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--primary-light)' }}>{p.razorpayPaymentId ?? p.razorpayOrderId ?? '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{(p.amount / 100).toLocaleString('en-IN')}</td>
                      <td><span style={statusStyle(p.status)}>{p.status}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        {p.status === 'paid' && (
                          <button
                            onClick={() => handleRefund(p._id)}
                            disabled={refundingId === p._id}
                            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '4px 10px', color: '#a78bfa', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            {refundingId === p._id ? '⏳' : '↩ Refund'}
                          </button>
                        )}
                        {p.status === 'refunded' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>✓ Refunded</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No payments found</div>}
            </div>
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

const pageBtn: React.CSSProperties = { padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' };
