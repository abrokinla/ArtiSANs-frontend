'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminDashboard } from '@/lib/api';

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getAdminDashboard(token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-red-500">Failed to load dashboard</div>;

  const cards = [
    { label: 'Platform Wallet', value: `₦${data.platform_wallet_balance?.toLocaleString() || '0'}`, color: 'text-green-600 dark:text-green-400' },
    { label: 'Total Deposits', value: `₦${data.total_deposits?.toLocaleString() || '0'}`, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Commissions', value: `₦${data.total_commissions?.toLocaleString() || '0'}`, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Total Payouts', value: `₦${data.total_payouts?.toLocaleString() || '0'}`, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Total Withdrawals', value: `₦${data.total_withdrawals?.toLocaleString() || '0'}`, color: 'text-red-600 dark:text-red-400' },
    { label: 'Escrow Held', value: `₦${data.escrow_held?.toLocaleString() || '0'}`, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Active Jobs', value: data.active_jobs, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Jobs', value: data.total_jobs, color: 'text-gray-600 dark:text-gray-400' },
    { label: 'Active Disputes', value: data.active_disputes, color: 'text-red-600 dark:text-red-400' },
    { label: 'Pending Withdrawals', value: data.pending_withdrawals ?? '—', color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Total Users', value: data.total_users, color: 'text-gray-600 dark:text-gray-400' },
    { label: 'Artisans', value: data.total_artisans, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Clients', value: data.total_clients, color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-sm dark:border dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
