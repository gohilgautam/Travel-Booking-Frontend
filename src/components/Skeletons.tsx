

export const CardSkeleton = () => (
  <div className="pkg-card content-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
    <div style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 24, width: '70%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div className="skeleton" style={{ height: 16, width: 60 }} />
        <div className="skeleton" style={{ height: 16, width: 80 }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="skeleton" style={{ height: 40, flex: 1, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 40, flex: 1.4, borderRadius: 12 }} />
      </div>
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="pkg-list-row" style={{ display: 'flex', marginBottom: 12, borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-card)', height: 140, overflow: 'hidden' }}>
    <div className="skeleton" style={{ width: 180, height: '100%', borderRadius: 0 }} />
    <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="skeleton" style={{ height: 22, width: '50%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '80%' }} />
    </div>
    <div style={{ width: 180, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', borderLeft: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ height: 24, width: 80, marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="skeleton" style={{ height: 36, width: 36, borderRadius: '50%' }} />
        <div className="skeleton" style={{ height: 36, width: 80, borderRadius: 12 }} />
      </div>
    </div>
  </div>
);
