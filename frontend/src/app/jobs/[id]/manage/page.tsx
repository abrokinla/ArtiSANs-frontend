'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getJob, getJobBids, acceptBid,
  startJob, completeJob, confirmJobCompletion,
  createReview, getArtisanReviews,
  fundEscrow, verifyEscrow, cancelJob,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import BidList from '@/components/jobs/BidList';
import SubmitReviewForm from '@/components/reviews/SubmitReviewForm';
import ReviewList from '@/components/reviews/ReviewList';
import Link from 'next/link';

  interface Job {
    id: number;
    title: string;
    description: string;
    status: string;
    budget?: number;
    final_amount?: number;
    escrow_amount?: number;
    is_paid?: boolean;
    location: string;
    state_name?: string;
    lga_name?: string;
    priority: string;
    category_name?: string;
    client_username: string;
    artisan_username?: string;
    artisan?: number;
    created_at: string;
    bids_count: number;
  }

export default function JobManagePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, token } = useAuth();

  if (!id) {
    return <div className="p-8 text-center">Invalid job ID</div>;
  }

  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [escrowLoading, setEscrowLoading] = useState(false);

  useEffect(() => {
    if (id && token) {
      loadJob();
    }
  }, [id, token, user?.id, user?.role]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await getJob(id, token!);
      setJob(jobData);

      const isClient = user?.role === 'client' && jobData.client_username === user?.username;
      const isAssignedArtisan = user?.role === 'artisan' && jobData.artisan_username === user?.username;

      if (!isClient && !isAssignedArtisan) {
        setError('You are not authorized to manage this job');
        return;
      }
      
      if (token && (isClient || isAssignedArtisan)) {
        const bidsData = await getJobBids(id, token);
        setBids(bidsData);
      }
      
      if (jobData.status === 'completed' && jobData.artisan) {
        const reviewsData = await getArtisanReviews(jobData.artisan.toString());
        setReviews(reviewsData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleFundEscrow = async () => {
    if (!token) return;
    setEscrowLoading(true);
    try {
      const result = await fundEscrow(id, token);
      if (result.authorization_url && !result.authorization_url.startsWith('/mock')) {
        window.location.href = result.authorization_url;
      } else {
        const verifyResult = await verifyEscrow(id, result.reference, token);
        if (verifyResult.is_paid) {
          alert('Escrow funded successfully! The artisan can now start the job.');
          loadJob();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to fund escrow');
    } finally {
      setEscrowLoading(false);
    }
  };

  const handleCancelJob = async () => {
    if (!token || !user || user.role !== 'client') return;
    if (!confirm('Cancel this job? A 10% cancellation fee will be deducted, and the remaining funds refunded to your wallet.')) return;
    try {
      await cancelJob(id, token);
      alert('Job cancelled. Refund processed.');
      loadJob();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel job');
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    if (!token || !user || user.role !== 'client') return;
    if (!confirm('Accept this bid and assign the job?')) return;
    try {
      const result = await acceptBid(bidId.toString(), token);
      if (result.message?.includes('Escrow funded')) {
        alert('Bid accepted! Escrow is already funded.');
      } else {
        alert('Bid accepted! Fund escrow to proceed.');
      }
      loadJob();
    } catch (err: any) {
      alert(err.message || 'Failed to accept bid');
    }
  };

  const handleStartJob = async () => {
    if (!token || !user || user.role !== 'artisan') return;
    try {
      await startJob(id, token);
      alert('Job started!');
      loadJob();
    } catch (err: any) {
      alert(err.message || 'Failed to start job');
    }
  };

  const handleCompleteJob = async () => {
    if (!token || !user || user.role !== 'artisan') return;
    try {
      await completeJob(id, token);
      alert('Job marked as complete! Awaiting client confirmation.');
      loadJob();
    } catch (err: any) {
      alert(err.message || 'Failed to complete job');
    }
  };

  const handleConfirmCompletion = async () => {
    if (!token || !user || user.role !== 'client') return;
    if (!confirm('Confirm job completion? Payment will be credited to the artisan\'s wallet.')) return;
    try {
      const result = await confirmJobCompletion(id, token);
      alert(`Job completed! ₦${(result.payout || 0).toLocaleString()} credited to artisan wallet. Platform fee: ₦${(result.commission || 0).toLocaleString()}`);
      loadJob();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm completion');
    }
  };

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    if (!token || !user || user.role !== 'client' || !job) return;
    try {
      await createReview({ job: id, rating: data.rating, comment: data.comment }, token);
      alert('Review submitted!');
      loadJob();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!job) return <div className="p-8 text-center">Job not found</div>;

  const isClient = user?.role === 'client' && job.client_username === user?.username;
  const isAssignedArtisan = user?.role === 'artisan' && job.artisan_username === user?.username;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
            <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className={`px-2 py-1 rounded ${
                job.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                job.status === 'awaiting_confirmation' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                job.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                job.status === 'assigned' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                job.status === 'bidding' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                {job.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{job.priority.toUpperCase()}</span>
              {job.category_name && <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">{job.category_name}</span>}
            </div>
          </div>
          {job.budget && (
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₦{job.budget.toLocaleString()}
            </div>
          )}
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">{job.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div>
            <strong>Location:</strong> {job.lga_name ? `${job.lga_name}, ${job.state_name}` : job.location}
          </div>
          <div>
            <strong>Client:</strong> {job.client_username}
          </div>
          {job.artisan_username && (
            <div>
              <strong>Artisan:</strong> {job.artisan_username}
            </div>
          )}
          {job.final_amount && (
            <div>
              <strong>Final Amount:</strong> ₦{job.final_amount.toLocaleString()}
            </div>
          )}
          <div>
            <strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {/* Client: fund escrow */}
          {isClient && job.status === 'assigned' && !job.is_paid && (
            <button onClick={handleFundEscrow} disabled={escrowLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50">
              {escrowLoading ? 'Processing...' : `Fund Escrow (₦${(job.escrow_amount || job.final_amount || 0).toLocaleString()})`}
            </button>
          )}
          {isClient && job.status === 'assigned' && job.is_paid && (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded dark:bg-green-900/30 dark:text-green-300 font-medium">
              ✓ Escrow Funded
            </span>
          )}

          {/* Client: cancel job (unassigned only) */}
          {isClient && ['pending', 'bidding'].includes(job.status) && (
            <button onClick={handleCancelJob}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Cancel Job
            </button>
          )}

          {/* Artisan: start / complete */}
          {isAssignedArtisan && job.status === 'assigned' && job.is_paid && (
            <button onClick={handleStartJob} className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700">
              Start Job
            </button>
          )}
          {isAssignedArtisan && job.status === 'in_progress' && (
            <button onClick={handleCompleteJob} className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700">
              Mark as Complete
            </button>
          )}

          {/* Client: confirm completion */}
          {isClient && job.status === 'awaiting_confirmation' && (
            <button onClick={handleConfirmCompletion} className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
              Confirm & Release Payment
            </button>
          )}

          <Link href={`/jobs/${id}`} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block text-center">
            Public View →
          </Link>
        </div>

        {/* Escrow status info */}
        {job.is_paid && (
          <div className="text-sm text-green-600 dark:text-green-400 mb-4">
            ✓ Escrow of ₦{(job.escrow_amount || job.final_amount || 0).toLocaleString()} has been funded.
          </div>
        )}
        {job.status === 'assigned' && !job.is_paid && isAssignedArtisan && (
          <div className="text-sm text-amber-600 dark:text-amber-400 mb-4">
            ⏳ Awaiting escrow funding from the client before you can start.
          </div>
        )}
        {job.status === 'awaiting_confirmation' && isAssignedArtisan && (
          <div className="text-sm text-amber-600 dark:text-amber-400 mb-4">
            ⏳ You marked this job as complete. Awaiting client confirmation to release payment.
          </div>
        )}
      </div>

      {job.status === 'bidding' && (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bids ({bids.length})</h2>
          <BidList
            bids={bids}
            isClient={isClient}
            jobStatus={job.status}
            onAcceptBid={handleAcceptBid}
          />
        </div>
      )}

      {['completed'].includes(job.status) && (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          {isClient && reviews.length === 0 && (
            <SubmitReviewForm onSubmit={handleSubmitReview} />
          )}
          <ReviewList reviews={reviews} />
        </div>
      )}
    </div>
  );
}
