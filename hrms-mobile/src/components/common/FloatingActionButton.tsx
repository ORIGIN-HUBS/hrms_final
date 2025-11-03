import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { useSPANavigation } from '@/hooks/useSPANavigation';
import { useNavigation } from '@/contexts/NavigationContext';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addEmployee, addProject, addTimesheet } = useSPANavigation();
  const { state } = useNavigation();
  
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(rotation.value, [0, 1], [0, 45])}deg` },
      { scale: withSpring(isOpen ? 1 : 0) }
    ]
  }));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    rotation.value = withSpring(isOpen ? 0 : 1);
    scale.value = withSpring(isOpen ? 0 : 1);
  };

  const hasEmployeeWindow = state.windows.some(w => w.component === 'Employees');
  const hasProjectWindow = state.windows.some(w => w.component === 'Projects');
  const hasTimesheetWindow = state.windows.some(w => w.component === 'Timesheets');
  
  const actions = [
    { label: 'Add Employee', icon: 'person-add', action: addEmployee, show: hasEmployeeWindow },
    { label: 'Add Project', icon: 'briefcase', action: addProject, show: hasProjectWindow },
    { label: 'Add Timesheet', icon: 'time', action: addTimesheet, show: hasTimesheetWindow }
  ].filter(action => action.show);

  if (actions.length === 0) return null;

  return (
    <View style={{ position: 'absolute', bottom: 100, right: 20 }}>
      {actions.map((action, index) => (
        <Animated.View
          key={action.label}
          style={[
            animatedStyle,
            {
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }
          ]}
        >
          <Text style={{
            backgroundColor: 'white',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 12,
            fontSize: 14,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            {action.label}
          </Text>
          <TouchableOpacity
            onPress={() => {
              action.action();
              toggleMenu();
            }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#667eea',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5
            }}
          >
            <Ionicons name={action.icon as any} size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      ))}
      
      <TouchableOpacity
        onPress={toggleMenu}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#667eea',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8
        }}
      >
        <Animated.View style={animatedStyle}>
          <Ionicons name="add" size={28} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingActionButton;