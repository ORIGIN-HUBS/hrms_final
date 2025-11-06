import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, Button, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch, RootState } from '../../store';
import { fetchEmployee } from '../../store/slices/employeeSlice';
import { logout } from '../../store/slices/authSlice';
import { theme } from '../../theme';

interface ProfileItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function ProfileItem({ icon, label, value }: ProfileItemProps) {
  return (
    <View style={styles.profileItem}>
      <View style={styles.profileItemIcon}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemLabel}>{label}</Text>
        <Text style={styles.profileItemValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentEmployee } = useSelector((state: RootState) => state.employee);

  useEffect(() => {
    if (user && !currentEmployee) {
      // Fetch current user's employee profile
      // This would need to be implemented in the backend
      // dispatch(fetchEmployee(user.employeeId));
    }
  }, [dispatch, user, currentEmployee]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return user?.username?.substring(0, 2).toUpperCase() || 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const employee = currentEmployee || {
    firstName: user?.username || 'User',
    lastName: '',
    personalEmail: user?.email || '',
    workEmail: '',
    contactNumber: '',
    jobTitle: '',
    employmentType: '',
    workLocation: '',
    joiningDate: '',
    employeeId: '',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient colors={theme.gradients.primary} style={styles.headerGradient}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={getInitials(employee.firstName, employee.lastName)}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <Text style={styles.profileName}>
            {employee.firstName} {employee.lastName}
          </Text>
          <Text style={styles.profileTitle}>{employee.jobTitle || 'Employee'}</Text>
          {employee.employeeId && (
            <Text style={styles.employeeId}>ID: {employee.employeeId}</Text>
          )}
        </View>
      </LinearGradient>

      {/* Profile Actions */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleEditProfile}
          style={styles.actionButton}
          icon="pencil"
        >
          Edit Profile
        </Button>
        <Button
          mode="outlined"
          onPress={handleChangePassword}
          style={styles.actionButton}
          icon="key"
        >
          Change Password
        </Button>
      </View>

      {/* Profile Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Divider style={styles.divider} />
          
          <ProfileItem
            icon="mail"
            label="Personal Email"
            value={employee.personalEmail || 'Not provided'}
          />
          
          {employee.workEmail && (
            <ProfileItem
              icon="mail-outline"
              label="Work Email"
              value={employee.workEmail}
            />
          )}
          
          <ProfileItem
            icon="call"
            label="Phone Number"
            value={employee.contactNumber || 'Not provided'}
          />
        </Card.Content>
      </Card>

      {/* Employment Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Employment Information</Text>
          <Divider style={styles.divider} />
          
          <ProfileItem
            icon="briefcase"
            label="Job Title"
            value={employee.jobTitle || 'Not specified'}
          />
          
          <ProfileItem
            icon="business"
            label="Employment Type"
            value={employee.employmentType || 'Not specified'}
          />
          
          <ProfileItem
            icon="location"
            label="Work Location"
            value={employee.workLocation || 'Not specified'}
          />
          
          {employee.joiningDate && (
            <ProfileItem
              icon="calendar"
              label="Joining Date"
              value={new Date(employee.joiningDate).toLocaleDateString()}
            />
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.quickActions}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('MyDocuments')}
              style={styles.quickActionButton}
              icon="document-text"
            >
              My Documents
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('MyTimesheets')}
              style={styles.quickActionButton}
              icon="time"
            >
              My Timesheets
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('MyTickets')}
              style={styles.quickActionButton}
              icon="headset"
            >
              Support Tickets
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          icon="logout"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: theme.spacing.md,
  },
  avatarLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  profileTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xs,
  },
  employeeId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  infoCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    marginBottom: theme.spacing.md,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  profileItemIcon: {
    width: 40,
    alignItems: 'center',
  },
  profileItemContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  profileItemLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  profileItemValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  quickActions: {
    gap: theme.spacing.xs,
  },
  quickActionButton: {
    justifyContent: 'flex-start',
  },
  logoutContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  logoutButton: {
    paddingVertical: theme.spacing.xs,
  },
});