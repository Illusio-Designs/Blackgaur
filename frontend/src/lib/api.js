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

// The API serializes Prisma models in camelCase (invoiceNumber, companyName),
// while the UI is written against snake_case (invoice_number, company_name).
// Deep-convert response payloads so the existing components work unchanged.
const SNAKE_CACHE = new Map();
function toSnakeKey(key) {
  if (SNAKE_CACHE.has(key)) return SNAKE_CACHE.get(key);
  const snake = key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').toLowerCase();
  SNAKE_CACHE.set(key, snake);
  return snake;
}
export function keysToSnake(value) {
  if (Array.isArray(value)) return value.map(keysToSnake);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[toSnakeKey(k)] = keysToSnake(v);
    return out;
  }
  return value;
}

// Unwrap the standard envelope (section 5.1). Hard-wired to the API — no mock
// fallback. `data` is snake-cased for the UI; `meta`/`filters_applied` are kept
// as-is (the UI reads meta.totalPages / hasNext in camelCase).
export async function fetchList(endpoint, params = {}) {
  const { data } = await api.get(endpoint, { params });
  return { ...data, data: keysToSnake(data?.data) };
}

export async function fetchOne(endpoint) {
  const { data } = await api.get(endpoint);
  return keysToSnake(data?.data ?? data);
}
