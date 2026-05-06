import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/packages', { replace: true });
  }, [navigate]);

  return (
    <Sidebar>
      <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="btn-spinner" style={{ marginBottom: 16 }} />
          <div>Redirecting to dashboard...</div>
        </div>
      </div>
    </Sidebar>
  );
}
