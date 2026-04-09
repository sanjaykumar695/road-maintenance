import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Update axios headers when token changes
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    }
  };

  const register = async (username, email, password, role) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password,
        role,
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', {
        username,
        password,
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
