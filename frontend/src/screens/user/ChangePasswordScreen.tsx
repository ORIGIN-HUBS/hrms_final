import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors } from '../../constants/colors';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface ChangePasswordScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ onNavigate }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();
  const isTemporaryPassword = user?.isTemporaryPassword;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword === newPassword && currentPassword.trim()) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/users/change-password', {
        currentPassword,
        newPassword,
      });

      // Refresh auth context to get updated user data
      window.location.reload(); // Force reload to refresh user data

      if (Platform.OS === 'web') {
        alert('✓ Password changed successfully!');
        if (!isTemporaryPassword) {
          onNavigate('Profile');
        }
      } else {
        Alert.alert('Success', 'Password changed successfully!', [
          { text: 'OK', onPress: () => !isTemporaryPassword && onNavigate('Profile') }
        ]);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'Failed to change password. Please check your current password and try again.';
      
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
          {!isTemporaryPassword && (
            <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Profile')}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          {isTemporaryPassword && <View style={styles.placeholder} />}
          <Text style={styles.headerTitle}>
            {isTemporaryPassword ? 'Set Your Password' : 'Change Password'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Temporary Password Warning */}
        {isTemporaryPassword && (
          <View style={styles.warningBox}>
            <MaterialIcons name="warning" size={24} color={colors.warning} />
            <Text style={styles.warningText}>
              You are using a temporary password. Please change it to continue using the system.
            </Text>
          </View>
        )}

        {/* Info Box */}
        {!isTemporaryPassword && (
          <View style={styles.infoBox}>
            <MaterialIcons name="info" size={24} color={colors.primary} />
            <Text style={styles.infoText}>
              Choose a strong password with at least 6 characters including letters, numbers, and symbols.
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.formSection}>
          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={(value) => {
              setCurrentPassword(value);
              clearError('currentPassword');
            }}
            error={errors.currentPassword}
            secureTextEntry
            placeholder="Enter current password"
            autoCapitalize="none"
          />

          <View style={styles.spacer} />

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
              name={newPassword !== currentPassword && newPassword.trim() ? "check-circle" : "radio-button-unchecked"} 
              size={16} 
              color={newPassword !== currentPassword && newPassword.trim() ? colors.success : colors.textSecondary} 
            />
            <Text style={styles.requirementText}>Different from current password</Text>
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
            onPress={() => onNavigate('Profile')}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title={loading ? 'Updating...' : 'Update Password'}
            onPress={handleChangePassword}
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#8B6914',
    marginLeft: 12,
    lineHeight: 20,
    fontWeight: '600',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
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
