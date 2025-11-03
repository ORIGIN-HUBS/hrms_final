import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const LoginScreen: React.FC<any> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      const result = await login({ username: username.trim(), password });
      
      if (result?.type?.endsWith('/rejected')) {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 'Login failed';
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error: any) {
      const errorMessage = typeof error.message === 'string' ? error.message : 'Login failed';
      Alert.alert('Error', errorMessage);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'hr' | 'employee') => {
    const credentials = {
      admin: { username: 'admin', password: 'admin123' },
      hr: { username: 'hr', password: 'hr123' },
      employee: { username: 'employee', password: 'emp123' }
    };
    
    const cred = credentials[role];
    setUsername(cred.username);
    setPassword(cred.password);
  };
  
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginBox}>
            <View style={styles.logo}>
              <Ionicons name="business" size={24} color={colors.white} />
            </View>
            
            <Text style={styles.title}>Sign in to HRMS Pro</Text>
            
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
              />
            </View>
            
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
            
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <Text style={styles.demoText}>
                Admin: admin/admin123 | HR: hr/hr123 | Employee: employee/emp123
              </Text>
              <View style={styles.demoButtons}>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => fillDemoCredentials('admin')}
                >
                  <Text style={styles.demoButtonText}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => fillDemoCredentials('hr')}
                >
                  <Text style={styles.demoButtonText}>HR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => fillDemoCredentials('employee')}
                >
                  <Text style={styles.demoButtonText}>Employee</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loginBox: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#4285f4',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: colors.white,
  },
  loginButton: {
    backgroundColor: '#4285f4',
    marginTop: 10,
    borderRadius: 4,
  },
  forgotPassword: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#4285f4',
    fontSize: 14,
    textAlign: 'center',
  },
  demoSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    width: '100%',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 10,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  demoButton: {
    padding: 8,
    margin: 2,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: colors.white,
    borderRadius: 3,
  },
  demoButtonText: {
    fontSize: 12,
    color: '#495057',
  },
});

export default LoginScreen;

