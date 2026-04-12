import axios from 'axios';
import { getStoredAuth } from '../utils/auth';

/**
 * Base URL must be the server origin only (no trailing /api).
 * All request paths in this app use the /api/... prefix.
 * If REACT_APP_API_URL ends with /api, it is stripped so paths are not doubled.
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

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  const { token } = getStoredAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
