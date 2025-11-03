import React from 'react';
import { View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInRight, SlideInLeft, SlideInUp, SlideInDown, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation, WindowPosition } from '@/contexts/NavigationContext';
import EmployeeListScreen from '@/screens/employees/EmployeeListScreen';
import EmployeeViewScreen from '@/screens/employees/EmployeeViewScreen';
import ProjectListScreen from '@/screens/projects/ProjectListScreen';
import ProjectViewScreen from '@/screens/projects/ProjectViewScreen';
import TimesheetDashboardScreen from '@/screens/timesheets/TimesheetDashboardScreen';
import TimesheetViewScreen from '@/screens/timesheets/TimesheetViewScreen';
import MyProfileScreen from '@/screens/profile/MyProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

const { width, height } = Dimensions.get('window');

const WindowManager: React.FC = () => {
  const { state, closeView, minimizeWindow } = useNavigation();

  const renderWindowContent = (component: string, props: any) => {
    switch (component) {
      case 'Employees':
        return <EmployeeListScreen />;
      case 'EmployeeView':
        return <EmployeeViewScreen {...props} />;
      case 'Projects':
        return <ProjectListScreen />;
      case 'ProjectView':
        return <ProjectViewScreen {...props} />;
      case 'Timesheets':
        return <TimesheetDashboardScreen />;
      case 'TimesheetView':
        return <TimesheetViewScreen {...props} />;
      case 'Profile':
        return <MyProfileScreen />;
      case 'Settings':
        return <SettingsScreen {...props} />;
      default:
        return null;
    }
  };

  const getInitialPosition = (position: WindowPosition) => {
    const windowWidth = Platform.OS === 'web' ? 400 : width * 0.45;
    
    switch (position) {
      case 'right':
        return { x: width - windowWidth - 10, y: 80 };
      case 'left':
        return { x: 10, y: 80 };
      case 'bottom':
        return { x: width - windowWidth - 10, y: height - (Platform.OS === 'web' ? 510 : height * 0.4 + 90) };
      case 'top':
        return { x: width / 2 - windowWidth / 2, y: 80 };
    }
  };

  const getAnimation = (position: WindowPosition) => {
    switch (position) {
      case 'right':
        return SlideInRight.duration(300);
      case 'left':
        return SlideInLeft.duration(300);
      case 'bottom':
        return SlideInUp.duration(300);
      case 'top':
        return SlideInDown.duration(300);
    }
  };

  const DraggableWindow = ({ window }: { window: any }) => {
    const windowWidth = Platform.OS === 'web' ? 400 : width * 0.45;
    const windowHeight = Platform.OS === 'web' ? 500 : height * 0.4;
    const minHeight = 60;
    
    const initialPos = getInitialPosition(window.position);
    const translateX = useSharedValue(initialPos.x);
    const translateY = useSharedValue(initialPos.y);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    
    const pan = Gesture.Pan()
      .onStart(() => {
        startX.value = translateX.value;
        startY.value = translateY.value;
      })
      .onUpdate((event) => {
        translateX.value = startX.value + event.translationX;
        translateY.value = startY.value + event.translationY;
      })
      .onEnd(() => {
        // Keep final position without constraints for free placement
        translateX.value = Math.max(-windowWidth/2, Math.min(width - windowWidth/2, translateX.value));
        translateY.value = Math.max(0, Math.min(height - 100, translateY.value));
      });
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ]
    }));
    
    return (
      <Animated.View
        entering={getAnimation(window.position)}
        style={[
          animatedStyle,
          {
            position: 'absolute',
            width: windowWidth,
            height: window.isMinimized ? minHeight : windowHeight,
            backgroundColor: 'white',
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 10,
            overflow: 'hidden',
            zIndex: 100
          }
        ]}
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#667eea',
            minHeight: 48
          }}>
            <TouchableOpacity 
              onPress={() => minimizeWindow(window.id)}
              style={{ padding: 4 }}
            >
              <Ionicons 
                name={window.isMinimized ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
            
            <View style={{ flex: 1, height: 20 }} />
            
            <TouchableOpacity 
              onPress={() => closeView(window.id)}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>

        {!window.isMinimized && (
          <View style={{ flex: 1 }}>
            {renderWindowContent(window.component, window.props)}
          </View>
        )}
      </Animated.View>
    );
  };
  
  return (
    <>
      {state.windows.map((window) => (
        <DraggableWindow key={window.id} window={window} />
      ))}
    </>
  );
};

export default WindowManager;