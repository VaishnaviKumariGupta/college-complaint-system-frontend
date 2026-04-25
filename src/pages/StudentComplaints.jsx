import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

const API = import.meta.env.VITE_API_URL;

function StudentComplaints() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [complaints,   setComplaints]   = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewComplaint,setViewComplaint]= useState(null); // full view
  const [viewPhoto,    setViewPhoto]    = useState(null); // lightbox

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API}/api/complaints/my`, config);
      const list = data.message ? [] : data;
      setComplaints(list);
      setFiltered(list);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleFilter = (status) => {
    setActiveFilter(status);
    setFiltered(status === 'All' ? complaints : complaints.filter(c => c.status === status));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':     return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Resolved':    return 'badge-resolved';
      default:            return '';
    }
  };

  const getCategoryIcon = (cat) => {
    const map = { Academics:'📚', Infrastructure:'🏢', Faculty:'👨‍🏫', Hostel:'🏠', Sanitation:'🧹' };
    return map[cat] || '🔧';
  };

  const handleLogout = () => { logout(); navigate('/'); };
  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar role="student" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div><h1>My Complaints</h1><p className="breadcrumb">Home / My Complaints</p></div>
          <button className="btn-primary" onClick={() => navigate('/student/new-complaint')}>
            ➕ New Complaint
          </button>
        </div>

        <div className="filter-tabs">
          {['All','Pending','In Progress','Resolved'].map(f => (
            <button key={f} className={`filter-tab ${activeFilter===f?'active':''}`}
              onClick={() => handleFilter(f)}>
              {f}
              <span className="filter-count">
                {f==='All' ? complaints.length : complaints.filter(c=>c.status===f).length}
              </span>
            </button>
          ))}
        </div>

        <div className="content-card">
          <div className="card-body">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No Complaints Found</h4>
                <p>{activeFilter==='All'
                  ? "You haven't submitted any complaints yet."
                  : `No ${activeFilter} complaints.`}</p>
              </div>
            ) : (
              <div className="complaints-list">
                {filtered.map(c => (
                  <div key={c._id} className="complaint-list-item">
                    <div className="complaint-list-left">
                      <div className="complaint-list-icon">{getCategoryIcon(c.category)}</div>
                      <div className="complaint-list-info">
                        <h4>{c.title}</h4>
                        <p className="complaint-list-meta">
                          <span className="category-badge">{c.category}</span>
                          <span className="text-muted"> • {c.department}</span>
                          <span className="text-muted"> • {new Date(c.createdAt).toLocaleDateString()}</span>
                        </p>
                        {/* Truncated description */}
                        <p className="complaint-list-desc">
                          {c.description?.substring(0, 100)}
                          {c.description?.length > 100 && (
                            <button
                              className="read-more-btn"
                              onClick={() => setViewComplaint(c)}
                            >
                              ...read more
                            </button>
                          )}
                        </p>

                        {c.uri && (
                          <img src={c.uri} alt="proof" className="complaint-thumb"
                            onClick={() => setViewPhoto(c.uri)} style={{marginTop:'8px'}} />
                        )}

                        {c.adminRemarks && (
                          <div className="admin-remark">
                            <strong>💬 Admin:</strong> {c.adminRemarks}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="complaint-list-right" style={{display:'flex', flexDirection:'column', gap:'8px', alignItems:'flex-end'}}>
                      <span className={`status-badge ${getStatusClass(c.status)}`}>{c.status}</span>
                      <button className="btn-action" onClick={() => setViewComplaint(c)}>
                        👁 View
                      </button>
                    </div>
                  </div>
                ))}
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
                  ['Category',   viewComplaint.category],
                  ['Department', viewComplaint.department],
                  ['Submitted',  new Date(viewComplaint.createdAt).toLocaleString()],
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
                <p style={{fontWeight:700, fontSize:'15px', color:'#1a1a2e', marginBottom:'14px'}}>
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
              <button className="btn-secondary-outline" onClick={() => setViewComplaint(null)}>Close</button>
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

export default StudentComplaints;