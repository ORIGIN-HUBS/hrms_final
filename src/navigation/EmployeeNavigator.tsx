import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeeListScreen from '@/screens/employees/EmployeeListScreen';
import EmployeeAddScreen from '@/screens/employees/EmployeeAddScreen';
import EmployeeEditScreen from '@/screens/employees/EmployeeEditScreen';
import EmployeeViewScreen from '@/screens/employees/EmployeeViewScreen';
import EmployeeDocumentsScreen from '@/screens/employees/EmployeeDocumentsScreen';

const Stack = createNativeStackNavigator();

const EmployeeNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
      <Stack.Screen name="EmployeeAdd" component={EmployeeAddScreen} />
      <Stack.Screen name="EmployeeEdit" component={EmployeeEditScreen} />
      <Stack.Screen name="EmployeeView" component={EmployeeViewScreen} />
      <Stack.Screen name="EmployeeDocuments" component={EmployeeDocumentsScreen} />
    </Stack.Navigator>
  );
};

export default EmployeeNavigator;

