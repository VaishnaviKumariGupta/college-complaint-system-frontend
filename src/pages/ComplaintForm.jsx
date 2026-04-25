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

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Academics', 'Infrastructure', 'Faculty', 'Hostel', 'Sanitation', 'Other'];
  const departments = ['BCA', 'BTECH', 'MCA', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── photo select ──────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size must be less than 5MB'); return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, or WEBP images are allowed'); return;
    }
    setError('');
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    const inp = document.getElementById('photoInput');
    if (inp) inp.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { title, category, department, description } = formData;
    if (!title || !category || !department || !description) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', title);
      data.append('category', category);
      data.append('department', department);
      data.append('description', description);
      if (photo) data.append('photo', photo);


      // ── DEBUG — ye console mein dekho ──
    console.log('API URL:', import.meta.env.VITE_API_URL);
    console.log('User token:', user?.token);
    console.log('FormData entries:');
    for (let [key, val] of data.entries()) {
      console.log(key, val);
    }




      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/complaints`, data, config);


       console.log('Success response:', response.data);




      setSuccess('Complaint submitted successfully!');
      setFormData({ title: '', category: '', department: '', description: '' });

      removePhoto();

      setTimeout(() => navigate('/student/complaints'), 1500);

    } catch (err) {



      console.log('Error status:', err.response?.status);
    console.log('Error message:', err.response?.data);



    
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
                <label className="form-label">Title *</label>
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

              {/* ── PHOTO UPLOAD FIELD ── */}
              <div className="form-group">
                <label className="form-label">
                  Attach Photo&nbsp;
                  <span style={{ color: '#999', fontWeight: 400 }}>(Optional — max 5MB)</span>
                </label>

                {!photoPreview ? (
                  <label htmlFor="photoInput" className="photo-upload-box">
                    <div className="photo-upload-icon">📷</div>
                    <p className="photo-upload-text">Click to upload a photo</p>
                    <p className="photo-upload-hint">JPG, PNG, WEBP • Max 5MB</p>
                    <input
                      id="photoInput" type="file" 
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                ) : (
                  <div className="photo-preview-box">
                    <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                    <div className="photo-preview-info">
                      <span className="photo-preview-name">📎 {photo?.name}</span>
                      <span className="photo-preview-size">{(photo?.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button type="button" className="photo-remove-btn" onClick={removePhoto}>
                      ✕ Remove
                    </button>
                  </div>
                )}
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