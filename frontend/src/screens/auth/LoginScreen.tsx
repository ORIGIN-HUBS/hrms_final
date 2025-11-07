import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import { AuthStackParamList } from '../../types';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await login(username, password);
      
      if (!success) {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
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

        {/* Login Card */}
        <View style={styles.loginCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandLogo}>
              <MaterialIcons name="access-time" size={40} color="white" />
            </View>
            <Text style={styles.title}>HRMS Pro</Text>
            <Text style={styles.subtitle}>Sign in to access your dashboard</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Username or Email"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username or email"
              leftIcon="person"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.username}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              leftIcon="lock"
              secureTextEntry
              error={errors.password}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 HRMS Pro. All rights reserved.
            </Text>
          </View>
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
  loginCard: {
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  form: {
    marginBottom: 30,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 10,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});