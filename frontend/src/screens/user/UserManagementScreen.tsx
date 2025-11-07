import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{
    id: number;
    name: string;
  }>;
  enabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserManagementScreenProps {
  onNavigate?: (route: string, params?: any) => void;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/users');
      console.log('Users response:', response.data);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId: number, enabled: boolean) => {
    try {
      await apiClient.post(`/users/${userId}/toggle`, { enabled: !enabled });
      fetchUsers();
      Alert.alert('Success', `User ${!enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleDeleteUser = (userId: number, username: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${username}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/users/${userId}`);
              fetchUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const renderUserRow = ({ item }: { item: User }) => (
    <View style={styles.tableRow}>
      <View style={styles.userCell}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </View>
      <View style={styles.emailCell}>
        <Text style={styles.cellText}>{item.email}</Text>
      </View>
      <View style={styles.roleCell}>
        <Text style={styles.cellText}>{item.roles?.map(role => role.name).join(', ')}</Text>
      </View>
      <View style={styles.statusCell}>
        <View style={[styles.statusBadge, { backgroundColor: item.enabled ? colors.success : colors.danger }]}>
          <Text style={styles.statusBadgeText}>{item.enabled ? 'Active' : 'Disabled'}</Text>
        </View>
      </View>
      <View style={styles.dateCell}>
        <Text style={styles.cellText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.actionsCell}>
        <TouchableOpacity style={styles.actionIcon} onPress={() => handleToggleUser(item.id, item.enabled)}>
          <MaterialIcons name={item.enabled ? 'toggle-on' : 'toggle-off'} size={20} color={item.enabled ? colors.success : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon} onPress={() => handleDeleteUser(item.id, item.username)}>
          <MaterialIcons name="delete" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen>
      <Header 
        title="User Management" 
        onBack={() => onNavigate?.('Dashboard')}
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onNavigate?.('AddUser')}
          >
            <MaterialIcons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <View style={styles.userCell}><Text style={styles.headerText}>User</Text></View>
          <View style={styles.emailCell}><Text style={styles.headerText}>Email</Text></View>
          <View style={styles.roleCell}><Text style={styles.headerText}>Roles</Text></View>
          <View style={styles.statusCell}><Text style={styles.headerText}>Status</Text></View>
          <View style={styles.dateCell}><Text style={styles.headerText}>Created</Text></View>
          <View style={styles.actionsCell}><Text style={styles.headerText}>Actions</Text></View>
        </View>
        <FlatList
          data={users}
          renderItem={renderUserRow}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchUsers}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  addButton: {
    padding: 8,
  },
  tableContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  userCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  username: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emailCell: {
    flex: 2,
    paddingHorizontal: 8,
  },
  roleCell: {
    flex: 1.5,
    paddingHorizontal: 8,
  },
  statusCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  dateCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  actionsCell: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 8,
  },
  cellText: {
    fontSize: 13,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  actionIcon: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});