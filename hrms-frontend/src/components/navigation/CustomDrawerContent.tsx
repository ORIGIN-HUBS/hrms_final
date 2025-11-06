import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider, List, Avatar } from 'react-native-paper';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { theme } from '../../theme';

export default function CustomDrawerContent(props: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');
  const isHR = user?.roles?.some(role => role.name === 'HR');
  const isEmployee = user?.roles?.some(role => role.name === 'EMPLOYEE');

  const handleLogout = () => {
    dispatch(logout());
  };

  const getInitials = (username: string) => {
    return username ? username.substring(0, 2).toUpperCase() : 'U';
  };

  const getRoleDisplay = () => {
    if (isAdmin) return 'Administrator';
    if (isHR) return 'HR Manager';
    if (isEmployee) return 'Employee';
    return 'User';
  };

  const getRoleColor = () => {
    if (isAdmin) return '#dc2626';
    if (isHR) return '#0ea5e9';
    if (isEmployee) return '#059669';
    return theme.colors.primary;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={theme.gradients.primary} style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Text 
            size={60} 
            label={getInitials(user?.username || '')}
            style={styles.avatar}
          />
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor() }]}>
            <Text style={styles.roleText}>{getRoleDisplay()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Navigation Items */}
      <DrawerContentScrollView {...props} style={styles.drawerContent}>
        {/* Main Section */}
        <View style={styles.drawerSection}>
          <Text style={styles.sectionTitle}>MAIN</Text>
          <DrawerItem
            label="Dashboard"
            icon={({ color, size }) => <Ionicons name="speedometer" size={size} color={color} />}
            onPress={() => props.navigation.navigate('Dashboard')}
            activeTintColor={theme.colors.primary}
            inactiveTintColor={theme.colors.onSurface}
          />
        </View>

        {/* HR Management - Admin & HR Only */}
        {(isAdmin || isHR) && (
          <View style={styles.drawerSection}>
            <Text style={styles.sectionTitle}>HR MANAGEMENT</Text>
            <DrawerItem
              label="Employees"
              icon={({ color, size }) => <Ionicons name="people" size={size} color={color} />}
              onPress={() => props.navigation.navigate('EmployeeList')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
            <DrawerItem
              label="Projects"
              icon={({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />}
              onPress={() => props.navigation.navigate('ProjectList')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
            <DrawerItem
              label="Approvals"
              icon={({ color, size }) => <Ionicons name="checkmark-circle" size={size} color={color} />}
              onPress={() => props.navigation.navigate('TimesheetApprovals')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
            <DrawerItem
              label="Offboarding"
              icon={({ color, size }) => <Ionicons name="exit" size={size} color={color} />}
              onPress={() => props.navigation.navigate('OffboardingList')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
            <DrawerItem
              label="Manage Tickets"
              icon={({ color, size }) => <Ionicons name="ticket" size={size} color={color} />}
              onPress={() => props.navigation.navigate('SelfServiceDashboard')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
            <DrawerItem
              label="Self Service Portal"
              icon={({ color, size }) => <Ionicons name="headset" size={size} color={color} />}
              onPress={() => props.navigation.navigate('SelfService')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
          </View>
        )}

        {/* Time & Finance */}
        <View style={styles.drawerSection}>
          <Text style={styles.sectionTitle}>TIME & FINANCE</Text>
          {(isAdmin || isHR) && (
            <>
              <DrawerItem
                label="Timesheets"
                icon={({ color, size }) => <Ionicons name="time" size={size} color={color} />}
                onPress={() => props.navigation.navigate('TimesheetList')}
                activeTintColor={theme.colors.primary}
                inactiveTintColor={theme.colors.onSurface}
              />
              <DrawerItem
                label="Invoices"
                icon={({ color, size }) => <Ionicons name="receipt" size={size} color={color} />}
                onPress={() => props.navigation.navigate('InvoiceDashboard')}
                activeTintColor={theme.colors.primary}
                inactiveTintColor={theme.colors.onSurface}
              />
            </>
          )}
          {isEmployee && (
            <DrawerItem
              label="My Timesheets"
              icon={({ color, size }) => <Ionicons name="time" size={size} color={color} />}
              onPress={() => props.navigation.navigate('TimesheetList')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
          )}
        </View>

        {/* Documents */}
        <View style={styles.drawerSection}>
          <Text style={styles.sectionTitle}>DOCUMENTS</Text>
          {(isAdmin || isHR) && (
            <DrawerItem
              label="All Documents"
              icon={({ color, size }) => <Ionicons name="document-text" size={size} color={color} />}
              onPress={() => props.navigation.navigate('Documents')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
          )}
          {isEmployee && (
            <DrawerItem
              label="Upload Documents"
              icon={({ color, size }) => <Ionicons name="cloud-upload" size={size} color={color} />}
              onPress={() => props.navigation.navigate('Documents')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
          )}
        </View>

        {/* Employee Section */}
        {isEmployee && (
          <View style={styles.drawerSection}>
            <Text style={styles.sectionTitle}>MY PROFILE</Text>
            <DrawerItem
              label="Profile"
              icon={({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />}
              onPress={() => props.navigation.navigate('Profile')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
          </View>
        )}

        {/* Support */}
        <View style={styles.drawerSection}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <DrawerItem
            label="Self Service Portal"
            icon={({ color, size }) => <Ionicons name="headset" size={size} color={color} />}
            onPress={() => props.navigation.navigate('SelfService')}
            activeTintColor={theme.colors.primary}
            inactiveTintColor={theme.colors.onSurface}
          />
          {(isAdmin || isHR) && (
            <DrawerItem
              label="Manage Tickets"
              icon={({ color, size }) => <Ionicons name="ticket" size={size} color={color} />}
              onPress={() => props.navigation.navigate('SelfServiceDashboard')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
          )}
        </View>

        {/* Administration - Admin Only */}
        {isAdmin && (
          <View style={styles.drawerSection}>
            <Text style={styles.sectionTitle}>ADMINISTRATION</Text>
            <DrawerItem
              label="User Management"
              icon={({ color, size }) => <Ionicons name="person-add" size={size} color={color} />}
              onPress={() => props.navigation.navigate('UserManagement')}
              activeTintColor={theme.colors.primary}
              inactiveTintColor={theme.colors.onSurface}
            />
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Logout */}
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => <Ionicons name="log-out" size={size} color="#dc2626" />}
          onPress={handleLogout}
          activeTintColor="#dc2626"
          inactiveTintColor="#dc2626"
          labelStyle={{ color: '#dc2626' }}
        />
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 HRMS Pro</Text>
        <Text style={styles.footerSubtext}>All rights reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: theme.spacing.md,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  drawerContent: {
    flex: 1,
  },
  drawerSection: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginLeft: 16,
    marginBottom: theme.spacing.sm,
    opacity: 0.7,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 10,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
});