import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

const API = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [stats, setStats] = useState({ total:0, pending:0, inProgress:0, resolved:0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading,          setLoading]          = useState(true);

  // ── refresh feedback ──────────────────────────────────
  const [refreshing,    setRefreshing]    = useState(false);
  const [refreshMsg,    setRefreshMsg]    = useState('');

  // ── notifications ─────────────────────────────────────
  const [showNotif,     setShowNotif]     = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ── full view modal ───────────────────────────────────
  const [viewComplaint, setViewComplaint] = useState(null);

  // ── delete confirm ────────────────────────────────────
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  // ── close notification dropdown on outside click ──────
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.notif-wrapper')) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API}/api/complaints/all`, config);
      const complaints = data.message ? [] : data;

      setStats({
        total:      complaints.length,
        pending:    complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved:   complaints.filter(c => c.status === 'Resolved').length
      });
      setRecentComplaints(complaints.slice(0, 5));

      // Build notifications from pending complaints
      const pendingOnes = complaints.filter(c => c.status === 'Pending');
      setNotifications(pendingOnes.slice(0, 10).map(c => ({
        id:      c._id,
        text:    `New complaint: "${c.title}"`,
        student: c.student?.name || 'Unknown',
        time:    new Date(c.createdAt).toLocaleDateString(),
        unread:  true
      })));

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // ── REFRESH BUTTON ────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg('');
    await fetchDashboardData();
    setRefreshing(false);
    setRefreshMsg('Dashboard refreshed!');
    setTimeout(() => setRefreshMsg(''), 2500);
  };

  // ── DELETE ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API}/api/complaints/${deleteTarget._id}`, config);
      setDeleteTarget(null);
      setViewComplaint(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
    setDeleting(false);
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

  const pendingPct  = stats.total > 0 ? ((stats.pending    / stats.total)*100).toFixed(1) : 0;
  const progressPct = stats.total > 0 ? ((stats.inProgress / stats.total)*100).toFixed(1) : 0;
  const resolvedPct = stats.total > 0 ? ((stats.resolved   / stats.total)*100).toFixed(1) : 0;

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">

        {/* ── HEADER ── */}
        <div className="content-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="breadcrumb">Home / Dashboard</p>
          </div>
          <div className="header-actions">

            {/* Refresh button */}
            <div style={{ position:'relative' }}>
              <button
                className="btn-icon"
                title="Refresh dashboard"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ opacity: refreshing ? 0.6 : 1 }}
              >
                <span style={{
                  display:'inline-block',
                  animation: refreshing ? 'spin 0.8s linear infinite' : 'none'
                }}>🔄</span>
              </button>
              {refreshMsg && (
                <div className="refresh-toast">{refreshMsg}</div>
              )}
            </div>

            {/* Notification bell */}
            <div className="notif-wrapper" style={{ position:'relative' }}>
              <button
                className="btn-icon"
                title="Notifications"
                onClick={() => setShowNotif(prev => !prev)}
              >
                🔔
                {notifications.length > 0 && (
                  <span className="notif-badge">{notifications.length}</span>
                )}
              </button>

              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <strong>Pending Complaints</strong>
                    <span className="notif-count">{notifications.length}</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notif-empty">🎉 No pending complaints!</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="notif-item"
                        onClick={() => { navigate('/admin/complaints'); setShowNotif(false); }}>
                        <div className="notif-dot"></div>
                        <div className="notif-text">
                          <p>{n.text}</p>
                          <small>{n.student} • {n.time}</small>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="notif-footer"
                    onClick={() => { navigate('/admin/pending'); setShowNotif(false); }}>
                    View all pending →
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refresh toast */}
        {refreshMsg && <div className="alert alert-success" style={{marginBottom:'16px'}}>{refreshMsg}</div>}

        {/* Welcome */}
        <div className="welcome-card admin-welcome">
          <div className="welcome-content">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <p>Manage and resolve student complaints efficiently.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/admin/complaints')}>
            📋 View All Complaints
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">📊</div>
            <div className="stat-details">
              <p className="stat-label">Total Complaints</p>
              <h3 className="stat-value">{stats.total}</h3>
              <p className="stat-trend">All time</p>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-details">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{stats.pending}</h3>
              <p className="stat-trend">{pendingPct}% of total</p>
            </div>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-icon">🔄</div>
            <div className="stat-details">
              <p className="stat-label">In Progress</p>
              <h3 className="stat-value">{stats.inProgress}</h3>
              <p className="stat-trend">{progressPct}% of total</p>
            </div>
          </div>
          <div className="stat-card stat-resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-details">
              <p className="stat-label">Resolved</p>
              <h3 className="stat-value">{stats.resolved}</h3>
              <p className="stat-trend">{resolvedPct}% of total</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <div className="content-card">
            <div className="card-header"><h3>Status Distribution</h3></div>
            <div className="card-body" style={{padding:'30px'}}>
              <div className="chart-bars">
                {[
                  { label:'Pending',     val:stats.pending,    pct:pendingPct,  cls:'bar-pending' },
                  { label:'In Progress', val:stats.inProgress, pct:progressPct, cls:'bar-progress' },
                  { label:'Resolved',    val:stats.resolved,   pct:resolvedPct, cls:'bar-resolved' },
                ].map(b => (
                  <div className="chart-bar-item" key={b.label}>
                    <div className="chart-bar-label">
                      <span>{b.label}</span>
                      <span className="chart-bar-value">{b.val}</span>
                    </div>
                    <div className="chart-bar-track">
                      <div className={`chart-bar-fill ${b.cls}`} style={{width:`${b.pct}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header"><h3>Quick Actions</h3></div>
            <div className="card-body" style={{padding:'20px'}}>
              <div className="admin-quick-actions">
                {[
                  { icon:'⏳', label:'View Pending',   badge:stats.pending, path:'/admin/pending' },
                  { icon:'📋', label:'All Complaints', badge:stats.total,   path:'/admin/complaints' },
                  { icon:'👥', label:'Students',       badge:null,          path:'/admin/students' },
                  { icon:'📈', label:'Analytics',      badge:null,          path:'/admin/analytics' },
                ].map(a => (
                  <button key={a.label} className="quick-action-btn" onClick={() => navigate(a.path)}>
                    <span className="quick-action-icon">{a.icon}</span>
                    <span>{a.label}</span>
                    {a.badge !== null && <span className="quick-action-badge">{a.badge}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Complaints</h3>
            <button className="btn-link" onClick={() => navigate('/admin/complaints')}>View All →</button>
          </div>
          <div className="card-body">
            {recentComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No Complaints Yet</h4>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student</th><th>Title</th><th>Category</th>
                      <th>Status</th><th>Date</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map(c => (
                      <tr key={c._id}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar-small">
                              {c.student?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{c.student?.name}</strong><br />
                              <small className="text-muted">{c.student?.email}</small>
                            </div>
                          </div>
                        </td>
                        <td><strong>{c.title}</strong><br /><small className="text-muted">{c.department}</small></td>
                        <td><span className="category-badge">{c.category}</span></td>
                        <td><span className={`status-badge ${getStatusClass(c.status)}`}>{c.status}</span></td>
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
                <div className="view-detail-row">
                  <span className="view-detail-label">Student</span>
                  <span className="view-detail-value">{viewComplaint.student?.name}</span>
                </div>
                <div className="view-detail-row">
                  <span className="view-detail-label">Email</span>
                  <span className="view-detail-value">{viewComplaint.student?.email}</span>
                </div>
                <div className="view-detail-row">
                  <span className="view-detail-label">Title</span>
                  <span className="view-detail-value"><strong>{viewComplaint.title}</strong></span>
                </div>
                <div className="view-detail-row">
                  <span className="view-detail-label">Category</span>
                  <span className="view-detail-value">
                    <span className="category-badge">{viewComplaint.category}</span>
                  </span>
                </div>
                <div className="view-detail-row">
                  <span className="view-detail-label">Department</span>
                  <span className="view-detail-value">{viewComplaint.department}</span>
                </div>
                <div className="view-detail-row">
                  <span className="view-detail-label">Status</span>
                  <span className="view-detail-value">
                    <span className={`status-badge ${getStatusClass(viewComplaint.status)}`}>
                      {viewComplaint.status}
                    </span>
                  </span>
                </div>
                <div className="view-detail-row">
                  <span className="view-detail-label">Submitted</span>
                  <span className="view-detail-value">
                    {new Date(viewComplaint.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Full description */}
              <div className="view-description-box">
                <p className="view-description-label">Description</p>
                <p className="view-description-text">{viewComplaint.description}</p>
              </div>

              {/* Admin remarks */}
              {viewComplaint.adminRemarks && (
                <div className="admin-remark" style={{marginTop:'14px'}}>
                  <strong>💬 Admin Remarks:</strong> {viewComplaint.adminRemarks}
                </div>
              )}

              {/* Photo */}
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
              {/* Delete only for Resolved */}
              {viewComplaint.status === 'Resolved' ? (
                <button
                  className="btn-danger-outline"
                  onClick={() => setDeleteTarget(viewComplaint)}
                >
                  🗑 Delete Complaint
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => { setViewComplaint(null); navigate('/admin/complaints'); }}
                >
                  ✏️ Update Status
                </button>
              )}
              <button className="btn-secondary-outline" onClick={() => setViewComplaint(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" style={{maxWidth:'420px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Complaint</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{textAlign:'center', padding:'10px 0'}}>
                <div style={{fontSize:'48px', marginBottom:'12px'}}>🗑️</div>
                <p style={{fontSize:'15px', color:'#333', marginBottom:'8px'}}>
                  Are you sure you want to delete this complaint?
                </p>
                <p style={{fontSize:'13px', color:'#888'}}>
                  "<strong>{deleteTarget.title}</strong>" by {deleteTarget.student?.name}
                </p>
                <p style={{fontSize:'13px', color:'#e53e3e', marginTop:'10px', fontWeight:600}}>
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : '🗑 Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;