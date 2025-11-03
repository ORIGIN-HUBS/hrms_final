import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSPANavigation } from '@/hooks/useSPANavigation';
import { useAuth } from '@/hooks/useAuth';

const QuickActions: React.FC = () => {
  const { navigateToSection, addEmployee, addProject, addTimesheet } = useSPANavigation();
  const { isAdmin, isHR } = useAuth();

  const actions = [
    { id: 'employees', label: 'Team', icon: 'people-outline', action: () => navigateToSection('employees') },
    { id: 'projects', label: 'Projects', icon: 'briefcase-outline', action: () => navigateToSection('projects') },
    { id: 'timesheets', label: 'Time', icon: 'time-outline', action: () => navigateToSection('timesheets') },
    ...(isAdmin() || isHR() ? [
      { id: 'add-employee', label: 'Add Staff', icon: 'person-add-outline', action: addEmployee }
    ] : []),
    { id: 'add-project', label: 'New Project', icon: 'add-circle-outline', action: addProject },
    { id: 'add-timesheet', label: 'Log Time', icon: 'timer-outline', action: addTimesheet }
  ];

  if (Platform.OS !== 'web') return null;

  return (
    <View style={{
      position: 'absolute',
      top: 80,
      left: 20,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 50
    }}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={action.action}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderRadius: 8,
            marginVertical: 2,
            minWidth: 140
          }}
        >
          <Ionicons name={action.icon as any} size={18} color="#667eea" />
          <Text style={{
            marginLeft: 8,
            fontSize: 14,
            color: '#374151',
            fontWeight: '500'
          }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default QuickActions;