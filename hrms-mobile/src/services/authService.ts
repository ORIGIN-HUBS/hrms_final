import { apiClient } from './api';
import { API_CONFIG } from '@/constants/config';
import { LoginRequest, LoginResponse, User, UserInfo } from '@/types';
import { storeSession, clearStoredSession } from '@/utils/storage';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );
      
      // Store session data if login successful
      if (response.data.success && response.data.user) {
        await storeSession({
          user: response.data.user,
          sessionId: response.data.sessionId,
        });
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearStoredSession();
    }
  },
  
  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<UserInfo | null> => {
    try {
      const response = await apiClient.get<UserInfo>(API_CONFIG.ENDPOINTS.CURRENT_USER);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  /**
   * Change password
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const formData = new URLSearchParams();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      formData.append('confirmPassword', confirmPassword);
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CHANGE_PASSWORD,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      return { success: true, message: 'Password changed successfully' };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to change password');
    }
  },
  
  /**
   * Forgot password
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.FORGOT_PASSWORD,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      return { success: true, message: 'Password reset instructions sent' };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset instructions');
    }
  },
  
  /**
   * Reset password
   */
  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const formData = new URLSearchParams();
      formData.append('token', token);
      formData.append('newPassword', newPassword);
      formData.append('confirmPassword', confirmPassword);
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESET_PASSWORD,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      return { success: true, message: 'Password reset successfully' };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },
};

export default authService;

