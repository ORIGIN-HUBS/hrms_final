// Theme colors matching the Thymeleaf application
export const colors = {
  // Primary gradient colors
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#8b9aff',
  
  // Secondary gradient colors
  secondary: '#f093fb',
  secondaryDark: '#f5576c',
  
  // Success gradient
  success: '#4facfe',
  successDark: '#00f2fe',
  successLight: '#4ade80',
  
  // Status colors
  info: '#0d6efd',
  warning: '#ffc107',
  danger: '#dc3545',
  error: '#ef4444',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Background colors
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
    dark: '#1a1a1a',
  },
  
  // Text colors
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    disabled: '#9ca3af',
    inverse: '#ffffff',
  },
  
  // Border colors
  border: {
    light: '#e5e7eb',
    default: '#d1d5db',
    dark: '#9ca3af',
  },
  
  // Sidebar
  sidebar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: 'rgba(255,255,255,0.8)',
    textActive: '#ffffff',
  },
  
  // Card colors
  card: {
    background: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Status badge colors
  badge: {
    active: '#10b981',
    onboarding: '#3b82f6',
    offboarding: '#f59e0b',
    terminated: '#ef4444',
    pending: '#f59e0b',
    verified: '#10b981',
    rejected: '#ef4444',
    draft: '#6b7280',
    submitted: '#3b82f6',
    approved: '#10b981',
    paid: '#059669',
  },
};

// Gradient definitions
export const gradients = {
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  success: ['#4facfe', '#00f2fe'],
  info: ['#667eea', '#764ba2'],
  warning: ['#f59e0b', '#f97316'],
  danger: ['#ef4444', '#dc2626'],
};

export default colors;

