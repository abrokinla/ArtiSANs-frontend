'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getArtisanProfile } from '@/lib/api';

const STORAGE_KEY = 'profile-banner-dismissed';

export default function ProfileCompletionBanner() {
  const { user, token } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setDismissed(true);
        return;
      }
    }

    if (!token || user?.role !== 'artisan') return;

    let cancelled = false;
    getArtisanProfile(user!.id.toString(), token)
      .then((data) => {
        if (!cancelled && (!data.categories || data.categories.length === 0)) {
          setVisible(true);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [token, user?.id, user?.role]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (dismissed || !visible) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Complete your profile to start bidding —{' '}
          <Link
            href="/profile/edit"
            className="font-semibold underline hover:no-underline"
          >
            Add your skills
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 ml-4 flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
