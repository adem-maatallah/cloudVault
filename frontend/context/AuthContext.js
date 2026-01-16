'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on load
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.getMe();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load user', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      localStorage.setItem('token', response.token);
      setUser(response.data);
      router.push('/');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const signUp = async (name, email, password) => {
    try {
      const response = await api.signUp({ name, email, password });
      localStorage.setItem('token', response.token);
      setUser(response.data);
      router.push('/');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
