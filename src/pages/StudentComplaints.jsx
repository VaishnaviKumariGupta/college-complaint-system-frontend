import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function StudentComplaints() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Pending', 'In Progress', 'Resolved'];

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/complaints/my`, config);
      const list = data.message ? [] : data;
      setComplaints(list);
      setFiltered(list);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFilter = (status) => {
    setActiveFilter(status);
    if (status === 'All') setFiltered(complaints);
    else setFiltered(complaints.filter(c => c.status === status));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      default: return '';
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar role="student" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>My Complaints</h1>
            <p className="breadcrumb">Home / My Complaints</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/student/new-complaint')}>
            ➕ New Complaint
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {filters.map(f => (
            <button
              key={f}
              className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
              onClick={() => handleFilter(f)}
            >
              {f}
              <span className="filter-count">
                {f === 'All' ? complaints.length : complaints.filter(c => c.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Complaints List */}
        <div className="content-card">
          <div className="card-body">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No Complaints Found</h4>
                <p>{activeFilter === 'All' ? "You haven't submitted any complaints yet." : `No ${activeFilter} complaints.`}</p>
                <button className="btn-primary" style={{ marginTop: '15px' }} onClick={() => navigate('/student/new-complaint')}>
                  Submit First Complaint
                </button>
              </div>
            ) : (
              <div className="complaints-list">
                {filtered.map((complaint) => (
                  <div key={complaint._id} className="complaint-list-item">
                    <div className="complaint-list-left">
                      <div className="complaint-list-icon">
                        {complaint.category === 'Academics' ? '📚' :
                         complaint.category === 'Infrastructure' ? '🏢' :
                         complaint.category === 'Faculty' ? '👨‍🏫' :
                         complaint.category === 'Hostel' ? '🏠' :
                         complaint.category === 'Sanitation' ? '🧹' : '🔧'}
                      </div>
                      <div className="complaint-list-info">
                        <h4>{complaint.title}</h4>
                        <p className="complaint-list-meta">
                          <span className="category-badge">{complaint.category}</span>
                          <span className="text-muted"> • {complaint.department}</span>
                          <span className="text-muted"> • {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </p>
                        <p className="complaint-list-desc">{complaint.description?.substring(0, 120)}...</p>
                        {complaint.adminRemarks && (
                          <div className="admin-remark">
                            <strong>💬 Admin:</strong> {complaint.adminRemarks}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="complaint-list-right">
                      <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                        {complaint.status}
                      </span>
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

export default StudentComplaints;