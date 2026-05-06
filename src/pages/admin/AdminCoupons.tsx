import { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/Sidebar';
import { couponService, type Coupon } from '../../services/couponService';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY: Partial<Coupon> = { 
  code: '', 
  discountValue: 0, 
  discountType: 'percentage', 
  active: true, 
  usageLimit: 100,
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  applicablePackages: [],
  applicableCategories: []
};

export default function AdminCoupons() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Coupon>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { 
      const [couponsRes, pkgsRes, catsRes] = await Promise.all([
        couponService.getAll(),
        api.get('/packages'),
        api.get('/categories')
      ]);
      setItems(couponsRes);
      setPackages(pkgsRes.data?.data || []);
      setCategories(catsRes.data?.data || []);
    }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (c: Coupon) => { 
    setForm({ 
      ...c,
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 10) : EMPTY.expiryDate,
      applicablePackages: c.applicablePackages || [],
      applicableCategories: c.applicableCategories || []
    }); 
    setEditId(c._id); setShowForm(true); 
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.expiryDate) return toast.error('Code, Discount, and Expiry are required!');
    setSaving(true);
    try {
      if (editId) {
        const updated = await couponService.update(editId, form);
        setItems(prev => prev.map(c => c._id === updated._id ? updated : c));
        toast.success('Coupon updated successfully!');
      } else {
        const created = await couponService.create(form);
        setItems(prev => [...prev, created]);
        toast.success('Coupon created successfully!');
      }
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error saving coupon');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await couponService.delete(id);
      setItems(prev => prev.filter(c => c._id !== id));
      toast.success('Coupon deleted successfully!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error deleting coupon');
    }
  };

  const togglePackage = (id: string) => {
    const pkgs = form.applicablePackages || [];
    setForm(p => ({ ...p, applicablePackages: pkgs.includes(id) ? pkgs.filter(x => x !== id) : [...pkgs, id] }));
  };

  const toggleCategory = (slug: string) => {
    const cats = form.applicableCategories || [];
    setForm(p => ({ ...p, applicableCategories: cats.includes(slug) ? cats.filter(x => x !== slug) : [...cats, slug] }));
  };

  return (
    <AdminSidebar>
      {showForm && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700 }}>{editId ? '✏️ Edit Coupon' : '➕ Add Coupon'}</h2>
              <button onClick={() => setShowForm(false)} style={closeBtn}>✕</button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Coupon Code *</label>
              <input className="form-input" style={{ textTransform: 'uppercase' }} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SUMMER24" />
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Discount Type</label>
                <select className="form-input" style={selectStyle} value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as 'percentage' | 'fixed' }))}>
                  <option value="percentage" style={{ backgroundColor: '#000000' }}>Percentage (%)</option>
                  <option value="fixed" style={{ backgroundColor: '#000000' }}>Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Discount Value *</label>
                <input className="form-input" type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: Number(e.target.value) }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Usage Limit</label>
                <input className="form-input" type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: Number(e.target.value) }))} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Expiry Date *</label>
                <input className="form-input" type="date" value={form.expiryDate as string} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Specific Packages (Leave empty for all)</label>
              <div style={{ maxHeight: 120, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 10, padding: 8 }}>
                {packages.map(p => (
                  <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 4, cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={(form.applicablePackages || []).includes(p._id)} onChange={() => togglePackage(p._id)} />
                    {p.title}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Specific Categories (Leave empty for all)</label>
              <div style={{ maxHeight: 120, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 10, padding: 8 }}>
                {categories.map(c => (
                  <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 4, cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={(form.applicableCategories || []).includes(c.slug)} onChange={() => toggleCategory(c.slug)} />
                    {c.icon} {c.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Status</label>
              <select className="form-input" style={selectStyle} value={form.active ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, active: e.target.value === 'true' }))}>
                <option value="true" style={{ backgroundColor: '#000000' }}>✅ Active</option>
                <option value="false" style={{ backgroundColor: '#000000' }}>❌ Inactive</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} className="btn-primary" style={{ flex: 2, marginTop: 0 }} disabled={saving}>{saving ? '⏳ Saving...' : 'Save Coupon'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="topbar">
        <div>
          <div className="topbar-title">🎟️ Coupons</div>
          <div className="topbar-sub">Manage platform-wide or package-specific discounts</div>
        </div>
      </div>
      
      <div className="page-body">
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">All Coupons</div>
            <button onClick={openNew} className="btn-primary" style={{ width: 'auto', padding: '9px 18px', marginTop: 0, fontSize: '0.85rem' }}>➕ Add Coupon</button>
          </div>
          
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
              {items.map(c => (
                <div key={c._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-light)' }}>{c.code}</div>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: c.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: c.active ? '#34d399' : '#f87171' }}>{c.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Discount:</span>
                      <span style={{ fontWeight: 600 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Usage:</span>
                      <span style={{ fontWeight: 600 }}>{c.usedCount} / {c.usageLimit ?? '∞'}</span>
                    </div>
                    {c.applicablePackages && c.applicablePackages.length > 0 && (
                      <div style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginTop: 4 }}>
                        🎯 Applied to {c.applicablePackages.length} package(s)
                      </div>
                    )}
                    {c.applicableCategories && c.applicableCategories.length > 0 && (
                      <div style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
                        🏷️ Applied to {c.applicableCategories.length} category(s)
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={() => openEdit(c)} style={{ flex: 1, padding: '7px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>✏️ Edit</button>
                    <button onClick={() => handleDelete(c._id)} style={{ flex: 1, padding: '7px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>🗑 Delete</button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No coupons found</div>}
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modal: React.CSSProperties = { background: 'rgba(20, 20, 40, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' };
const closeBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const selectStyle: React.CSSProperties = {
  padding: '10px 32px 10px 14px',
  color: '#ffffff',
  appearance: 'none',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 500,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '14px'
};
