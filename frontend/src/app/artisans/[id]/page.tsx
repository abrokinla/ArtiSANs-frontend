'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getArtisanProfilePublic } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ArtisanProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) {
    return <div className="p-8 text-center">Invalid artisan ID</div>;
  }
  const [artisan, setArtisan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getArtisanProfilePublic(id as string);
        setArtisan(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id]);

  const handleHire = () => {
    if (!token) {
      router.push('/auth');
      return;
    }
    router.push(`/jobs/post?artisan=${id}`);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!artisan) return <div className="text-center py-12">Artisan not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 mb-6 dark:border dark:border-gray-700">
                  <div className="flex items-start mb-6">
                  {artisan.profile_picture_url ? (
                    <img
                      src={artisan.profile_picture_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover mr-6"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full mr-6 flex-shrink-0"></div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">
                      {artisan.first_name} {artisan.last_name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {artisan.lga_name ? `${artisan.lga_name}, ${artisan.state_name}` : artisan.location || 'Location not set'}
                    </p>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500 text-xl mr-1">★</span>
                      <span className="font-medium text-lg">{artisan.average_rating ? artisan.average_rating.toFixed(1) : '0.0'}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">({artisan.reviews_count || 0} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {artisan.is_verified && (
                        <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                          ✓ Verified Artisan
                        </span>
                      )}
                      {artisan.can_travel && (
                        <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                          🌍 Willing to Travel
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-gray-700 dark:text-gray-300">{artisan.bio || 'No bio provided.'}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {artisan.categories && artisan.categories.map((cat: any, idx: number) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full">
                      {cat.name || cat}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Portfolio Section */}
              {artisan.portfolio_images?.length > 0 && (
                <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 mb-6 dark:border dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4">Previous Work</h2>
                <div className="grid grid-cols-3 gap-3">
                  {artisan.portfolio_images.map((img: any, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={img.url || img}
                        alt={`Portfolio ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 dark:border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              {artisan.reviews && artisan.reviews.length > 0 ? (
                <div className="space-y-4">
                  {artisan.reviews.map((review: any, idx: number) => (
                    <div key={idx} className="border-b dark:border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">{review.reviewer_username}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 sticky top-4 dark:border dark:border-gray-700">
              <button
                onClick={handleHire}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold mb-3"
              >
                Hire {artisan.first_name}
              </button>
              
              <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-3 rounded-lg text-sm cursor-default">
                Hire this artisan to start a conversation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
