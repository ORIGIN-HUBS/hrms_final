import { apiClient } from './client';
import { LoginRequest, User } from '@/types';

export const authApi = {
  login: async (credentials: LoginRequest) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await apiClient.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/user/current');
    return response.data;
  },

  getCsrfToken: async () => {
    const response = await apiClient.get('/api/csrf');
    return response.data;
  },
};