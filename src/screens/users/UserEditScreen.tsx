import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { userService } from '@/services/userService';
import { User, Role } from '@/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
});

const UserEditScreen: React.FC<any> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [userData, rolesData] = await Promise.all([
        userService.getUserById(userId),
        userService.getAllRoles(),
      ]);
      setUser(userData);
      setRoles(rolesData);
      setSelectedRoles(userData.roles?.map(r => typeof r === 'string' ? rolesData.find(role => role.name === r)?.id || 0 : r.id) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load user data');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (selectedRoles.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one role');
      return;
    }

    try {
      const updateData = {
        ...values,
        roleIds: selectedRoles,
      };

      await userService.updateUser(userId, updateData, selectedRoles);
      Alert.alert('Success', 'User updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error updating user:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update user');
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_ADMIN': return colors.error;
      case 'ROLE_HR': return colors.warning;
      case 'ROLE_EMPLOYEE': return colors.info;
      default: return colors.gray[500];
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Formik
        initialValues={{
          username: user.username,
          fullName: user.fullName,
          email: user.email,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <ScrollView style={styles.scrollView}>
            {/* User Information */}
            <Card>
              <Text style={styles.sectionTitle}>User Information</Text>
              <Input
                label="Username"
                value={values.username}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                error={touched.username && errors.username ? errors.username : undefined}
                placeholder="Enter username"
                autoCapitalize="none"
              />
              <Input
                label="Full Name"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={touched.fullName && errors.fullName ? errors.fullName : undefined}
                placeholder="Enter full name"
              />
              <Input
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email ? errors.email : undefined}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Card>

            {/* Role Assignment */}
            <Card>
              <Text style={styles.sectionTitle}>Role Assignment</Text>
              <Text style={styles.sectionSubtitle}>
                Select one or more roles for this user
              </Text>
              <View style={styles.rolesContainer}>
                {roles.map(role => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleCheckbox,
                      selectedRoles.includes(role.id) && styles.roleCheckboxSelected,
                    ]}
                    onPress={() => toggleRole(role.id)}
                  >
                    <View style={styles.roleCheckboxLeft}>
                      <View style={[
                        styles.checkbox,
                        selectedRoles.includes(role.id) && styles.checkboxSelected,
                      ]}>
                        {selectedRoles.includes(role.id) && (
                          <Ionicons name="checkmark" size={16} color={colors.white} />
                        )}
                      </View>
                      <View>
                        <Text style={styles.roleName}>{role.name}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(role.name) + '20' }
                    ]}>
                      <Text style={[styles.roleBadgeText, { color: getRoleColor(role.name) }]}>
                        {role.name.replace('ROLE_', '')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Account Status */}
            <Card>
              <View style={styles.statusRow}>
                <View>
                  <Text style={styles.statusLabel}>Account Status</Text>
                  <Text style={styles.statusValue}>
                    {user.enabled ? 'Active' : 'Disabled'}
                  </Text>
                </View>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: user.enabled ? colors.success : colors.error }
                ]} />
              </View>
              {user.isTemporaryPassword && (
                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={20} color={colors.warning} />
                  <Text style={styles.warningText}>
                    User is using a temporary password and should change it on next login
                  </Text>
                </View>
              )}
            </Card>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? 'Updating...' : 'Update User'}
                onPress={handleSubmit}
                disabled={isSubmitting}
              />
              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="outline"
              />
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </Formik>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  rolesContainer: {
    gap: spacing.sm,
  },
  roleCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  roleCheckboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  roleCheckboxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  roleDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warning + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default UserEditScreen;

