import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function AdminComplaints() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/complaints/all`, config);
      const list = data.message ? [] : data;
      setComplaints(list);
      setFiltered(list);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleFilter = (status) => {
    setActiveFilter(status);
    applyFilters(status, searchQuery);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    applyFilters(activeFilter, e.target.value);
  };

  const applyFilters = (status, query) => {
    let result = complaints;
    if (status !== 'All') result = result.filter(c => c.status === status);
    if (query) result = result.filter(c =>
      c.title?.toLowerCase().includes(query.toLowerCase()) ||
      c.student?.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.category?.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(result);
  };

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setAdminRemarks(complaint.adminRemarks || '');
  };

  const closeModal = () => { setSelectedComplaint(null); };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(` ${import.meta.env.VITE_API_URL}/api/complaints/${selectedComplaint._id}`, {
        status: newStatus,
        adminRemarks
      }, config);
      await fetchComplaints();
      closeModal();
    } catch (err) { console.error(err); }
    setUpdating(false);
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
      <Sidebar role="admin" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>All Complaints</h1>
            <p className="breadcrumb">Home / Complaints</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="search-filter-row">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by title, student, category..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="filter-tabs">
            {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
              <button key={f} className={`filter-tab ${activeFilter === f ? 'active' : ''}`} onClick={() => handleFilter(f)}>
                {f} <span className="filter-count">{f === 'All' ? complaints.length : complaints.filter(c => c.status === f).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="content-card">
          <div className="card-body">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No Complaints Found</h4>
                <p>No complaints match your filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((complaint) => (
                      <tr key={complaint._id}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar-small">{complaint.student?.name?.charAt(0).toUpperCase()}</div>
                            <div>
                              <strong>{complaint.student?.name}</strong><br />
                              <small className="text-muted">{complaint.student?.email}</small>
                            </div>
                          </div>
                        </td>
                        <td><strong>{complaint.title}</strong></td>
                        <td><span className="category-badge">{complaint.category}</span></td>
                        <td>{complaint.department}</td>
                        <td><span className={`status-badge ${getStatusClass(complaint.status)}`}>{complaint.status}</span></td>
                        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn-action" onClick={() => openModal(complaint)}>
                            ✏️ Update
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

      {/* Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Complaint</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <p><strong>Student:</strong> {selectedComplaint.student?.name}</p>
                <p><strong>Title:</strong> {selectedComplaint.title}</p>
                <p><strong>Category:</strong> {selectedComplaint.category}</p>
                <p><strong>Description:</strong> {selectedComplaint.description}</p>
              </div>
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Update Status</label>
                <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Remarks (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  placeholder="Add remarks for the student..."
                  value={adminRemarks}
                  onChange={e => setAdminRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-outline" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleStatusUpdate} disabled={updating}>
                {updating ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComplaints;