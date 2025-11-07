import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { EmployeeListScreen } from '../screens/employee/EmployeeListScreen';
import { AddEmployeeScreen } from '../screens/employee/AddEmployeeScreen';
import { ViewEmployeeScreen } from '../screens/employee/ViewEmployeeScreen';
import { EditEmployeeScreen } from '../screens/employee/EditEmployeeScreen';
import { EmployeeDocumentsScreen } from '../screens/employee/EmployeeDocumentsScreen';
import { ProjectListScreen } from '../screens/project/ProjectListScreen';
import { ViewProjectScreen } from '../screens/project/ViewProjectScreen';
import { EditProjectScreen } from '../screens/project/EditProjectScreen';
import { AddProjectScreen } from '../screens/project/AddProjectScreen';
import { ApprovalsScreen } from '../screens/timesheet/ApprovalsScreen';
import { TimesheetListScreen } from '../screens/timesheet/TimesheetListScreen';
import { OffboardingListScreen } from '../screens/offboarding/OffboardingListScreen';
import { InvoiceListScreen } from '../screens/invoice/InvoiceListScreen';
import { DocumentsScreen } from '../screens/documents/DocumentsScreen';
import { UserManagementScreen } from '../screens/user/UserManagementScreen';
import { ViewProfileScreen } from '../screens/user/ViewProfileScreen';
import { ChangePasswordScreen } from '../screens/user/ChangePasswordScreen';
import { ResetPasswordScreen } from '../screens/user/ResetPasswordScreen';
import { Sidebar } from '../components/layout/Sidebar';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';
import { View, Text, ActivityIndicator, Platform } from 'react-native';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => {
  const [activeRoute, setActiveRoute] = React.useState('Dashboard');
  const [screenParams, setScreenParams] = React.useState<any>(null);
  const { user } = useAuth();
  
  // Check if user has temporary password and redirect to change password
  React.useEffect(() => {
    if (user?.isTemporaryPassword && activeRoute !== 'ChangePassword') {
      setActiveRoute('ChangePassword');
    }
  }, [user, activeRoute]);
  
  const handleNavigate = (route: string, params?: any) => {
    // Prevent navigation away from change password if using temporary password
    if (user?.isTemporaryPassword && route !== 'ChangePassword') {
      return;
    }
    setActiveRoute(route);
    setScreenParams(params);
  };

  const renderScreen = () => {
    switch (activeRoute) {
      case 'Dashboard':
        return <DashboardScreen onNavigate={handleNavigate} />;
      case 'Employees':
      case 'EmployeeList':
        return <EmployeeListScreen onNavigate={handleNavigate} />;
      case 'AddEmployee':
        return <AddEmployeeScreen onNavigate={handleNavigate} />;
      case 'ViewEmployee':
        return <ViewEmployeeScreen onNavigate={handleNavigate} employeeId={screenParams?.id} />;
      case 'EditEmployee':
        return <EditEmployeeScreen onNavigate={handleNavigate} employeeId={screenParams?.id} />;
      case 'EmployeeDocuments':
        return <EmployeeDocumentsScreen onNavigate={handleNavigate} employeeId={screenParams?.id} />;
      case 'Projects':
        return <ProjectListScreen onNavigate={handleNavigate} />;
      case 'AddProject':
        return <AddProjectScreen onNavigate={handleNavigate} />;
      case 'ViewProject':
        return <ViewProjectScreen onNavigate={handleNavigate} projectId={screenParams?.id} />;
      case 'EditProject':
        return <EditProjectScreen onNavigate={handleNavigate} projectId={screenParams?.id} />;
      case 'Approvals':
        return <ApprovalsScreen onNavigate={handleNavigate} />;
      case 'Timesheets':
        return <TimesheetListScreen onNavigate={handleNavigate} />;
      case 'Offboarding':
        return <OffboardingListScreen onNavigate={handleNavigate} />;
      case 'Invoices':
        return <InvoiceListScreen onNavigate={handleNavigate} />;
      case 'Documents':
        return <DocumentsScreen onNavigate={handleNavigate} />;
      case 'UserManagement':
        return <UserManagementScreen onNavigate={handleNavigate} />;
      case 'Profile':
        return <ViewProfileScreen onNavigate={handleNavigate} />;
      case 'ChangePassword':
        return <ChangePasswordScreen onNavigate={handleNavigate} />;
      case 'ResetPassword':
        return <ResetPasswordScreen onNavigate={handleNavigate} userId={screenParams?.userId} username={screenParams?.username} />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Sidebar activeRoute={activeRoute} onNavigate={handleNavigate} />
      <View style={{ flex: 1, marginLeft: Platform.OS === 'web' ? 280 : 0 }}>
        {renderScreen()}
      </View>
    </View>
  );
};

const MobileMainNavigator = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof MaterialIcons.glyphMap;

        switch (route.name) {
          case 'Dashboard':
            iconName = 'dashboard';
            break;
          case 'Employees':
            iconName = 'people';
            break;
          case 'Projects':
            iconName = 'work';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'dashboard';
        }

        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    })}
  >
    <MainTab.Screen name="Dashboard" component={DashboardScreen} />
    <MainTab.Screen name="Employees" component={DashboardScreen} />
    <MainTab.Screen name="Projects" component={DashboardScreen} />
    <MainTab.Screen name="Profile" component={DashboardScreen} />
  </MainTab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={Platform.OS === 'web' ? MainNavigator : MobileMainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};