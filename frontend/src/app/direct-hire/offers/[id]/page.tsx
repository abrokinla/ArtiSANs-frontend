'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOffer, acceptOffer, declineOffer, counterOffer, acceptCounterOffer } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function OfferDetailPage() {
  const { id } = useParams() ?? {};
  const router = useRouter();
  const { user, token, authInitialized } = useAuth();

  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Counter modal state
  const [showCounter, setShowCounter] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [artisanMessage, setArtisanMessage] = useState('');
  const [counterSaving, setCounterSaving] = useState(false);
  const [counterError, setCounterError] = useState('');

  // Insufficient balance state (from accept)
  const [balanceError, setBalanceError] = useState<{
    required: number;
    balance: number;
    shortfall: number;
  } | null>(null);

  useEffect(() => {
    if (!authInitialized) return;
    if (!token) { router.push('/auth'); return; }
    async function load() {
      try {
        const data = await getOffer(id as string, token!);
        setOffer(data);
        setCounterAmount(data.counter_amount || data.proposed_amount);
      } catch (err: any) {
        setError(err.message || 'Failed to load offer');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authInitialized, id, token, router]);

  const isClient = user?.role === 'client';
  const isArtisan = user?.role === 'artisan';
  const isMyOffer = isClient && offer?.client_username === user?.username;
  const isForMe = isArtisan && offer?.artisan_username === user?.username;
  const canAct = isForMe || (isClient && offer?.status === 'countered' && isMyOffer);
  const showAccept = isForMe && (offer?.status === 'pending' || offer?.status === 'countered');
  const showDecline = isForMe && (offer?.status === 'pending');
  const showCounterBtn = isForMe && (offer?.status === 'pending');
  const showAcceptCounter = isMyOffer && offer?.status === 'countered';

  const handleAccept = async () => {
    setError('');
    setBalanceError(null);
    try {
      const result = await acceptOffer(id as string, token!);
      router.push(`/jobs/${result.job_id}/manage`);
    } catch (err: any) {
      try {
        const body = JSON.parse(err.message.replace('HTTP ', ''));
        if (body.required) {
          setBalanceError(body);
          return;
        }
      } catch {}
      setError(err.message || 'Failed to accept offer');
    }
  };

  const handleDecline = async () => {
    setError('');
    try {
      await declineOffer(id as string, token!);
      setOffer({ ...offer, status: 'declined' });
    } catch (err: any) {
      setError(err.message || 'Failed to decline offer');
    }
  };

  const handleCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCounterError('');

    const amount = parseFloat(counterAmount);
    if (!amount || amount < 1000) {
      setCounterError('Minimum amount is ₦1,000');
      return;
    }

    setCounterSaving(true);
    try {
      const updated = await counterOffer(id as string, {
        counter_amount: amount,
        artisan_message: artisanMessage.trim(),
      }, token!);
      setOffer(updated);
      setShowCounter(false);
    } catch (err: any) {
      setCounterError(err.message || 'Failed to send counter-offer');
    } finally {
      setCounterSaving(false);
    }
  };

  const handleAcceptCounter = async () => {
    setError('');
    setBalanceError(null);
    try {
      const result = await acceptCounterOffer(id as string, token!);
      router.push(`/jobs/${result.job_id}/manage`);
    } catch (err: any) {
      try {
        const body = JSON.parse(err.message.replace('HTTP ', ''));
        if (body.required) {
          setBalanceError(body);
          return;
        }
      } catch {}
      setError(err.message || 'Failed to accept counter-offer');
    }
  };

  if (!authInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/direct-hire/offers" className="text-blue-600 underline">Back to offers</Link>
        </div>
      </div>
    );
  }

  if (!offer) return null;

  const amount = offer.counter_amount || offer.proposed_amount;
  const otherName = isClient ? offer.artisan_username : offer.client_username;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/direct-hire/offers" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mb-6 inline-block">
          ← Back to Offers
        </Link>

        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm">{error}</div>
          )}

          {balanceError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-300 space-y-2">
              <p className="font-semibold">Insufficient Wallet Balance</p>
              <p>Required: <strong>₦{balanceError.required.toLocaleString()}</strong></p>
              <p>Available: <strong>₦{balanceError.balance.toLocaleString()}</strong></p>
              <p>Shortfall: <strong>₦{balanceError.shortfall.toLocaleString()}</strong></p>
              <p className="text-xs mt-2">The client needs to fund their wallet before this offer can be accepted.</p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{offer.title}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {isClient ? 'To: ' : 'From: '}{otherName}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              offer.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              offer.status === 'declined' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
              offer.status === 'countered' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
            }`}>
              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </span>
          </div>

          {/* Amount */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {offer.counter_amount ? 'Counter-offer amount' : 'Proposed amount'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">₦{amount?.toLocaleString()}</p>
            {offer.counter_amount && (
              <p className="text-sm text-gray-400 mt-1">Original offer: ₦{offer.proposed_amount?.toLocaleString()}</p>
            )}
          </div>

          {/* Description */}
          {offer.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{offer.description}</p>
            </div>
          )}

          {/* Location */}
          {offer.location && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Location: {offer.location}</p>
          )}

          {/* Client message */}
          {offer.client_message && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Message from {offer.client_username}:</p>
              <p className="text-blue-900 dark:text-blue-100 whitespace-pre-wrap">{offer.client_message}</p>
            </div>
          )}

          {/* Artisan message (on counter) */}
          {offer.artisan_message && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Message from {offer.artisan_username}:</p>
              <p className="text-purple-900 dark:text-purple-100 whitespace-pre-wrap">{offer.artisan_message}</p>
            </div>
          )}

          {/* Job link if accepted */}
          {offer.job_id && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <p className="text-green-700 dark:text-green-300 font-medium mb-2">✓ Offer Accepted — Job Created</p>
              <Link href={`/jobs/${offer.job_id}/manage`} className="text-blue-600 underline text-sm">
                View Job Details
              </Link>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 flex-wrap">
            {showAccept && (
              <button onClick={handleAccept} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">
                Accept Offer
              </button>
            )}
            {showAcceptCounter && (
              <button onClick={handleAcceptCounter} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">
                Accept Counter-Offer
              </button>
            )}
            {showCounterBtn && (
              <button onClick={() => setShowCounter(true)} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                Send Counter-Offer
              </button>
            )}
            {showDecline && (
              <button onClick={handleDecline} className="px-6 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">
                Decline
              </button>
            )}
            {(offer.status === 'accepted' && !offer.job_id) && (
              <Link href="/direct-hire/offers" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300">
                Back to Offers
              </Link>
            )}
          </div>
        </div>

        {/* Counter-offer modal */}
        {showCounter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Send Counter-Offer</h2>
              <form onSubmit={handleCounter} className="space-y-4">
                {counterError && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm">{counterError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your amount (₦)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={100}
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-400 mt-1">Original offer: ₦{offer.proposed_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (optional)</label>
                  <textarea
                    value={artisanMessage}
                    onChange={(e) => setArtisanMessage(e.target.value)}
                    rows={3}
                    placeholder="Explain your counter-offer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={counterSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {counterSaving ? 'Sending...' : 'Send Counter-Offer'}
                  </button>
                  <button type="button" onClick={() => setShowCounter(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
