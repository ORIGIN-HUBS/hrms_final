import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '@/constants/config';
import { UserInfo } from '@/types';

interface SessionData {
  user: UserInfo;
  sessionId?: string;
}

// Platform-specific storage implementation
const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

/**
 * Store session data securely
 */
export const storeSession = async (session: SessionData): Promise<void> => {
  try {
    await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(session.user));
    if (session.sessionId) {
      await storage.setItem(STORAGE_KEYS.SESSION_ID, session.sessionId);
    }
  } catch (error) {
    console.error('Error storing session:', error);
    throw error;
  }
};

/**
 * Get stored session data
 */
export const getStoredSession = async (): Promise<SessionData | null> => {
  try {
    const userDataStr = await storage.getItem(STORAGE_KEYS.USER_DATA);
    const sessionId = await storage.getItem(STORAGE_KEYS.SESSION_ID);
    
    if (!userDataStr) {
      return null;
    }
    
    let user: UserInfo;
    try {
      user = JSON.parse(userDataStr) as UserInfo;
    } catch (parseError) {
      console.error('Error parsing user data:', parseError);
      await clearStoredSession();
      return null;
    }
    
    return {
      user,
      sessionId: sessionId || undefined,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Clear stored session data
 */
export const clearStoredSession = async (): Promise<void> => {
  try {
    await storage.removeItem(STORAGE_KEYS.USER_DATA);
    await storage.removeItem(STORAGE_KEYS.SESSION_ID);
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

/**
 * Store auth token
 */
export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
    throw error;
  }
};

/**
 * Get stored auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Store remember me preference
 */
export const storeRememberMe = async (remember: boolean): Promise<void> => {
  try {
    await storage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
  } catch (error) {
    console.error('Error storing remember me:', error);
  }
};

/**
 * Get remember me preference
 */
export const getRememberMe = async (): Promise<boolean> => {
  try {
    const value = await storage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return value === 'true';
  } catch (error) {
    console.error('Error getting remember me:', error);
    return false;
  }
};