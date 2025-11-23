import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles,
      }));
      setUser({
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles,
      }));
      setUser({
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

