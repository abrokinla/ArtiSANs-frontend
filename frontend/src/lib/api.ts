const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) throw new Error('No refresh token');

    const response = await fetch(`${API_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
      throw new Error('Session expired');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access);
    return data.access;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    cache: 'no-store',
  });
  
  if (response.status === 401 && token) {
    try {
      const newToken = await refreshAccessToken();
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        cache: 'no-store',
      });
    } catch {
      throw new Error('Session expired. Please log in again.');
    }
  }
  
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (typeof body === 'string') throw new Error(body);
    if (body.detail) throw new Error(body.detail);
    if (body.non_field_errors) throw new Error(String(body.non_field_errors));
    const firstError = Object.values(body).flat().find(Boolean);
    if (firstError) throw new Error(String(firstError));
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
}

// Auth
export async function register(userData: {
  username: string;
  email: string;
  password: string;
  role: 'client' | 'artisan';
  phone_number: string;
  terms_accepted?: boolean;
}) {
  return apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function login(credentials: { username: string; password: string }) {
  return apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// Password Reset
export async function requestPasswordReset(email: string) {
  return apiRequest('/auth/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(data: { uid: string; token: string; new_password: string }) {
  return apiRequest('/auth/password-reset/confirm/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Email Verification
export async function verifyEmail(uid: string, token: string) {
  return apiRequest('/auth/verify_email/', {
    method: 'POST',
    body: JSON.stringify({ uid, token }),
  });
}

export async function resendVerification(token: string) {
  return apiRequest('/auth/send_verification/', {
    method: 'POST',
    token,
  });
}

// Categories
export async function getCategories() {
  const data = await apiRequest('/categories/');
  return Array.isArray(data) ? data : (data.results || []);
}

// Artisans
export async function searchArtisans(params: {
  category?: string;
  location?: string;
  state?: number;
  lga?: number;
  min_rating?: number;
}) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.location) query.set('location', params.location);
  if (params.state) query.set('state', params.state.toString());
  if (params.lga) query.set('lga', params.lga.toString());
  if (params.min_rating) query.set('min_rating', params.min_rating.toString());
  
  return apiRequest(`/search/artisans/?${query.toString()}`);
}

export async function getArtisanProfile(id: string, token: string) {
  return apiRequest(`/artisans/${id}/profile/`, { token });
}

export async function getArtisanProfilePublic(id: string) {
  return apiRequest(`/artisans/${id}/public/`);
}

export async function getMyArtisanProfile(token: string) {
  return apiRequest('/artisans/me/', { token });
}

export async function updateArtisanProfile(data: any, token: string) {
  return apiRequest('/artisans/me/', {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

// Jobs
export async function getJobs(params: { status?: string; state?: number; lga?: number } = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.state) query.set('state', params.state.toString());
  if (params.lga) query.set('lga', params.lga.toString());
  return apiRequest(`/jobs/?${query.toString()}`);
}

export async function getJob(id: string, token?: string) {
  return apiRequest(`/jobs/${id}/`, token ? { token } : {});
}

export async function getJobPublic(id: string) {
  return apiRequest(`/jobs/${id}/public/`);
}

export async function createJob(jobData: any, token: string) {
  return apiRequest('/jobs/', {
    method: 'POST',
    token,
    body: JSON.stringify(jobData),
  });
}

export async function uploadJobImage(file: File, token: string): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/jobs/upload_image/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getMyJobs(token: string) {
  return apiRequest('/jobs/my_jobs/', { token });
}

// Profiles
export async function getMyProfile(token: string) {
  return apiRequest('/profiles/me/', { token });
}

export async function uploadProfileImage(file: File, token: string): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/profiles/upload_image/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function uploadPortfolioImage(file: File, token: string): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/artisans/upload_portfolio_image/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function updateMyProfile(data: any, token: string) {
  return apiRequest('/profiles/me/', {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export async function refreshToken(refresh: string) {
  return apiRequest('/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  });
}

export async function purchaseBids(quantity: number, token: string) {
  return apiRequest('/artisans/purchase_bids/', {
    method: 'POST',
    token,
    body: JSON.stringify({ quantity }),
  });
}

// Locations
export async function fetchStates(): Promise<{ id: number; name: string; code: string }[]> {
  return apiRequest('/locations/states/');
}

export async function fetchLGAs(stateId: number): Promise<{ id: number; name: string }[]> {
  return apiRequest(`/locations/lgas/?state_id=${stateId}`);
}

export async function verifyNIN(nin: string, token: string) {
  return apiRequest('/artisans/verify_nin/', {
    method: 'POST',
    token,
    body: JSON.stringify({ nin }),
  });
}

export default apiRequest;

// Bids
export async function placeBid(jobId: string, bidData: {
  amount: number;
  message?: string;
  estimated_days?: number;
  bid_weight?: number;
}, token: string) {
  return apiRequest(`/jobs/${jobId}/bid/`, {
    method: 'POST',
    token,
    body: JSON.stringify(bidData),
  });
}

export async function getMyBids(token: string) {
  return apiRequest('/bids/my_bids/', { token });
}

export async function getJobBids(jobId: string, token: string) {
  return apiRequest(`/bids/job_bids/?job_id=${jobId}`, { token });
}

export async function acceptBid(bidId: string, token: string) {
  return apiRequest(`/bids/${bidId}/accept/`, {
    method: 'POST',
    token,
  });
}

// Reviews
export async function createReview(reviewData: {
  job: string;
  rating: number;
  comment: string;
}, token: string) {
  return apiRequest('/reviews/', {
    method: 'POST',
    token,
    body: JSON.stringify(reviewData),
  });
}

export async function getArtisanReviews(artisanId: string, token?: string) {
  return apiRequest(`/reviews/for_artisan/?artisan_id=${artisanId}`, { token });
}

// Job Workflow
export async function startJob(jobId: string, token: string) {
  return apiRequest(`/jobs/${jobId}/start_job/`, {
    method: 'POST',
    token,
  });
}

export async function completeJob(jobId: string, token: string) {
  return apiRequest(`/jobs/${jobId}/complete_job/`, {
    method: 'POST',
    token,
  });
}

export async function confirmJobCompletion(jobId: string, token: string) {
  return apiRequest(`/jobs/${jobId}/confirm_completion/`, {
    method: 'POST',
    token,
  });
}

// Messages
export async function getConversations(token: string) {
  return apiRequest('/conversations/', { token });
}

export async function getConversation(id: string, token: string) {
  return apiRequest(`/conversations/${id}/`, { token });
}

export async function getMessages(conversationId: string, token: string, afterId?: number) {
  const query = afterId ? `?after_id=${afterId}` : '';
  return apiRequest(`/conversations/${conversationId}/messages/${query}`, { token });
}

export async function sendMessage(conversationId: string, content: string, token: string) {
  return apiRequest(`/conversations/${conversationId}/messages/`, {
    method: 'POST',
    token,
    body: JSON.stringify({ content }),
  });
}

export async function getUnreadCount(token: string) {
  return apiRequest('/conversations/unread/', { token });
}

// Hire
export async function getHireContext(artisanId: string, token: string) {
  return apiRequest(`/artisans/${artisanId}/hire_context/`, { token });
}

export async function assignJob(jobId: string, artisanId: number, amount: number | null, token: string) {
  return apiRequest(`/jobs/${jobId}/assign/`, {
    method: 'POST',
    token,
    body: JSON.stringify({ artisan_id: artisanId, amount }),
  });
}

export async function directHire(data: {
  artisan_id: number;
  title: string;
  description?: string;
  budget?: number;
  category?: number;
  location?: string;
}, token: string) {
  return apiRequest('/jobs/direct_hire/', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

// Wallet & Payments
export async function getWallet(token: string) {
  return apiRequest('/profiles/wallet/', { token });
}

export async function getBankDetails(token: string) {
  return apiRequest('/profiles/bank/', { token });
}

export async function saveBankDetails(data: {
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code: string;
}, token: string) {
  return apiRequest('/profiles/bank/', {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });
}

export async function withdrawFromWallet(amount: number, token: string) {
  return apiRequest('/profiles/withdraw/', {
    method: 'POST',
    token,
    body: JSON.stringify({ amount }),
  });
}

export async function getBanks(token: string) {
  return apiRequest('/profiles/banks/', { token });
}

export async function resolveAccount(accountNumber: string, bankCode: string, token: string) {
  return apiRequest('/profiles/resolve_account/', {
    method: 'POST',
    token,
    body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
  });
}

export async function fundEscrow(jobId: string, token: string) {
  return apiRequest(`/jobs/${jobId}/fund_escrow/`, {
    method: 'POST',
    token,
  });
}

export async function verifyEscrow(jobId: string, reference: string, token: string) {
  return apiRequest(`/jobs/${jobId}/verify_escrow/`, {
    method: 'POST',
    token,
    body: JSON.stringify({ reference }),
  });
}

export async function purchaseBidsWithWallet(quantity: number, token: string) {
  return apiRequest('/artisans/purchase_bids/', {
    method: 'POST',
    token,
    body: JSON.stringify({ quantity, payment_method: 'wallet' }),
  });
}

export async function deposit(amount: number, token: string) {
  return apiRequest('/profiles/deposit/', {
    method: 'POST',
    token,
    body: JSON.stringify({ amount }),
  });
}

export async function verifyDeposit(reference: string, token: string) {
  return apiRequest('/profiles/verify_deposit/', {
    method: 'POST',
    token,
    body: JSON.stringify({ reference }),
  });
}

export async function reportFailedDeposit(reference: string, token: string, description?: string) {
  return apiRequest('/profiles/report_failed_deposit/', {
    method: 'POST',
    token,
    body: JSON.stringify({ reference, description: description || '' }),
  });
}

export async function cancelJob(jobId: string, token: string) {
  return apiRequest(`/jobs/${jobId}/cancel_job/`, {
    method: 'POST',
    token,
  });
}

export async function raiseDispute(jobId: string, reason: string, description: string, token: string) {
  return apiRequest(`/jobs/${jobId}/dispute/`, {
    method: 'POST',
    token,
    body: JSON.stringify({ reason, description }),
  });
}

export async function getDisputeDetail(jobId: string, token: string) {
  return apiRequest(`/jobs/${jobId}/dispute_detail/`, { token });
}

// Admin
export async function getAdminDashboard(token: string) {
  return apiRequest('/profiles/admin_dashboard/', { token });
}

export async function getAdminTransactions(token: string, params?: { type?: string; status?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.status) query.set('status', params.status);
  if (params?.limit) query.set('limit', params.limit.toString());
  return apiRequest(`/profiles/admin_transactions/?${query.toString()}`, { token });
}

export async function getAdminUsers(token: string, params?: { role?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.role) query.set('role', params.role);
  if (params?.search) query.set('search', params.search);
  return apiRequest(`/profiles/admin_users/?${query.toString()}`, { token });
}

export async function getAdminJobs(token: string, params?: { status?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  return apiRequest(`/profiles/admin_jobs/?${query.toString()}`, { token });
}

export async function getAdminDisputes(token: string, params?: { status?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  return apiRequest(`/profiles/admin_disputes/?${query.toString()}`, { token });
}

export async function getAdminPendingDeposits(token: string) {
  return apiRequest('/profiles/admin_pending_deposits/', { token });
}

export async function getAdminPaystackTransactions(token: string, params?: { page?: number; reference?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.reference) query.set('reference', params.reference);
  return apiRequest(`/profiles/admin_paystack_transactions/?${query.toString()}`, { token });
}

export async function adminConfirmDeposit(reference: string, token: string) {
  return apiRequest('/profiles/admin_confirm_deposit/', {
    method: 'POST',
    token,
    body: JSON.stringify({ reference }),
  });
}

export async function getAdminPendingWithdrawals(token: string) {
  return apiRequest('/profiles/admin_pending_withdrawals/', { token });
}

export async function adminRetryWithdrawal(reference: string, token: string) {
  return apiRequest('/profiles/admin_retry_withdrawal/', {
    method: 'POST',
    token,
    body: JSON.stringify({ reference }),
  });
}

// Profile Boost
export async function boostProfile(duration: 7 | 30, token: string) {
  return apiRequest('/artisans/boost/', {
    method: 'POST',
    token,
    body: JSON.stringify({ duration }),
  });
}

export async function adminRefundWithdrawal(reference: string, token: string) {
  return apiRequest('/profiles/admin_refund_withdrawal/', {
    method: 'POST',
    token,
    body: JSON.stringify({ reference }),
  });
}

export async function adminConfirmWithdrawal(reference: string, token: string) {
  return apiRequest('/profiles/admin_confirm_withdrawal/', {
    method: 'POST',
    token,
    body: JSON.stringify({ reference }),
  });
}

// Admin Dispute Resolution
export async function adminResolveDispute(disputeId: number, resolution: 'release' | 'refund' | 'partial', notes: string, token: string) {
  return apiRequest('/profiles/admin_resolve_dispute/', {
    method: 'POST',
    token,
    body: JSON.stringify({ dispute_id: disputeId, resolution, notes }),
  });
}

// Account Deletion
export async function deleteAccount(reason: string, token: string) {
  return apiRequest('/profiles/delete_account/', {
    method: 'POST',
    token,
    body: JSON.stringify({ reason }),
  });
}

// Contact
export async function sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
  return apiRequest('/contact/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Direct Hire Offers
export async function createOffer(offerData: {
  artisan: number;
  title: string;
  description?: string;
  category?: number;
  location?: string;
  proposed_amount: number;
  client_message?: string;
}, token: string) {
  return apiRequest('/direct-hire/offers/', {
    method: 'POST',
    token,
    body: JSON.stringify(offerData),
  });
}

export async function getMyOffers(token: string) {
  return apiRequest('/direct-hire/offers/', { token });
}

export async function getOffer(id: string, token: string) {
  return apiRequest(`/direct-hire/offers/${id}/`, { token });
}

export async function acceptOffer(id: string, token: string) {
  return apiRequest(`/direct-hire/offers/${id}/accept/`, {
    method: 'POST',
    token,
  });
}

export async function declineOffer(id: string, token: string) {
  return apiRequest(`/direct-hire/offers/${id}/decline/`, {
    method: 'POST',
    token,
  });
}

export async function counterOffer(id: string, data: { counter_amount: number; artisan_message?: string }, token: string) {
  return apiRequest(`/direct-hire/offers/${id}/counter/`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function acceptCounterOffer(id: string, token: string) {
  return apiRequest(`/direct-hire/offers/${id}/accept_counter/`, {
    method: 'POST',
    token,
  });
}
