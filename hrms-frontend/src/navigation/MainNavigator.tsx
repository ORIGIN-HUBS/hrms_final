import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import EmployeeListScreen from '../screens/employee/EmployeeListScreen';
import EmployeeAddScreen from '../screens/employee/EmployeeAddScreen';
import EmployeeViewScreen from '../screens/employee/EmployeeViewScreen';
import EmployeeEditScreen from '../screens/employee/EmployeeEditScreen';
import ProjectListScreen from '../screens/project/ProjectListScreen';
import ProjectAddScreen from '../screens/project/ProjectAddScreen';
import ProjectViewScreen from '../screens/project/ProjectViewScreen';
import ProjectEditScreen from '../screens/project/ProjectEditScreen';
import TimesheetListScreen from '../screens/timesheet/TimesheetListScreen';
import TimesheetFormScreen from '../screens/timesheet/TimesheetFormScreen';
import TimesheetViewScreen from '../screens/timesheet/TimesheetViewScreen';
import TimesheetApprovalsScreen from '../screens/timesheet/TimesheetApprovalsScreen';
import OffboardingListScreen from '../screens/offboarding/OffboardingListScreen';
import OffboardingInitiateScreen from '../screens/offboarding/OffboardingInitiateScreen';
import OffboardingViewScreen from '../screens/offboarding/OffboardingViewScreen';
import OffboardingEditScreen from '../screens/offboarding/OffboardingEditScreen';
import SelfServiceScreen from '../screens/selfservice/SelfServiceScreen';
import SelfServiceDashboardScreen from '../screens/selfservice/SelfServiceDashboardScreen';
import CreateTicketScreen from '../screens/selfservice/CreateTicketScreen';
import ViewTicketScreen from '../screens/selfservice/ViewTicketScreen';
import InvoiceDashboardScreen from '../screens/invoice/InvoiceDashboardScreen';
import InvoiceGenerateScreen from '../screens/invoice/InvoiceGenerateScreen';
import InvoiceViewScreen from '../screens/invoice/InvoiceViewScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import DocumentsScreen from '../screens/documents/DocumentsScreen';
import UserManagementScreen from '../screens/user/UserManagementScreen';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function EmployeeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
      <Stack.Screen name="EmployeeAdd" component={EmployeeAddScreen} />
      <Stack.Screen name="EmployeeView" component={EmployeeViewScreen} />
      <Stack.Screen name="EmployeeEdit" component={EmployeeEditScreen} />
    </Stack.Navigator>
  );
}

function ProjectStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectList" component={ProjectListScreen} />
      <Stack.Screen name="ProjectAdd" component={ProjectAddScreen} />
      <Stack.Screen name="ProjectView" component={ProjectViewScreen} />
      <Stack.Screen name="ProjectEdit" component={ProjectEditScreen} />
    </Stack.Navigator>
  );
}

function TimesheetStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimesheetList" component={TimesheetListScreen} />
      <Stack.Screen name="TimesheetForm" component={TimesheetFormScreen} />
      <Stack.Screen name="TimesheetView" component={TimesheetViewScreen} />
      <Stack.Screen name="TimesheetApprovals" component={TimesheetApprovalsScreen} />
    </Stack.Navigator>
  );
}

function OffboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OffboardingList" component={OffboardingListScreen} />
      <Stack.Screen name="OffboardingInitiate" component={OffboardingInitiateScreen} />
      <Stack.Screen name="OffboardingView" component={OffboardingViewScreen} />
      <Stack.Screen name="OffboardingEdit" component={OffboardingEditScreen} />
    </Stack.Navigator>
  );
}

function SelfServiceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SelfServiceDashboard" component={SelfServiceDashboardScreen} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
      <Stack.Screen name="ViewTicket" component={ViewTicketScreen} />
    </Stack.Navigator>
  );
}

function InvoiceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InvoiceDashboard" component={InvoiceDashboardScreen} />
      <Stack.Screen name="InvoiceGenerate" component={InvoiceGenerateScreen} />
      <Stack.Screen name="InvoiceView" component={InvoiceViewScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');
  const isHR = user?.roles?.some(role => role.name === 'HR');
  const isEmployee = user?.roles?.some(role => role.name === 'EMPLOYEE');

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      
      {isAdmin && (
        <Drawer.Screen name="UserManagement" component={UserManagementScreen} />
      )}
      
      {(isAdmin || isHR) && (
        <>
          <Drawer.Screen name="Employees" component={EmployeeStack} />
          <Drawer.Screen name="Projects" component={ProjectStack} />
          <Drawer.Screen name="Timesheets" component={TimesheetStack} />
          <Drawer.Screen name="Offboarding" component={OffboardingStack} />
          <Drawer.Screen name="Invoices" component={InvoiceStack} />
          <Drawer.Screen name="Documents" component={DocumentsScreen} />
        </>
      )}
      
      {isEmployee && (
        <>
          <Drawer.Screen name="MyTimesheets" component={TimesheetStack} />
          <Drawer.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
      
      <Drawer.Screen name="SelfService" component={SelfServiceStack} />
    </Drawer.Navigator>
  );
}