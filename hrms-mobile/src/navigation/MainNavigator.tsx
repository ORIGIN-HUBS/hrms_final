import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import WebNavigationHeader from '@/components/navigation/WebNavigationHeader';

// Import screen navigators
import DashboardNavigator from './DashboardNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import ProjectNavigator from './ProjectNavigator';
import TimesheetNavigator from './TimesheetNavigator';
import SelfServiceNavigator from './SelfServiceNavigator';
import NotificationNavigator from './NotificationNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator: React.FC = () => {
  const { isAdmin, isHR } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {(isAdmin() || isHR()) && (
        <Tab.Screen
          name="Employees"
          component={EmployeeNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Projects"
        component={ProjectNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Timesheets"
        component={TimesheetNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const WebNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <WebNavigationHeader />,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardNavigator} />
      <Stack.Screen name="Employees" component={EmployeeNavigator} />
      <Stack.Screen name="Projects" component={ProjectNavigator} />
      <Stack.Screen name="Timesheets" component={TimesheetNavigator} />
      <Stack.Screen name="SelfService" component={SelfServiceNavigator} />
      <Stack.Screen name="Notifications" component={NotificationNavigator} />
      <Stack.Screen name="Profile" component={ProfileNavigator} />
    </Stack.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return Platform.OS === 'web' ? <WebNavigator /> : <TabNavigator />;
};

export default MainNavigator;

