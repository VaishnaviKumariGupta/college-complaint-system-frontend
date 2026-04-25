import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

const API = import.meta.env.VITE_API_URL;

function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [stats,            setStats]            = useState({ total:0, pending:0, inProgress:0, resolved:0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [viewComplaint,    setViewComplaint]    = useState(null); // full view modal

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API}/api/complaints/my`, config);
      const complaints = data.message ? [] : data;

      setStats({
        total:      complaints.length,
        pending:    complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved:   complaints.filter(c => c.status === 'Resolved').length
      });
      setRecentComplaints(complaints.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':     return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Resolved':    return 'badge-resolved';
      default:            return '';
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar role="student" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p className="breadcrumb">Home / Dashboard</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="Refresh" onClick={fetchDashboardData}>🔄</button>
          </div>
        </div>

        <div className="welcome-card">
          <div className="welcome-content">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <p>Here's what's happening with your complaints today.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/student/new-complaint')}>
            ➕ Submit New Complaint
          </button>
        </div>

        <div className="stats-grid">
          {[
            { icon:'📊', label:'Total Complaints', val:stats.total,      cls:'stat-total' },
            { icon:'⏳', label:'Pending',          val:stats.pending,    cls:'stat-pending' },
            { icon:'🔄', label:'In Progress',      val:stats.inProgress, cls:'stat-progress' },
            { icon:'✅', label:'Resolved',         val:stats.resolved,   cls:'stat-resolved' },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-details">
                <p className="stat-label">{s.label}</p>
                <h3 className="stat-value">{s.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Complaints */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Complaints</h3>
            <button className="btn-link" onClick={() => navigate('/student/complaints')}>View All →</button>
          </div>
          <div className="card-body">
            {recentComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No Complaints Yet</h4>
                <p>Click the button above to submit your first complaint.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map(c => (
                      <tr key={c._id}>
                        <td>
                          <strong>{c.title}</strong><br />
                          <small className="text-muted">{c.department}</small>
                        </td>
                        <td><span className="category-badge">{c.category}</span></td>
                        <td>
                          <span className={`status-badge ${getStatusClass(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn-action" onClick={() => setViewComplaint(c)}>
                            👁 View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            {[
              { icon:'➕', title:'New Complaint', desc:'Submit a new complaint',  path:'/student/new-complaint' },
              { icon:'📋', title:'View All',      desc:'See all your complaints', path:'/student/complaints' },
              { icon:'👤', title:'My Profile',    desc:'Update your information', path:'/student/profile' },
            ].map(a => (
              <div key={a.title} className="action-card" onClick={() => navigate(a.path)}>
                <div className="action-icon">{a.icon}</div>
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FULL VIEW MODAL ── */}
      {viewComplaint && (
        <div className="modal-overlay" onClick={() => setViewComplaint(null)}>
          <div className="modal-box modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Complaint Details</h3>
              <button className="modal-close" onClick={() => setViewComplaint(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="view-detail-grid">
                {[
                  ['Category',  viewComplaint.category],
                  ['Department',viewComplaint.department],
                  ['Submitted', new Date(viewComplaint.createdAt).toLocaleString()],
                ].map(([label, val]) => (
                  <div className="view-detail-row" key={label}>
                    <span className="view-detail-label">{label}</span>
                    <span className="view-detail-value">{val}</span>
                  </div>
                ))}
                <div className="view-detail-row">
                  <span className="view-detail-label">Status</span>
                  <span className="view-detail-value">
                    <span className={`status-badge ${getStatusClass(viewComplaint.status)}`}>
                      {viewComplaint.status}
                    </span>
                  </span>
                </div>
              </div>

              <div className="view-description-box">
                <p className="view-description-label">Title</p>
                <p style={{fontWeight:700, fontSize:'15px', color:'#1a1a2e', marginBottom:'12px'}}>
                  {viewComplaint.title}
                </p>
                <p className="view-description-label">Full Description</p>
                <p className="view-description-text">{viewComplaint.description}</p>
              </div>

              {viewComplaint.adminRemarks && (
                <div className="admin-remark" style={{marginTop:'14px'}}>
                  <strong>💬 Admin Remarks:</strong> {viewComplaint.adminRemarks}
                </div>
              )}

              {viewComplaint.uri && (
                <div style={{marginTop:'16px'}}>
                  <p style={{fontSize:'13px', fontWeight:600, marginBottom:'8px', color:'#555'}}>
                    📷 Attached Photo
                  </p>
                  <img src={viewComplaint.uri} alt="Complaint"
                    style={{width:'100%', maxHeight:'250px', objectFit:'cover', borderRadius:'10px'}} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-outline" onClick={() => setViewComplaint(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;