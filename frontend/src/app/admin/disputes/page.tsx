'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminDisputes } from '@/lib/api';

export default function AdminDisputesPage() {
  const { token } = useAuth();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAdminDisputes(token, { status: statusFilter || undefined })
      .then(setDisputes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, statusFilter]);

  const statuses = ['', 'pending', 'under_review', 'resolved'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Disputes</h1>

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
      ) : disputes.length === 0 ? (
        <p className="text-gray-500">No disputes found.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((d: any) => (
            <div key={d.id} className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-sm dark:border dark:border-gray-700 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{d.job_title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Job #{d.job_id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  d.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  d.status === 'under_review' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {d.status_display}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Raised by:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-white">{d.raised_by_username}</span>
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                    d.raised_by_role === 'client' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {d.raised_by_role}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Reason:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-white">{d.reason_display}</span>
                </div>
              </div>
              {d.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {d.description}
                </p>
              )}
              {d.resolution_notes && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Resolution: {d.resolution_notes}
                </p>
              )}
              <div className="text-xs text-gray-400 mt-2">
                {new Date(d.created_at).toLocaleString()}
                {d.resolved_by_username && ` • Resolved by ${d.resolved_by_username}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
