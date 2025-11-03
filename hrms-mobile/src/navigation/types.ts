import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Dashboard Stack
export type DashboardStackParamList = {
  AdminDashboard: undefined;
  EmployeeDashboard: undefined;
};

// Employee Stack
export type EmployeeStackParamList = {
  EmployeeList: undefined;
  EmployeeAdd: undefined;
  EmployeeEdit: { employeeId: number };
  EmployeeView: { employeeId: number };
  EmployeeDocuments: { employeeId: number };
};

// Project Stack
export type ProjectStackParamList = {
  ProjectList: undefined;
  MyProjects: undefined;
  ProjectAdd: undefined;
  ProjectEdit: { projectId: number };
  ProjectView: { projectId: number };
};

// Timesheet Stack
export type TimesheetStackParamList = {
  TimesheetList: undefined;
  MyTimesheets: undefined;
  TimesheetForm: { timesheetId?: number };
  TimesheetView: { timesheetId: number };
  TimesheetApprovals: undefined;
  TimesheetDashboard: undefined;
};

// Self Service Stack
export type SelfServiceStackParamList = {
  SelfServiceDashboard: undefined;
  CreateTicket: undefined;
  ViewTicket: { ticketId: number };
  AdminTickets: undefined;
};

// Notification Stack
export type NotificationStackParamList = {
  NotificationList: undefined;
};

// User Stack
export type UserStackParamList = {
  UserList: undefined;
  UserAdd: undefined;
  UserEdit: { userId: number };
  UserView: { userId: number };
};

// Offboarding Stack
export type OffboardingStackParamList = {
  OffboardingList: undefined;
  OffboardingInitiate: undefined;
  OffboardingView: { offboardingId: number };
  OffboardingEdit: { offboardingId: number };
};

// Invoice Stack
export type InvoiceStackParamList = {
  InvoiceDashboard: undefined;
  InvoiceGenerate: undefined;
  InvoiceView: { invoiceId: number };
};

// Profile Stack
export type ProfileStackParamList = {
  MyProfile: undefined;
  ChangePassword: undefined;
};

// Settings Stack
export type SettingsStackParamList = {
  SettingsMain: undefined;
  About: undefined;
};

// Reports Stack
export type ReportsStackParamList = {
  ReportsList: undefined;
  Analytics: undefined;
};

// Main Drawer
export type MainDrawerParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Employees: NavigatorScreenParams<EmployeeStackParamList>;
  Projects: NavigatorScreenParams<ProjectStackParamList>;
  Timesheets: NavigatorScreenParams<TimesheetStackParamList>;
  SelfService: NavigatorScreenParams<SelfServiceStackParamList>;
  Notifications: NavigatorScreenParams<NotificationStackParamList>;
  Users: NavigatorScreenParams<UserStackParamList>;
  Offboarding: NavigatorScreenParams<OffboardingStackParamList>;
  Documents: undefined;
  Invoices: NavigatorScreenParams<InvoiceStackParamList>;
  Reports: NavigatorScreenParams<ReportsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainDrawerParamList>;
};

// Navigation prop types for screens
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

