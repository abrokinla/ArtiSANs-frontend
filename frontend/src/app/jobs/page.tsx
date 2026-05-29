'use client';

import { useState, useEffect } from 'react';
import { getJobs } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getJobs({ status: 'bidding' });
        const jobList = Array.isArray(data) ? data : data.results || [];
        setJobs(jobList);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Available Jobs</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Browse jobs open for bidding from clients</p>

        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No jobs available right now. Check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <Link href={`/jobs/${job.id}`} key={job.id}>
                <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{job.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-medium">
                      {job.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {job.category_name && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{job.category_name}</span>
                    )}
                    <span>{job.lga_name ? `${job.lga_name}, ${job.state_name}` : job.location}</span>
                    {job.budget && <span>Budget: ₦{job.budget.toLocaleString()}</span>}
                    <span>{job.bids_count || 0} bid(s)</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
