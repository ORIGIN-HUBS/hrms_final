import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeRoute, onNavigate }) => {
  const { user, logout } = useAuth();

  if (Platform.OS !== 'web') return null;

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false;
  const isHR = user?.roles?.includes('ROLE_HR') || false;
  const isEmployee = user?.roles?.includes('ROLE_EMPLOYEE') || false;
  
  console.log('Sidebar user:', user);
  console.log('Sidebar roles:', user?.roles);
  console.log('isAdmin:', isAdmin, 'isHR:', isHR, 'isEmployee:', isEmployee);

  return (
    <View style={styles.sidebar}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Dashboard')} style={styles.brand}>
          <MaterialIcons name="business" size={32} color="white" />
          <Text style={styles.brandText}>HRMS Pro</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        {/* Main Section */}
        <View style={styles.navSection}>
          <Text style={styles.sectionTitle}>Main</Text>
          <TouchableOpacity
            style={[styles.navItem, activeRoute === 'Dashboard' && styles.navItemActive]}
            onPress={() => onNavigate('Dashboard')}
          >
            <MaterialIcons name="dashboard" size={20} color={activeRoute === 'Dashboard' ? 'white' : 'rgba(255,255,255,0.8)'} />
            <Text style={[styles.navText, activeRoute === 'Dashboard' && styles.navTextActive]}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* HR Management */}
        {(isAdmin || isHR) && (
          <View style={styles.navSection}>
            <Text style={styles.sectionTitle}>HR Management</Text>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Employees' && styles.navItemActive]}
              onPress={() => onNavigate('Employees')}
            >
              <MaterialIcons name="people" size={20} color={activeRoute === 'Employees' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Employees' && styles.navTextActive]}>Employees</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Projects' && styles.navItemActive]}
              onPress={() => onNavigate('Projects')}
            >
              <MaterialIcons name="work" size={20} color={activeRoute === 'Projects' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Projects' && styles.navTextActive]}>Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Approvals' && styles.navItemActive]}
              onPress={() => onNavigate('Approvals')}
            >
              <MaterialIcons name="check-circle" size={20} color={activeRoute === 'Approvals' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Approvals' && styles.navTextActive]}>Approvals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Offboarding' && styles.navItemActive]}
              onPress={() => onNavigate('Offboarding')}
            >
              <MaterialIcons name="exit-to-app" size={20} color={activeRoute === 'Offboarding' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Offboarding' && styles.navTextActive]}>Offboarding</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Time & Finance - Only show section for Admin/HR */}
        {(isAdmin || isHR) && (
          <View style={styles.navSection}>
            <Text style={styles.sectionTitle}>Time & Finance</Text>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Timesheets' && styles.navItemActive]}
              onPress={() => onNavigate('Timesheets')}
            >
              <MaterialIcons name="schedule" size={20} color={activeRoute === 'Timesheets' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Timesheets' && styles.navTextActive]}>Timesheets</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Invoices' && styles.navItemActive]}
              onPress={() => onNavigate('Invoices')}
            >
              <MaterialIcons name="receipt" size={20} color={activeRoute === 'Invoices' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Invoices' && styles.navTextActive]}>Invoices</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Documents - Only show section for Admin/HR */}
        {(isAdmin || isHR) && (
          <View style={styles.navSection}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Documents' && styles.navItemActive]}
              onPress={() => onNavigate('Documents')}
            >
              <MaterialIcons name="description" size={20} color={activeRoute === 'Documents' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Documents' && styles.navTextActive]}>All Documents</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Employee Section */}
        {isEmployee && !isAdmin && !isHR && (
          <View style={styles.navSection}>
            <Text style={styles.sectionTitle}>My Account</Text>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Profile' && styles.navItemActive]}
              onPress={() => onNavigate('Profile')}
            >
              <MaterialIcons name="person" size={20} color={activeRoute === 'Profile' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Profile' && styles.navTextActive]}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                logout();
                onNavigate('Login');
              }}
            >
              <MaterialIcons name="logout" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.navText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Section for Admin & HR */}
        {(isAdmin || isHR) && (
          <View style={styles.navSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'Profile' && styles.navItemActive]}
              onPress={() => onNavigate('Profile')}
            >
              <MaterialIcons name="person" size={20} color={activeRoute === 'Profile' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'Profile' && styles.navTextActive]}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                logout();
                onNavigate('Login');
              }}
            >
              <MaterialIcons name="logout" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.navText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Administration */}
        {isAdmin && (
          <View style={styles.navSection}>
            <Text style={styles.sectionTitle}>Administration</Text>
            <TouchableOpacity
              style={[styles.navItem, activeRoute === 'UserManagement' && styles.navItemActive]}
              onPress={() => onNavigate('UserManagement')}
            >
              <MaterialIcons name="settings" size={20} color={activeRoute === 'UserManagement' ? 'white' : 'rgba(255,255,255,0.8)'} />
              <Text style={[styles.navText, activeRoute === 'UserManagement' && styles.navTextActive]}>User Management</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    height: '100vh',
    backgroundColor: '#1e3c72',
    position: 'fixed' as any,
    left: 0,
    top: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  header: {
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
  },
  nav: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  navSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
    paddingHorizontal: 25,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 12,
    gap: 15,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 8,
  },
  navText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  navTextActive: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutBtn: {
    padding: 8,
  },
});