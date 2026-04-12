import axios from 'axios';
import { getStoredAuth } from '../utils/auth';

const API_BASE_URL =
  process.env.REACT_APP_API_URL?.trim() ||
  '/api';

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

