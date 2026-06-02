'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMyProfile, updateMyProfile, updateArtisanProfile, getMyArtisanProfile, uploadProfileImage, uploadPortfolioImage, getCategories } from '@/lib/api';
import LocationSelect from '@/components/LocationSelect';
import type { LocationValue } from '@/components/LocationSelect';
import CategorySelect from '@/components/CategorySelect';
import Link from 'next/link';

export default function EditProfilePage() {
  const { isLoggedIn, user, authInitialized } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Portfolio upload state
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [formData, setFormData] = useState({
    // User fields
    first_name: '',
    last_name: '',
    email: '',
    // Profile fields
    phone_number: '',
    location: '',
    bio: '',
    profile_picture_url: '',
    // Artisan-specific fields (if applicable)
    categories: [] as number[],
    experience: '',
    whatsapp: '',
    tel: '',
    is_available: true,
    can_travel: false,
    portfolio_images: [] as { url: string; public_id: string }[],
    available_days: 'Mon,Tue,Wed,Thu,Fri',
    available_hours_start: '08:00',
    available_hours_end: '18:00',
  });

  const [allCategories, setAllCategories] = useState<any[]>([]);

  const [locationValue, setLocationValue] = useState<LocationValue>({
    state_id: null,
    lga_id: null,
    state_name: '',
    lga_name: '',
  });

  // Redirect if not logged in (wait for auth to initialize)
  useEffect(() => {
    if (authInitialized && !isLoggedIn) {
      router.push('/auth');
    }
  }, [authInitialized, isLoggedIn, router]);

  // Fetch profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch profile
        const profile = await getMyProfile(token);
        setFormData(prev => ({
          ...prev,
          // Prefer profile data (fresh from server), fall back to AuthContext user
          first_name: profile.first_name || user?.first_name || '',
          last_name: profile.last_name || user?.last_name || '',
          email: profile.email || user?.email || '',
          phone_number: profile.phone_number || '',
          location: profile.location || '',
          bio: profile.bio || '',
          profile_picture_url: profile.profile_picture_url || '',
        }));
        setLocationValue({
          state_id: profile.state || null,
          lga_id: profile.lga || null,
          state_name: profile.state_name || '',
          lga_name: profile.lga_name || '',
        });

        // If artisan, fetch artisan profile
        if (user.role === 'artisan') {
          const artisan = await getMyArtisanProfile(token);
          setFormData(prev => ({
            ...prev,
            categories: artisan.categories?.map((cat: any) => cat.id) || [],
            experience: artisan.experience || '',
            whatsapp: artisan.whatsapp || '',
            tel: artisan.tel || '',
            is_available: artisan.is_available || true,
            can_travel: artisan.can_travel || false,
            portfolio_images: artisan.portfolio_images || [],
            available_days: artisan.available_days || 'Mon,Tue,Wed,Thu,Fri',
            available_hours_start: artisan.available_hours_start || '08:00',
            available_hours_end: artisan.available_hours_end || '18:00',
          }));
        }

        const cats = await getCategories();
        setAllCategories(Array.isArray(cats) ? cats : cats.results || []);
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoggedIn && user) {
      fetchProfile();
    }
  }, [isLoggedIn, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleUpload = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const result = await uploadProfileImage(file, token);
      setFormData(prev => ({
        ...prev,
        profile_picture_url: result.url,
      }));
      setSuccess('Profile picture uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      profile_picture_url: '',
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Update profile (common fields)
      const profileData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        location: formData.location,
        bio: formData.bio,
        profile_picture_url: formData.profile_picture_url,
      };
      if (locationValue.state_id) profileData.state = locationValue.state_id;
      if (locationValue.lga_id) profileData.lga = locationValue.lga_id;
      await updateMyProfile(profileData, token);

      // If artisan, update artisan profile
      if (user?.role === 'artisan') {
        const artisanData: any = {
          category_ids: formData.categories,
          experience: formData.experience,
          whatsapp: formData.whatsapp,
          tel: formData.tel,
          is_available: formData.is_available,
          can_travel: formData.can_travel,
          portfolio_images: formData.portfolio_images,
          available_days: formData.available_days,
          available_hours_start: formData.available_hours_start,
          available_hours_end: formData.available_hours_end,
        };
        if (locationValue.state_id) artisanData.state = locationValue.state_id;
        if (locationValue.lga_id) artisanData.lga = locationValue.lga_id;
        await updateArtisanProfile(artisanData, token);
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-gray-200">Edit Profile</h1>
          <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-6 space-y-6">
          {/* Profile Picture Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <div className="flex flex-col items-center gap-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Drop zone / Avatar preview */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`
                  relative w-32 h-32 rounded-full overflow-hidden cursor-pointer
                  border-4 transition-all duration-200
                  ${dragActive
                    ? 'border-blue-500 bg-blue-50 scale-105 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-blue-400 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'}
                  ${uploading ? 'opacity-70 pointer-events-none' : ''}
                  shadow-md dark:shadow-gray-900/60
                `}
              >
                {formData.profile_picture_url ? (
                  <img
                    src={formData.profile_picture_url}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs">No photo</span>
                  </div>
                )}

                {/* Upload overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}

                {/* Hover overlay */}
                {!uploading && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? 'Uploading...' : formData.profile_picture_url ? 'Change Photo' : 'Browse Photo'}
                </button>

                {formData.profile_picture_url && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                JPEG, PNG or WebP. Max 5MB. Drag & drop or click to browse.
              </p>

              {uploadError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-md w-full text-center">
                  {uploadError}
                </div>
              )}
            </div>
          </section>

          {/* Portfolio Images Section (Artisan only) */}
          {user?.role === 'artisan' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Portfolio Images</h2>
              <input
                ref={portfolioInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                  if (!allowedTypes.includes(file.type)) return;
                  if (file.size > 5 * 1024 * 1024) return;
                  setUploadingPortfolio(true);
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    const result = await uploadPortfolioImage(file, token);
                    setFormData(prev => ({
                      ...prev,
                      portfolio_images: [...prev.portfolio_images, result],
                    }));
                  } catch (err) {
                    console.error('Portfolio upload failed:', err);
                  } finally {
                    setUploadingPortfolio(false);
                  }
                  if (portfolioInputRef.current) portfolioInputRef.current.value = '';
                }}
                className="hidden"
              />
              {formData.portfolio_images.length > 0 ? (
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.portfolio_images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            portfolio_images: prev.portfolio_images.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No portfolio images yet.</p>
              )}
              <button
                type="button"
                onClick={() => portfolioInputRef.current?.click()}
                disabled={uploadingPortfolio}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {uploadingPortfolio ? 'Uploading...' : 'Add Image'}
              </button>
            </section>
          )}

          {/* Basic Info Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                  disabled
                />
              </div>
            </div>
          </section>

          {/* Contact & Location */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact & Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              <LocationSelect
                value={locationValue}
                onChange={setLocationValue}
                includeAddress
                addressValue={formData.location}
                onAddressChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
              />
            </div>
          </section>

          {/* Bio */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Bio</h2>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
            />
          </section>

          {/* Artisan-specific fields */}
          {user?.role === 'artisan' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Artisan Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Skills & Categories</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Select up to 3 categories that match your expertise. You can only bid on jobs in these categories.
                  </p>
                  <CategorySelect
                    categories={allCategories}
                    value={formData.categories}
                    onChange={(ids) => setFormData(prev => ({ ...prev, categories: ids }))}
                    max={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experience
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="e.g., +234****5678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telephone Number
                    </label>
                    <input
                      type="tel"
                      name="tel"
                      value={formData.tel}
                      onChange={handleChange}
                      placeholder="e.g., +234****5678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 dark:border-gray-600 dark:text-blue-400 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Available for work</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="can_travel"
                      checked={formData.can_travel}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 dark:border-gray-600 dark:text-blue-400 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Willing to Travel</span>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Profile Boosting Tip */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              💡 <strong>Tip:</strong> Complete your profile with a bio, location, portfolio images, and
              up-to-date contact details. Artisans with complete profiles are recommended to job posts that
              match their expertise.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Link
            href="/profile/delete"
            className="inline-block px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            Delete Account
          </Link>
        </div>
      </div>
    </main>
  );
}
