import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/ModernDashboard.css';

function AdminAnalytics() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/complaints/all`, config);
      setComplaints(data.message ? [] : data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Category breakdown
  const categories = ['Academics', 'Infrastructure', 'Faculty', 'Hostel', 'Sanitation', 'Other'];
  const categoryData = categories.map(cat => ({
    name: cat,
    count: complaints.filter(c => c.category === cat).length,
    emoji: cat === 'Academics' ? '📚' : cat === 'Infrastructure' ? '🏢' : cat === 'Faculty' ? '👨‍🏫' : cat === 'Hostel' ? '🏠' : cat === 'Sanitation' ? '🧹' : '🔧'
  }));
  const maxCat = Math.max(...categoryData.map(c => c.count), 1);

  // Status breakdown
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

  // Monthly data (last 6 months)
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const count = complaints.filter(c => {
        const cd = new Date(c.createdAt);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ label, count });
    }
    return months;
  };
  const monthlyData = getMonthlyData();
  const maxMonth = Math.max(...monthlyData.map(m => m.count), 1);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={user?.name} onLogout={handleLogout} />

      <div className="main-content">
        <div className="content-header">
          <div>
            <h1>Analytics</h1>
            <p className="breadcrumb">Home / Analytics</p>
          </div>
          <button className="btn-icon" onClick={fetchData} title="Refresh">🔄</button>
        </div>

        {/* KPI Row */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">📊</div>
            <div className="stat-details">
              <p className="stat-label">Total</p>
              <h3 className="stat-value">{total}</h3>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-details">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{pending}</h3>
            </div>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-icon">🔄</div>
            <div className="stat-details">
              <p className="stat-label">In Progress</p>
              <h3 className="stat-value">{inProgress}</h3>
            </div>
          </div>
          <div className="stat-card stat-resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-details">
              <p className="stat-label">Resolution Rate</p>
              <h3 className="stat-value">{resolutionRate}%</h3>
            </div>
          </div>
        </div>

        <div className="charts-row">
          {/* Monthly Trend */}
          <div className="content-card">
            <div className="card-header"><h3>📅 Monthly Trend</h3></div>
            <div className="card-body" style={{ padding: '30px' }}>
              <div className="bar-chart-vertical">
                {monthlyData.map((m, i) => (
                  <div key={i} className="bar-col">
                    <div className="bar-col-count">{m.count}</div>
                    <div className="bar-col-bar-track">
                      <div
                        className="bar-col-bar-fill"
                        style={{ height: `${(m.count / maxMonth) * 100}%` }}
                      ></div>
                    </div>
                    <div className="bar-col-label">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="content-card">
            <div className="card-header"><h3>🏷️ Category Breakdown</h3></div>
            <div className="card-body" style={{ padding: '30px' }}>
              <div className="chart-bars">
                {categoryData.map((cat, i) => (
                  <div key={i} className="chart-bar-item">
                    <div className="chart-bar-label">
                      <span>{cat.emoji} {cat.name}</span>
                      <span className="chart-bar-value">{cat.count}</span>
                    </div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill bar-pending"
                        style={{ width: `${(cat.count / maxCat) * 100}%`, background: `hsl(${i * 50}, 60%, 55%)` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Donut-style Summary */}
        <div className="content-card">
          <div className="card-header"><h3>📈 Status Summary</h3></div>
          <div className="card-body" style={{ padding: '30px' }}>
            <div className="status-summary-row">
              <div className="status-summary-item">
                <div className="summary-circle" style={{ background: '#fff3cd', color: '#856404' }}>
                  <span className="summary-pct">{total > 0 ? ((pending / total) * 100).toFixed(0) : 0}%</span>
                </div>
                <p>Pending</p>
                <strong>{pending}</strong>
              </div>
              <div className="status-summary-item">
                <div className="summary-circle" style={{ background: '#cfe2ff', color: '#084298' }}>
                  <span className="summary-pct">{total > 0 ? ((inProgress / total) * 100).toFixed(0) : 0}%</span>
                </div>
                <p>In Progress</p>
                <strong>{inProgress}</strong>
              </div>
              <div className="status-summary-item">
                <div className="summary-circle" style={{ background: '#d1e7dd', color: '#0f5132' }}>
                  <span className="summary-pct">{resolutionRate}%</span>
                </div>
                <p>Resolved</p>
                <strong>{resolved}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;