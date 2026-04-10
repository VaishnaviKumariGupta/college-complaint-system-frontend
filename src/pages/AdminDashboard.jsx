import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/complaints/all`, config);
      
      const complaints = data.message ? [] : data;

      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length
      });

      setRecentComplaints(complaints.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Pending': return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      default: return '';
    }
  };

  // Calculate percentages
  const pendingPercentage = stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0;
  const progressPercentage = stats.total > 0 ? ((stats.inProgress / stats.total) * 100).toFixed(1) : 0;
  const resolvedPercentage = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0;

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={user?.name} onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="breadcrumb">Home / Dashboard</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="Refresh" onClick={fetchDashboardData}>
              🔄
            </button>
            <button className="btn-icon" title="Notifications">
              🔔
            </button>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card admin-welcome">
          <div className="welcome-content">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <p>Manage and resolve student complaints efficiently.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/admin/complaints')}>
            📋 View All Complaints
          </button>
        </div>

        {/* Stats Cards */}
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
              <p className="stat-trend">{pendingPercentage}% of total</p>
            </div>
          </div>

          <div className="stat-card stat-progress">
            <div className="stat-icon">🔄</div>
            <div className="stat-details">
              <p className="stat-label">In Progress</p>
              <h3 className="stat-value">{stats.inProgress}</h3>
              <p className="stat-trend">{progressPercentage}% of total</p>
            </div>
          </div>

          <div className="stat-card stat-resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-details">
              <p className="stat-label">Resolved</p>
              <h3 className="stat-value">{stats.resolved}</h3>
              <p className="stat-trend">{resolvedPercentage}% of total</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <div className="content-card">
            <div className="card-header">
              <h3>Status Distribution</h3>
            </div>
            <div className="card-body" style={{padding: '30px'}}>
              <div className="chart-bars">
                <div className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span>Pending</span>
                    <span className="chart-bar-value">{stats.pending}</span>
                  </div>
                  <div className="chart-bar-track">
                    <div 
                      className="chart-bar-fill bar-pending" 
                      style={{width: `${pendingPercentage}%`}}
                    ></div>
                  </div>
                </div>

                <div className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span>In Progress</span>
                    <span className="chart-bar-value">{stats.inProgress}</span>
                  </div>
                  <div className="chart-bar-track">
                    <div 
                      className="chart-bar-fill bar-progress" 
                      style={{width: `${progressPercentage}%`}}
                    ></div>
                  </div>
                </div>

                <div className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span>Resolved</span>
                    <span className="chart-bar-value">{stats.resolved}</span>
                  </div>
                  <div className="chart-bar-track">
                    <div 
                      className="chart-bar-fill bar-resolved" 
                      style={{width: `${resolvedPercentage}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="card-body" style={{padding: '20px'}}>
              <div className="admin-quick-actions">
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/admin/pending')}
                >
                  <span className="quick-action-icon">⏳</span>
                  <span>View Pending</span>
                  <span className="quick-action-badge">{stats.pending}</span>
                </button>

                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/admin/complaints')}
                >
                  <span className="quick-action-icon">📋</span>
                  <span>All Complaints</span>
                  <span className="quick-action-badge">{stats.total}</span>
                </button>

                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/admin/students')}
                >
                  <span className="quick-action-icon">👥</span>
                  <span>Students</span>
                </button>

                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/admin/analytics')}
                >
                  <span className="quick-action-icon">📈</span>
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Complaints</h3>
            <button className="btn-link" onClick={() => navigate('/admin/complaints')}>
              View All →
            </button>
          </div>
          <div className="card-body">
            {recentComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No Complaints Yet</h4>
                <p>No complaints have been submitted.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint._id} onClick={() => navigate('/admin/complaints')} style={{cursor: 'pointer'}}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar-small">
                              {complaint.student?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{complaint.student?.name}</strong>
                              <br />
                              <small className="text-muted">{complaint.student?.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{complaint.title}</strong>
                          <br />
                          <small className="text-muted">{complaint.department}</small>
                        </td>
                        <td>
                          <span className="category-badge">{complaint.category}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td>
                          {new Date(complaint.createdAt).toLocaleDateString()}
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
    </div>
  );
}

export default AdminDashboard;