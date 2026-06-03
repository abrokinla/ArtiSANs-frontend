'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getArtisanProfilePublic, createOffer, getCategories } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function CreateOfferForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, authInitialized } = useAuth();
  const artisanId = searchParams.get('artisan');

  const [artisan, setArtisan] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    proposed_amount: '',
    client_message: '',
  });

  useEffect(() => {
    if (!authInitialized) return;
    if (!token || user?.role !== 'client') {
      router.push('/auth');
      return;
    }
    if (!artisanId) {
      router.push('/search');
      return;
    }
    const artisanIdValue = artisanId;
    async function load() {
      try {
        const [artisanData, cats] = await Promise.all([
          getArtisanProfilePublic(artisanIdValue),
          getCategories(),
        ]);
        setArtisan(artisanData);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setError('Artisan not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authInitialized, artisanId, token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(form.proposed_amount);
    if (!amount || amount < 1000) {
      setError('Minimum offer is ₦1,000');
      return;
    }
    if (!form.title.trim()) {
      setError('Job title is required');
      return;
    }

    setSaving(true);
    try {
      await createOffer({
        artisan: parseInt(artisanId!),
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category ? parseInt(form.category) : undefined,
        location: form.location.trim(),
        proposed_amount: amount,
        client_message: form.client_message.trim(),
      }, token!);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send offer');
    } finally {
      setSaving(false);
    }
  };

  if (!authInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Artisan not found'}</p>
          <Link href="/search" className="text-blue-600 underline">Back to search</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-8 max-w-md w-full text-center space-y-4">
          <div className="text-green-500 text-5xl">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Offer Sent!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your offer has been sent to <strong>{artisan.first_name || artisan.user?.username}</strong>.
            They will review it and can accept, decline, or send a counter-offer.
          </p>
          <p className="text-sm text-gray-400">You&apos;ll be notified via email when they respond.</p>
          <div className="flex gap-3 justify-center pt-4">
            <Link href="/direct-hire/offers" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              View My Offers
            </Link>
            <Link href={`/artisans/${artisanId}`} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          {artisan.profile_picture_url && (
            <img src={artisan.profile_picture_url} alt="" className="w-16 h-16 rounded-full object-cover" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Send Offer</h1>
            <p className="text-gray-500 dark:text-gray-400">
              To: <strong>{artisan.first_name || artisan.user?.username}</strong>
              {artisan.categories?.length > 0 && ` — ${artisan.categories.map((c: any) => c.name).join(', ')}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Fix bathroom plumbing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe the work you need done..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Lagos, Ikeja"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Offer (₦) *</label>
            <input
              type="number"
              required
              min={1000}
              step={100}
              value={form.proposed_amount}
              onChange={(e) => setForm({ ...form, proposed_amount: e.target.value })}
              placeholder="e.g. 15000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum: ₦1,000. No payment is taken until the artisan accepts.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message to {artisan.first_name || 'Artisan'}</label>
            <textarea
              value={form.client_message}
              onChange={(e) => setForm({ ...form, client_message: e.target.value })}
              rows={3}
              placeholder="Optional: Add a personal note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Sending...' : 'Send Offer'}
            </button>
            <Link
              href={`/artisans/${artisanId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateOfferPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <CreateOfferForm />
    </Suspense>
  );
}
