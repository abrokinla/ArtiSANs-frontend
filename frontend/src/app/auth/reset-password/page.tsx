'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams?.get('uid');
  const token = searchParams?.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!uid || !token) {
      setError('Invalid reset link.');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset({ uid, token, new_password: newPassword });
      router.push('/auth?reset=success');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-red-50 text-red-600 p-4 rounded">
          Invalid or missing reset link. Please request a new password reset.
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 underline"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm New Password
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm dark:shadow-gray-900/50 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          Reset Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1a1a2e] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
