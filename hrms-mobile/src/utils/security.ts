/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input.replace(/[<>\"'&]/g, (match) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match] || match;
  });
};

/**
 * Sanitize log messages to prevent log injection
 */
export const sanitizeLogMessage = (message: string | null | undefined): string => {
  if (!message || typeof message !== 'string') {
    return 'Invalid message';
  }
  
  return message.replace(/[\r\n\t]/g, ' ').substring(0, 200);
};

/**
 * Validate URL to prevent SSRF attacks
 */
export const isValidApiUrl = (url: string, allowedPaths: string[] = []): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  const defaultAllowedPaths = [
    '/api/',
    '/auth/',
    '/notifications',
    '/self-service',
    '/documents',
    '/invoice'
  ];
  
  const allowedPatterns = [...defaultAllowedPaths, ...allowedPaths];
  
  try {
    // Check if it's a relative URL with allowed paths
    if (url.startsWith('/')) {
      return allowedPatterns.some(pattern => url.startsWith(pattern));
    }
    
    // For absolute URLs, ensure they match the base URL
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const requestUrl = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    
    return requestUrl.origin === baseUrlObj.origin;
  } catch {
    return false;
  }
};

/**
 * Sanitize file names to prevent path traversal
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return 'unknown';
  }
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};

/**
 * Validate file type against allowed types
 */
export const isValidFileType = (fileName: string, allowedTypes: string[]): boolean => {
  if (!fileName || !allowedTypes || allowedTypes.length === 0) {
    return false;
  }
  
  const extension = fileName.toLowerCase().split('.').pop();
  return extension ? allowedTypes.includes(extension) : false;
};

/**
 * Sanitize error messages for user display
 */
export const sanitizeErrorMessage = (error: any): string => {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  if (typeof error === 'string') {
    return sanitizeInput(error);
  }
  
  if (error.message && typeof error.message === 'string') {
    return sanitizeInput(error.message);
  }
  
  return 'An error occurred';
};

/**
 * Validate and sanitize user data object
 */
export const sanitizeUserData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return {};
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeUserData(value);
    }
  }
  
  return sanitized;
};

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 300000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();