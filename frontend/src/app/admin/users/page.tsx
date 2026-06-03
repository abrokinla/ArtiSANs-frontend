'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminUsers, adminDeleteUsers } from '@/lib/api';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getAdminUsers(token, { role: roleFilter || undefined, search: search || undefined })
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, roleFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    setSelectedIds(new Set());
    load();
  };

  const toggleAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u: any) => u.id)));
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDelete = async () => {
    if (!token || selectedIds.size === 0) return;
    setDeleting(true);
    setConfirmOpen(false);
    try {
      const res = await adminDeleteUsers([...selectedIds], token);
      const deletedCount = res.deleted?.length || 0;
      setFeedback({ type: 'success', message: `${deletedCount} user${deletedCount === 1 ? '' : 's'} deleted successfully.` });
      setSelectedIds(new Set());
      load();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete users.' });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        {selectedIds.size > 0 && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            feedback.type === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setSelectedIds(new Set()); }}
          className="px-3 py-1.5 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
        >
          <option value="">All Roles</option>
          <option value="client">Client</option>
          <option value="artisan">Artisan</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search username or email..."
          className="flex-1 px-3 py-1.5 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
        />
        <button onClick={handleSearch} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-sm dark:border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700 text-left">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.size === users.length}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">ID</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Username</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Wallet</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Deposited</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Staff</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.id)}
                      onChange={() => toggleOne(u.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      u.role === 'client' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">₦{u.wallet_balance?.toLocaleString()}</td>
                  <td className="px-4 py-3">₦{u.total_deposited?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {u.is_staff ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(u.date_joined).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Users</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{selectedIds.size} user{selectedIds.size === 1 ? '' : 's'}</strong>?
              This will anonymize all personal data and deactivate the account{selectedIds.size === 1 ? '' : 's'}.
              Related records (jobs, bids, messages) will be preserved. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete {selectedIds.size > 1 ? `(${selectedIds.size})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-xl px-6 py-4 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">Deleting users...</span>
          </div>
        </div>
      )}
    </div>
  );
}
