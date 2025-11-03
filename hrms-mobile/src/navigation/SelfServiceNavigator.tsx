import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelfServiceDashboardScreen from '@/screens/selfservice/SelfServiceDashboardScreen';
import CreateTicketScreen from '@/screens/selfservice/CreateTicketScreen';
import ViewTicketScreen from '@/screens/selfservice/ViewTicketScreen';
import AdminTicketsScreen from '@/screens/selfservice/AdminTicketsScreen';

const Stack = createNativeStackNavigator();

const SelfServiceNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SelfServiceDashboard" component={SelfServiceDashboardScreen} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
      <Stack.Screen name="ViewTicket" component={ViewTicketScreen} />
      <Stack.Screen name="AdminTickets" component={AdminTicketsScreen} />
    </Stack.Navigator>
  );
};

export default SelfServiceNavigator;

