import { apiClient } from './api';
import { API_CONFIG } from '@/constants/config';
import { Notification } from '@/types';

export const notificationService = {
  /**
   * Get all notifications
   */
  getAllNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get<Notification[]>(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },
  
  /**
   * Get recent notifications
   */
  getRecentNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get<Notification[]>(
        API_CONFIG.ENDPOINTS.RECENT_NOTIFICATIONS
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent notifications');
    }
  },
  
  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>(
        API_CONFIG.ENDPOINTS.UNREAD_COUNT
      );
      return response.data.count;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  },
  
  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<void> => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.MARK_READ(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.MARK_ALL_READ);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark all as read');
    }
  },
};

export default notificationService;

