import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { AuthStackParamList } from '../../types';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/users/forgot-password`, {
        email: email.trim()
      });
      
      setSubmitted(true);
      Alert.alert(
        'Success',
        response.data.message || 'If an account exists with this email, you will receive password reset instructions.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.response?.data?.error || error.response?.data?.message || 'Failed to send reset email'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Screen backgroundColor={colors.surface}>
      <View style={styles.container}>
        {/* Animated Background Shapes */}
        <View style={styles.backgroundShapes}>
          <View style={[styles.shape, styles.shape1]} />
          <View style={[styles.shape, styles.shape2]} />
          <View style={[styles.shape, styles.shape3]} />
          <View style={[styles.shape, styles.shape4]} />
        </View>

        {/* Forgot Password Card */}
        <View style={styles.card}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock-reset" size={50} color="white" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              {submitted
                ? 'Check your email for reset instructions'
                : 'Enter your email address and we\'ll send you instructions to reset your password'}
            </Text>
          </View>

          {/* Form */}
          {!submitted && (
            <View style={styles.form}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                leftIcon="email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Button
                title={loading ? 'Sending...' : 'Send Reset Link'}
                onPress={handleSubmit}
                disabled={loading}
                style={styles.submitButton}
              />
            </View>
          )}

          {/* Success State */}
          {submitted && (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <MaterialIcons name="check-circle" size={60} color={colors.success} />
              </View>
              <Text style={styles.successText}>
                We've sent password reset instructions to your email address.
              </Text>
              <Text style={styles.successSubtext}>
                Please check your inbox and spam folder.
              </Text>
              <Button
                title="Back to Login"
                onPress={handleBackToLogin}
                style={styles.backToLoginButton}
              />
            </View>
          )}

          {/* Footer */}
          {!submitted && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  shape1: {
    width: 100,
    height: 100,
    top: '10%',
    left: '10%',
  },
  shape2: {
    width: 150,
    height: 150,
    top: '20%',
    right: '15%',
  },
  shape3: {
    width: 80,
    height: 80,
    bottom: '20%',
    left: '20%',
  },
  shape4: {
    width: 120,
    height: 120,
    bottom: '30%',
    right: '10%',
  },
  card: {
    width: '90%',
    maxWidth: 480,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.2,
    shadowRadius: 60,
    elevation: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 30,
  },
  submitButton: {
    marginTop: 10,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  successSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  backToLoginButton: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
