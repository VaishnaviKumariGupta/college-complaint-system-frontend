import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function ComplaintForm() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    department: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Academics', 'Infrastructure', 'Faculty', 'Hostel', 'Sanitation', 'Other'];
  const departments = ['BCA', 'BTECH', 'MCA', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { title, category, department, description } = formData;
    if (!title || !category || !department || !description) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(' ${import.meta.env.VITE_API_URL}/api/complaints', formData, config);
      setSuccess('Complaint submitted successfully!');
      setFormData({ title: '', category: '', department: '', description: '' });
      setTimeout(() => navigate('/student/complaints'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
    setLoading(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <Sidebar role="student" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>Submit Complaint</h1>
            <p className="breadcrumb">Home / New Complaint</p>
          </div>
        </div>

        <div className="content-card" style={{ maxWidth: '700px' }}>
          <div className="card-header">
            <h3>📝 New Complaint Form</h3>
          </div>
          <div className="card-body" style={{ padding: '30px' }}>
            {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>}

            <form onSubmit={handleSubmit} className="complaint-form-body">
              <div className="form-group">
                <label className="form-label">Complaint Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Brief title of your complaint"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-input" value={formData.category} onChange={handleChange}>
                    <option value="">-- Select Category --</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select name="department" className="form-input" value={formData.department} onChange={handleChange}>
                    <option value="">-- Select Department --</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  placeholder="Describe your complaint in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary-outline" onClick={() => navigate('/student/dashboard')}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : '📤 Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintForm;