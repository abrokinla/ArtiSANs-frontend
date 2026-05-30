'use client';

import { getCategories, searchArtisans, getJobs } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredArtisans, setFeaturedArtisans] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : cats.results || []);

        // Get some featured artisans
        const artisans = await searchArtisans({ min_rating: 4 });
        const artisanList = Array.isArray(artisans) ? artisans : artisans.results || [];
        setFeaturedArtisans(artisanList.slice(0, 6));

        // Get featured jobs (open/bidding)
        const jobs = await getJobs({ status: 'bidding' });
        const jobList = Array.isArray(jobs) ? jobs : jobs.results || [];
        setFeaturedJobs(jobList.slice(0, 6));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-[#1a1a2e]">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-24 md:py-32"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/50" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <h1 className="text-display mb-6 text-white">
            Find Trusted Local Artisans in Nigeria
          </h1>
          <p className="text-feature text-gray-200 mb-10 max-w-2xl mx-auto">
            Connect with verified professionals in your area. Quality work, trusted hands.
          </p>

          {/* Search Bar */}
          <div className="search-bar max-w-2xl mx-auto mb-8">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="What service do you need?"
              className="flex-1"
            />
            <input
              type="text"
              placeholder="Your location"
              className="flex-1"
            />
            <button aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <p className="text-caption text-gray-300">
            Popular: Plumbing, Electrical, Carpentry, Painting, Tiling
          </p>
        </div>
      </section>

      {/* Brand Mission */}
      <section className="py-16 bg-white dark:bg-[#1a1a2e] border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-2xl font-bold mb-3">
            ArtiSANs
            <span className="text-gray-500 dark:text-gray-400 text-lg font-normal ml-2">
              — Artisans Support Access Network
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 italic leading-relaxed">
            “Connecting skilled artisans to opportunities, customers, and growth.”
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-bg-tertiary dark:bg-[#16213e]">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Popular Services</h2>
          {loading ? (
            <div className="text-center text-text-secondary dark:text-text-secondary-dark">Loading...</div>
          ) : (
            <div className="grid-cards">
              {categories.map((cat) => (
                <Link href={`/search?category=${cat.id}`} key={cat.id}>
                  <div className="card cursor-pointer">
                    <div className="card-body">
                      <h3 className="card-title mb-2">{cat.name}</h3>
                      <p className="card-subtitle mb-4 line-clamp-2">{cat.description}</p>
                      <span className="text-rausch text-sm font-medium hover:underline">
                        Browse {cat.name} →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="section">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Featured Jobs</h2>
          {loading ? (
            <div className="text-center text-text-secondary dark:text-text-secondary-dark">Loading...</div>
          ) : (
            <div className="grid-cards">
              {featuredJobs.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id}>
                  <div className="card cursor-pointer">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="card-title text-base flex-1 mr-2">{job.title}</h3>
                        <span className="badge badge-info flex-shrink-0">
                          {job.status}
                        </span>
                      </div>
                      <p className="card-subtitle mb-4 line-clamp-2">{job.description}</p>
                      <div className="flex items-center justify-between text-caption text-text-secondary dark:text-text-secondary-dark mb-3">
                        <span>{job.category_name}</span>
                        <span>{job.lga_name ? `${job.lga_name}, ${job.state_name}` : job.location}</span>
                      </div>
                      {job.budget && (
                        <div className="font-semibold text-text-primary dark:text-text-primary-dark">
                          Budget: ₦{job.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link href="/jobs" className="btn-secondary">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artisans Section */}
      <section className="section bg-bg-tertiary dark:bg-[#16213e]">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Featured Artisans</h2>
          {loading ? (
            <div className="text-center text-text-secondary dark:text-text-secondary-dark">Loading...</div>
          ) : (
            <div className="grid-cards">
              {featuredArtisans.map((artisan) => (
                <Link href={`/artisans/${artisan.id}`} key={artisan.id}>
                  <div className="card cursor-pointer">
                    <div className="card-body">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-bg-secondary rounded-full mr-4 flex items-center justify-center text-text-secondary dark:text-text-secondary-dark font-semibold">
                          {artisan.first_name?.[0]}{artisan.last_name?.[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">{artisan.first_name} {artisan.last_name}</h3>
                          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{artisan.lga_name ? `${artisan.lga_name}, ${artisan.state_name}` : artisan.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-3">
                        <span className="text-rausch mr-1">★</span>
                        <span className="text-sm font-medium">{artisan.average_rating?.toFixed(1) || 'New'}</span>
                        <span className="text-sm text-text-secondary dark:text-text-secondary-dark ml-1">
                          ({artisan.review_count || 0} reviews)
                        </span>
                      </div>
                      {artisan.is_verified && (
                        <span className="badge badge-success">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link href="/search" className="btn-secondary">
              Find Artisans
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-white dark:bg-[#1a1a2e] border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-display mb-4 text-text-primary dark:text-text-primary-dark">Ready to get started?</h2>
          <p className="text-feature text-text-secondary dark:text-text-secondary-dark mb-10">
            Join thousands of satisfied customers and skilled artisans on ArtiSANs NG
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="btn-primary">
              Find an Artisan
            </Link>
            <Link href="/auth" className="btn-rausch">
              Join as Artisan
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
