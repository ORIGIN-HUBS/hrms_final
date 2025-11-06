import { format, parseISO, formatDistanceToNow } from 'date-fns';

/**
 * Format date to display format
 */
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return format(dateObj, formatStr);
  } catch (error) {
    if (__DEV__) {
      console.error('Error formatting date');
    }
    return '';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    if (__DEV__) {
      console.error('Error formatting relative time');
    }
    return '';
  }
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  try {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    if (__DEV__) {
      console.error('Error formatting currency');
    }
    return '$0.00';
  }
};

/**
 * Format number
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return '??';
  
  const sanitizedName = name.replace(/[<>"'&]/g, '').trim();
  const parts = sanitizedName.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  const colorMap: { [key: string]: string } = {
    active: '#10b981',
    approved: '#10b981',
    verified: '#10b981',
    completed: '#10b981',
    resolved: '#10b981',
    paid: '#059669',
    
    pending: '#f59e0b',
    onboarding: '#3b82f6',
    submitted: '#3b82f6',
    in_progress: '#3b82f6',
    
    draft: '#6b7280',
    
    rejected: '#ef4444',
    terminated: '#ef4444',
    cancelled: '#ef4444',
    offboarding: '#f59e0b',
  };
  
  return colorMap[statusLower] || '#6b7280';
};

/**
 * Get status badge style
 */
export const getStatusBadgeStyle = (status: string) => {
  const color = getStatusColor(status);
  return {
    backgroundColor: `${color}20`,
    borderColor: color,
    color: color,
  };
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || typeof text !== 'string') return '';
  if (maxLength <= 0) return '';
  
  const sanitizedText = text.replace(/[<>"'&]/g, '');
  if (sanitizedText.length <= maxLength) return sanitizedText;
  return sanitizedText.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convert bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if user has role
 */
export const hasRole = (userRoles: string[], requiredRole: string | string[]): boolean => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => userRoles.includes(role));
  }
  return userRoles.includes(requiredRole);
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Validate file type
 */
export const isValidFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(filename).toLowerCase();
  return allowedTypes.includes(extension);
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  try {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    if (__DEV__) {
      console.error('Error cloning object');
    }
    return obj;
  }
};

