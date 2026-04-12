import axios from 'axios';
import { getStoredAuth } from '../utils/auth';

/**
 * Base URL resolution:
 * - In local dev: .env.development.local sets REACT_APP_API_URL=http://localhost:5000
 * - In production (Vercel): set REACT_APP_API_URL in Vercel dashboard
 * - Fallback: http://localhost:5000
 *
 * Strip trailing /api if someone accidentally added it.
 */
function normalizeApiBase(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim().replace(/\/+$/, '');
  if (t.toLowerCase().endsWith('/api')) {
    return t.slice(0, -4).replace(/\/+$/, '') || t;
  }
  return t;
}

const API_BASE_URL =
  normalizeApiBase(process.env.REACT_APP_API_URL) || 'http://localhost:5000';

console.log('[axiosClient] BASE URL:', API_BASE_URL);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15s — enough for Render cold-start first response
});

// Attach JWT token to every request
axiosClient.interceptors.request.use((config) => {
  const { token } = getStoredAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralised response error logging
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message;

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error(`[axiosClient] TIMEOUT on ${url} — backend may be cold-starting (Render free tier). Retry.`);
    } else if (!error.response) {
      console.error(`[axiosClient] NETWORK ERROR on ${url} — backend unreachable at ${API_BASE_URL}`);
    } else {
      console.error(`[axiosClient] HTTP ${status} on ${url}: ${msg}`);
    }

    return Promise.reject(error);
  }
);

/**
 * Wake up the Render backend on app load.
 * Render free tier sleeps after 15 min of inactivity.
 * Calling /api/health silently warms it up before the user tries to scan.
 */
export function pingBackend() {
  axiosClient.get('/api/health').catch(() => {
    // Silence ping errors — this is just a warmup
  });
}

export default axiosClient;
