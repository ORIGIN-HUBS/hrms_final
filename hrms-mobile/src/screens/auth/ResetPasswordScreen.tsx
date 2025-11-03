import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import { authService } from '@/services/authService';
import { resetPasswordValidationSchema } from '@/utils/validation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const ResetPasswordScreen: React.FC<any> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = route.params || {};
  
  const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(token, values.newPassword, values.confirmPassword);
      Alert.alert(
        'Success',
        'Your password has been reset successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below.
            </Text>
            
            <Formik
              initialValues={{ newPassword: '', confirmPassword: '' }}
              validationSchema={resetPasswordValidationSchema}
              onSubmit={handleResetPassword}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  <Input
                    label="New Password"
                    placeholder="Enter new password"
                    value={values.newPassword}
                    onChangeText={handleChange('newPassword')}
                    onBlur={handleBlur('newPassword')}
                    error={touched.newPassword && errors.newPassword ? errors.newPassword : undefined}
                    icon="lock-closed-outline"
                    secureTextEntry
                  />
                  
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                    icon="lock-closed-outline"
                    secureTextEntry
                  />
                  
                  <Button
                    title="Reset Password"
                    onPress={handleSubmit}
                    loading={isLoading}
                    fullWidth
                    style={styles.submitButton}
                  />
                  
                  <Button
                    title="Back to Login"
                    onPress={() => navigation.navigate('Login')}
                    variant="outline"
                    fullWidth
                  />
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginBottom: spacing.md,
  },
});

export default ResetPasswordScreen;

