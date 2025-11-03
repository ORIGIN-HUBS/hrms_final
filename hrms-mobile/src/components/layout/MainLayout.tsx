import React from 'react';
import { View, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@/contexts/NavigationContext';
import Header from './Header';
import BottomTabs from './BottomTabs';
import ContentArea from './ContentArea';
import WindowManager from './WindowManager';
import FloatingActionButton from '@/components/common/FloatingActionButton';
import QuickActions from './QuickActions';

const MainLayout: React.FC = () => {
  const isWeb = Platform.OS === 'web';

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Header />
      
      <View style={{ flex: 1 }}>
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={{ flex: 1 }}
        >
          <ContentArea />
        </Animated.View>
        {isWeb && <QuickActions />}
      </View>

      {!isWeb && <BottomTabs />}
      
      <WindowManager />
      <FloatingActionButton />
    </View>
  );
};

export default MainLayout;