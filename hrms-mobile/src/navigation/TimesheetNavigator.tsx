import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TimesheetListScreen from '@/screens/timesheets/TimesheetListScreen';
import MyTimesheetsScreen from '@/screens/timesheets/MyTimesheetsScreen';
import TimesheetFormScreen from '@/screens/timesheets/TimesheetFormScreen';
import TimesheetViewScreen from '@/screens/timesheets/TimesheetViewScreen';
import TimesheetApprovalsScreen from '@/screens/timesheets/TimesheetApprovalsScreen';
import TimesheetDashboardScreen from '@/screens/timesheets/TimesheetDashboardScreen';

const Stack = createNativeStackNavigator();

const TimesheetNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimesheetList" component={TimesheetListScreen} />
      <Stack.Screen name="MyTimesheets" component={MyTimesheetsScreen} />
      <Stack.Screen name="TimesheetForm" component={TimesheetFormScreen} />
      <Stack.Screen name="TimesheetView" component={TimesheetViewScreen} />
      <Stack.Screen name="TimesheetApprovals" component={TimesheetApprovalsScreen} />
      <Stack.Screen name="TimesheetDashboard" component={TimesheetDashboardScreen} />
    </Stack.Navigator>
  );
};

export default TimesheetNavigator;

