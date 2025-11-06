import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvoiceDashboardScreen from '@/screens/invoice/InvoiceDashboardScreen';
import InvoiceGenerateScreen from '@/screens/invoice/InvoiceGenerateScreen';
import InvoiceViewScreen from '@/screens/invoice/InvoiceViewScreen';

const Stack = createNativeStackNavigator();

const InvoiceNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InvoiceDashboard" component={InvoiceDashboardScreen} />
      <Stack.Screen name="InvoiceGenerate" component={InvoiceGenerateScreen} />
      <Stack.Screen name="InvoiceView" component={InvoiceViewScreen} />
    </Stack.Navigator>
  );
};

export default InvoiceNavigator;

