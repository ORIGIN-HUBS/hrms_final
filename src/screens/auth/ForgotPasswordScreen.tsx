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
import { forgotPasswordValidationSchema } from '@/utils/validation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const ForgotPasswordScreen: React.FC<any> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleForgotPassword = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(values.email);
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset instructions');
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
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
            
            <Formik
              initialValues={{ email: '' }}
              validationSchema={forgotPasswordValidationSchema}
              onSubmit={handleForgotPassword}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  <Input
                    label="Email Address"
                    placeholder="Enter your email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && errors.email ? errors.email : undefined}
                    icon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  
                  <Button
                    title="Send Reset Instructions"
                    onPress={handleSubmit}
                    loading={isLoading}
                    fullWidth
                    style={styles.submitButton}
                  />
                  
                  <Button
                    title="Back to Login"
                    onPress={() => navigation.goBack()}
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
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginBottom: spacing.md,
  },
});

export default ForgotPasswordScreen;

