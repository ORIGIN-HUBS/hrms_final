import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import CustomDrawerContent from '@/components/navigation/CustomDrawerContent';

// Import screen navigators
import DashboardNavigator from './DashboardNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import ProjectNavigator from './ProjectNavigator';
import TimesheetNavigator from './TimesheetNavigator';
import SelfServiceNavigator from './SelfServiceNavigator';
import NotificationNavigator from './NotificationNavigator';
import ProfileNavigator from './ProfileNavigator';
import UserNavigator from './UserNavigator';
import OffboardingNavigator from './OffboardingNavigator';
import InvoiceNavigator from './InvoiceNavigator';
import SettingsNavigator from './SettingsNavigator';
import ReportsNavigator from './ReportsNavigator';

// Import standalone screens
import DocumentsScreen from '@/screens/documents/DocumentsScreen';

const Drawer = createDrawerNavigator();

const MainNavigator: React.FC = () => {
  const { isAdmin, isHR } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#667eea',
        drawerInactiveTintColor: '#6b7280',
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
      }}
    >
      {/* Dashboard - Available to all users */}
      <Drawer.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Employees - Admin & HR only */}
      {(isAdmin() || isHR()) && (
        <Drawer.Screen
          name="Employees"
          component={EmployeeNavigator}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* Projects - Available to all users */}
      <Drawer.Screen
        name="Projects"
        component={ProjectNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Timesheets - Available to all users */}
      <Drawer.Screen
        name="Timesheets"
        component={TimesheetNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Self Service - Available to all users */}
      <Drawer.Screen
        name="SelfService"
        component={SelfServiceNavigator}
        options={{
          title: 'Self Service',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Notifications - Available to all users */}
      <Drawer.Screen
        name="Notifications"
        component={NotificationNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Admin & HR only sections */}
      {(isAdmin() || isHR()) && (
        <>
          <Drawer.Screen
            name="Users"
            component={UserNavigator}
            options={{
              drawerIcon: ({ color, size }) => (
                <Ionicons name="people-circle-outline" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="Offboarding"
            component={OffboardingNavigator}
            options={{
              drawerIcon: ({ color, size }) => (
                <Ionicons name="exit-outline" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="Documents"
            component={DocumentsScreen}
            options={{
              drawerIcon: ({ color, size }) => (
                <Ionicons name="document-text-outline" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="Invoices"
            component={InvoiceNavigator}
            options={{
              drawerIcon: ({ color, size }) => (
                <Ionicons name="receipt-outline" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="Reports"
            component={ReportsNavigator}
            options={{
              title: 'Reports & Analytics',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="bar-chart-outline" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* Profile - Available to all users */}
      <Drawer.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Settings - Available to all users */}
      <Drawer.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default MainNavigator;

