'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminTransactions } from '@/lib/api';

export default function AdminFinancesPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAdminTransactions(token, { type: typeFilter || undefined })
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, typeFilter]);

  const txTypes = ['', 'wallet_credit', 'commission', 'withdrawal', 'wallet_debit'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Finances</h1>

      <div className="mb-4">
        <label className="text-sm text-gray-500 dark:text-gray-400 mr-2">Filter by type:</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
        >
          {txTypes.map((t) => (
            <option key={t} value={t}>{t || 'All'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-sm dark:border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">ID</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Job</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{tx.id}</td>
                  <td className="px-4 py-3">{tx.username}</td>
                  <td className="px-4 py-3 capitalize">{tx.transaction_type.replace(/_/g, ' ')}</td>
                  <td className={`px-4 py-3 font-semibold ${
                    ['wallet_credit'].includes(tx.transaction_type)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    ₦{tx.amount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      tx.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{tx.job_title || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
