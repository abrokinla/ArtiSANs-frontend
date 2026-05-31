'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminUsers } from '@/lib/api';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    getAdminUsers(token, { role: roleFilter || undefined, search: search || undefined })
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token, roleFilter]);
  const handleSearch = () => load();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Users</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
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
                <tr key={u.id} className="border-b dark:border-gray-700 last:border-0">
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
    </div>
  );
}
