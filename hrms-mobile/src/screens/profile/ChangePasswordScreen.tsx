import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ChangePasswordScreen: React.FC<any> = ({ navigation }) => {
  const { changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChangePassword = async (values: ChangePasswordForm) => {
    setIsLoading(true);
    try {
      await changePassword(values.currentPassword, values.newPassword, values.confirmPassword);
      Alert.alert(
        'Success',
        'Password changed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new secure password
          </Text>
        </View>
        
        <View style={styles.content}>
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleChangePassword}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <Card>
                <View style={styles.form}>
                  <Input
                    label="Current Password"
                    value={values.currentPassword}
                    onChangeText={handleChange('currentPassword')}
                    onBlur={handleBlur('currentPassword')}
                    secureTextEntry
                    placeholder="Enter your current password"
                    error={touched.currentPassword && errors.currentPassword}
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray[400]} />}
                  />
                  
                  <Input
                    label="New Password"
                    value={values.newPassword}
                    onChangeText={handleChange('newPassword')}
                    onBlur={handleBlur('newPassword')}
                    secureTextEntry
                    placeholder="Enter your new password"
                    error={touched.newPassword && errors.newPassword}
                    leftIcon={<Ionicons name="key-outline" size={20} color={colors.gray[400]} />}
                  />
                  
                  <Input
                    label="Confirm New Password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    secureTextEntry
                    placeholder="Confirm your new password"
                    error={touched.confirmPassword && errors.confirmPassword}
                    leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.gray[400]} />}
                  />
                  
                  <View style={styles.passwordRequirements}>
                    <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                    <Text style={styles.requirement}>• At least 8 characters long</Text>
                    <Text style={styles.requirement}>• Contains uppercase letter (A-Z)</Text>
                    <Text style={styles.requirement}>• Contains lowercase letter (a-z)</Text>
                    <Text style={styles.requirement}>• Contains at least one number (0-9)</Text>
                  </View>
                  
                  <View style={styles.actions}>
                    <Button
                      title="Change Password"
                      onPress={handleSubmit}
                      loading={isLoading}
                      icon={<Ionicons name="save-outline" size={20} color={colors.white} />}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => navigation.goBack()}
                      variant="outline"
                    />
                  </View>
                </View>
              </Card>
            )}
          </Formik>
        </View>
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
  header: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  passwordRequirements: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  requirementsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  requirement: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});

export default ChangePasswordScreen;
