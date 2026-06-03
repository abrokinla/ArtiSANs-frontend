'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_staff?: boolean;
  email_verified?: boolean;
  has_completed_onboarding?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, refresh: string, user: User) => void;
  logout: () => void;
  authInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const storedRefresh = localStorage.getItem('refresh');
      const userStr = localStorage.getItem('user');

      if (!storedRefresh || !userStr) {
        clearAuth();
        return;
      }

      try {
        const response = await fetch('/api/token/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: storedRefresh }),
        });

        if (response.ok) {
          const data = await response.json();
          const newToken = data.access;

          localStorage.setItem('token', newToken);
          setIsLoggedIn(true);
          setToken(newToken);
          setUser(JSON.parse(userStr));
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setAuthInitialized(true);
      }
    };

    const clearAuth = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setToken(null);
      setUser(null);
    };

    checkAuth();

    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  const login = (token: string, refresh: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    setIsLoggedIn(true);
    setToken(token);
    setUser(user);
    setAuthInitialized(true);
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    setAuthInitialized(true);
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, authInitialized }}>
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
