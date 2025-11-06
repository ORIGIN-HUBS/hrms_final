/**
 * Security configuration constants
 */

export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITING: {
    ENABLED: process.env.EXPO_PUBLIC_ENABLE_RATE_LIMITING === 'true',
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.EXPO_PUBLIC_MAX_LOGIN_ATTEMPTS || '5', 10),
    LOGIN_WINDOW_MS: parseInt(process.env.EXPO_PUBLIC_LOGIN_WINDOW_MS || '300000', 10), // 5 minutes
    MAX_API_REQUESTS: 100,
    API_WINDOW_MS: 60000, // 1 minute
  },
  
  // Input validation
  INPUT_VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_TEXT_LENGTH: 5000,
    ALLOWED_FILE_EXTENSIONS: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },
  
  // XSS Protection
  XSS_PROTECTION: {
    SANITIZE_HTML: true,
    ESCAPE_SPECIAL_CHARS: true,
    ALLOWED_HTML_TAGS: [], // No HTML tags allowed by default
  },
  
  // CSRF Protection
  CSRF_PROTECTION: {
    ENABLED: true,
    TOKEN_HEADER: 'X-CSRF-Token',
  },
  
  // Session Management
  SESSION: {
    TIMEOUT_MS: parseInt(process.env.EXPO_PUBLIC_SESSION_TIMEOUT || '3600000', 10), // 1 hour
    REFRESH_THRESHOLD_MS: 300000, // 5 minutes before expiry
    MAX_CONCURRENT_SESSIONS: 3,
  },
  
  // API Security
  API_SECURITY: {
    ALLOWED_ORIGINS: [
      'http://localhost:8080',
      'https://api.originhubs.com',
    ],
    TIMEOUT_MS: 30000,
    MAX_RETRIES: 3,
  },
  
  // Logging Security
  LOGGING: {
    SANITIZE_LOGS: true,
    MAX_LOG_LENGTH: 200,
    EXCLUDE_SENSITIVE_FIELDS: [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
    ],
  },
};

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  EMPLOYEE_ID: /^[A-Z]{2,3}\d{3,6}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
};

export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  RATE_LIMITED: 'Too many requests. Please try again later',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
  INVALID_FILE_TYPE: 'File type is not allowed',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  VALIDATION_ERROR: 'Please check your input and try again',
};