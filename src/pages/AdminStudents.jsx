import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function AdminStudents() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      // Complaints fetch karo (ye guaranteed kaam karta hai)
      const complaintsRes = await axios.get(' ${import.meta.env.VITE_API_URL}/api/complaints/all', config);
      const complaintsList = complaintsRes.data.message ? [] : complaintsRes.data;
      setComplaints(complaintsList);

      // Students fetch karo — 2 tarike try karte hain
      try {
        // Pehle dedicated route try karo
        const usersRes = await axios.get(' ${import.meta.env.VITE_API_URL}/api/users/students', config);
        const studentsList = usersRes.data.message ? [] : usersRes.data;
        setStudents(studentsList);
      } catch (studentErr) {
        // Agar /students route nahi hai, complaints se students nikaal lo
        console.warn('Students route not found, extracting from complaints...');
        const uniqueStudents = [];
        const seenIds = new Set();
        complaintsList.forEach(c => {
          if (c.student && c.student._id && !seenIds.has(c.student._id)) {
            seenIds.add(c.student._id);
            uniqueStudents.push(c.student);
          }
        });
        setStudents(uniqueStudents);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please try again.');
    }
    setLoading(false);
  };

  const getStudentStats = (studentId) => {
    const sc = complaints.filter(c =>
      c.student?._id === studentId || c.student === studentId
    );
    return {
      total: sc.length,
      pending: sc.filter(c => c.status === 'Pending').length,
      inProgress: sc.filter(c => c.status === 'In Progress').length,
      resolved: sc.filter(c => c.status === 'Resolved').length
    };
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>Students</h1>
            <p className="breadcrumb">Home / Students</p>
          </div>
          <div className="pending-count-badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>
            👥 {students.length} Registered
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
            <button onClick={fetchData} style={{ marginLeft: '12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: '#b91c1c' }}>
              Retry ↻
            </button>
          </div>
        )}

        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search students by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="content-card">
          <div className="card-body">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h4>{search ? 'No students match your search' : 'No Students Found'}</h4>
                <p>
                  {search
                    ? 'Try a different search term.'
                    : 'No students registered yet, or backend /api/users/students route missing.'}
                </p>
                {!search && (
                  <p style={{ marginTop: '10px', fontSize: '13px', color: '#aaa' }}>
                    💡 Add <code>GET /api/users/students</code> route in your backend userRoutes.js
                  </p>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Total</th>
                      <th>Pending</th>
                      <th>In Progress</th>
                      <th>Resolved</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student) => {
                      const stats = getStudentStats(student._id);
                      return (
                        <tr key={student._id}>
                          <td>
                            <div className="student-cell">
                              <div className="student-avatar-small">
                                {student.name?.charAt(0).toUpperCase()}
                              </div>
                              <strong>{student.name}</strong>
                            </div>
                          </td>
                          <td className="text-muted">{student.email}</td>
                          <td><span className="category-badge">{stats.total}</span></td>
                          <td>
                            {stats.pending > 0
                              ? <span className="status-badge badge-pending">{stats.pending}</span>
                              : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            {stats.inProgress > 0
                              ? <span className="status-badge badge-progress">{stats.inProgress}</span>
                              : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            {stats.resolved > 0
                              ? <span className="status-badge badge-resolved">{stats.resolved}</span>
                              : <span className="text-muted">—</span>}
                          </td>
                          <td className="text-muted">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      );
                    })}
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

export default AdminStudents;