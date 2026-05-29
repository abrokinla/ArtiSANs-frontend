'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, getMyJobs, getArtisanProfile, uploadPortfolioImage, purchaseBids, verifyNIN } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const BID_PRICING = [
  { quantity: 1, price: 500 },
  { quantity: 5, price: 2000 },
  { quantity: 10, price: 3000 },
  { quantity: 25, price: 5000 },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [artisanProfile, setArtisanProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, token } = useAuth();

  // Portfolio
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // NIN
  const [showNINModal, setShowNINModal] = useState(false);
  const [nin, setNin] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Purchase Bids
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }

    async function loadDashboard() {
      try {
        const profileData = await getMyProfile(token!);
        setProfile(profileData);

        const jobsData = await getMyJobs(token!);
        setJobs(jobsData);

        if (user?.role === 'artisan') {
          const artisanData = await getArtisanProfile(user.id.toString(), token!);
          setArtisanProfile(artisanData);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router, token, user?.id, user?.role]);

  const handlePortfolioUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploadingPortfolio(true);
    try {
      const result = await uploadPortfolioImage(file, token!);
      const updated = await getArtisanProfile(user!.id.toString(), token!);
      setArtisanProfile(updated);
    } catch (err) {
      console.error('Portfolio upload failed:', err);
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handlePortfolioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePortfolioUpload(file);
    if (portfolioInputRef.current) portfolioInputRef.current.value = '';
  };

  const handleVerifyNIN = async () => {
    if (nin.length !== 11) return;
    setVerifying(true);
    try {
      await verifyNIN(nin, token!);
      const updated = await getArtisanProfile(user!.id.toString(), token!);
      setArtisanProfile(updated);
      setShowNINModal(false);
      setNin('');
    } catch (err) {
      console.error('NIN verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handlePurchaseBids = async () => {
    setPurchasing(true);
    try {
      const result = await purchaseBids(selectedQuantity, token!);
      setProfile((prev: any) => ({ ...prev, bids_remaining: result.total_bids }));
      setShowPurchaseModal(false);
    } catch (err) {
      console.error('Purchase failed:', err);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!user) return null;

  const activeJobs = jobs.filter((j: any) => ['assigned', 'in_progress'].includes(j.status));
  const completedJobs = jobs.filter((j: any) => j.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Jobs</h3>
            <p className="text-3xl font-bold">{jobs.length}</p>
          </div>
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Active Jobs</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeJobs.length}</p>
          </div>
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Completed</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedJobs.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            {user.role === 'client' && (
              <button
                onClick={() => router.push('/jobs/post')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800"
              >
                Post a Job
              </button>
            )}
            <button
              onClick={() => router.push('/search')}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 dark:hover:bg-green-800"
            >
              Find Artisans
            </button>
            {user.role === 'artisan' && (
              <button
                onClick={() => router.push('/dashboard/my-bids')}
                className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 dark:hover:bg-purple-800"
              >
                My Bids
              </button>
            )}
            <button
              onClick={() => router.push('/profile/edit')}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Jobs</h2>
          {activeJobs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No active jobs.{' '}
              {user.role === 'client' ? (
                <a href="/jobs/post" className="text-blue-600 dark:text-blue-400">Post a job</a>
              ) : (
                <a href="/jobs" className="text-blue-600 dark:text-blue-400">Find jobs</a>
              )}{' '}
              to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job: any) => (
                <div key={job.id} className="border rounded-lg p-4 dark:border-gray-600 dark:bg-[#1a1a2e] dark:text-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {job.lga_name ? `${job.lga_name}, ${job.state_name}` : job.location}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">{job.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Profile Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.profile_picture_url && (
                <div className="md:col-span-2 flex items-center gap-3">
                  <img
                    src={profile.profile_picture_url}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Phone</p>
                <p className="font-medium">{profile.phone_number}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Location</p>
                <p className="font-medium">
                  {profile.lga_name ? `${profile.lga_name}, ${profile.state_name}` : profile.location || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Subscription</p>
                <p className="font-medium capitalize">{profile.subscription_tier}</p>
              </div>
              {user.role === 'artisan' && (
                <>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Bids Remaining</p>
                    <p className="font-medium">{profile.bids_remaining}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">NIN Verification</p>
                    <p className="font-medium">
                      {artisanProfile?.is_verified || profile.is_verified ? (
                        <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                      ) : (
                        <span className="text-red-500">Not Verified</span>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
            {user.role === 'artisan' && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {!artisanProfile?.is_verified && !profile.is_verified && (
                  <button
                    onClick={() => setShowNINModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 dark:hover:bg-indigo-800"
                  >
                    Verify with NIN
                  </button>
                )}
                {(profile.bids_remaining < 5) && (
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="px-4 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 dark:hover:bg-amber-800"
                  >
                    Buy Bids
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* My Portfolio Section (Artisan only) */}
        {user.role === 'artisan' && (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Portfolio</h2>
              <div>
                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePortfolioFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => portfolioInputRef.current?.click()}
                  disabled={uploadingPortfolio}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 dark:hover:bg-blue-800"
                >
                  {uploadingPortfolio ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>
            {artisanProfile?.portfolio_images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {artisanProfile.portfolio_images.map((img: any, idx: number) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={img.url || img}
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No portfolio images yet. Upload your work to showcase your skills.</p>
            )}
          </div>
        )}
      </div>

      {/* NIN Verification Modal */}
      {showNINModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Verify with NIN</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter your 11-digit National Identification Number (NIN) to verify your identity.</p>
            <input
              type="text"
              value={nin}
              onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="Enter 11-digit NIN"
              maxLength={11}
              className="w-full px-3 py-2 border rounded-lg mb-4 dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowNINModal(false); setNin(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyNIN}
                disabled={nin.length !== 11 || verifying}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 dark:hover:bg-indigo-800"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Bids Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Purchase Bids</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose a bid package to increase your bidding power.</p>
            <div className="space-y-2 mb-6">
              {BID_PRICING.map((option) => (
                <label
                  key={option.quantity}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                    selectedQuantity === option.quantity ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="bidQuantity"
                      checked={selectedQuantity === option.quantity}
                      onChange={() => setSelectedQuantity(option.quantity)}
                      className="accent-blue-600"
                    />
                    <span className="font-medium">{option.quantity} bid{option.quantity > 1 ? 's' : ''}</span>
                  </div>
                  <span className="font-bold text-lg">₦{option.price.toLocaleString()}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchaseBids}
                disabled={purchasing}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 dark:hover:bg-amber-800"
              >
                {purchasing ? 'Processing...' : `Pay ₦${BID_PRICING.find(o => o.quantity === selectedQuantity)?.price.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
