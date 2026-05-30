'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getJobPublic, placeBid, getMyProfile, getMyArtisanProfile } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import PlaceBidForm from '@/components/jobs/PlaceBidForm';
import Link from 'next/link';

export default function JobPublicPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, token } = useAuth();

  if (!id) {
    return <div className="p-8 text-center">Invalid job ID</div>;
  }

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidsRemaining, setBidsRemaining] = useState(0);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id, token, user?.id, user?.role]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await getJobPublic(id);
      setJob(jobData);

      if (user?.role === 'artisan' && token) {
        try {
          const profile = await getMyProfile(token);
          setBidsRemaining(profile.bids_remaining || 0);
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (data: { amount: number; message: string; estimated_days: number; bid_weight: number }) => {
    if (!token || !user || user.role !== 'artisan') return;

    try {
      await placeBid(id, data, token);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to place bid');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!job) return <div className="p-8 text-center">Job not found</div>;

  const isClient = user?.role === 'client';
  const isArtisan = user?.role === 'artisan';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/jobs" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
        ← Back to Jobs
      </Link>

      <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
            <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className={`px-2 py-1 rounded ${
                job.status === 'bidding' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                {job.status?.replace('_', ' ').toUpperCase()}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{job.priority?.toUpperCase()}</span>
              {job.category_name && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                  {job.category_name}
                </span>
              )}
            </div>
          </div>
          {job.budget && (
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₦{Number(job.budget).toLocaleString()}
            </div>
          )}
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">{job.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div>
            <strong>Location:</strong> {job.lga_name ? `${job.lga_name}, ${job.state_name}` : 'Nigeria'}
          </div>
          <div>
            <strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}
          </div>
          <div>
            <strong>Bids:</strong> {job.bids_count || 0}
          </div>
        </div>

        {isClient && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is your job posting.{' '}
            <Link href={`/jobs/${id}/manage`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Manage this job →
            </Link>
          </p>
        )}
      </div>

      {/* Place Bid Section (Artisans only, bidding status) */}
      {isArtisan && job.status === 'bidding' && (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Place a Bid</h2>
          <PlaceBidForm
            jobId={id}
            token={token!}
            bidsRemaining={bidsRemaining}
            onSubmit={handlePlaceBid}
          />
        </div>
      )}

      {isArtisan && job.status !== 'bidding' && (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            This job is not currently accepting bids.
          </p>
        </div>
      )}
    </div>
  );
}
