import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear invalid/expired token and notify app
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-change'));

      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.startsWith('/auth/login') || currentPath.startsWith('/auth/register');

      if (!isAuthPage) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`;
      }
    }
    return Promise.reject(error);
  }
);
