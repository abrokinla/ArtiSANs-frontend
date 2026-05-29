'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getMyProfile } from '@/lib/api';

export default function Navbar() {
  const { isLoggedIn, user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [bidsRemaining, setBidsRemaining] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'artisan' && token) {
      let cancelled = false;
      getMyProfile(token).then((profile) => {
        if (!cancelled) setBidsRemaining(profile.bids_remaining);
      }).catch(() => {});
      return () => { cancelled = true; };
    }
  }, [isLoggedIn, user?.role, token]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="ArtiSANs.NG" className="h-8 sm:h-10 w-auto" />
          </Link>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {user?.role === 'artisan' ? (
              <Link href="/jobs" className="text-sm font-medium transition-colors hover:text-rausch" style={{ color: 'var(--color-text-secondary)' }}>
                Find Jobs
              </Link>
            ) : (
              <Link href="/search" className="text-sm font-medium transition-colors hover:text-rausch" style={{ color: 'var(--color-text-secondary)' }}>
                Find Artisans
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-rausch" style={{ color: 'var(--color-text-secondary)' }}>
                Dashboard
              </Link>
            )}
            {user?.role === 'client' && (
              <Link href="/jobs/post" className="text-sm font-medium transition-colors hover:text-rausch" style={{ color: 'var(--color-text-secondary)' }}>
                Post a Job
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isLoggedIn ? (
              <>
                {user?.role === 'artisan' && bidsRemaining !== null && (
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      bidsRemaining < 3 ? 'text-red-500' : bidsRemaining < 5 ? 'text-orange-500' : ''
                    }`}
                    style={bidsRemaining >= 5 ? { color: 'var(--color-text-secondary)' } : {}}
                  >
                    Bids: {bidsRemaining}
                  </Link>
                )}
                <Link href="/dashboard" className="text-sm font-medium hidden sm:block transition-colors hover:text-rausch" style={{ color: 'var(--color-text-secondary)' }}>
                  Dashboard
                </Link>
                <Link href="/profile/edit" className="text-sm font-medium hidden sm:block transition-colors hover:text-rausch" style={{ color: 'var(--color-text-secondary)' }}>
                  Profile
                </Link>
                <span className="text-sm hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium transition-colors hover:text-rausch" style={{ color: 'var(--color-text-secondary)' }}
                >
                  Logout
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)' }}
                >
                  Login / Register
                </Link>
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            {user?.role === 'artisan' ? (
              <Link href="/jobs" className="block px-2 py-2 text-sm rounded" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)' }}>Find Jobs</Link>
            ) : (
              <Link href="/search" className="block px-2 py-2 text-sm rounded" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)' }}>Find Artisans</Link>
            )}
            {isLoggedIn && (
              <Link href="/dashboard" className="block px-2 py-2 text-sm rounded" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)' }}>Dashboard</Link>
            )}
            {user?.role === 'client' && (
              <Link href="/jobs/post" className="block px-2 py-2 text-sm rounded" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)' }}>Post a Job</Link>
            )}
            {isLoggedIn && (
              <>
                <Link href="/profile/edit" className="block px-2 py-2 text-sm rounded" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)' }}>Profile</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-2 py-2 text-sm rounded" style={{ color: 'var(--color-text-secondary)' }}>Logout</button>
              </>
            )}
            {!isLoggedIn && (
              <Link href="/auth" className="block px-2 py-2 text-sm rounded" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)' }}>Login / Register</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
