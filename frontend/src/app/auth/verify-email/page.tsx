'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail, resendVerification } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token, login: authLogin } = useAuth();
  const uid = searchParams.get('uid');
  const tokenParam = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!uid || !tokenParam) {
      setStatus('error');
      setError('Invalid verification link.');
      return;
    }

    async function verify() {
      try {
        const data = await verifyEmail(uid!, tokenParam!);
        setStatus('success');

        if (user && token) {
          const updatedUser = { ...user, email_verified: true };
          const refresh = localStorage.getItem('refresh');
          if (refresh) {
            authLogin(token, refresh, updatedUser);
          }
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Verification failed. The link may have expired.');
      }
    }

    verify();
  }, [uid, tokenParam]);

  const handleResend = async () => {
    if (!token) return;
    setResending(true);
    try {
      await resendVerification(token);
      setResent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center space-y-4">
      {status === 'loading' && (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Verifying your email...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <div className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-4 rounded">
            <p className="font-semibold text-lg">Email Verified! 🎉</p>
            <p className="mt-1">Your email has been verified successfully. You can now access all features.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-4 rounded">
            <p className="font-semibold">{error}</p>
          </div>
          {user && (
            <div className="space-y-3">
              {resent ? (
                <div className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-3 rounded text-sm">
                  Verification email sent! Check your inbox.
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}
          <Link
            href={user ? '/dashboard' : '/auth'}
            className="inline-block text-blue-600 dark:text-blue-400 underline text-sm"
          >
            {user ? 'Back to Dashboard' : 'Go to Login'}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1a1a2e] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
