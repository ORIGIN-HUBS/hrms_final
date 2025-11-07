// User and Authentication Types
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  isTemporaryPassword: boolean;
  employeeId?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

// Employee Types
export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  workEmail: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  status: 'ONBOARDING' | 'ACTIVE' | 'OFFBOARDING' | 'TERMINATED';
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// Project Types
export interface Project {
  id: number;
  projectName: string;
  clientCompanyName: string;
  vendorCompanyName: string;
  projectStartDate: string;
  projectEndDate?: string;
  status: string;
  description?: string;
}

// Dashboard Analytics Types
export interface DashboardAnalytics {
  totalEmployees: number;
  activeProjects: number;
  pendingDocuments: number;
  pendingOffboardings: number;
  onboardingEmployees: number;
  totalProjects: number;
  totalDocuments: number;
  completedOffboardings: number;
  totalInvoices: number;
  totalInvoiceAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalTimesheets: number;
  approvedTimesheets: number;
  pendingApprovalTimesheets: number;
  rejectedTimesheets: number;
  departmentStats: Record<string, number>;
  monthlyHires: Record<string, number>;
  recentEmployees: Employee[];
  recentProjects: Project[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Employees: undefined;
  Projects: undefined;
  Profile: undefined;
};

export type EmployeeStackParamList = {
  List: undefined;
  Add: undefined;
  View: { id: number };
  Edit: { id: number };
};

export type ProjectStackParamList = {
  List: undefined;
  Add: undefined;
  View: { id: number };
  Edit: { id: number };
};