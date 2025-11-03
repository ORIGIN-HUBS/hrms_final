import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, SectionType } from '@/contexts/NavigationContext';
import { useAuth } from '@/hooks/useAuth';

const BottomTabs: React.FC = () => {
  const { state, navigateToSection } = useNavigation();
  const { isAdmin, isHR } = useAuth();

  const tabs = [
    { key: 'dashboard', label: 'Home', icon: 'home-outline' },
    ...(isAdmin() || isHR() ? [{ key: 'employees', label: 'Staff', icon: 'people-outline' }] : []),
    { key: 'projects', label: 'Projects', icon: 'briefcase-outline' },
    { key: 'timesheets', label: 'Time', icon: 'time-outline' },
    { key: 'profile', label: 'Profile', icon: 'person-outline' }
  ];

  return (
    <View style={{
      height: 80,
      backgroundColor: 'white',
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingBottom: 20
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => navigateToSection(tab.key as SectionType)}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 8
          }}
        >
          <Ionicons
            name={tab.icon as any}
            size={24}
            color={state.activeSection === tab.key ? '#667eea' : '#6b7280'}
          />
          <Text style={{
            fontSize: 12,
            marginTop: 4,
            color: state.activeSection === tab.key ? '#667eea' : '#6b7280'
          }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default BottomTabs;