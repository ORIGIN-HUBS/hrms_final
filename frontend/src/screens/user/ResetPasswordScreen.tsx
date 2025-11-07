import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

interface ResetPasswordScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  userId: number;
  username: string;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onNavigate, userId, username }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/api/users/${userId}/reset-password`, {
        newPassword,
      });

      if (Platform.OS === 'web') {
        alert(`✓ Password reset successfully for user "${username}"!`);
        onNavigate('UserManagement');
      } else {
        Alert.alert('Success', `Password reset successfully for user "${username}"!`, [
          { text: 'OK', onPress: () => onNavigate('UserManagement') }
        ]);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to reset password. Please try again.';
      
      if (Platform.OS === 'web') {
        alert('✗ ' + errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('UserManagement')}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={styles.placeholder} />
        </View>

        {/* User Info */}
        <View style={styles.userInfoBox}>
          <View style={styles.userAvatar}>
            <MaterialIcons name="person" size={32} color="white" />
          </View>
          <View>
            <Text style={styles.userInfoLabel}>Resetting password for:</Text>
            <Text style={styles.userName}>@{username}</Text>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <MaterialIcons name="warning" size={24} color={colors.warning} />
          <Text style={styles.warningText}>
            This will immediately change the user's password. Make sure to share the new password with the user securely.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={(value) => {
              setNewPassword(value);
              clearError('newPassword');
            }}
            error={errors.newPassword}
            secureTextEntry
            placeholder="Enter new password (min 6 characters)"
            autoCapitalize="none"
          />

          <View style={styles.spacer} />

          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              clearError('confirmPassword');
            }}
            error={errors.confirmPassword}
            secureTextEntry
            placeholder="Re-enter new password"
            autoCapitalize="none"
          />
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <View style={styles.requirementItem}>
            <MaterialIcons 
              name={newPassword.length >= 6 ? "check-circle" : "radio-button-unchecked"} 
              size={16} 
              color={newPassword.length >= 6 ? colors.success : colors.textSecondary} 
            />
            <Text style={styles.requirementText}>At least 6 characters</Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialIcons 
              name={newPassword === confirmPassword && newPassword.trim() ? "check-circle" : "radio-button-unchecked"} 
              size={16} 
              color={newPassword === confirmPassword && newPassword.trim() ? colors.success : colors.textSecondary} 
            />
            <Text style={styles.requirementText}>Passwords match</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => onNavigate('UserManagement')}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title={loading ? 'Resetting...' : 'Reset Password'}
            onPress={handleResetPassword}
            disabled={loading}
            style={styles.button}
          />
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  spacer: {
    height: 20,
  },
  requirementsBox: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
  bottomSpace: {
    height: 40,
  },
});
