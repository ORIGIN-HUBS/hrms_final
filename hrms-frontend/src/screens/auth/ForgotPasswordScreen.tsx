import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { theme } from '../../theme';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await apiService.forgotPassword(email.trim());
      setMessage('Password reset link has been sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="key" size={48} color="white" />
          </View>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email to reset password</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Button
              mode="contained"
              onPress={handleForgotPassword}
              loading={loading}
              disabled={loading || !email.trim()}
              style={styles.resetButton}
              contentStyle={styles.resetButtonContent}
            >
              Send Reset Link
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              Back to Login
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={[styles.snackbar, { backgroundColor: theme.colors.error }]}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage('')}
        duration={6000}
        style={[styles.snackbar, { backgroundColor: theme.colors.success }]}
      >
        {message}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card: {
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
  cardContent: {
    padding: theme.spacing.xxl,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  resetButton: {
    marginBottom: theme.spacing.md,
  },
  resetButtonContent: {
    paddingVertical: theme.spacing.xs,
  },
  backButton: {
    alignSelf: 'center',
  },
  snackbar: {
    marginBottom: theme.spacing.lg,
  },
});