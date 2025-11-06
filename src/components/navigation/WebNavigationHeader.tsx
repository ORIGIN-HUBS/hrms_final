import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { getInitials } from '@/utils/helpers';

const WebNavigationHeader: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout, isAdmin, isHR } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: 'home-outline', route: 'Dashboard' },
    ...(isAdmin() || isHR() ? [{ name: 'Employees', icon: 'people-outline', route: 'Employees' }] : []),
    { name: 'Projects', icon: 'briefcase-outline', route: 'Projects' },
    { name: 'Timesheets', icon: 'time-outline', route: 'Timesheets' },
    { name: 'Self Service', icon: 'help-circle-outline', route: 'SelfService' },
    { name: 'Notifications', icon: 'notifications-outline', route: 'Notifications' },
    { name: 'Profile', icon: 'person-circle-outline', route: 'Profile' },
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <Text style={styles.logo}>HRMS Pro</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuContainer}>
          <View style={styles.menu}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.route as never)}
              >
                <Ionicons name={item.icon as any} size={20} color={colors.white} />
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.userSection}>
          <TouchableOpacity
            style={styles.userButton}
            onPress={() => setShowUserMenu(!showUserMenu)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName ? getInitials(user.fullName) : 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.white} />
          </TouchableOpacity>

          {showUserMenu && (
            <View style={styles.userMenu}>
              <TouchableOpacity
                style={styles.userMenuItem}
                onPress={() => {
                  navigation.navigate('Profile' as never);
                  setShowUserMenu(false);
                }}
              >
                <Ionicons name="person-outline" size={16} color={colors.text.primary} />
                <Text style={styles.userMenuText}>My Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.userMenuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={16} color={colors.error} />
                <Text style={[styles.userMenuText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#667eea',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginRight: spacing.xl,
  },
  menuContainer: {
    flex: 1,
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  menuText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  userSection: {
    position: 'relative',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  userName: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  userMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  userMenuText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
});

export default WebNavigationHeader;