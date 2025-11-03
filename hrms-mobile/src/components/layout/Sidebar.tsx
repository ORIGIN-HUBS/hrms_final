import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, SectionType } from '@/contexts/NavigationContext';
import { useAuth } from '@/hooks/useAuth';

const Sidebar: React.FC = () => {
  const { state, navigateToSection } = useNavigation();
  const { isAdmin, isHR } = useAuth();

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home-outline' },
    ...(isAdmin() || isHR() ? [{ key: 'employees', label: 'Employees', icon: 'people-outline' }] : []),
    { key: 'projects', label: 'Projects', icon: 'briefcase-outline' },
    { key: 'timesheets', label: 'Timesheets', icon: 'time-outline' },
    { key: 'profile', label: 'Profile', icon: 'person-outline' },
    { key: 'settings', label: 'Settings', icon: 'settings-outline' }
  ];

  return (
    <View style={{
      width: 240,
      backgroundColor: 'white',
      borderRightWidth: 1,
      borderRightColor: '#e5e7eb',
      paddingTop: 20
    }}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={() => navigateToSection(item.key as SectionType)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: state.activeSection === item.key ? '#f3f4f6' : 'transparent'
          }}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={state.activeSection === item.key ? '#667eea' : '#6b7280'}
          />
          <Text style={{
            marginLeft: 12,
            fontSize: 16,
            color: state.activeSection === item.key ? '#667eea' : '#374151'
          }}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Sidebar;