import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For session-based auth
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  // Add CSRF token if available
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function getCsrfToken(): string | null {
  // Try to get CSRF token from meta tag or cookie
  const metaTag = document.querySelector('meta[name="_csrf"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  return null;
}