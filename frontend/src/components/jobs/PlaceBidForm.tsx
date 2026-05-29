'use client';

import { useState } from 'react';

interface PlaceBidFormProps {
  jobId: string;
  token: string;
  bidsRemaining?: number;
  onSubmit: (data: { amount: number; message: string; estimated_days: number; bid_weight: number }) => Promise<void>;
}

const MAX_WEIGHT = 5;

export default function PlaceBidForm({ jobId, token, bidsRemaining = 0, onSubmit }: PlaceBidFormProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidDays, setBidDays] = useState('1');
  const [bidWeight, setBidWeight] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maxWeight = Math.min(MAX_WEIGHT, bidsRemaining);
  const hasEnoughBids = bidsRemaining >= bidWeight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount) return;
    if (!hasEnoughBids) {
      setError('Not enough bids remaining. Please reduce bid weight or purchase more bids.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        amount: Number(bidAmount),
        message: bidMessage,
        estimated_days: Number(bidDays),
        bid_weight: bidWeight,
      });
      setBidAmount('');
      setBidMessage('');
      setBidDays('1');
      setBidWeight(1);
    } catch (err) {
      console.error('Failed to place bid:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const weightLabels = ['', 'Use 1 bid', 'Use 2 bids', 'Use 3 bids', 'Use 4 bids', 'Use 5 bids'];

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-[#0f0f23] rounded">
      <h3 className="font-semibold mb-3">Place a Bid</h3>
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <label className="block text-sm font-medium mb-1">Amount (₦)</label>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-[#1a1a2e] dark:text-gray-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Days</label>
          <input
            type="number"
            value={bidDays}
            onChange={(e) => setBidDays(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-[#1a1a2e] dark:text-gray-200"
            min="1"
            required
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          value={bidMessage}
          onChange={(e) => setBidMessage(e.target.value)}
          className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-[#1a1a2e] dark:text-gray-200"
          rows={3}
          placeholder="Explain why you're the best fit..."
        />
      </div>

      {/* Boost Your Bid Section */}
      <div className="mb-4 p-3 bg-white dark:bg-[#1a1a2e] border border-amber-200 dark:border-amber-800 rounded-lg">
        <h4 className="font-semibold text-sm mb-2 text-amber-800 dark:text-amber-300">🚀 Boost Your Bid</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Increase your bid weight to stand out. Higher weight costs more bids but gets more visibility.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max={maxWeight}
            value={bidWeight}
            onChange={(e) => setBidWeight(Number(e.target.value))}
            className="flex-1 accent-amber-600 dark:accent-amber-400"
          />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300 min-w-[80px] text-right">
            {weightLabels[bidWeight]}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Bids remaining: <strong>{bidsRemaining}</strong> &bull; This will cost <strong>{bidWeight}</strong> bid{bidWeight > 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || (bidsRemaining < bidWeight)}
        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Place Bid'}
      </button>
    </form>
  );
}
