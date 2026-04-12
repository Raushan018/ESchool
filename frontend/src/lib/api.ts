import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://eschool-ltrb.onrender.com/api');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    try {
      const token = JSON.parse(stored)?.state?.token as string | undefined;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
