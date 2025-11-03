import { apiClient } from './api';
import { API_CONFIG } from '@/constants/config';
import { User, Role } from '@/types';

export const userService = {
  /**
   * Get all users
   */
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>(API_CONFIG.ENDPOINTS.USERS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await apiClient.get<User>(API_CONFIG.ENDPOINTS.USER_BY_ID(id));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (roleName: string): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>(
        API_CONFIG.ENDPOINTS.USER_BY_ROLE(roleName)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users by role');
    }
  },

  /**
   * Create new user
   */
  createUser: async (userData: Partial<User>, roleIds: number[]): Promise<User> => {
    try {
      const response = await apiClient.post<User>(API_CONFIG.ENDPOINTS.USERS, {
        ...userData,
        roleIds,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  /**
   * Update user
   */
  updateUser: async (id: number, userData: Partial<User>, roleIds: number[]): Promise<User> => {
    try {
      const response = await apiClient.put<User>(API_CONFIG.ENDPOINTS.USER_BY_ID(id), {
        ...userData,
        roleIds,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.USER_BY_ID(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  /**
   * Check if username exists
   */
  checkUsernameExists: async (username: string): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>(
        `${API_CONFIG.ENDPOINTS.USERS}/check-username/${username}`
      );
      return response.data;
    } catch (error: any) {
      return false;
    }
  },

  /**
   * Check if email exists
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>(
        `${API_CONFIG.ENDPOINTS.USERS}/check-email/${email}`
      );
      return response.data;
    } catch (error: any) {
      return false;
    }
  },

  /**
   * Get all roles
   */
  getAllRoles: async (): Promise<Role[]> => {
    try {
      const response = await apiClient.get<Role[]>(API_CONFIG.ENDPOINTS.ROLES);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch roles');
    }
  },

  /**
   * Enable/Disable user
   */
  toggleUserStatus: async (id: number, enabled: boolean): Promise<User> => {
    try {
      const response = await apiClient.patch<User>(
        `${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}/status`,
        { enabled }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  },

  /**
   * Reset user password
   */
  resetUserPassword: async (id: number, newPassword: string): Promise<void> => {
    try {
      await apiClient.post(`${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}/reset-password`, {
        newPassword,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },
};

export default userService;

