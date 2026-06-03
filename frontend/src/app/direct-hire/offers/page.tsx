'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMyOffers } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  countered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function OffersListPage() {
  const { user, token, authInitialized } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authInitialized) return;
    if (!token) { router.push('/auth'); return; }
    async function load() {
      try {
        const data = await getMyOffers(token!);
        setOffers(Array.isArray(data) ? data : (data.results || []));
      } catch (err: any) {
        setError(err.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authInitialized, token, router]);

  if (!authInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Direct Hire Offers</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {user?.role === 'client' ? 'Offers you\'ve sent to artisans' : 'Offers received from clients'}
            </p>
          </div>
          {user?.role === 'client' && (
            <Link
              href="/search"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Find Artisans
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {offers.length === 0 && !error && (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-12 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">No offers yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
              {user?.role === 'client'
                ? 'Send a direct hire offer to an artisan to get started.'
                : 'You haven\'t received any direct hire offers yet.'}
            </p>
            {user?.role === 'client' && (
              <Link href="/search" className="text-blue-600 underline text-sm">Browse artisans</Link>
            )}
          </div>
        )}

        <div className="space-y-3">
          {offers.map((offer) => {
            const otherName = user?.role === 'client' ? offer.artisan_username : offer.client_username;
            const amount = offer.counter_amount || offer.proposed_amount;
            return (
              <Link
                key={offer.id}
                href={`/direct-hire/offers/${offer.id}`}
                className="block bg-white dark:bg-[#1a1a2e] rounded-lg shadow hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {offer.artisan_profile_picture && (
                      <img src={offer.artisan_profile_picture} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{offer.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.role === 'client' ? 'To: ' : 'From: '}{otherName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">₦{amount?.toLocaleString()}</p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[offer.status] || ''}`}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
