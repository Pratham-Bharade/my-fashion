import axios from 'axios';

const rawUrl = (import.meta as any).env?.VITE_API_URL;
let BASE_URL = '/api/v1';

if (rawUrl) {
  BASE_URL = rawUrl.endsWith('/api/v1') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api/v1`;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const message = error.response?.data?.detail || error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
