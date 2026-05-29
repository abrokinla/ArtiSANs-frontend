'use client';

import { useState, useEffect } from 'react';
import { searchArtisans, getCategories } from '@/lib/api';
import LocationSelect from '@/components/LocationSelect';
import type { LocationValue } from '@/components/LocationSelect';
import { useRouter } from 'next/navigation';
import { groupCategories } from '@/components/CategorySelect';

export default function SearchPage() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    min_rating: '',
  });
  const [locationValue, setLocationValue] = useState<LocationValue>({
    state_id: null,
    lga_id: null,
  });
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategories();
        setCategories(cats);
        
        // Load initial artisans
        const results = await searchArtisans({});
        setArtisans(results);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (locationValue.state_id) params.state = locationValue.state_id;
      if (locationValue.lga_id) params.lga = locationValue.lga_id;
      if (filters.min_rating) params.min_rating = parseFloat(filters.min_rating);
      
      const results = await searchArtisans(params);
      setArtisans(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
      {/* Search Header */}
      <div className="bg-white dark:bg-[#1a1a2e] shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4 flex-wrap">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
            >
              <option value="">All Categories</option>
              {groupCategories(categories).map((group) => (
                <optgroup key={group.key} label={group.label}>
                  {group.categories.map((cat: any) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            
            <div className="flex-1">
              <LocationSelect
                value={locationValue}
                onChange={setLocationValue}
                label=""
              />
            </div>
            
            <select
              value={filters.min_rating}
              onChange={(e) => setFilters({ ...filters, min_rating: e.target.value })}
              className="px-4 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
            >
              <option value="">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
            
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Available Artisans</h2>
        
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No artisans found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan) => (
              <div
                key={artisan.id}
                onClick={() => router.push(`/artisans/${artisan.id}`)}
                className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 hover:shadow-lg dark:hover:shadow-gray-900/60 transition cursor-pointer"
              >
                <div className="flex items-start mb-4">
                  {artisan.profile_picture_url ? (
                    <img
                      src={artisan.profile_picture_url}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mr-4 flex-shrink-0"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {artisan.first_name} {artisan.last_name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {artisan.lga_name ? `${artisan.lga_name}, ${artisan.state_name}` : artisan.location || 'Location not set'}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {artisan.is_verified && (
                        <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded">
                          Verified ✓
                        </span>
                      )}
                      {artisan.can_travel && (
                        <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded">
                          🌍 Travel
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">{artisan.average_rating.toFixed(1)}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">({artisan.review_count} reviews)</span>
                  {artisan.portfolio_images?.length > 0 && (
                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">📷 {artisan.portfolio_images.length} photos</span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{artisan.bio}</p>
                
                <div className="flex flex-wrap gap-1">
                  {artisan.categories.map((cat: string, idx: number) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
