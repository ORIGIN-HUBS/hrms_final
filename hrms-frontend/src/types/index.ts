export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  workEmail?: string;
  contactNumber: string;
  jobTitle: string;
  employmentType: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'OFFBOARDING' | 'TERMINATED';
  joiningDate: string;
  workLocation: string;
  department?: string;
  manager?: string;
  salary?: number;
  documents?: EmployeeDocument[];
}

export interface EmployeeDocument {
  id: number;
  documentType: string;
  fileName: string;
  uploadDate: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface Project {
  id: number;
  projectName: string;
  clientCompanyName: string;
  vendorCompanyName: string;
  projectStartDate: string;
  projectEndDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  description?: string;
  assignedEmployees?: Employee[];
}

export interface Timesheet {
  id: number;
  employee: Employee;
  weekStartDate: string;
  weekEndDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  totalHours: number;
  entries: TimesheetEntry[];
  expenses: TimesheetExpense[];
}

export interface TimesheetEntry {
  id: number;
  date: string;
  project: Project;
  hoursWorked: number;
  workLocation: string;
  workType: string;
  description?: string;
}

export interface TimesheetExpense {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  receipt?: string;
}

export interface SelfServiceTicket {
  id: number;
  ticketNumber: string;
  employee: Employee;
  category: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdDate: string;
  updatedDate: string;
  assignedTo?: string;
  resolution?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  pendingDocuments: number;
  pendingOffboardings: number;
  totalInvoices: number;
  totalTimesheets: number;
  pendingApprovalTimesheets: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}