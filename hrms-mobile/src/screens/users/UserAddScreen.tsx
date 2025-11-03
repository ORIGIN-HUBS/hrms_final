import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '@/services/userService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Role } from '@/types';

const userValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots and underscores'),
  email: Yup.string().required('Email is required').email('Invalid email format'),
  fullName: Yup.string().required('Full name is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

const UserAddScreen: React.FC<any> = ({ navigation }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAllRoles();
      setRoles(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const getRoleDisplayName = (roleName: string) => {
    return roleName.replace('ROLE_', '');
  };

  const getRoleColor = (roleName: string) => {
    if (roleName.includes('ADMIN')) return colors.error;
    if (roleName.includes('HR')) return colors.warning;
    return colors.info;
  };

  const handleSubmit = async (values: any) => {
    if (selectedRoles.length === 0) {
      Alert.alert('Error', 'Please select at least one role');
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        username: values.username,
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        enabled: true,
        isTemporaryPassword: values.isTemporaryPassword,
      };

      await userService.createUser(userData, selectedRoles);

      Alert.alert('Success', 'User created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Formik
          initialValues={{
            username: '',
            email: '',
            fullName: '',
            password: '',
            confirmPassword: '',
            isTemporaryPassword: true,
          }}
          validationSchema={userValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View style={styles.form}>
              {/* User Information */}
              <Card>
                <Text style={styles.sectionTitle}>User Information</Text>

                <Input
                  label="Username *"
                  value={values.username}
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  error={touched.username ? errors.username : undefined}
                  placeholder="john.doe"
                  autoCapitalize="none"
                  leftIcon={<Ionicons name="person-outline" size={20} color={colors.gray[400]} />}
                />

                <Input
                  label="Full Name *"
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={touched.fullName ? errors.fullName : undefined}
                  placeholder="John Doe"
                  leftIcon={<Ionicons name="person-circle-outline" size={20} color={colors.gray[400]} />}
                />

                <Input
                  label="Email *"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email ? errors.email : undefined}
                  placeholder="john.doe@originhubs.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Ionicons name="mail-outline" size={20} color={colors.gray[400]} />}
                />
              </Card>

              {/* Password */}
              <Card>
                <Text style={styles.sectionTitle}>Password</Text>

                <Input
                  label="Password *"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password ? errors.password : undefined}
                  placeholder="Enter password"
                  secureTextEntry
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray[400]} />}
                />

                <Input
                  label="Confirm Password *"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  placeholder="Confirm password"
                  secureTextEntry
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray[400]} />}
                />

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setFieldValue('isTemporaryPassword', !values.isTemporaryPassword)}
                >
                  <Ionicons
                    name={values.isTemporaryPassword ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={values.isTemporaryPassword ? colors.primary : colors.gray[400]}
                  />
                  <Text style={styles.checkboxLabel}>
                    Temporary password (user must change on first login)
                  </Text>
                </TouchableOpacity>
              </Card>

              {/* Roles */}
              <Card>
                <Text style={styles.sectionTitle}>Assign Roles *</Text>
                <Text style={styles.sectionDescription}>
                  Select one or more roles for this user
                </Text>

                {roles.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={styles.roleItem}
                    onPress={() => toggleRole(role.id)}
                  >
                    <View style={styles.roleInfo}>
                      <View
                        style={[
                          styles.roleIcon,
                          { backgroundColor: getRoleColor(role.name) + '20' },
                        ]}
                      >
                        <Ionicons
                          name={
                            role.name.includes('ADMIN')
                              ? 'shield-checkmark'
                              : role.name.includes('HR')
                              ? 'people'
                              : 'person'
                          }
                          size={20}
                          color={getRoleColor(role.name)}
                        />
                      </View>
                      <View style={styles.roleDetails}>
                        <Text style={styles.roleName}>{getRoleDisplayName(role.name)}</Text>
                        <Text style={styles.roleDescription}>
                          {role.name.includes('ADMIN')
                            ? 'Full system access and user management'
                            : role.name.includes('HR')
                            ? 'Employee and project management'
                            : 'Basic employee access'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name={selectedRoles.includes(role.id) ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={selectedRoles.includes(role.id) ? colors.primary : colors.gray[400]}
                    />
                  </TouchableOpacity>
                ))}

                {selectedRoles.length === 0 && (
                  <Text style={styles.errorText}>Please select at least one role</Text>
                )}
              </Card>

              {/* Info Box */}
              <Card style={styles.infoBox}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={24} color={colors.info} />
                  <Text style={styles.infoTitle}>User Account Information</Text>
                </View>
                <Text style={styles.infoText}>
                  • Username must be unique and cannot be changed later{'\n'}
                  • Email will be used for notifications and password recovery{'\n'}
                  • Users with temporary passwords must change them on first login{'\n'}
                  • Multiple roles can be assigned to a single user
                </Text>
              </Card>

              <View style={styles.buttonContainer}>
                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  variant="outline"
                  style={styles.button}
                />
                <Button
                  title="Create User"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  style={styles.button}
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleDetails: {
    flex: 1,
  },
  roleName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.sm,
  },
  infoBox: {
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '30',
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.info,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
  },
});

export default UserAddScreen;

