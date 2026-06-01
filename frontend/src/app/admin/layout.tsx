'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, authInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authInitialized) return;
    if (!token || !user?.is_staff) {
      router.push('/');
    }
  }, [authInitialized, token, user, router]);

  if (!authInitialized) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!token || !user?.is_staff) return null;

  const navItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/finances', label: 'Finances', icon: '💰' },
    { href: '/admin/deposits', label: 'Deposits', icon: '🏦' },
    { href: '/admin/disputes', label: 'Disputes', icon: '⚖️' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/jobs', label: 'Jobs', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex">
      <aside className="w-56 bg-white dark:bg-[#1a1a2e] border-r dark:border-gray-700 min-h-screen flex-shrink-0">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user.username}</p>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
