import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useSPANavigation } from '@/hooks/useSPANavigation';
import { useAuth } from '@/hooks/useAuth';

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ visible, onClose }) => {
  const [query, setQuery] = useState('');
  const { navigateToSection, addEmployee, addProject, addTimesheet, openPanel } = useSPANavigation();
  const { isAdmin, isHR } = useAuth();

  const commands: Command[] = [
    { id: 'dashboard', title: 'Dashboard', icon: 'home-outline', action: () => navigateToSection('dashboard'), keywords: ['home', 'main'] },
    { id: 'employees', title: 'Employees', icon: 'people-outline', action: () => navigateToSection('employees'), keywords: ['staff', 'team', 'people'] },
    { id: 'projects', title: 'Projects', icon: 'briefcase-outline', action: () => navigateToSection('projects'), keywords: ['work', 'client'] },
    { id: 'timesheets', title: 'Timesheets', icon: 'time-outline', action: () => navigateToSection('timesheets'), keywords: ['time', 'hours'] },
    { id: 'profile', title: 'Profile', icon: 'person-outline', action: () => navigateToSection('profile'), keywords: ['me', 'account'] },
    { id: 'settings', title: 'Settings', icon: 'settings-outline', action: () => openPanel('Settings', {}), keywords: ['config', 'preferences'] },
    ...(isAdmin() || isHR() ? [
      { id: 'add-employee', title: 'Add Employee', subtitle: 'Create new employee', icon: 'person-add-outline', action: addEmployee, keywords: ['new', 'hire', 'onboard'] },
    ] : []),
    { id: 'add-project', title: 'Add Project', subtitle: 'Create new project', icon: 'add-circle-outline', action: addProject, keywords: ['new', 'create'] },
    { id: 'add-timesheet', title: 'Add Timesheet', subtitle: 'Log time entry', icon: 'timer-outline', action: addTimesheet, keywords: ['log', 'track'] }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
    cmd.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
  );

  const executeCommand = (command: Command) => {
    command.action();
    onClose();
    setQuery('');
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
        
        <Animated.View
          entering={SlideInUp.duration(300)}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            maxHeight: '70%',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 20
          }}
        >
          {/* Search Input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb'
          }}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: '#111827'
              }}
              placeholder="Search commands..."
              value={query}
              onChangeText={setQuery}
              autoFocus
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Commands List */}
          <FlatList
            data={filteredCommands}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 400 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => executeCommand(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6'
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name={item.icon as any} size={20} color="#667eea" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Ionicons name="search-outline" size={48} color="#d1d5db" />
                <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 8 }}>
                  No commands found
                </Text>
              </View>
            }
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CommandPalette;