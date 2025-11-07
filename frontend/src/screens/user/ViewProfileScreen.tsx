import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';

interface ViewProfileScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{ id: number; name: string }>;
  enabled: boolean;
  createdAt: string;
  lastLogin?: string;
  employee?: {
    id: number;
    employeeId: string;
    jobTitle: string;
    workEmail: string;
    phoneNumber: string;
    department: string;
  };
}

export const ViewProfileScreen: React.FC<ViewProfileScreenProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/users/profile');
      setProfile(response.data);
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to load profile');
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        await logout();
        onNavigate('Login');
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await logout();
              onNavigate('Login');
            }
          }
        ]
      );
    }
  };

  const InfoRow = ({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value?: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <MaterialIcons name={icon} size={20} color={colors.textSecondary} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.valueText}>{value || 'N/A'}</Text>
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Dashboard')}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => onNavigate('ChangePassword')}>
            <MaterialIcons name="lock" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.firstName} {profile?.lastName}</Text>
          <Text style={styles.profileUsername}>@{profile?.username}</Text>
          {profile?.roles && profile.roles.length > 0 && (
            <View style={styles.rolesContainer}>
              {profile.roles.map((role) => (
                <View key={role.id} style={styles.roleBadge}>
                  <Text style={styles.roleText}>{role.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="account-circle" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Account Information</Text>
          </View>
          <View style={styles.sectionContent}>
            <InfoRow icon="email" label="Email" value={profile?.email} />
            <InfoRow icon="person" label="Username" value={profile?.username} />
            <InfoRow icon="check-circle" label="Status" value={profile?.enabled ? 'Active' : 'Disabled'} />
            <InfoRow icon="calendar-today" label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
            <InfoRow icon="access-time" label="Last Login" value={profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'} />
          </View>
        </View>

        {/* Employee Information */}
        {profile?.employee && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="work" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Employee Information</Text>
            </View>
            <View style={styles.sectionContent}>
              <InfoRow icon="badge" label="Employee ID" value={profile.employee.employeeId} />
              <InfoRow icon="work" label="Job Title" value={profile.employee.jobTitle} />
              <InfoRow icon="business" label="Department" value={profile.employee.department} />
              <InfoRow icon="email" label="Work Email" value={profile.employee.workEmail} />
              <InfoRow icon="phone" label="Phone" value={profile.employee.phoneNumber} />
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Change Password"
            onPress={() => onNavigate('ChangePassword')}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surface,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  sectionContent: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  valueText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  actionsSection: {
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  logoutButton: {
    backgroundColor: colors.danger + '20',
    borderColor: colors.danger,
  },
  bottomSpace: {
    height: 40,
  },
});
