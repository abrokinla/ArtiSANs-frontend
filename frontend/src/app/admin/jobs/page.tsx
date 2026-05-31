'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminJobs } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  bidding: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  assigned: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  awaiting_confirmation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  disputed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function AdminJobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAdminJobs(token, { status: statusFilter || undefined })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, statusFilter]);

  const statuses = ['', ...Object.keys(STATUS_COLORS)];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Jobs</h1>

      <div className="mb-4">
        <label className="text-sm text-gray-500 dark:text-gray-400 mr-2">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s || 'All'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">No jobs found.</p>
      ) : (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-sm dark:border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">ID</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Client</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Artisan</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Budget</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Escrow</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Commission</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j: any) => (
                <tr key={j.id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{j.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{j.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[j.status] || ''}`}>
                      {j.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{j.client_username}</td>
                  <td className="px-4 py-3">{j.artisan_username || '-'}</td>
                  <td className="px-4 py-3">
                    {j.budget ? `₦${j.budget.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {j.escrow_amount ? `₦${j.escrow_amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {j.commission_amount ? `₦${j.commission_amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(j.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
