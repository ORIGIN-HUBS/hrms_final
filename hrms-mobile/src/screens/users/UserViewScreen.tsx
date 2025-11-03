import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '@/services/userService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { User } from '@/types';

const UserViewScreen: React.FC<any> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUserById(userId);
      setUser(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load user details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    const action = user.enabled ? 'disable' : 'enable';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            setIsProcessing(true);
            try {
              await userService.toggleUserStatus(userId, !user.enabled);
              Alert.alert('Success', `User ${action}d successfully`);
              fetchUser();
            } catch (error: any) {
              Alert.alert('Error', error.message || `Failed to ${action} user`);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = () => {
    Alert.prompt(
      'Reset Password',
      'Enter new password for this user:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async (newPassword) => {
            if (!newPassword || newPassword.length < 6) {
              Alert.alert('Error', 'Password must be at least 6 characters');
              return;
            }
            setIsProcessing(true);
            try {
              await userService.resetUserPassword(userId, newPassword);
              Alert.alert('Success', 'Password reset successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reset password');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleDeleteUser = () => {
    if (!user) return;

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await userService.deleteUser(userId);
              Alert.alert('Success', 'User deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const InfoRow = ({ label, value, icon }: { label: string; value?: string; icon?: string }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        {icon && <Ionicons name={icon as any} size={20} color={colors.text.secondary} />}
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  const getRoleBadgeColor = (roleName: string) => {
    if (roleName.includes('ADMIN')) return colors.error;
    if (roleName.includes('HR')) return colors.warning;
    return colors.info;
  };

  const getRoleDisplayName = (roleName: string) => {
    return roleName.replace('ROLE_', '');
  };

  const userRoles = Array.isArray(user.roles)
    ? user.roles.map((role: any) => (typeof role === 'string' ? role : role.name))
    : [];

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userUsername}>@{user.username}</Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: user.enabled ? colors.success : colors.error },
                ]}
              />
              <Text style={styles.statusText}>
                {user.enabled ? 'Active' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Temporary Password Warning */}
      {user.isTemporaryPassword && (
        <Card style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={24} color={colors.warning} />
            <Text style={styles.warningTitle}>Temporary Password</Text>
          </View>
          <Text style={styles.warningText}>
            This user has a temporary password and must change it on first login.
          </Text>
        </Card>
      )}

      {/* User Information */}
      <Card>
        <Text style={styles.sectionTitle}>User Information</Text>
        <InfoRow label="Username" value={user.username} icon="person-outline" />
        <InfoRow label="Email" value={user.email} icon="mail-outline" />
        <InfoRow label="Full Name" value={user.fullName} icon="person-circle-outline" />
        <InfoRow
          label="Last Login"
          value={user.lastLogin || 'Never'}
          icon="time-outline"
        />
        <InfoRow
          label="Created At"
          value={user.createdAt}
          icon="calendar-outline"
        />
        <InfoRow
          label="Updated At"
          value={user.updatedAt}
          icon="calendar-outline"
        />
      </Card>

      {/* Roles */}
      <Card>
        <Text style={styles.sectionTitle}>Assigned Roles</Text>
        <View style={styles.rolesContainer}>
          {userRoles.map((roleName, index) => (
            <View
              key={index}
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleBadgeColor(roleName) + '20' },
              ]}
            >
              <Ionicons
                name={
                  roleName.includes('ADMIN')
                    ? 'shield-checkmark'
                    : roleName.includes('HR')
                    ? 'people'
                    : 'person'
                }
                size={16}
                color={getRoleBadgeColor(roleName)}
              />
              <Text style={[styles.roleText, { color: getRoleBadgeColor(roleName) }]}>
                {getRoleDisplayName(roleName)}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Edit User"
          onPress={() => navigation.navigate('UserEdit', { userId: user.id })}
          icon={<Ionicons name="create-outline" size={20} color={colors.white} />}
          style={styles.actionButton}
        />
        <Button
          title={user.enabled ? 'Disable User' : 'Enable User'}
          onPress={handleToggleStatus}
          loading={isProcessing}
          variant="outline"
          icon={
            <Ionicons
              name={user.enabled ? 'close-circle-outline' : 'checkmark-circle-outline'}
              size={20}
              color={user.enabled ? colors.error : colors.success}
            />
          }
          style={styles.actionButton}
        />
        <Button
          title="Reset Password"
          onPress={handleResetPassword}
          loading={isProcessing}
          variant="outline"
          icon={<Ionicons name="key-outline" size={20} color={colors.warning} />}
          style={styles.actionButton}
        />
        <Button
          title="Delete User"
          onPress={handleDeleteUser}
          loading={isProcessing}
          variant="outline"
          icon={<Ionicons name="trash-outline" size={20} color={colors.error} />}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  headerCard: {
    marginTop: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userUsername: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  warningCard: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
    borderWidth: 1,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  roleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  actionsContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default UserViewScreen;

