'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { register, login } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import PasswordStrength from '@/components/PasswordStrength';

function AuthForm() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams?.get('reset') === 'success';

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client' as 'client' | 'artisan',
    phone_number: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login({
          username: formData.username,
          password: formData.password,
        });
        authLogin(data.access, data.refresh, data.user);
        router.push('/dashboard');
      } else {
        if (formData.password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (!termsAccepted) {
          setError('You must accept the Terms and Conditions to register.');
          setLoading(false);
          return;
        }
        const data = await register({ ...formData, terms_accepted: true });
        authLogin(data.access, data.refresh, data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1a1a2e] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => { setIsLogin(true); setConfirmPassword(''); }}
              className={`flex-1 py-2 rounded ${isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setConfirmPassword(''); }}
              className={`flex-1 py-2 rounded ${!isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Register
            </button>
          </div>

          {resetSuccess && (
            <div className="bg-green-50 text-green-700 p-4 rounded mb-4">
              Password reset successful. You can now sign in with your new password.
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    I am a:
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'artisan' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="client">Client (looking for artisans)</option>
                    <option value="artisan">Artisan (offering services)</option>
                  </select>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                    I accept the{' '}
                    <Link href="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {!isLogin && <PasswordStrength password={formData.password} />}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            )}

            {isLogin && (
              <div className="text-sm text-right">
                <Link href="/auth/forgot-password" className="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm dark:shadow-gray-900/50 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
