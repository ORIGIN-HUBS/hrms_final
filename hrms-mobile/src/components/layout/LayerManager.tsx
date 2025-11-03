import React from 'react';
import { View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInRight, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@/contexts/NavigationContext';
import EmployeeListScreen from '@/screens/employees/EmployeeListScreen';
import EmployeeViewScreen from '@/screens/employees/EmployeeViewScreen';
import ProjectListScreen from '@/screens/projects/ProjectListScreen';
import ProjectViewScreen from '@/screens/projects/ProjectViewScreen';
import TimesheetDashboardScreen from '@/screens/timesheets/TimesheetDashboardScreen';
import TimesheetViewScreen from '@/screens/timesheets/TimesheetViewScreen';
import MyProfileScreen from '@/screens/profile/MyProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

const { width } = Dimensions.get('window');

const LayerManager: React.FC = () => {
  const { state, closeView } = useNavigation();

  const renderLayerContent = (component: string, props: any) => {
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

  return (
    <>
      {state.viewStack.map((layer, index) => {
        const isTopLayer = index === state.viewStack.length - 1;
        const layerWidth = Platform.OS === 'web' ? Math.min(width * 0.5, 600) : width * 0.9;
        const leftOffset = index * 50; // Stagger each layer

        return (
          <View
            key={layer.id}
            style={{
              position: 'absolute',
              top: 0,
              left: leftOffset,
              right: 0,
              bottom: 0,
              zIndex: layer.zIndex
            }}
          >
            {/* Background overlay - only clickable on top layer */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isTopLayer ? 'rgba(0,0,0,0.3)' : 'transparent'
              }}
              onPress={isTopLayer ? closeView : undefined}
              disabled={!isTopLayer}
            />

            {/* Layer content */}
            <Animated.View
              entering={SlideInRight.duration(300)}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: layerWidth,
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: -2, height: 0 },
                shadowOpacity: isTopLayer ? 0.2 : 0.1,
                shadowRadius: 8,
                elevation: layer.zIndex,
                opacity: isTopLayer ? 1 : 0.8
              }}
            >
              {/* Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
                backgroundColor: isTopLayer ? '#f9fafb' : '#f3f4f6'
              }}>
                <TouchableOpacity 
                  onPress={closeView}
                  disabled={!isTopLayer}
                >
                  <Ionicons 
                    name="close" 
                    size={24} 
                    color={isTopLayer ? '#6b7280' : '#9ca3af'} 
                  />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                {renderLayerContent(layer.component, layer.props)}
              </View>
            </Animated.View>
          </View>
        );
      })}
    </>
  );
};

export default LayerManager;