import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationListScreen from '@/screens/notifications/NotificationListScreen';

const Stack = createNativeStackNavigator();

const NotificationNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotificationList" component={NotificationListScreen} />
    </Stack.Navigator>
  );
};

export default NotificationNavigator;

