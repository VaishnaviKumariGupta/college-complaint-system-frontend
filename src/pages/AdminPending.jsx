import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function AdminPending() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // stores complaint id being updated

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(' ${import.meta.env.VITE_API_URL}/api/complaints/all', config);
      const list = data.message ? [] : data;
      setPending(list.filter(c => c.status === 'Pending'));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const markInProgress = async (id) => {
    setUpdating(id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(` ${import.meta.env.VITE_API_URL}/api/complaints/${id}`, { status: 'In Progress' }, config);
      await fetchPending();
    } catch (err) { console.error(err); }
    setUpdating(null);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>Pending Complaints</h1>
            <p className="breadcrumb">Home / Pending</p>
          </div>
          <div className="pending-count-badge">
            ⏳ {pending.length} Pending
          </div>
        </div>

        <div className="content-card">
          <div className="card-body">
            {pending.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <h4>All Caught Up!</h4>
                <p>No pending complaints at the moment.</p>
              </div>
            ) : (
              <div className="complaints-list">
                {pending.map((complaint) => (
                  <div key={complaint._id} className="complaint-list-item pending-item">
                    <div className="complaint-list-left">
                      <div className="pending-dot"></div>
                      <div className="complaint-list-info">
                        <h4>{complaint.title}</h4>
                        <p className="complaint-list-meta">
                          <strong>{complaint.student?.name}</strong>
                          <span className="text-muted"> • {complaint.student?.email}</span>
                        </p>
                        <p className="complaint-list-meta">
                          <span className="category-badge">{complaint.category}</span>
                          <span className="text-muted"> • {complaint.department}</span>
                          <span className="text-muted"> • {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </p>
                        <p className="complaint-list-desc">{complaint.description?.substring(0, 150)}...</p>
                      </div>
                    </div>
                    <div className="complaint-list-right" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span className="status-badge badge-pending">Pending</span>
                      <button
                        className="btn-action"
                        onClick={() => markInProgress(complaint._id)}
                        disabled={updating === complaint._id}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {updating === complaint._id ? '...' : '🔄 Start'}
                      </button>
                      <button
                        className="btn-action-secondary"
                        onClick={() => navigate('/admin/complaints')}
                      >
                        ✏️ Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPending;