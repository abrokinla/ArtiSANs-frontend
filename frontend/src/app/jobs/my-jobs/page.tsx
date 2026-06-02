'use client';

import { useState, useEffect } from 'react';
import { getMyJobs, startJob, completeJob } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user, token, authInitialized } = useAuth();

  useEffect(() => {
    if (!authInitialized) return;
    if (!token || !user || user.role !== 'artisan') return;

    async function load() {
      try {
        const data = await getMyJobs(token);
        const list = Array.isArray(data) ? data : data.results || [];
        setJobs(list.filter((j: any) => !['pending', 'bidding'].includes(j.status)));
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authInitialized, token, user]);

  const activeJobs = jobs.filter((j: any) => ['assigned', 'in_progress'].includes(j.status));
  const awaitingJobs = jobs.filter((j: any) => j.status === 'awaiting_confirmation');
  const completedJobs = jobs.filter((j: any) => j.status === 'completed');
  const disputedJobs = jobs.filter((j: any) => j.status === 'disputed');
  const cancelledJobs = jobs.filter((j: any) => j.status === 'cancelled');

  const handleStartJob = async (jobId: string) => {
    if (!token) return;
    setActionLoading(`start_${jobId}`);
    try {
      await startJob(jobId, token);
      const data = await getMyJobs(token);
      const list = Array.isArray(data) ? data : data.results || [];
      setJobs(list.filter((j: any) => !['pending', 'bidding'].includes(j.status)));
    } catch (err) {
      console.error('Failed to start job:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    if (!token) return;
    setActionLoading(`complete_${jobId}`);
    try {
      await completeJob(jobId, token);
      const data = await getMyJobs(token);
      const list = Array.isArray(data) ? data : data.results || [];
      setJobs(list.filter((j: any) => !['pending', 'bidding'].includes(j.status)));
    } catch (err) {
      console.error('Failed to complete job:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!authInitialized || loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!token || !user || user.role !== 'artisan') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-500">Only artisans can view this page.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Jobs</h1>

        {/* In Progress */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2" />
            In Progress ({activeJobs.length})
          </h2>
          {activeJobs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No active jobs.{' '}
              <a href="/jobs" className="text-blue-600 dark:text-blue-400">Find jobs to bid on</a>
            </p>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job: any) => {
                const isLoading = actionLoading === `start_${job.id}` || actionLoading === `complete_${job.id}`;
                return (
                  <div key={job.id} className="border rounded-lg p-4 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/jobs/${job.id}/manage`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          {job.title}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {job.lga_name ? `${job.lga_name}, ${job.state_name}` : job.location} • {new Date(job.created_at).toLocaleDateString()}
                        </p>
                        {job.client_username && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            <span className="font-medium">Client:</span> {job.client_username}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {job.budget && (
                          <span className="font-bold text-green-600 dark:text-green-400">₦{job.budget.toLocaleString()}</span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          job.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}>
                          {job.status === 'in_progress' ? 'IN PROGRESS' : 'ASSIGNED'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {job.status === 'assigned' && (
                        <button
                          onClick={() => handleStartJob(job.id)}
                          disabled={isLoading}
                          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isLoading ? 'Starting...' : 'Start Job'}
                        </button>
                      )}
                      {job.status === 'in_progress' && (
                        <button
                          onClick={() => handleCompleteJob(job.id)}
                          disabled={isLoading}
                          className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {isLoading ? 'Completing...' : 'Mark Complete'}
                        </button>
                      )}
                      {['in_progress', 'awaiting_confirmation'].includes(job.status) && (
                        <Link
                          href={`/jobs/${job.id}/manage`}
                          className="px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 inline-block"
                        >
                          Raise Dispute
                        </Link>
                      )}
                      <Link
                        href={`/jobs/${job.id}/manage`}
                        className="px-4 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Awaiting Confirmation */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2" />
            Awaiting Confirmation ({awaitingJobs.length})
          </h2>
          {awaitingJobs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No jobs awaiting confirmation.</p>
          ) : (
            <div className="space-y-4">
              {awaitingJobs.map((job: any) => (
                <div key={job.id} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/jobs/${job.id}/manage`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        {job.title}
                      </Link>
                      {job.final_amount && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Final: <span className="font-bold text-green-600 dark:text-green-400">₦{job.final_amount.toLocaleString()}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Awaiting client confirmation.
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-sm rounded-full">
                      Awaiting Confirmation
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2" />
            Completed ({completedJobs.length})
          </h2>
          {completedJobs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No completed jobs yet.</p>
          ) : (
            <div className="space-y-4">
              {completedJobs.map((job: any) => (
                <div key={job.id} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/jobs/${job.id}/manage`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        {job.title}
                      </Link>
                      {job.final_amount && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Final: <span className="font-bold text-green-600 dark:text-green-400">₦{job.final_amount.toLocaleString()}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Completed: {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/jobs/${job.id}/manage`}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disputed & Cancelled */}
        {(disputedJobs.length > 0 || cancelledJobs.length > 0) && (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              <span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-2" />
              Other ({disputedJobs.length + cancelledJobs.length})
            </h2>
            <div className="space-y-4">
              {[...disputedJobs, ...cancelledJobs].map((job: any) => (
                <div key={job.id} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/jobs/${job.id}/manage`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        {job.title}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{job.status}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      job.status === 'disputed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
