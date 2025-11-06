import * as Yup from 'yup';

// Login validation schema
export const loginValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Change password validation schema
export const changePasswordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

// Forgot password validation schema
export const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
});

// Reset password validation schema
export const resetPasswordValidationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

// Employee validation schema
export const employeeValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  contactNumber: Yup.string()
    .required('Contact number is required')
    .matches(/^[0-9]{10}$/, 'Contact number must be 10 digits'),
  personalEmail: Yup.string()
    .required('Personal email is required')
    .email('Invalid email address'),
  jobTitle: Yup.string()
    .required('Job title is required'),
  employmentType: Yup.string()
    .required('Employment type is required'),
});

// Project validation schema
export const projectValidationSchema = Yup.object().shape({
  projectName: Yup.string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters'),
  status: Yup.string()
    .required('Status is required'),
});

// Timesheet validation schema
export const timesheetValidationSchema = Yup.object().shape({
  weekStartDate: Yup.date()
    .required('Week start date is required'),
  weekEndDate: Yup.date()
    .required('Week end date is required')
    .min(Yup.ref('weekStartDate'), 'End date must be after start date'),
});

// Ticket validation schema
export const ticketValidationSchema = Yup.object().shape({
  category: Yup.string()
    .required('Category is required'),
  priority: Yup.string()
    .required('Priority is required'),
  subject: Yup.string()
    .required('Subject is required')
    .min(5, 'Subject must be at least 5 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
});

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  if (password.length < 6) {
    return { isValid: false, strength: 'weak', message: 'Password too short' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (strengthScore <= 2) {
    return { isValid: true, strength: 'weak', message: 'Weak password' };
  } else if (strengthScore === 3) {
    return { isValid: true, strength: 'medium', message: 'Medium strength password' };
  } else {
    return { isValid: true, strength: 'strong', message: 'Strong password' };
  }
};

