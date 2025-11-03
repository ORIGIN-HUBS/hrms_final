// User and Authentication Types
export interface Role {
  id: number;
  name: string; // ROLE_ADMIN, ROLE_HR, ROLE_EMPLOYEE
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  password?: string; // Only for create/update
  roles: Role[] | string[]; // Can be Role objects or role name strings
  enabled: boolean;
  isTemporaryPassword?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
  sessionId?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  isTemporaryPassword?: boolean;
  employee?: Employee;
}

// Employee Types
export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;
  contactNumber: string;
  alternateContactNumber?: string;
  personalEmail: string;
  workEmail?: string;
  residentialAddress?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
  ssn?: string;
  workPermit?: string;
  jobTitle: string;
  supervisor?: string;
  manager?: Employee;
  managerId?: number;
  employmentType: string;
  workLocation?: string;
  currentLocation?: string;
  workMode?: string;
  joiningDate?: string;
  terminationDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface EmployeeCreateRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  contactNumber: string;
  personalEmail: string;
  workEmail?: string;
  jobTitle: string;
  employmentType: string;
  joiningDate?: string;
  workLocation?: string;
  workMode?: string;
  managerId?: number;
  residentialAddress?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
}

export interface EmployeeResponse {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  jobTitle: string;
  employmentType: string;
  status: string;
  // ... other fields
}

// Project Types
export interface Project {
  id: number;
  projectName: string;
  jobTitle: string;
  // Vendor Information
  vendorCompanyName: string;
  pocName?: string;
  pocTitle?: string;
  pocEmail?: string;
  pocPhone?: string;
  vendorEmail?: string;
  agreementTerms?: string;
  vendorLocation?: string;
  // Client Information
  clientCompanyName: string;
  clientLocation?: string;
  workMode?: string;
  // Financial Information
  vendorPayRate?: number;
  candidatePayRate?: number;
  // Timeline
  projectStartDate?: string;
  projectEndDate?: string;
  extensionDate?: string;
  // Status
  status: string;
  // Employee Assignment
  employee?: Employee;
  employeeId?: number;
  // Audit Fields
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Timesheet Types
export interface Timesheet {
  id: number;
  timesheetId?: string;
  employee: Employee;
  employeeId?: number;
  manager?: Employee;
  managerId?: number;
  project?: Project;
  projectId?: number;
  weekStartDate: string;
  weekEndDate: string;
  // Status and Workflow
  status: string; // DRAFT, SUBMITTED, APPROVED, REJECTED, PAID, ARCHIVED
  submittedOn?: string;
  approvedBy?: Employee;
  approvalDate?: string;
  rejectionReason?: string;
  // Financial Information
  employeePayRate?: number;
  vendorBillRate?: number;
  totalHoursLogged?: number;
  totalRegularHours?: number;
  totalOvertimeHours?: number;
  totalBillableHours?: number;
  totalNonBillableHours?: number;
  totalBillableAmount?: number;
  totalPayableAmount?: number;
  totalExpenses?: number;
  // Invoice and Payment
  invoiceId?: string;
  invoiceDate?: string;
  paymentDueDate?: string;
  paymentStatus?: string; // PENDING, PROCESSING, PAID, OVERDUE, CANCELLED
  // AI/ML Enhancement
  autoPopulated?: boolean;
  anomalyDetected?: boolean;
  anomalyReason?: string;
  aiConfidenceScore?: number;
  // Audit
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  // Relationships
  timesheetEntries?: TimesheetEntry[];
  expenses?: TimesheetExpense[];
}

export interface TimesheetEntry {
  id?: number;
  timesheetId?: number;
  workDate: string;
  // Time Information
  hoursWorked: number;
  billableHours?: number;
  nonBillableHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  // Time Tracking Details
  startTime?: string;
  endTime?: string;
  notes?: string;
  comments?: string;
  // Work Type and Location
  workType?: string; // REGULAR, OVERTIME, HOLIDAY, WEEKEND, SICK_LEAVE, VACATION, TRAINING, MEETING, TRAVEL
  workLocation?: string; // OFFICE, REMOTE, CLIENT_SITE, HYBRID, TRAVEL
  // AI/ML Enhancement
  autoCaptured?: boolean;
  calendarSynced?: boolean;
  productivityScore?: number;
  // Audit
  createdAt?: string;
  updatedAt?: string;
}

export interface TimesheetExpense {
  id?: number;
  timesheetId?: number;
  expenseDate: string;
  expenseAmount: number;
  expenseType: string;
  expenseDescription?: string;
  vendorName?: string;
  category?: string;
  receiptFilePath?: string;
  receiptFileName?: string;
  status?: string;
  reimbursable?: boolean;
  billableToClient?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  category: string;
  userId?: number;
  employeeId?: number;
  documentId?: number;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

// Self-Service Ticket Types
export interface SelfServiceTicket {
  id: number;
  ticketNumber: string;
  employee: Employee;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  assignedTo?: Employee;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolution?: string;
  adminNotes?: string;
}

// Offboarding Types
export interface Offboarding {
  id: number;
  employee: Employee;
  employeeId?: number;
  // Exit Details
  resignationDate?: string;
  reasonForLeaving?: string;
  lastWorkingDay?: string;
  noticePeriod?: number;
  assetsToCollect?: string;
  feedbackAndSuggestions?: string;
  // Settlement Details
  finalSettlement?: number;
  pendingSalary?: number;
  settlementStatus?: string; // PENDING, PROCESSED, COMPLETED
  // IT Access
  emailRevoked?: boolean;
  slackRevoked?: boolean;
  emailRevokedAt?: string;
  slackRevokedAt?: string;
  // Documents
  relievingLetterGenerated?: boolean;
  experienceCertificateGenerated?: boolean;
  relievingLetterPath?: string;
  experienceCertificatePath?: string;
  // NDA
  ndaSigned?: boolean;
  ndaDocumentPath?: string;
  // Status
  status: string; // INITIATED, IN_PROGRESS, COMPLETED
  // Audit Fields
  initiatedAt?: string;
  completedAt?: string;
  initiatedBy?: string;
}

// Document Types
export interface EmployeeDocument {
  id: number;
  employee: Employee;
  documentType: string;
  documentName: string;
  filePath: string;
  fileSize?: number;
  uploadedAt: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

// Dashboard Analytics Types
export interface DashboardAnalytics {
  totalEmployees?: number;
  activeEmployees?: number;
  onboardingEmployees?: number;
  offboardingEmployees?: number;
  totalProjects?: number;
  activeProjects?: number;
  pendingTimesheets?: number;
  pendingApprovals?: number;
  // ... other analytics fields
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

