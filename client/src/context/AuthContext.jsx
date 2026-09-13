import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lexora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('lexora_token');
      if (token) {
        try {
          const currentUser = await api.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem('lexora_user', JSON.stringify(currentUser));
          } else {
            localStorage.removeItem('lexora_token');
            localStorage.removeItem('lexora_user');
            setUser(null);
          }
        } catch (e) {
          console.error('Auth verification error:', e);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('lexora_token', data.token);
    localStorage.setItem('lexora_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, role = 'USER') => {
    const data = await api.register(name, email, password, role);
    localStorage.setItem('lexora_token', data.token);
    localStorage.setItem('lexora_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      isLawyer: user?.role === 'LAWYER'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
