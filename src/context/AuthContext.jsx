import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Context
export const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in (on page load)
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (name, email, password, role = 'student') => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        name,
        email,
        password,
        role
      });

      // Save user data and token
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      return { success: true, role: data.role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        email,
        password
      });

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true, role: data.role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};