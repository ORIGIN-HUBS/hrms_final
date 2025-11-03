import React from 'react';
import { Modal, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useNavigation } from '@/contexts/NavigationContext';
import EmployeeAddScreen from '@/screens/employees/EmployeeAddScreen';
import EmployeeEditScreen from '@/screens/employees/EmployeeEditScreen';
import ProjectAddScreen from '@/screens/projects/ProjectAddScreen';
import TimesheetFormScreen from '@/screens/timesheets/TimesheetFormScreen';

const { width, height } = Dimensions.get('window');

const ModalManager: React.FC = () => {
  const { state, closeView } = useNavigation();
  
  if (state.viewType !== 'modal' || !state.activeView) return null;

  const renderModalContent = () => {
    switch (state.activeView) {
      case 'EmployeeAdd':
        return <EmployeeAddScreen {...state.viewProps} />;
      case 'EmployeeEdit':
        return <EmployeeEditScreen {...state.viewProps} />;
      case 'ProjectAdd':
        return <ProjectAddScreen {...state.viewProps} />;
      case 'TimesheetForm':
        return <TimesheetFormScreen {...state.viewProps} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={closeView}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={closeView}
        />
        
        <Animated.View
          entering={SlideInUp.duration(300)}
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            width: Math.min(width * 0.9, 500),
            maxHeight: height * 0.8,
            overflow: 'hidden'
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb'
          }}>
            <TouchableOpacity onPress={closeView}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1 }}>
            {renderModalContent()}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ModalManager;