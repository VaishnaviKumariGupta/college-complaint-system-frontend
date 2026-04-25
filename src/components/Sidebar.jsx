import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar({ role, userName, onLogout }) {
  const [isOpen, setIsOpen] = useState(false); // ← ADD

  return (
    <>
      {/* ── HAMBURGER BUTTON — sirf mobile pe dikhega ── */}
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(prev => !prev)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* ── OVERLAY — sidebar ke peeche dark background ── */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">🎓 CCMS</h2>
          <p className="sidebar-subtitle">Complaint Management</p>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {userName?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h4>{userName}</h4>
            <span className="user-role">
              {role === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 Student'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {role === 'student' ? (
            <>
              <NavLink to="/student/dashboard"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}> {/* ← onClick add */}
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/student/complaints"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}>
                <span className="nav-icon">📋</span>
                <span>My Complaints</span>
              </NavLink>
              <NavLink to="/student/new-complaint"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}>
                <span className="nav-icon">➕</span>
                <span>New Complaint</span>
              </NavLink>
              <NavLink to="/student/profile"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}>
                <span className="nav-icon">👤</span>
                <span>My Profile</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/admin/dashboard"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}>
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/admin/complaints"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}>
                <span className="nav-icon">📋</span>
                <span>All Complaints</span>
              </NavLink>
              <NavLink to="/admin/pending"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}>
                <span className="nav-icon">⏳</span>
                <span>Pending</span>
              </NavLink>
              <NavLink to="/admin/students"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}>
                <span className="nav-icon">👥</span>
                <span>Students</span>
              </NavLink>
              <NavLink to="/admin/analytics"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setIsOpen(false)}>
                <span className="nav-icon">📈</span>
                <span>Analytics</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;