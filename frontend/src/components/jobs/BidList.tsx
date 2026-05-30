'use client';

import Link from 'next/link';

interface Bid {
  id: number;
  artisan: number;
  artisan_username: string;
  artisan_verified?: boolean;
  artisan_profile_picture?: string;
  amount: number;
  message: string;
  estimated_days: number;
  is_accepted: boolean;
  bid_weight?: number;
  created_at: string;
}

interface BidListProps {
  bids: Bid[];
  isClient: boolean;
  jobStatus: string;
  onAcceptBid?: (bidId: number) => void;
}

export default function BidList({ bids, isClient, jobStatus, onAcceptBid }: BidListProps) {
  if (bids.length === 0) {
    return     <p className="text-gray-500 dark:text-gray-400">No bids yet.</p>;
  }

  return (
    <div className="space-y-3">
      {bids.map((bid) => (
        <div key={bid.id} className="border rounded p-4 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/artisans/${bid.artisan}`} className="flex items-center gap-2 hover:opacity-80">
                  {bid.artisan_profile_picture ? (
                    <img
                      src={bid.artisan_profile_picture}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                  )}
                  <span className="font-semibold">{bid.artisan_username}</span>
                </Link>
                {bid.artisan_verified && (
                  <span className="text-green-600 dark:text-green-400 text-xs font-medium flex items-center gap-0.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{bid.message}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Estimated: {bid.estimated_days} day(s) • {new Date(bid.created_at).toLocaleDateString()}
              </div>
              {bid.bid_weight && bid.bid_weight > 1 && (
                <div className={`mt-1 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  bid.bid_weight >= 4 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                  bid.bid_weight >= 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  🚀 Boosted x{bid.bid_weight}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">₦{bid.amount.toLocaleString()}</div>
              {isClient && jobStatus === 'bidding' && onAcceptBid && (
                <button
                  onClick={() => onAcceptBid(bid.id)}
                  className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Accept Bid
                </button>
              )}
              {bid.is_accepted && (
                <span className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm rounded">
                  Accepted
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
