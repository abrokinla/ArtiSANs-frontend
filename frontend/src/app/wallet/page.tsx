'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWallet, getBankDetails, saveBankDetails, withdrawFromWallet, deposit, verifyDeposit, getBanks, resolveAccount, reportFailedDeposit } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function WalletPage() {
  const { user, token, authInitialized } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Banks list
  const [banks, setBanks] = useState<any[]>([]);
  const [resolving, setResolving] = useState(false);

  // Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  // Bank form
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: '', account_number: '', account_name: '', bank_code: '' });
  const [savingBank, setSavingBank] = useState(false);
  const [bankSaveError, setBankSaveError] = useState('');

  // Deposit
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositMsg, setDepositMsg] = useState('');
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);
  const [failedRef, setFailedRef] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!authInitialized) return;
    if (!token) { router.push('/auth'); return; }
    loadWallet();
  }, [authInitialized, token, user]);

  useEffect(() => {
    if (token) {
      getBanks(token).then(setBanks).catch(() => {});
    }
  }, [token]);

  // Handle Paystack redirect back to wallet page after payment
  useEffect(() => {
    if (!token || !authInitialized) return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('trxref') || params.get('reference');
    if (ref && !verifyingRef) {
      setVerifyingRef(ref);
      setDepositing(true);
      setDepositMsg('Verifying payment...');
      verifyDeposit(ref, token)
        .then((result) => {
          setDepositMsg(result.message || 'Payment verified successfully!');
          loadWallet();
          window.history.replaceState({}, '', '/wallet');
        })
        .catch((err: any) => {
          setFailedRef(ref);
          setDepositMsg(err.message || 'Payment verification failed. Your money may have been deducted but not credited.');
          reportFailedDeposit(ref, token).catch(() => {});
        })
        .finally(() => {
          setDepositing(false);
          setVerifyingRef(null);
        });
    }
  }, [token, authInitialized]);

  const loadWallet = async () => {
    if (!token) return;
    try {
      const walletData = await getWallet(token);
      setWallet(walletData);
      try {
        const bankData = await getBankDetails(token);
        setBank(bankData);
        setBankForm({
          bank_name: bankData.bank_name || '',
          account_number: '',
          account_name: bankData.account_name || '',
          bank_code: bankData.bank_code || '',
        });
      } catch {}
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountNumberChange = useCallback(async (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setBankForm(prev => ({ ...prev, account_number: digits, account_name: '' }));

    if (digits.length === 10 && bankForm.bank_code && token) {
      setResolving(true);
      try {
        const result = await resolveAccount(digits, bankForm.bank_code, token);
        setBankForm(prev => ({ ...prev, account_name: result.account_name }));
      } catch {}
      setResolving(false);
    }
  }, [bankForm.bank_code, token]);

  const handleSaveBank = async () => {
    if (!token) return;
    setSavingBank(true);
    setBankSaveError('');
    try {
      const result = await saveBankDetails(bankForm, token);
      setBank(result);
      setEditingBank(false);
    } catch (err: any) {
      setBankSaveError(err.message || 'Failed to save bank details');
    } finally {
      setSavingBank(false);
    }
  };

  const handleDeposit = async () => {
    if (!token || !depositAmount) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    setDepositing(true);
    setDepositMsg('');
    try {
      const result = await deposit(amount, token);
      if (result.authorization_url && !result.authorization_url.startsWith('/mock')) {
        window.location.href = result.authorization_url;
      } else {
        setDepositMsg(result.message || `₦${amount.toLocaleString()} deposited successfully!`);
        setDepositAmount('');
        loadWallet();
      }
    } catch (err: any) {
      setDepositMsg(err.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!token || !withdrawAmount) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (!bank?.has_bank_details) { setWithdrawMsg('Set your bank details first'); return; }

    setWithdrawing(true);
    setWithdrawMsg('');
    try {
      const result = await withdrawFromWallet(amount, token);
      setWithdrawMsg(result.message || `Withdrawn ₦${amount.toLocaleString()} successfully`);
      setWithdrawAmount('');
      loadWallet();
    } catch (err: any) {
      setWithdrawMsg(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  if (!authInitialized || loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  const selectedBank = banks.find(b => b.code === bankForm.bank_code);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Wallet</h1>

        {/* Balance Card */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-sm dark:shadow-gray-900/60 dark:border dark:border-gray-700 p-6 mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Available Balance</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            ₦{wallet?.wallet_balance?.toLocaleString() || '0.00'}
          </p>
          <div className="flex gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Total Deposited: ₦{wallet?.total_deposited?.toLocaleString() || '0.00'}</span>
          </div>
        </div>

        {/* Deposit */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-sm dark:shadow-gray-900/60 dark:border dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Fund Wallet</h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Amount (₦)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            <button
              onClick={handleDeposit}
              disabled={depositing || !depositAmount}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {depositing ? 'Processing...' : 'Deposit'}
            </button>
          </div>
          {depositMsg && (
            <p className={`mt-2 text-sm ${depositMsg.includes('success') || depositMsg.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {depositMsg}
            </p>
          )}
          {failedRef && (
            <button
              onClick={() => setShowReportModal(true)}
              className="mt-2 text-sm text-red-600 underline hover:text-red-700"
            >
              Report Issue — Admin will review and credit your wallet
            </button>
          )}
        </div>

        {/* Withdraw */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-sm dark:shadow-gray-900/60 dark:border dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Withdraw to Bank</h2>
          <p className="text-xs text-gray-400 mb-3">Fee: ₦50 per withdrawal</p>
          {bank?.has_bank_details ? (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Amount (₦)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {withdrawing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          ) : (
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              Add bank details below to enable withdrawals.
            </p>
          )}
          {withdrawMsg && (
            <p className={`mt-2 text-sm ${withdrawMsg.includes('success') || withdrawMsg.includes('initiated') ? 'text-green-600' : 'text-red-600'}`}>
              {withdrawMsg}
            </p>
          )}
          {bank?.has_bank_details && (
            <p className="mt-2 text-xs text-gray-400">
              To: {bank.bank_name} ••••{bank.account_number}
            </p>
          )}
        </div>

        {/* Bank Details */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-sm dark:shadow-gray-900/60 dark:border dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Bank Details</h2>
          {editingBank ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bank Name</label>
                <select
                  value={bankForm.bank_code}
                  onChange={(e) => {
                    const bank = banks.find(b => b.code === e.target.value);
                    setBankForm({ ...bankForm, bank_code: e.target.value, bank_name: bank?.name || '' });
                  }}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                >
                  <option value="">Select a bank</option>
                  {banks.map((b: any) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Account Number</label>
                <div className="relative">
                  <input
                    value={bankForm.account_number}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    maxLength={10}
                    placeholder="10-digit account number"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                  />
                  {resolving && <span className="absolute right-3 top-2 text-xs text-gray-400">Resolving...</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Account Name</label>
                <input
                  value={bankForm.account_name}
                  onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })}
                  placeholder="Auto-resolved when you enter account number"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              {bankSaveError && (
                <p className="text-sm text-red-600">{bankSaveError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setEditingBank(false); setBankSaveError(''); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBank}
                  disabled={savingBank || !bankForm.bank_code || bankForm.account_number.length !== 10}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingBank ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {bank?.has_bank_details ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Bank: {bank.bank_name}</p>
                  <p>Account: ••••{bank.account_number}</p>
                  <p>Name: {bank.account_name}</p>
                  {bank.recipient_created && (
                    <p className="text-green-600 dark:text-green-400 mt-1">✓ Linked to Paystack</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No bank details saved.</p>
              )}
              <button
                onClick={() => setEditingBank(true)}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {bank?.has_bank_details ? 'Edit' : 'Add Bank Details'}
              </button>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-sm dark:shadow-gray-900/60 dark:border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Transaction History</h2>
          {wallet?.transactions?.length > 0 ? (
            <div className="space-y-3">
              {wallet.transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {tx.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.job_title || ''} {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      ['wallet_credit'].includes(tx.type)
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {['wallet_credit'].includes(tx.type) ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                    </span>
                    {tx.status && tx.status !== 'success' && (
                      <p className={`text-xs ${
                        tx.status === 'pending' ? 'text-amber-500' :
                        tx.status === 'failed' ? 'text-red-500' :
                        'text-gray-400'
                      }`}>
                        {tx.status}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No transactions yet.</p>
          )}
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && failedRef && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1a2e] rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Report Deposit Issue</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Reference: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{failedRef}</code>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Tell us what happened (optional):
            </p>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="e.g. Payment was deducted but wallet wasn't credited."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowReportModal(false); setReportDescription(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!token || !failedRef) return;
                  setReporting(true);
                  try {
                    await reportFailedDeposit(failedRef, token, reportDescription);
                    setShowReportModal(false);
                    setReportDescription('');
                    setDepositMsg('Issue reported. Admin will review and credit your wallet.');
                    setFailedRef(null);
                  } catch {
                    setDepositMsg('Failed to report. Please try again.');
                  } finally {
                    setReporting(false);
                  }
                }}
                disabled={reporting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {reporting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
