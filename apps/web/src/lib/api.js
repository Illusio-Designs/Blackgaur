import axios from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

// Axios instance with credentials for httpOnly refresh cookie (section 5.1 / 17.3)
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from cookie/localStorage when present (client side only).
api.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )accessToken=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error, token = null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
}

// Refresh on 401 (section 3.1 step 7 — access 15m / refresh 7d)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => api(original));
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        flushQueue(null);
        return api(original);
      } catch (refreshErr) {
        flushQueue(refreshErr, null);
        if (typeof window !== 'undefined') {
          // session expired — let the app route to login
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// Helper that unwraps the standard envelope (section 5.1) and supports a mock fallback.
export async function fetchList(endpoint, params = {}, mock) {
  try {
    const { data } = await api.get(endpoint, { params });
    return data;
  } catch (err) {
    if (mock !== undefined) {
      const items = typeof mock === 'function' ? mock(params) : mock;
      return {
        success: true,
        data: items,
        meta: {
          total: Array.isArray(items) ? items.length : 0,
          page: 1,
          limit: params.limit || 25,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        _mock: true,
      };
    }
    throw err;
  }
}

export async function fetchOne(endpoint, mock) {
  try {
    const { data } = await api.get(endpoint);
    return data?.data ?? data;
  } catch (err) {
    if (mock !== undefined) return typeof mock === 'function' ? mock() : mock;
    throw err;
  }
}
