import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import { useAuth } from '@/hooks/useAuth';
import { loginValidationSchema } from '@/utils/validation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const LoginScreen: React.FC<any> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const result = await login(values);
      
      if (!result.type) {
        // If no type property, the promise resolved without error
        if (__DEV__) {
          console.log('Login successful, waiting for navigation');
        }
        return;
      }
      
      if (result.type.endsWith('/rejected')) {
        if (__DEV__) {
          console.error('Login failed');
        }
        const errorMessage = typeof result.payload === 'string' ? result.payload : 'Login failed';
        Alert.alert('Login Failed', errorMessage);
      } else if (result.type.endsWith('/fulfilled')) {
        // Success case - AppNavigator will handle navigation
        if (__DEV__) {
          console.log('Login successful, authenticated state updated');
        }
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('Login error occurred');
      }
      const errorMessage = typeof error.message === 'string' ? error.message : 'Login failed';
      Alert.alert('Error', errorMessage);
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
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>HRMS Pro</Text>
            <Text style={styles.tagline}>Human Resource Management System</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
            
            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={loginValidationSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  <Input
                    label="Username"
                    placeholder="Enter your username"
                    value={values.username}
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    error={touched.username && errors.username ? errors.username : undefined}
                    icon="person-outline"
                    autoCapitalize="none"
                  />
                  
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && errors.password ? errors.password : undefined}
                    icon="lock-closed-outline"
                    secureTextEntry
                  />
                  
                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                  
                  <Button
                    title="Sign In"
                    onPress={handleSubmit}
                    loading={isLoading}
                    fullWidth
                    style={styles.loginButton}
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  loginButton: {
    marginTop: spacing.md,
  },
});

export default LoginScreen;

