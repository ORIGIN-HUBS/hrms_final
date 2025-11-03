# Security Implementation Guide

## Overview

This document outlines the security measures implemented in the HRMS mobile application to protect against common vulnerabilities and ensure data security.

## Security Fixes Implemented

### 1. Cross-Site Scripting (XSS) Prevention

**Issues Fixed:**
- User input sanitization in timesheet forms
- Employee data display sanitization
- Status badge content sanitization

**Implementation:**
- Created `sanitizeInput()` function to escape HTML entities
- Applied sanitization to all user-generated content
- Implemented input validation for form fields

**Files Modified:**
- `src/utils/security.ts` - Security utilities
- `src/screens/timesheets/TimesheetFormScreen.tsx`
- `src/screens/offboarding/OffboardingInitiateScreen.tsx`
- `src/components/common/StatusBadge.tsx`

### 2. Log Injection Prevention

**Issues Fixed:**
- Sanitized log messages to prevent injection attacks
- Removed sensitive data from logs
- Limited log message length

**Implementation:**
- Created `sanitizeLogMessage()` function
- Applied to all console.log/error statements
- Wrapped debug logs with `__DEV__` checks

**Files Modified:**
- `src/services/api.ts`
- `src/services/authService.ts`
- `src/services/projectService.ts`
- `src/screens/auth/LoginScreen.tsx`

### 3. Server-Side Request Forgery (SSRF) Prevention

**Issues Fixed:**
- URL validation for API requests
- Restricted allowed API endpoints
- Prevented arbitrary URL requests

**Implementation:**
- Created `isValidApiUrl()` function
- Added URL validation to all API client methods
- Whitelisted allowed API paths

**Files Modified:**
- `src/services/api.ts`
- `src/utils/security.ts`

### 4. Hardcoded Credentials Removal

**Issues Fixed:**
- Removed hardcoded API URLs
- Moved configuration to environment variables
- Secured sensitive configuration

**Implementation:**
- Updated configuration to use `EXPO_PUBLIC_*` environment variables
- Created `.env.example` template
- Removed sensitive defaults

**Files Modified:**
- `src/constants/config.ts`
- `.env.example` (created)

### 5. Error Handling Improvements

**Issues Fixed:**
- Inadequate error handling across components
- Exposed sensitive error information
- Missing error boundaries

**Implementation:**
- Standardized error handling patterns
- Created `sanitizeErrorMessage()` function
- Added proper error logging

**Files Modified:**
- Multiple service files
- Screen components
- Utility functions

## Security Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com
EXPO_PUBLIC_API_TIMEOUT=30000

# App Configuration
EXPO_PUBLIC_APP_NAME=HRMS Pro
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_SESSION_TIMEOUT=3600000

# File Upload Configuration
EXPO_PUBLIC_MAX_FILE_SIZE=10485760
EXPO_PUBLIC_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Security Configuration
EXPO_PUBLIC_ENABLE_RATE_LIMITING=true
EXPO_PUBLIC_MAX_LOGIN_ATTEMPTS=5
EXPO_PUBLIC_LOGIN_WINDOW_MS=300000
```

### Security Constants

The application includes centralized security configuration in `src/constants/security.ts`:

- Rate limiting settings
- Input validation rules
- XSS protection configuration
- Session management settings
- API security policies

## Security Best Practices

### 1. Input Validation

Always validate and sanitize user input:

```typescript
import { sanitizeInput } from '@/utils/security';

const handleUserInput = (input: string) => {
  const sanitized = sanitizeInput(input);
  // Process sanitized input
};
```

### 2. Error Handling

Use standardized error handling:

```typescript
import { sanitizeErrorMessage } from '@/utils/security';

try {
  // API call
} catch (error: any) {
  if (__DEV__) {
    console.error('Operation failed');
  }
  const message = sanitizeErrorMessage(error);
  Alert.alert('Error', message);
}
```

### 3. Logging

Sanitize log messages:

```typescript
import { sanitizeLogMessage } from '@/utils/security';

if (__DEV__) {
  console.log('User action:', sanitizeLogMessage(userInput));
}
```

### 4. API Requests

Validate URLs before making requests:

```typescript
import { isValidApiUrl } from '@/utils/security';

const makeRequest = (url: string) => {
  if (!isValidApiUrl(url)) {
    throw new Error('Invalid API URL');
  }
  // Make request
};
```

## Security Checklist

- [x] XSS prevention implemented
- [x] Log injection prevention
- [x] SSRF protection
- [x] Hardcoded credentials removed
- [x] Error handling improved
- [x] Input sanitization
- [x] URL validation
- [x] Environment configuration
- [x] Security utilities created
- [x] Documentation updated

## Additional Security Measures

### 1. Rate Limiting

The application includes client-side rate limiting to prevent abuse:

```typescript
import { rateLimiter } from '@/utils/security';

const handleLogin = async (credentials: LoginCredentials) => {
  if (!rateLimiter.isAllowed('login', 5, 300000)) {
    throw new Error('Too many login attempts');
  }
  // Proceed with login
};
```

### 2. File Upload Security

File uploads are validated for type and size:

```typescript
import { isValidFileType, sanitizeFileName } from '@/utils/security';

const handleFileUpload = (file: File) => {
  const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  
  if (!isValidFileType(file.name, allowedTypes)) {
    throw new Error('Invalid file type');
  }
  
  const sanitizedName = sanitizeFileName(file.name);
  // Process file
};
```

### 3. Session Management

Sessions are properly managed with timeout and validation:

- Automatic session timeout
- Session validation on API requests
- Secure session storage

## Monitoring and Maintenance

### Regular Security Updates

1. Keep dependencies updated
2. Monitor security advisories
3. Regular security audits
4. Penetration testing

### Security Monitoring

1. Log security events
2. Monitor failed login attempts
3. Track API usage patterns
4. Alert on suspicious activities

## Compliance

The implemented security measures help ensure compliance with:

- OWASP Top 10 security risks
- Data protection regulations
- Industry security standards
- Corporate security policies

## Contact

For security-related questions or to report vulnerabilities, contact the development team.