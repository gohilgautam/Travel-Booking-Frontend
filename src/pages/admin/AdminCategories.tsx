import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/Sidebar';
import { categoryService, type Category } from '../../services/categoryService';
import { toast } from 'react-toastify';

const EMPTY: Partial<Category> = { name: '', slug: '', icon: '🏷️', description: '', active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Category>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setCategories(await categoryService.getAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (c: Category) => { setForm({ ...c }); setEditId(c._id); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Category name is required!');
    if (!form.slug) form.slug = form.name.toLowerCase().replace(/\s+/g, '-');
    setSaving(true);
    try {
      if (editId) {
        const updated = await categoryService.update(editId, form);
        setCategories(prev => prev.map(c => c._id === updated._id ? updated : c));
        toast.success('Category updated successfully!');
      } else {
        const created = await categoryService.create(form);
        setCategories(prev => [...prev, created]);
        toast.success('Category created successfully!');
      }
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error saving category');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Category deleted successfully!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error deleting category');
    }
  };

  return (
    <AdminSidebar>
      {showForm && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700 }}>{editId ? '✏️ Edit Category' : '➕ Add Category'}</h2>
              <button onClick={() => setShowForm(false)} style={closeBtn}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Icon Emoji</label>
              <input className="form-input" style={{ paddingLeft: 14 }} value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" style={{ paddingLeft: 14 }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Slug (auto-generated if blank)</label>
              <input className="form-input" style={{ paddingLeft: 14 }} value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. beach-holidays" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" style={{ paddingLeft: 14, resize: 'vertical', minHeight: 64 }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Active</label>
              <select
                className="form-input"
                value={form.active ? "true" : "false"}
                onChange={(e) =>
                  setForm((p) => ({ ...p, active: e.target.value === "true" }))
                }
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: form.active ? "1px solid #22c55e" : "1px solid #ef4444",
                  background: form.active
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(239,68,68,0.15)",
                  color: form.active ? "#22c55e" : "#ef4444",
                  fontWeight: 600,
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
              >
                <option value="true" style={{ color: "#22c55e" }}>
                  ✅ Active
                </option>
                <option value="false" style={{ color: "#ef4444" }}>
                  ❌ Inactive
                </option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} className="btn-primary" style={{ flex: 2, marginTop: 0 }} disabled={saving}>{saving ? '⏳ Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="topbar">
        <div><div className="topbar-title">🏷️ Categories</div><div className="topbar-sub">Package categories</div></div>
      </div>
      <div className="page-body">
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">All Categories</div>
            <button onClick={openNew} className="btn-primary" style={{ width: 'auto', padding: '9px 18px', marginTop: 0, fontSize: '0.85rem' }}>➕ Add Category</button>
          </div>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
              {categories.map(c => (
                <div key={c._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>{c.icon || '🏷️'}</div>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: c.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: c.active ? '#34d399' : '#f87171' }}>{c.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>{c.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>{c.slug}</div>
                  {c.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>{c.description}</div>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button onClick={() => openEdit(c)} style={{ flex: 1, padding: '7px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>✏️ Edit</button>
                    <button onClick={() => handleDelete(c._id)} style={{ flex: 1, padding: '7px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>🗑 Delete</button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No categories yet</div>}
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modal: React.CSSProperties = { background: '#141428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' };
const closeBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };
