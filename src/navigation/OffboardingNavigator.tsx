import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OffboardingListScreen from '@/screens/offboarding/OffboardingListScreen';
import OffboardingInitiateScreen from '@/screens/offboarding/OffboardingInitiateScreen';
import OffboardingViewScreen from '@/screens/offboarding/OffboardingViewScreen';
import OffboardingEditScreen from '@/screens/offboarding/OffboardingEditScreen';

const Stack = createNativeStackNavigator();

const OffboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OffboardingList" component={OffboardingListScreen} />
      <Stack.Screen name="OffboardingInitiate" component={OffboardingInitiateScreen} />
      <Stack.Screen name="OffboardingView" component={OffboardingViewScreen} />
      <Stack.Screen name="OffboardingEdit" component={OffboardingEditScreen} />
    </Stack.Navigator>
  );
};

export default OffboardingNavigator;

