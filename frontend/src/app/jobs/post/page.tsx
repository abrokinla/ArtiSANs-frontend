'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createJob, uploadJobImage } from '@/lib/api';

interface JobImage {
  url: string;
  public_id: string;
}

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    location: '',
    budget: '',
    priority: 'medium',
  });
  const [images, setImages] = useState<JobImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth');
    }
  }, [isLoggedIn, router]);

  // Show access denied message for artisans
  if (isLoggedIn && user?.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#ff385c] text-5xl mb-4">✕</div>
          <h2 className="text-2xl font-bold mb-2 text-[#222222]">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only clients can post jobs. Artisans can browse and apply for jobs.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#ff385c] text-white px-6 py-2 rounded-lg hover:bg-[#e31c5f] transition-colors font-medium"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Max 5 images total
    if (images.length + files.length > 5) {
      setImageError('You can upload a maximum of 5 images');
      return;
    }

    setImageError('');
    setUploadingImages(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`);
        }
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 5MB`);
        }
        return uploadJobImage(file, token);
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedImages]);
    } catch (err: any) {
      setImageError(err.message || 'Failed to upload image(s)');
    } finally {
      setUploadingImages(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      await createJob(
        {
          ...formData,
          category: formData.category_id,
          budget: parseFloat(formData.budget) || null,
          images: images,
        },
        token
      );

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      // Handle 401 specifically
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Your session has expired. Please log in again.');
        // Clear stale token
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setTimeout(() => router.push('/auth'), 2000);
      } else {
        setError(err.message || 'An error occurred while posting the job');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2 text-[#222222]">Job Posted Successfully!</h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-[#222222]">Post a Job</h1>

        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#222222]">Job Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent transition-shadow"
                placeholder="e.g., Fix leaky faucet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#222222]">Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent transition-shadow resize-none"
                placeholder="Describe the work needed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#222222]">Category</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent transition-shadow"
              >
                <option value="">Select a category</option>
                <option value="1">Plumbing</option>
                <option value="2">Electrical</option>
                <option value="3">Carpentry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#222222]">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent transition-shadow"
                placeholder="e.g., Lagos, Ikeja"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#222222]">Budget (optional)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent transition-shadow"
                placeholder="e.g., 5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#222222]">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent transition-shadow"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Job Images Upload */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#222222]">
                Job Images <span className="text-gray-400 font-normal">(optional, max 5)</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Upload images to help artisans understand the work better
              </p>

              {imageError && (
                <div className="bg-red-50 text-red-600 p-2 rounded-lg mb-2 text-sm border border-red-200">
                  {imageError}
                </div>
              )}

              {/* Image previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={img.url}
                        alt={`Job image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-[#ff385c] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-[#e31c5f] transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {images.length < 5 && (
                <div
                  onClick={() => !uploadingImages && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    uploadingImages
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-[#ff385c] hover:bg-red-50/30'
                  }`}
                >
                  {uploadingImages ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff385c] mb-2"></div>
                      <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">Click to upload images</span>
                      <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP • Max 5MB each</span>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploadingImages || images.length >= 5}
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="w-full bg-[#ff385c] text-white py-3 rounded-lg hover:bg-[#e31c5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-base"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
