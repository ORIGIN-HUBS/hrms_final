import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '@/constants/config';
import { getStoredSession, clearStoredSession } from '@/utils/storage';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Set default axios config for web
if (typeof window !== 'undefined') {
  axios.defaults.withCredentials = true;
}

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get session data if available
    const session = await getStoredSession();
    
    // Add session cookie or token if available
    if (session?.sessionId) {
      config.headers['X-Session-ID'] = session.sessionId;
    }
    
    // Log request in development (sanitized)
    if (__DEV__) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: typeof config.url === 'string' ? config.url.replace(/[\r\n]/g, '') : config.url,
        hasData: !!config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development (sanitized)
    if (__DEV__) {
      console.log('API Response:', {
        status: response.status,
        url: typeof response.config.url === 'string' ? response.config.url.replace(/[\r\n]/g, '') : response.config.url,
        hasData: !!response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Log error in development (sanitized)
    if (__DEV__) {
      console.error('API Error:', {
        status: error.response?.status,
        url: typeof error.config?.url === 'string' ? error.config?.url.replace(/[\r\n]/g, '') : error.config?.url,
        message: typeof error.message === 'string' ? error.message.replace(/[\r\n]/g, '') : 'Unknown error',
        hasData: !!error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized - session expired
    if (error.response?.status === 401) {
      await clearStoredSession();
      // Navigation to login will be handled by the navigation guard
    }
    
    // Handle 403 Forbidden - access denied
    if (error.response?.status === 403) {
      console.warn('Access denied to resource');
    }
    
    return Promise.reject(error);
  }
);

// URL validation helper
const isValidApiUrl = (url: string): boolean => {
  try {
    const baseUrl = new URL(API_CONFIG.BASE_URL);
    const requestUrl = new URL(url, API_CONFIG.BASE_URL);
    return requestUrl.origin === baseUrl.origin;
  } catch {
    return url.startsWith('/api/') || url.startsWith('/auth/') || url.startsWith('/notifications') || url.startsWith('/self-service') || url.startsWith('/documents') || url.startsWith('/invoice');
  }
};

// API helper methods
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    if (!isValidApiUrl(url)) {
      return Promise.reject(new Error('Invalid API URL'));
    }
    return api.get<T>(url, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    if (!isValidApiUrl(url)) {
      return Promise.reject(new Error('Invalid API URL'));
    }
    return api.post<T>(url, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    if (!isValidApiUrl(url)) {
      return Promise.reject(new Error('Invalid API URL'));
    }
    return api.put<T>(url, data, config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    if (!isValidApiUrl(url)) {
      return Promise.reject(new Error('Invalid API URL'));
    }
    return api.patch<T>(url, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    if (!isValidApiUrl(url)) {
      return Promise.reject(new Error('Invalid API URL'));
    }
    return api.delete<T>(url, config);
  },
  
  // Upload file with multipart/form-data
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    if (!isValidApiUrl(url)) {
      return Promise.reject(new Error('Invalid API URL'));
    }
    return api.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  },
};

export default api;

