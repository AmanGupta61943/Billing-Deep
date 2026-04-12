import axios from 'axios';
import { getStoredAuth } from '../utils/auth';

/**
 * HOW URL RESOLUTION WORKS:
 * ─────────────────────────────────────────────────────────────────────
 * CRA loads env files in this priority order (higher = wins):
 *   .env.development.local  ← local dev override (gitignored, NOT on Vercel)
 *   .env.development        ← dev fallback
 *   .env.production         ← production (committed to git, Vercel reads this)
 *   .env                    ← all environments
 *
 * So:
 *   npm start  → uses .env.development.local → http://localhost:5000
 *   npm build  → uses .env.production        → https://billing-deep-backend.onrender.com
 *
 * Vercel runs `npm run build` so it always gets the Render URL.
 * ─────────────────────────────────────────────────────────────────────
 */

function normalizeApiBase(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim().replace(/\/+$/, '');
  // Strip trailing /api to avoid doubled paths like .../api/api/products
  if (t.toLowerCase().endsWith('/api')) {
    return t.slice(0, -4).replace(/\/+$/, '') || t;
  }
  return t;
}

const API_BASE_URL = normalizeApiBase(process.env.REACT_APP_API_URL);

if (!API_BASE_URL) {
  console.error(
    '[axiosClient] ⚠️  REACT_APP_API_URL is not set!\n' +
    '  • For local dev: create frontend/.env.development.local with REACT_APP_API_URL=http://localhost:5000\n' +
    '  • For production: Vercel will read frontend/.env.production automatically'
  );
}

console.log('[axiosClient] API_BASE_URL =', API_BASE_URL || '(MISSING)');

const axiosClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:5000', // fallback only for local dev safety
  timeout: 20000, // 20s — Render free tier can take up to 15s to cold-start
});

// Attach JWT token to every request
axiosClient.interceptors.request.use((config) => {
  const { token } = getStoredAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[axiosClient] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Centralised response error logging
axiosClient.interceptors.response.use(
  (response) => {
    console.log(`[axiosClient] ✓ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message;
    const base = error.config?.baseURL || API_BASE_URL;

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error(`[axiosClient] ⏱ TIMEOUT on ${url} — Render is cold-starting. Wait ~15s and retry.`);
    } else if (!error.response) {
      console.error(`[axiosClient] ❌ NETWORK ERROR — cannot reach ${base}${url}`);
      console.error('  Possible causes: backend down, wrong URL, CORS, no internet');
    } else {
      console.error(`[axiosClient] HTTP ${status} on ${url}: ${msg}`);
    }

    return Promise.reject(error);
  }
);

/**
 * Ping backend health endpoint on app load to warm up Render free tier.
 * Render spins down after 15 min inactivity — first request takes 15-60s.
 * This silent ping reduces cold-start delay before the user actually scans.
 */
export function pingBackend() {
  if (!API_BASE_URL) return;
  console.log('[axiosClient] Pinging backend to wake up Render...');
  axiosClient.get('/api/health').then(() => {
    console.log('[axiosClient] ✓ Backend is awake');
  }).catch(() => {
    console.warn('[axiosClient] Backend ping failed — it may still be cold-starting');
  });
}

export default axiosClient;
