export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  status: 'ONBOARDING' | 'ACTIVE' | 'OFFBOARDING' | 'TERMINATED';
}

export interface Project {
  id: string;
  projectName: string;
  clientCompanyName: string;
  projectStartDate: string;
  projectEndDate?: string;
  status: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  pendingDocuments: number;
  pendingOffboardings: number;
  onboardingEmployees: number;
  totalProjects: number;
  totalDocuments: number;
  completedOffboardings: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}