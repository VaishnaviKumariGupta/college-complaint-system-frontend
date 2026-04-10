import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function NewComplaint() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    category: '',
    description: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { title, department, category, description } = formData;

    // Validation
    if (!title || !department || !category || !description) {
      setError('Please fill all fields');
      return;
    }

    if (title.length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    if (description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.post(' ${import.meta.env.VITE_API_URL}/api/complaints', formData, config);

      setSuccess('✅ Complaint submitted successfully!');
      
      // Reset form
      setFormData({
        title: '',
        department: '',
        category: '',
        description: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/student/complaints');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit complaint');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="student" userName={user?.name} onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>Submit New Complaint</h1>
            <p className="breadcrumb">Home / New Complaint</p>
          </div>
        </div>

        <div className="form-container">
          <div className="content-card">
            <div className="card-header">
              <h3>Complaint Details</h3>
              <p className="card-subtitle">Please provide detailed information about your issue</p>
            </div>

            <div className="card-body" style={{padding: '30px'}}>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Complaint Title <span className="required">*</span></label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Brief summary of your complaint"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-input"
                    />
                    <small className="form-hint">Min. 5 characters</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department <span className="required">*</span></label>
                    <select 
                      name="department" 
                      value={formData.department} 
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Electronics">Electronics</option>
                      <option value="IT">IT</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category <span className="required">*</span></label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select Category</option>
                      <option value="Academics">📚 Academics</option>
                      <option value="Infrastructure">🏢 Infrastructure</option>
                      <option value="Faculty">👨‍🏫 Faculty</option>
                      <option value="Hostel">🏠 Hostel</option>
                      <option value="Sanitation">🧹 Sanitation</option>
                      <option value="Other">🔧 Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Description <span className="required">*</span></label>
                    <textarea
                      name="description"
                      rows="6"
                      placeholder="Describe your complaint in detail. Include specific information like location, date, time, etc."
                      value={formData.description}
                      onChange={handleChange}
                      className="form-input"
                    ></textarea>
                    <small className="form-hint">Min. 10 characters. Be as detailed as possible.</small>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => navigate('/student/dashboard')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : '✉️ Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Guidelines Card */}
          <div className="content-card" style={{marginTop: '20px'}}>
            <div className="card-header">
              <h3>📝 Guidelines</h3>
            </div>
            <div className="card-body" style={{padding: '25px'}}>
              <ul className="guidelines-list">
                <li>✅ Be specific and provide all relevant details</li>
                <li>✅ Include location, date, and time if applicable</li>
                <li>✅ Use respectful language</li>
                <li>✅ Attach evidence if available (coming soon)</li>
                <li>✅ Check status regularly for updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewComplaint;