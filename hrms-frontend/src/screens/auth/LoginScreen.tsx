import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Animated } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { login, clearError } from '../../store/slices/authSlice';

const FloatingShape = ({ size, top, left, delay }: any) => {
  const animatedValue = new Animated.Value(0);
  
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    ).start();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <Animated.View
      style={[
        styles.floatingShape,
        {
          width: size,
          height: size,
          top: `${top}%`,
          left: `${left}%`,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    />
  );
};

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return;
    }
    
    dispatch(login({ username: username.trim(), password }));
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  return (
    <LinearGradient 
      colors={['#1e3c72', '#2a5298', '#667eea', '#764ba2']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Animated Background Shapes */}
      <FloatingShape size={100} top={10} left={10} delay={0} />
      <FloatingShape size={150} top={20} left={85} delay={2000} />
      <FloatingShape size={80} top={80} left={20} delay={4000} />
      <FloatingShape size={120} top={70} left={80} delay={1000} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.loginCard}>
          {/* Top Border */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.topBorder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />

          {/* Header */}
          <View style={styles.loginHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.brandLogo}
            >
              <Ionicons name="time" size={40} color="white" />
            </LinearGradient>
            <Text style={styles.loginTitle}>HRMS Pro</Text>
            <Text style={styles.loginSubtitle}>Sign in to access your dashboard</Text>
          </View>

          {/* Error Messages */}
          {error && (
            <View style={styles.alertDanger}>
              <Ionicons name="warning" size={16} color="#742a2a" />
              <Text style={styles.alertText}>{error}</Text>
            </View>
          )}

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                <Ionicons name="person" size={14} /> Username or Email
              </Text>
              <View style={styles.inputGroupModern}>
                <Ionicons name="person" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username or email"
                  style={[styles.formControlModern, styles.hasIcon]}
                  autoCapitalize="none"
                  autoComplete="username"
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                <Ionicons name="lock-closed" size={14} /> Password
              </Text>
              <View style={styles.inputGroupModern}>
                <Ionicons name="lock-closed" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  style={[styles.formControlModern, styles.hasIcon]}
                  autoComplete="password"
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
                <Button
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  compact
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#9ca3af" 
                  />
                </Button>
              </View>
            </View>

            <View style={styles.formOptions}>
              <View style={styles.rememberMe}>
                <Button
                  mode="text"
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.checkboxButton}
                  compact
                >
                  <Ionicons 
                    name={rememberMe ? "checkbox" : "square-outline"} 
                    size={18} 
                    color="#667eea" 
                  />
                </Button>
                <Text style={styles.rememberLabel}>Remember me</Text>
              </View>
              <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPassword}
                compact
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Button>
            </View>

            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.btnLogin}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Button
                mode="text"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || !username.trim() || !password.trim()}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
              >
                <Ionicons name="log-in" size={18} color="white" /> Sign In
              </Button>
            </LinearGradient>
          </View>

          {/* Footer */}
          <View style={styles.loginFooter}>
            <Text style={styles.footerText}>© 2024 HRMS Pro. All rights reserved.</Text>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Privacy Policy</Text>
              <Text style={styles.footerLink}>Terms of Service</Text>
              <Text style={styles.footerLink}>Support</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh' as any,
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100vh' as any,
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: Platform.OS === 'web' ? 50 : 30,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 60,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  loginTitle: {
    fontSize: 35,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  alertDanger: {
    backgroundColor: '#fed7d7',
    borderLeftWidth: 4,
    borderLeftColor: '#e53e3e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertText: {
    color: '#742a2a',
    fontWeight: '500',
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  formGroup: {
    marginBottom: 25,
  },
  formLabel: {
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
    fontSize: 15,
  },
  inputGroupModern: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 5,
  },
  formControlModern: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    flex: 1,
    height: 55,
  },
  hasIcon: {
    paddingLeft: 55,
  },
  passwordToggle: {
    position: 'absolute',
    right: 10,
    zIndex: 5,
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    flexWrap: 'wrap',
    gap: 10,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxButton: {
    margin: 0,
    padding: 0,
  },
  rememberLabel: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    margin: 0,
    padding: 0,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  btnLogin: {
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  loginButton: {
    paddingVertical: 8,
    margin: 0,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginFooter: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    color: '#718096',
    fontSize: 14,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 15,
    flexWrap: 'wrap',
  },
  footerLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  snackbar: {
    backgroundColor: '#dc3545',
  },
});