'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWallet, getBankDetails, saveBankDetails, withdrawFromWallet, deposit, verifyDeposit } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function WalletPage() {
  const { user, token, authInitialized } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  // Bank form
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: '', account_number: '', account_name: '', bank_code: '' });
  const [savingBank, setSavingBank] = useState(false);

  // Deposit
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositMsg, setDepositMsg] = useState('');
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);

  useEffect(() => {
    if (!authInitialized) return;
    if (!token) { router.push('/auth'); return; }
    loadWallet();
  }, [authInitialized, token, user]);

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
          // Clean URL params
          window.history.replaceState({}, '', '/wallet');
        })
        .catch((err: any) => {
          setDepositMsg(err.message || 'Payment verification failed. Contact support if your money was deducted.');
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
      if (user?.role === 'artisan') {
        try {
          const bankData = await getBankDetails(token);
          setBank(bankData);
          setBankForm({
            bank_name: bankData.bank_name || '',
            account_number: '',
            account_name: bankData.account_name || '',
            bank_code: bankData.bank_code || '',
          });
        } catch {
          // Bank details not available for non-artisans
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async () => {
    if (!token) return;
    setSavingBank(true);
    try {
      const result = await saveBankDetails(bankForm, token);
      setBank(result);
      setEditingBank(false);
    } catch (err: any) {
      setError(err.message);
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
        // Live mode — redirect to Paystack checkout
        window.location.href = result.authorization_url;
      } else {
        // Mock mode — already credited
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
      setWithdrawMsg(`Withdrawn ₦${amount.toLocaleString()} successfully`);
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
            <p className={`mt-2 text-sm ${depositMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {depositMsg}
            </p>
          )}
        </div>

        {user?.role === 'artisan' && (<>
        {/* Withdraw */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-sm dark:shadow-gray-900/60 dark:border dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Withdraw to Bank</h2>
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
            <p className={`mt-2 text-sm ${withdrawMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
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
                <input
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Account Number</label>
                <input
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  maxLength={10}
                  placeholder="10-digit account number"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Account Name</label>
                <input
                  value={bankForm.account_name}
                  onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#1a1a2e] dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingBank(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBank}
                  disabled={savingBank}
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
        </>)}

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
                  <span className={`font-semibold ${
                    ['wallet_credit'].includes(tx.type)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {['wallet_credit'].includes(tx.type) ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No transactions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
