import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const LoginScreen: React.FC<any> = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ username, password });
      
      if (result.type.includes('fulfilled')) {
        // Navigation handled by auth state
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginCard}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.accentBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />

            <View style={styles.header}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.brandLogo}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name='time' size={40} color={colors.white} />
              </LinearGradient>

              <Text style={styles.loginTitle}>HRMS Pro</Text>
              <Text style={styles.loginSubtitle}>Sign in to access your dashboard</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Username or Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name='person-outline'
                    size={20}
                    color={colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder='Enter your username'
                    placeholderTextColor={colors.gray[400]}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize='none'
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name='lock-closed-outline'
                    size={20}
                    color={colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder='Enter your password'
                    placeholderTextColor={colors.gray[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize='none'
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name='checkmark' size={16} color={colors.white} />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.signInButton}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.signInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name='log-in-outline' size={20} color={colors.white} />
                  <Text style={styles.signInText}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}> 2024 HRMS Pro. All rights reserved.</Text>
              <View style={styles.footerLinks}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
                <Text style={styles.footerDivider}></Text>
                <Text style={styles.footerLink}>Terms of Service</Text>
                <Text style={styles.footerDivider}></Text>
                <Text style={styles.footerLink}>Support</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  loginCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: spacing['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 60,
    elevation: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  header: { alignItems: 'center', marginBottom: spacing['2xl'] },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loginTitle: { fontSize: 32, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  loginSubtitle: { fontSize: 16, color: colors.text.secondary, fontWeight: '500' },
  form: { marginBottom: spacing.xl },
  formGroup: { marginBottom: spacing.lg },
  label: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: 16, paddingVertical: spacing.md, color: colors.text.primary },
  eyeIcon: { padding: spacing.sm },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  rememberMeContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  rememberMeText: { fontSize: 14, color: colors.text.secondary, fontWeight: '500' },
  forgotPasswordText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  signInButton: { borderRadius: 12, overflow: 'hidden' },
  signInGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  signInText: { color: colors.white, fontSize: 18, fontWeight: '600' },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerText: { fontSize: 13, color: colors.text.secondary, marginBottom: spacing.sm },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footerLink: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  footerDivider: { fontSize: 13, color: colors.text.secondary },
});

export default LoginScreen;
