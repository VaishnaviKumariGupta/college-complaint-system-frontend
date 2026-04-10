import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function StudentProfile() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    // Password validation (optional update)
    if (formData.newPassword) {
      if (!formData.currentPassword) { setError('Enter current password'); return; }
      if (formData.newPassword !== formData.confirmPassword) { setError('New passwords do not match'); return; }
      if (formData.newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    }

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { name: formData.name, email: formData.email };
      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, payload, config);
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
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
            <h1>My Profile</h1>
            <p className="breadcrumb">Home / Profile</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-top-card">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-top-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <span className="user-role-badge">👨‍🎓 Student</span>
          </div>
        </div>

        {/* Update Form */}
        <div className="content-card" style={{ maxWidth: '600px' }}>
          <div className="card-header">
            <h3>✏️ Update Profile</h3>
          </div>
          <div className="card-body" style={{ padding: '30px' }}>
            {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>}

            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
              </div>

              <hr style={{ margin: '25px 0', borderColor: '#eee' }} />
              <h4 style={{ marginBottom: '15px', color: '#555' }}>Change Password (Optional)</h4>

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" name="currentPassword" className="form-input" placeholder="Enter current password" value={formData.currentPassword} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" name="newPassword" className="form-input" placeholder="Enter new password" value={formData.newPassword} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" name="confirmPassword" className="form-input" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleChange} />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                {loading ? 'Updating...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;