'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyBids } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Bid {
  id: number;
  job: number;
  artisan_username: string;
  amount: number;
  message: string;
  estimated_days: number;
  is_accepted: boolean;
  created_at: string;
  job_title?: string;
}

export default function MyBidsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'artisan') {
      router.push('/auth');
      return;
    }
    loadBids();
  }, [user, token]);

  const loadBids = async () => {
    try {
      setLoading(true);
      const data = await getMyBids(token!);
      setBids(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block dark:text-blue-400">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">My Bids</h1>

      {bids.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center dark:bg-[#1a1a2e] dark:shadow-gray-900/60">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't placed any bids yet.</p>
          <Link 
            href="/search" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block dark:hover:bg-blue-800"
          >
            Find Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white rounded-lg shadow-md p-6 dark:bg-[#1a1a2e] dark:shadow-gray-900/60">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Link 
                    href={`/jobs/${bid.job}`}
                    className="text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Job #{bid.job}
                  </Link>
                  {bid.job_title && (
                    <div className="text-gray-700 dark:text-gray-300 mt-1">{bid.job_title}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    ₦{bid.amount.toLocaleString()}
                  </div>
                  {bid.is_accepted && (
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded dark:bg-green-900/30 dark:text-green-300">
                      Accepted
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-3">{bid.message}</p>

              <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Estimated: {bid.estimated_days} day(s)</span>
                <span>•</span>
                <span>Placed: {new Date(bid.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
