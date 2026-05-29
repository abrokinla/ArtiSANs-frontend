'use client';

import { useState, useEffect } from 'react';
import { getJobs, getMyProfile, getMyArtisanProfile } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [artisanCategoryIds, setArtisanCategoryIds] = useState<number[]>([]);
  const [artisanStateId, setArtisanStateId] = useState<number | null>(null);
  const [canTravel, setCanTravel] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    async function loadJobs() {
      try {
        let artisanState: number | null = null;
        let artisanCanTravel = false;
        const categoryIds: number[] = [];

        if (user?.role === 'artisan' && token) {
          const [profile, artisan] = await Promise.all([
            getMyProfile(token),
            getMyArtisanProfile(token),
          ]);
          artisanState = profile.state || null;
          artisanCanTravel = artisan.can_travel || false;
          if (artisan.categories) {
            categoryIds.push(...artisan.categories.map((c: any) => c.id));
          }
        }

        setArtisanStateId(artisanState);
        setCanTravel(artisanCanTravel);
        setArtisanCategoryIds(categoryIds);

        const params: { status: string; state?: number } = { status: 'bidding' };
        if (categoryIds.length > 0 && !artisanCanTravel && artisanState) {
          params.state = artisanState;
        }

        const data = await getJobs(params);
        const jobList = Array.isArray(data) ? data : data.results || [];
        setJobs(jobList);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [user?.id, user?.role, token]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (user?.role === 'artisan' && artisanCategoryIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Available Jobs</h1>
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-8 max-w-md mx-auto">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Complete your profile to find jobs matching your expertise.
            </p>
            <Link
              href="/profile/edit"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredJobs = showAll
    ? jobs
    : jobs.filter((job) => job.category && artisanCategoryIds.includes(job.category));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Available Jobs</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {artisanCategoryIds.length > 0 && !canTravel && artisanStateId
            ? 'Jobs in your state matching your expertise'
            : 'Browse jobs open for bidding from clients'}
        </p>

        {artisanCategoryIds.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                showAll
                  ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {showAll
                ? 'Showing all jobs — Show only matching'
                : `Showing jobs matching your expertise (${filteredJobs.length})`}
            </button>
          </div>
        )}

        {filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {artisanCategoryIds.length > 0 && !showAll
                ? 'No jobs match your expertise categories right now. Try widening your search.'
                : 'No jobs available right now. Check back later.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job: any) => {
              const matchesExpertise = artisanCategoryIds.length > 0 && job.category && artisanCategoryIds.includes(job.category);
              return (
                <Link href={`/jobs/${job.id}`} key={job.id}>
                  <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{job.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {matchesExpertise && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-medium">
                            Matches your expertise
                          </span>
                        )}
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-medium">
                          {job.status}
                        </span>
                      </div>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
