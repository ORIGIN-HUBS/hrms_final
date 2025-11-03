import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants/config';
import { UserInfo } from '@/types';

interface SessionData {
  user: UserInfo;
  sessionId?: string;
}

/**
 * Store session data securely
 */
export const storeSession = async (session: SessionData): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(session.user));
    if (session.sessionId) {
      await SecureStore.setItemAsync(STORAGE_KEYS.SESSION_ID, session.sessionId);
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
    const userDataStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    const sessionId = await SecureStore.getItemAsync(STORAGE_KEYS.SESSION_ID);
    
    if (!userDataStr) {
      return null;
    }
    
    const user = JSON.parse(userDataStr) as UserInfo;
    
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
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_ID);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

/**
 * Store auth token
 */
export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
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
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
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
    await SecureStore.setItemAsync(STORAGE_KEYS.REMEMBER_ME, remember.toString());
  } catch (error) {
    console.error('Error storing remember me:', error);
  }
};

/**
 * Get remember me preference
 */
export const getRememberMe = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEYS.REMEMBER_ME);
    return value === 'true';
  } catch (error) {
    console.error('Error getting remember me:', error);
    return false;
  }
};

