import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function StudentDashboard() {
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

      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/complaints/my`, config);
      
      const complaints = data.message ? [] : data;

      // Calculate stats
      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length
      });

      // Recent 5 complaints
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

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="student" userName={user?.name} onLogout={handleLogout} />
      
      <div className="main-content">
        {/* Top Header */}
        <div className="content-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p className="breadcrumb">Home / Dashboard</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="Notifications">
              🔔
            </button>
            <button className="btn-icon" title="Settings">
              ⚙️
            </button>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <p>Here's what's happening with your complaints today.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/student/new-complaint')}>
            ➕ Submit New Complaint
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">📊</div>
            <div className="stat-details">
              <p className="stat-label">Total Complaints</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-details">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{stats.pending}</h3>
            </div>
          </div>

          <div className="stat-card stat-progress">
            <div className="stat-icon">🔄</div>
            <div className="stat-details">
              <p className="stat-label">In Progress</p>
              <h3 className="stat-value">{stats.inProgress}</h3>
            </div>
          </div>

          <div className="stat-card stat-resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-details">
              <p className="stat-label">Resolved</p>
              <h3 className="stat-value">{stats.resolved}</h3>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Complaints</h3>
            <button className="btn-link" onClick={() => navigate('/student/complaints')}>
              View All →
            </button>
          </div>
          <div className="card-body">
            {recentComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No Complaints Yet</h4>
                <p>You haven't submitted any complaints. Click the button above to get started.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint._id}>
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

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card" onClick={() => navigate('/student/new-complaint')}>
              <div className="action-icon">➕</div>
              <h4>New Complaint</h4>
              <p>Submit a new complaint</p>
            </div>

            <div className="action-card" onClick={() => navigate('/student/complaints')}>
              <div className="action-icon">📋</div>
              <h4>View All</h4>
              <p>See all your complaints</p>
            </div>

            <div className="action-card" onClick={() => navigate('/student/profile')}>
              <div className="action-icon">👤</div>
              <h4>My Profile</h4>
              <p>Update your information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;