'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAccount } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DeleteAccountPage() {
  const { token, logout, authInitialized } = useAuth();
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f23]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!token) {
    router.push('/auth');
    return null;
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await deleteAccount(reason, token);
      logout();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="Tell us why you're leaving..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || confirm !== 'DELETE'}
              className="w-full py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete My Account'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/edit')}
              className="w-full py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
