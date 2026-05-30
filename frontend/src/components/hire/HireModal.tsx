'use client';

import { useState, useEffect } from 'react';
import { getHireContext, assignJob, directHire, getCategories } from '@/lib/api';
import { groupCategories } from '@/components/CategorySelect';

interface JobEntry {
  id: number;
  title: string;
  budget: number | null;
  status: string;
  category_name: string | null;
  has_bid: boolean;
  bid: {
    id: number;
    amount: number;
    message: string;
    estimated_days: number;
  } | null;
}

interface HireContext {
  artisan: { id: number; first_name: string; last_name: string; username: string };
  jobs: JobEntry[];
}

interface Category {
  id: number;
  name: string;
  group: string;
}

interface HireModalProps {
  artisanId: string;
  artisanName: string;
  token: string;
  onClose: () => void;
  onSuccess: (conversationId: number) => void;
}

export default function HireModal({ artisanId, artisanName, token, onClose, onSuccess }: HireModalProps) {
  const [context, setContext] = useState<HireContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [categories, setCategories] = useState<Category[]>([]);
  const [offerAmount, setOfferAmount] = useState('');
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    location: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [ctx, cats] = await Promise.all([
          getHireContext(artisanId, token),
          getCategories(),
        ]);
        setContext(ctx);
        const catList = Array.isArray(cats) ? cats : cats.results || [];
        setCategories(catList);
        if (ctx.jobs.length > 0) {
          setSelectedJobId(ctx.jobs[0].id);
          const first = ctx.jobs[0];
          if (!first.has_bid && first.budget) {
            setOfferAmount(String(first.budget));
          }
        }
      } catch (err) {
        console.error('Failed to load hire context', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [artisanId, token]);

  const selectedJob = context?.jobs.find((j) => j.id === selectedJobId);

  const handleSubmit = async () => {
    if (submitting || !context) return;
    setSubmitting(true);
    try {
      if (mode === 'existing' && selectedJob) {
        if (selectedJob.has_bid && selectedJob.bid) {
          // Accept existing bid
          const res = await assignJob(
            String(selectedJob.id),
            parseInt(artisanId),
            null,
            token,
          );
          onSuccess(res.conversation_id);
        } else {
          // Assign existing job with offer amount
          const amount = offerAmount ? parseFloat(offerAmount) : null;
          const res = await assignJob(
            String(selectedJob.id),
            parseInt(artisanId),
            amount,
            token,
          );
          onSuccess(res.conversation_id);
        }
      } else {
        // Create new job + assign
        const amount = newJob.budget ? parseFloat(newJob.budget) : undefined;
        const res = await directHire({
          artisan_id: parseInt(artisanId),
          title: newJob.title,
          description: newJob.description,
          budget: amount,
          category: newJob.category ? parseInt(newJob.category) : undefined,
          location: newJob.location,
        }, token);
        onSuccess(res.conversation_id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to hire artisan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hire {artisanName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : !context ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Could not load hiring info</div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode('existing')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'existing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Existing Job
              </button>
              <button
                onClick={() => setMode('new')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                New Job
              </button>
            </div>

            {mode === 'existing' ? (
              <>
                {context.jobs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    You have no open jobs. Switch to "New Job" to hire {artisanName}.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select a job to assign to {artisanName}:
                    </p>
                    {context.jobs.map((job) => {
                      const isSelected = selectedJobId === job.id;
                      return (
                        <label
                          key={job.id}
                          className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="job"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedJobId(job.id);
                                if (!job.has_bid && job.budget) {
                                  setOfferAmount(String(job.budget));
                                }
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                  {job.title}
                                </span>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
                                  ₦{job.budget?.toLocaleString() || '—'}
                                </span>
                              </div>
                              {job.has_bid && job.bid ? (
                                <div className="mt-2 text-sm bg-green-50 dark:bg-green-900/20 rounded p-2 border border-green-200 dark:border-green-800">
                                  <p className="font-medium text-green-700 dark:text-green-300">
                                    Bid: ₦{job.bid.amount.toLocaleString()} • {job.bid.estimated_days} day(s)
                                  </p>
                                  {job.bid.message && (
                                    <p className="text-green-600 dark:text-green-400 text-xs mt-1 italic">
                                      "{job.bid.message}"
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    No bid from {artisanName} yet. Offer an amount:
                                  </p>
                                  <input
                                    type="number"
                                    value={isSelected ? offerAmount : ''}
                                    onChange={(e) => setOfferAmount(e.target.value)}
                                    placeholder="Offer amount"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Post a new job for {artisanName}:
                </p>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="Job title *"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                />
                <textarea
                  rows={3}
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Job description"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={newJob.budget}
                    onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })}
                    placeholder="Budget (₦)"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                  />
                  <select
                    value={newJob.category}
                    onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="">Category</option>
                    {groupCategories(categories).map((group) => (
                      <optgroup key={group.key} label={group.label}>
                        {group.categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="Location"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              submitting || loading || !context ||
              (mode === 'new' && !newJob.title) ||
              (mode === 'existing' && !selectedJob)
            }
            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Hiring...' : `Hire ${artisanName}`}
          </button>
        </div>
      </div>
    </div>
  );
}
