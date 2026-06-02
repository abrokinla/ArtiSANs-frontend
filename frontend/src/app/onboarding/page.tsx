'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, updateMyProfile, getMyArtisanProfile, updateArtisanProfile, getCategories } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import LocationSelect, { LocationValue } from '@/components/LocationSelect';
import CategorySelect from '@/components/CategorySelect';
import ProgressSteps from '@/components/ProgressSteps';

const STEPS = [
  { label: 'Profile' },
  { label: 'Skills' },
  { label: 'Review' },
];

export default function OnboardingPage() {
  const { user, token, authInitialized } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [allCategories, setAllCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    location: '',
  });
  const [locationValue, setLocationValue] = useState<LocationValue>({
    state_id: null,
    lga_id: null,
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  useEffect(() => {
    if (!authInitialized) return;
    if (!token || !user) {
      router.push('/auth');
      return;
    }

    async function load() {
      try {
        const profile = await getMyProfile(token);
        if (profile.has_completed_onboarding) {
          router.push('/dashboard');
          return;
        }
        setFormData({
          first_name: profile.first_name || user.first_name || '',
          last_name: profile.last_name || user.last_name || '',
          phone_number: profile.phone_number || '',
          location: profile.location || '',
        });
        if (profile.state) {
          setLocationValue({
            state_id: profile.state,
            lga_id: profile.lga || null,
          });
        }
        if (user.role === 'artisan') {
          const artisan = await getMyArtisanProfile(token);
          setSelectedCategories(artisan.categories?.map((c: any) => c.id) || []);
        }
        const cats = await getCategories();
        setAllCategories(cats);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authInitialized, token, user, router]);

  const canContinueStep0 = formData.first_name && formData.last_name && formData.phone_number;
  const canContinueStep1 = user?.role !== 'artisan' || selectedCategories.length > 0;

  const handleNext = () => {
    if (step === 0 && !canContinueStep0) return;
    if (step === 1 && !canContinueStep1) return;
    setStep(Math.min(step + 1, STEPS.length - 1));
  };

  const handleComplete = async () => {
    setSaving(true);
    setError('');
    try {
      const profilePayload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        location: formData.location || `${locationValue.lga_name || ''}, ${locationValue.state_name || ''}`,
        has_completed_onboarding: true,
      };
      if (locationValue.state_id) profilePayload.state = locationValue.state_id;
      if (locationValue.lga_id) profilePayload.lga = locationValue.lga_id;
      await updateMyProfile(profilePayload, token!);

      if (user?.role === 'artisan' && selectedCategories.length > 0) {
        await updateArtisanProfile({ category_ids: selectedCategories }, token!);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!authInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f23]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          Welcome to ArtiSANs
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Let&apos;s set up your profile</p>

        <ProgressSteps steps={STEPS} current={step} />

        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <LocationSelect value={locationValue} onChange={setLocationValue} />
            </div>
          )}

          {step === 1 && user?.role === 'artisan' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Skills</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select up to 3 categories that describe your skills.
              </p>
              <CategorySelect
                categories={allCategories}
                value={selectedCategories}
                onChange={setSelectedCategories}
                max={3}
              />
            </div>
          )}

          {step === 1 && user?.role !== 'artisan' && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                As a client, you&apos;re all set! You can start posting jobs and hiring artisans.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Review &amp; Confirm</h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Name:</span> {formData.first_name} {formData.last_name}</p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span> {formData.phone_number}</p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Location:</span> {locationValue.lga_name || '—'}, {locationValue.state_name || '—'}</p>
                {user?.role === 'artisan' && (
                  <p><span className="font-medium text-gray-700 dark:text-gray-300">Skills:</span> {selectedCategories.length} categories</p>
                )}
              </div>
              <p className="text-xs text-gray-400">You can always update these later from your profile settings.</p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={(step === 0 && !canContinueStep0) || (step === 1 && !canContinueStep1)}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
