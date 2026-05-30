const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestOptions extends RequestInit {
  token?: string;
}

let refreshing: Promise<string> | null = null;

async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const doFetch = async (t: string | null) => {
    if (t) (headers as Record<string, string>)['Authorization'] = `Bearer ${t}`;
    return fetch(`${API_URL}${endpoint}`, { ...fetchOptions, headers });
  };

  let response = await doFetch(token);

  if (response.status === 401 && token) {
    const refreshToken = localStorage.getItem('refresh');
    if (refreshToken && !refreshing) {
      refreshing = fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      }).then(async (r) => {
        if (!r.ok) throw new Error('Refresh failed');
        const { access } = await r.json();
        localStorage.setItem('token', access);
        return access;
      }).finally(() => { refreshing = null; });
    }
    if (refreshing) {
      try {
        const newToken = await refreshing;
        response = await doFetch(newToken);
      } catch { /* refresh failed — user must log in again */ }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP ${response.status}`);
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

// Categories
export async function getCategories() {
  return apiRequest('/categories/');
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
