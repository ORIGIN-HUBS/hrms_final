import Constants from 'expo-constants';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CURRENT_USER: '/api/auth/user',
    CHANGE_PASSWORD: '/api/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    
    // Employees
    EMPLOYEES: '/api/employees',
    EMPLOYEE_BY_ID: (id: number) => `/api/employees/${id}`,
    EMPLOYEE_BY_EMAIL: (email: string) => `/api/employees/by-email/${email}`,
    EMPLOYEE_DOCUMENTS: (id: number) => `/api/employees/${id}/documents`,
    EMPLOYEE_UPLOAD_DOCUMENT: (id: number) => `/api/employees/${id}/documents/upload`,
    CREATE_USER_ACCOUNT: (id: number) => `/api/employees/${id}/create-user-account`,
    
    // Projects
    PROJECTS: '/api/projects',
    PROJECT_BY_ID: (id: number) => `/api/projects/${id}`,
    PROJECTS_BY_EMPLOYEE: (employeeId: number) => `/api/projects/employee/${employeeId}`,
    
    // Dashboard
    DASHBOARD_ANALYTICS: '/api/dashboard/analytics',
    EMPLOYEE_ANALYTICS: (employeeId: string) => `/api/dashboard/employee-analytics/${employeeId}`,
    
    // Timesheets
    TIMESHEETS: '/api/timesheets',
    TIMESHEET_BY_ID: (id: number) => `/api/timesheets/${id}`,
    TIMESHEETS_BY_EMPLOYEE: (employeeId: number) => `/api/timesheets/employee/${employeeId}`,
    TIMESHEETS_PENDING: '/api/timesheets/pending',
    TIMESHEET_SUBMIT: (id: number) => `/api/timesheets/${id}/submit`,
    TIMESHEET_APPROVE: (id: number) => `/api/timesheets/${id}/approve`,
    TIMESHEET_REJECT: (id: number) => `/api/timesheets/${id}/reject`,
    TIMESHEET_SAVE: (id: number) => `/api/timesheets/${id}/save`,
    TIMESHEET_SUMMARY: '/api/timesheets/summary',
    TIMESHEET_CURRENT_WEEK: (employeeId: number) => `/api/timesheets/current-week/${employeeId}`,
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    UNREAD_COUNT: '/notifications/api/unread-count',
    RECENT_NOTIFICATIONS: '/notifications/api/recent',
    MARK_READ: (id: number) => `/notifications/${id}/mark-read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    
    // Self-Service
    SELF_SERVICE_TICKETS: '/self-service',
    CREATE_TICKET: '/self-service/create',
    TICKET_BY_ID: (id: number) => `/self-service/ticket/${id}`,
    ADMIN_TICKETS: '/self-service/admin/tickets',
    ASSIGN_TICKET: (id: number) => `/self-service/admin/assign/${id}`,
    UPDATE_TICKET_STATUS: (id: number) => `/self-service/admin/update-status/${id}`,
    
    // Offboarding
    OFFBOARDINGS: '/api/offboarding',
    OFFBOARDING_BY_ID: (id: number) => `/api/offboarding/${id}`,
    OFFBOARDING_BY_EMPLOYEE: (employeeId: number) => `/api/offboarding/employee/${employeeId}`,
    OFFBOARDING_REVOKE_ACCESS: (id: number) => `/api/offboarding/${id}/revoke-access`,
    OFFBOARDING_GENERATE_RELIEVING: (id: number) => `/api/offboarding/${id}/generate-relieving`,
    OFFBOARDING_GENERATE_EXPERIENCE: (id: number) => `/api/offboarding/${id}/generate-experience`,
    OFFBOARDING_COMPLETE: (id: number) => `/api/offboarding/${id}/complete`,
    
    // Users
    USERS: '/api/users',
    USER_BY_ID: (id: number) => `/api/users/${id}`,
    USER_BY_ROLE: (roleName: string) => `/api/users/role/${roleName}`,

    // Roles
    ROLES: '/api/roles',
    
    // Documents
    DOCUMENTS: '/documents',
    
    // Invoices
    INVOICES: '/invoice/dashboard',
    GENERATE_INVOICE: '/invoice/generate',
  },
};

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.APP_NAME || 'HRMS Pro',
  VERSION: process.env.APP_VERSION || '1.0.0',
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || '3600000', 10),
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(','),
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SESSION_ID: 'session_id',
  REMEMBER_ME: 'remember_me',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ROLE_ADMIN',
  HR: 'ROLE_HR',
  EMPLOYEE: 'ROLE_EMPLOYEE',
};

// Status Constants
export const EMPLOYEE_STATUS = {
  ACTIVE: 'ACTIVE',
  ONBOARDING: 'ONBOARDING',
  OFFBOARDING: 'OFFBOARDING',
  TERMINATED: 'TERMINATED',
};

export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  EXTENDED: 'EXTENDED',
  TERMINATED: 'TERMINATED',
};

export const TIMESHEET_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAID: 'PAID',
};

export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
};

export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

