import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { authApi } from '@/api/auth';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

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

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authApi.login({ username, password });
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid username or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#667eea', '#764ba2']}
      style={styles.container}
    >
      {/* Animated Background Shapes */}
      <View style={styles.backgroundShapes}>
        <View style={[styles.shape, styles.shape1]} />
        <View style={[styles.shape, styles.shape2]} />
        <View style={[styles.shape, styles.shape3]} />
        <View style={[styles.shape, styles.shape4]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginContainer}>
          <Card style={styles.loginCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.brandLogo}>
                <MaterialIcons name="schedule" size={40} color={colors.surface} />
              </View>
              <Text style={styles.title}>HRMS Pro</Text>
              <Text style={styles.subtitle}>Sign in to access your dashboard</Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <Input
                label="Username or Email"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username or email"
                icon="person"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.username}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                icon="lock"
                secureTextEntry
                error={errors.password}
              />

              <View style={styles.formOptions}>
                <TouchableOpacity style={styles.rememberMe}>
                  <MaterialIcons name="check-box-outline-blank" size={18} color={colors.primary} />
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2024 HRMS Pro. All rights reserved.</Text>
              <View style={styles.footerLinks}>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Terms of Service</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Support</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loginContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  form: {
    marginBottom: spacing.xl,
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rememberText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});