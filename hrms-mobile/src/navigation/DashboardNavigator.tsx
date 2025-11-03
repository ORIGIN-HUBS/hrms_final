import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import EmployeeDashboardScreen from '@/screens/dashboard/EmployeeDashboardScreen';
import { useAuth } from '@/hooks/useAuth';

const Stack = createNativeStackNavigator();

const DashboardNavigator: React.FC = () => {
  const { isAdmin, isHR } = useAuth();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {(isAdmin() || isHR()) ? (
        <Stack.Screen name="AdminDashboard" component={DashboardScreen} />
      ) : (
        <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboardScreen} />
      )}
    </Stack.Navigator>
  );
};

export default DashboardNavigator;

