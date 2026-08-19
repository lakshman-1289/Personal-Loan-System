'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Set up Axios default configurations
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface UserSession {
  token: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  userId: number;
}

interface AuthContextType {
  session: UserSession | null;
  loading: boolean;
  login: (data: UserSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ezfinanz_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
          setSession(parsed);
        }
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((data: UserSession) => {
    localStorage.setItem('ezfinanz_session', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ezfinanz_session');
    delete axios.defaults.headers.common['Authorization'];
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
