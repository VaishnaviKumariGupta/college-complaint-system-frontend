import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

const API = import.meta.env.VITE_API_URL;

function AdminComplaints() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [complaints,        setComplaints]        = useState([]);
  const [filtered,          setFiltered]          = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [activeFilter,      setActiveFilter]      = useState('All');
  const [searchQuery,       setSearchQuery]       = useState('');

  // update modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus,         setNewStatus]         = useState('');
  const [adminRemarks,      setAdminRemarks]      = useState('');
  const [updating,          setUpdating]          = useState(false);

  // full view modal
  const [viewComplaint,     setViewComplaint]     = useState(null);

  // delete
  const [deleteTarget,      setDeleteTarget]      = useState(null);
  const [deleting,          setDeleting]          = useState(false);

  // photo lightbox
  const [viewPhoto,         setViewPhoto]         = useState(null);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API}/api/complaints/all`, config);
      const list = data.message ? [] : data;
      setComplaints(list);
      setFiltered(list);
    } catch (err) { console.error(err); }
    setLoading(false);
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

  const handleFilter = (s) => { setActiveFilter(s); applyFilters(s, searchQuery); };
  const handleSearch = (e)  => { setSearchQuery(e.target.value); applyFilters(activeFilter, e.target.value); };

  // ── open update modal (block if Resolved) ─────────────
  const openUpdateModal = (complaint) => {
    if (complaint.status === 'Resolved') return; // no update on resolved
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setAdminRemarks(complaint.adminRemarks || '');
  };
  const closeUpdateModal = () => setSelectedComplaint(null);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API}/api/complaints/${selectedComplaint._id}`,
        { status: newStatus, adminRemarks }, config);
      await fetchComplaints();
      closeUpdateModal();
    } catch (err) { console.error(err); }
    setUpdating(false);
  };

  // ── delete ────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API}/api/complaints/${deleteTarget._id}`, config);
      setDeleteTarget(null);
      setViewComplaint(null);
      await fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
    setDeleting(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':     return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Resolved':    return 'badge-resolved';
      default:            return '';
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };
  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div><h1>All Complaints</h1><p className="breadcrumb">Home / Complaints</p></div>
        </div>

        <div className="search-filter-row">
          <input type="text" className="search-input"
            placeholder="🔍 Search by title, student, category..."
            value={searchQuery} onChange={handleSearch} />
          <div className="filter-tabs">
            {['All','Pending','In Progress','Resolved'].map(f => (
              <button key={f} className={`filter-tab ${activeFilter===f?'active':''}`}
                onClick={() => handleFilter(f)}>
                {f} <span className="filter-count">
                  {f==='All' ? complaints.length : complaints.filter(c=>c.status===f).length}
                </span>
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
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student</th><th>Title</th><th>Category</th>
                      <th>Status</th><th>Photo</th><th>Date</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
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
                        <td><strong>{c.title}</strong></td>
                        <td><span className="category-badge">{c.category}</span></td>
                        <td>
                          <span className={`status-badge ${getStatusClass(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          {c.uri ? (
                            <img src={c.uri} alt="proof" className="complaint-thumb"
                              onClick={() => setViewPhoto(c.uri)} title="Click to view" />
                          ) : <span className="text-muted">—</span>}
                        </td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                            {/* View button — always */}
                            <button className="btn-action"
                              onClick={() => setViewComplaint(c)}>
                              👁 View
                            </button>
                            {/* Update button — only non-resolved */}
                            {c.status !== 'Resolved' && (
                              <button className="btn-action"
                                onClick={() => openUpdateModal(c)}>
                                ✏️ Update
                              </button>
                            )}
                            {/* Delete button — only resolved */}
                            {c.status === 'Resolved' && (
                              <button className="btn-action-danger"
                                onClick={() => setDeleteTarget(c)}>
                                🗑 Delete
                              </button>
                            )}
                          </div>
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
                {[
                  ['Student',    viewComplaint.student?.name],
                  ['Email',      viewComplaint.student?.email],
                  ['Department', viewComplaint.department],
                  ['Submitted',  new Date(viewComplaint.createdAt).toLocaleString()],
                ].map(([label, val]) => (
                  <div className="view-detail-row" key={label}>
                    <span className="view-detail-label">{label}</span>
                    <span className="view-detail-value">{val}</span>
                  </div>
                ))}
                <div className="view-detail-row">
                  <span className="view-detail-label">Category</span>
                  <span className="view-detail-value">
                    <span className="category-badge">{viewComplaint.category}</span>
                  </span>
                </div>
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
                    style={{width:'100%', maxHeight:'250px', objectFit:'cover',
                      borderRadius:'10px', cursor:'pointer'}}
                    onClick={() => setViewPhoto(viewComplaint.uri)} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              {viewComplaint.status === 'Resolved' ? (
                <button className="btn-danger-outline"
                  onClick={() => { setViewComplaint(null); setDeleteTarget(viewComplaint); }}>
                  🗑 Delete
                </button>
              ) : (
                <button className="btn-primary"
                  onClick={() => { setViewComplaint(null); openUpdateModal(viewComplaint); }}>
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

      {/* ── UPDATE MODAL ── */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={closeUpdateModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Complaint</h3>
              <button className="modal-close" onClick={closeUpdateModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <p><strong>Student:</strong> {selectedComplaint.student?.name}</p>
                <p><strong>Title:</strong> {selectedComplaint.title}</p>
                <p><strong>Category:</strong> {selectedComplaint.category}</p>
                <p style={{marginTop:'8px', lineHeight:'1.6', color:'#555'}}>
                  {selectedComplaint.description}
                </p>
              </div>
              {selectedComplaint.uri && (
                <img src={selectedComplaint.uri} alt="Complaint"
                  style={{width:'100%', maxHeight:'180px', objectFit:'cover',
                    borderRadius:'10px', margin:'12px 0', cursor:'pointer'}}
                  onClick={() => setViewPhoto(selectedComplaint.uri)} />
              )}
              <div className="form-group" style={{marginTop:'16px'}}>
                <label className="form-label">Update Status</label>
                <select className="form-input" value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Remarks (Optional)</label>
                <textarea className="form-input form-textarea" rows={4}
                  placeholder="Add remarks for the student..."
                  value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-outline" onClick={closeUpdateModal}>Cancel</button>
              <button className="btn-primary" onClick={handleStatusUpdate} disabled={updating}>
                {updating ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" style={{maxWidth:'420px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Complaint</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body" style={{textAlign:'center', padding:'20px 0'}}>
              <div style={{fontSize:'48px', marginBottom:'14px'}}>🗑️</div>
              <p style={{fontSize:'15px', color:'#333', marginBottom:'8px'}}>
                Are you sure you want to delete this complaint?
              </p>
              <p style={{fontSize:'13px', color:'#888'}}>
                "<strong>{deleteTarget.title}</strong>" — {deleteTarget.student?.name}
              </p>
              <p style={{fontSize:'13px', color:'#e53e3e', marginTop:'10px', fontWeight:600}}>
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : '🗑 Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTO LIGHTBOX ── */}
      {viewPhoto && (
        <div className="lightbox-overlay" onClick={() => setViewPhoto(null)}>
          <div className="lightbox-box" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setViewPhoto(null)}>✕</button>
            <img src={viewPhoto} alt="Full view" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComplaints;