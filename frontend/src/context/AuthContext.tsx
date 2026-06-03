'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Defined outside component — stable, no closure issues
const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const isRefreshing = useRef(false); // prevent concurrent refresh calls

  useEffect(() => {
    const initAuth = async () => {
      if (isRefreshing.current) return;
      isRefreshing.current = true;

      const storedRefresh = localStorage.getItem('refresh');
      const storedToken = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      // Nothing stored — user is logged out
      if (!storedRefresh || !userStr) {
        setIsLoggedIn(false);
        setToken(null);
        setUser(null);
        setAuthInitialized(true);
        isRefreshing.current = false;
        return;
      }

      try {
        const response = await fetch(`${API_URL}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: storedRefresh }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access);
          setToken(data.access);
          setUser(JSON.parse(userStr));
          setIsLoggedIn(true);
        } else {
          // Server rejected the refresh token — genuine expiry
          clearAuthStorage();
          setIsLoggedIn(false);
          setToken(null);
          setUser(null);
        }
      } catch {
        // Network error — trust what's in localStorage
        if (storedToken && userStr) {
          setToken(storedToken);
          setUser(JSON.parse(userStr));
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setToken(null);
          setUser(null);
        }
      } finally {
        setAuthInitialized(true);
        isRefreshing.current = false;
      }
    };

    initAuth();

    // Only sync logout/login across tabs — don't re-run full refresh
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab — log out here too
        setIsLoggedIn(false);
        setToken(null);
        setUser(null);
      } else if (e.key === 'token' && e.newValue) {
        // Token was set in another tab — sync login state
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setToken(e.newValue);
          setUser(JSON.parse(userStr));
          setIsLoggedIn(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (newToken: string, refresh: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(newUser));
    // Set state directly — no need to re-run checkAuth
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    setAuthInitialized(true);
  };

  const logout = () => {
    clearAuthStorage();
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
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
