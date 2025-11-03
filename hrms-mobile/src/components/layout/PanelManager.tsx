import React from 'react';
import { View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useNavigation } from '@/contexts/NavigationContext';
import EmployeeViewScreen from '@/screens/employees/EmployeeViewScreen';
import EmployeeListScreen from '@/screens/employees/EmployeeListScreen';
import ProjectViewScreen from '@/screens/projects/ProjectViewScreen';
import ProjectListScreen from '@/screens/projects/ProjectListScreen';
import TimesheetViewScreen from '@/screens/timesheets/TimesheetViewScreen';
import TimesheetDashboardScreen from '@/screens/timesheets/TimesheetDashboardScreen';
import MyProfileScreen from '@/screens/profile/MyProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

const { width } = Dimensions.get('window');

const PanelManager: React.FC = () => {
  const { state, closeView } = useNavigation();
  
  if (state.viewType !== 'panel' || !state.activeView) return null;

  const renderPanelContent = () => {
    switch (state.activeView) {
      case 'Employees':
        return <EmployeeListScreen />;
      case 'EmployeeView':
        return <EmployeeViewScreen {...state.viewProps} />;
      case 'Projects':
        return <ProjectListScreen />;
      case 'ProjectView':
        return <ProjectViewScreen {...state.viewProps} />;
      case 'Timesheets':
        return <TimesheetDashboardScreen />;
      case 'TimesheetView':
        return <TimesheetViewScreen {...state.viewProps} />;
      case 'Profile':
        return <MyProfileScreen />;
      case 'Settings':
        return <SettingsScreen {...state.viewProps} />;
      default:
        return null;
    }
  };

  const panelWidth = Platform.OS === 'web' ? Math.min(width * 0.4, 600) : width * 0.85;

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: panelWidth,
      backgroundColor: 'rgba(0,0,0,0.3)'
    }}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={closeView}
      />
      
      <Animated.View
        entering={SlideInRight.duration(300)}
        exiting={SlideOutRight.duration(300)}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: panelWidth,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <TouchableOpacity onPress={closeView}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={{ flex: 1 }}>
          {renderPanelContent()}
        </View>
      </Animated.View>
    </View>
  );
};

export default PanelManager;