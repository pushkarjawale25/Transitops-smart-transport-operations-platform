import axios from 'axios';

/**
 * Central Axios instance for TransitOps API.
 * - baseURL points to /api (proxied to http://localhost:5000 via Vite in dev)
 * - Automatically attaches JWT from localStorage
 * - Handles 401 by clearing stored token
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('transitops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('transitops_token');
      localStorage.removeItem('transitops_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
