import React from 'react';
import { View } from 'react-native';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';

const ContentArea: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <DashboardScreen />
    </View>
  );
};

export default ContentArea;