import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintForm from './pages/ComplaintForm';
import StudentComplaints from './pages/StudentComplaints';
import StudentProfile from './pages/StudentProfile';
import AdminComplaints from './pages/AdminComplaints';
import AdminPending from './pages/AdminPending';
import AdminStudents from './pages/AdminStudents';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/complaints" element={
            <ProtectedRoute role="student"><StudentComplaints /></ProtectedRoute>
          } />
          <Route path="/student/new-complaint" element={
            <ProtectedRoute role="student"><ComplaintForm /></ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/complaints" element={
            <ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>
          } />
          <Route path="/admin/pending" element={
            <ProtectedRoute role="admin"><AdminPending /></ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;