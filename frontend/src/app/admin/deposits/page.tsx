'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminPendingDeposits, getAdminPaystackTransactions, adminConfirmDeposit, getAdminPendingWithdrawals, adminRetryWithdrawal, adminRefundWithdrawal, adminConfirmWithdrawal } from '@/lib/api';

export default function AdminDepositsPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<'pending' | 'paystack' | 'withdrawals'>('pending');

  // Pending deposits
  const [pending, setPending] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState('');

  // Pending withdrawals
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [withdrawalAction, setWithdrawalAction] = useState<string | null>(null);
  const [withdrawalMsg, setWithdrawalMsg] = useState('');

  // Paystack logs
  const [paystackData, setPaystackData] = useState<any>(null);
  const [loadingPaystack, setLoadingPaystack] = useState(false);
  const [psReference, setPsReference] = useState('');
  const [psPage, setPsPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    if (tab === 'pending') {
      setLoadingPending(true);
      getAdminPendingDeposits(token)
        .then(setPending)
        .catch(console.error)
        .finally(() => setLoadingPending(false));
    }
  }, [token, tab]);

  const loadPaystack = (page = 1) => {
    if (!token) return;
    setPsPage(page);
    setLoadingPaystack(true);
    getAdminPaystackTransactions(token, { page, reference: psReference || undefined })
      .then(setPaystackData)
      .catch(console.error)
      .finally(() => setLoadingPaystack(false));
  };

  useEffect(() => {
    if (tab === 'paystack' && token) {
      loadPaystack(1);
    }
  }, [token, tab]);

  useEffect(() => {
    if (!token || tab !== 'withdrawals') return;
    setLoadingWithdrawals(true);
    getAdminPendingWithdrawals(token)
      .then(setWithdrawals)
      .catch(console.error)
      .finally(() => setLoadingWithdrawals(false));
  }, [token, tab]);

  const handleConfirm = async (reference: string) => {
    if (!token) return;
    setConfirming(reference);
    setConfirmMsg('');
    try {
      const result = await adminConfirmDeposit(reference, token);
      setConfirmMsg(result.message || 'Deposit confirmed');
      setPending(prev => prev.filter(d => d.reference !== reference));
    } catch (err: any) {
      setConfirmMsg(err.message || 'Failed to confirm deposit');
    } finally {
      setConfirming(null);
    }
  };

  const handleRetry = async (reference: string) => {
    if (!token) return;
    setWithdrawalAction(`retry_${reference}`);
    setWithdrawalMsg('');
    try {
      const result = await adminRetryWithdrawal(reference, token);
      setWithdrawalMsg(result.message || 'Withdrawal retried');
      setWithdrawals(prev => prev.filter(w => w.reference !== reference));
    } catch (err: any) {
      setWithdrawalMsg(err.message || 'Failed to retry withdrawal');
    } finally {
      setWithdrawalAction(null);
    }
  };

  const handleConfirmPaid = async (reference: string) => {
    if (!token) return;
    if (!confirm('Have you manually sent this amount to the artisan\'s bank account?')) return;
    setWithdrawalAction(`confirm_${reference}`);
    setWithdrawalMsg('');
    try {
      const result = await adminConfirmWithdrawal(reference, token);
      setWithdrawalMsg(result.message || 'Withdrawal confirmed as paid');
      setWithdrawals(prev => prev.filter(w => w.reference !== reference));
    } catch (err: any) {
      setWithdrawalMsg(err.message || 'Failed to confirm withdrawal');
    } finally {
      setWithdrawalAction(null);
    }
  };

  const handleRefund = async (reference: string) => {
    if (!token) return;
    setWithdrawalAction(`refund_${reference}`);
    setWithdrawalMsg('');
    try {
      const result = await adminRefundWithdrawal(reference, token);
      setWithdrawalMsg(result.message || 'Withdrawal refunded');
      setWithdrawals(prev => prev.filter(w => w.reference !== reference));
    } catch (err: any) {
      setWithdrawalMsg(err.message || 'Failed to refund withdrawal');
    } finally {
      setWithdrawalAction(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Deposits</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setTab('pending')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${
            tab === 'pending'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab('withdrawals')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${
            tab === 'withdrawals'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Withdrawals ({withdrawals.length})
        </button>
        <button
          onClick={() => setTab('paystack')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${
            tab === 'paystack'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Paystack Logs
        </button>
      </div>

      {confirmMsg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          confirmMsg.includes('credited') || confirmMsg.includes('confirmed')
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {confirmMsg}
        </div>
      )}

      {/* Pending Deposits Tab */}
      {tab === 'pending' && (
        <div>
          {loadingPending ? (
            <p className="text-gray-500">Loading...</p>
          ) : pending.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No pending deposit issues.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((d: any) => (
                <div key={d.id} className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-sm dark:border dark:border-gray-700 p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{d.username}</span>
                        <span className="text-xs text-gray-400">(ID: {d.user_id})</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Reference: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{d.reference}</code>
                      </p>
                      {d.amount && (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          ₦{d.amount.toLocaleString()}
                        </p>
                      )}
                      {d.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          {d.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleConfirm(d.reference)}
                      disabled={confirming === d.reference}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {confirming === d.reference ? 'Verifying...' : 'Verify & Credit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdrawals Tab */}
      {tab === 'withdrawals' && (
        <div>
          {withdrawalMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              withdrawalMsg.includes('refunded') || withdrawalMsg.includes('retried') || withdrawalMsg.includes('confirmed')
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {withdrawalMsg}
            </div>
          )}
          {loadingWithdrawals ? (
            <p className="text-gray-500">Loading...</p>
          ) : withdrawals.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No pending withdrawals.</p>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((w: any) => (
                <div key={w.id} className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-sm dark:border dark:border-gray-700 p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{w.username}</span>
                        <span className="text-xs text-gray-400">(ID: {w.user_id})</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Reference: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{w.reference}</code>
                      </p>
                      <div className="flex gap-4 mt-1 text-sm">
                        <span className="font-medium text-green-600 dark:text-green-400">
                          ₦{w.amount?.toLocaleString()}
                        </span>
                        <span className="text-gray-400">Fee: ₦{w.fee?.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Bank: {w.bank_name || 'Unknown'} {w.account_number ? `••••${w.account_number.slice(-4)}` : ''}
                      </p>
                      {w.paystack_error && (
                        <p className="text-sm text-red-600 mt-1 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          Error: {w.paystack_error}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{new Date(w.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmPaid(w.reference)}
                        disabled={withdrawalAction === `confirm_${w.reference}`}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        {withdrawalAction === `confirm_${w.reference}` ? 'Confirming...' : 'Mark as Paid'}
                      </button>
                      <button
                        onClick={() => handleRetry(w.reference)}
                        disabled={withdrawalAction === `retry_${w.reference}`}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        {withdrawalAction === `retry_${w.reference}` ? 'Retrying...' : 'Retry'}
                      </button>
                      <button
                        onClick={() => handleRefund(w.reference)}
                        disabled={withdrawalAction === `refund_${w.reference}`}
                        className="px-3 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        Refund
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Paystack Logs Tab */}
      {tab === 'paystack' && (
        <div>
          <div className="flex gap-3 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Search by Reference</label>
              <input
                type="text"
                value={psReference}
                onChange={(e) => setPsReference(e.target.value)}
                placeholder="e.g. dep_abc123"
                className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            <button
              onClick={() => loadPaystack(1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {loadingPaystack ? (
            <p className="text-gray-500">Loading transactions from Paystack...</p>
          ) : !paystackData?.data ? (
            <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
          ) : (
            <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-sm dark:border dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <tr>
                    <th className="text-left px-4 py-3">Reference</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Channel</th>
                    <th className="text-left px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {Array.isArray(paystackData.data) && paystackData.data.map((tx: any, i: number) => (
                    <tr key={tx.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                        {tx.reference}
                      </td>
                      <td className="px-4 py-3 text-green-600 dark:text-green-400">
                        ₦{(tx.amount / 100).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          tx.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          tx.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tx.channel || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {paystackData?.meta && (
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => loadPaystack(Math.max(1, psPage - 1))}
                disabled={psPage <= 1}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">
                Page {psPage} of {paystackData.meta.page_count || 1}
              </span>
              <button
                onClick={() => loadPaystack(psPage + 1)}
                disabled={psPage >= (paystackData.meta.page_count || 1)}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
