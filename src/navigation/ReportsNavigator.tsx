import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportsScreen from '@/screens/reports/ReportsScreen';
import AnalyticsScreen from '@/screens/analytics/AnalyticsScreen';

const Stack = createNativeStackNavigator();

const ReportsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportsList" component={ReportsScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
};

export default ReportsNavigator;

