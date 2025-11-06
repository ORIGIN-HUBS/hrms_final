import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { UserInfo } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { getInitials } from '@/utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const MyProfileScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserInfo | null>(user);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getCurrentUser();
      if (response) {
        setProfileData(response);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh profile when screen gains focus (e.g., after editing)
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );
  
  useEffect(() => {
    if (!profileData) {
      fetchProfile();
    }
  }, []);
  
  const ProfileField = ({ label, value, icon }: { label: string; value?: string; icon: string }) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
    </View>
  );
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchProfile} />
      }
    >
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profileData?.fullName ? getInitials(profileData.fullName) : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData?.fullName || 'User'}</Text>
            <Text style={styles.profileEmail}>{profileData?.email}</Text>
            <Text style={styles.profileUsername}>@{profileData?.username}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ProfileField
            label="Full Name"
            value={profileData?.fullName}
            icon="person-outline"
          />
          <ProfileField
            label="Username"
            value={profileData?.username}
            icon="at-outline"
          />
          <ProfileField
            label="Email Address"
            value={profileData?.email}
            icon="mail-outline"
          />
        </Card>
        
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Information</Text>
          </View>
          
          <ProfileField
            label="User ID"
            value={profileData?.id?.toString()}
            icon="key-outline"
          />
          <ProfileField
            label="Roles"
            value={profileData?.roles?.join(', ')}
            icon="shield-outline"
          />
          {profileData?.isTemporaryPassword && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                You are using a temporary password. Please change it.
              </Text>
            </View>
          )}
        </Card>
        
        {profileData?.employee && (
          <Card>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Employee Information</Text>
            </View>
            
            <ProfileField
              label="Employee ID"
              value={profileData.employee.employeeId}
              icon="badge-outline"
            />
            <ProfileField
              label="Job Title"
              value={profileData.employee.jobTitle}
              icon="briefcase-outline"
            />
            <ProfileField
              label="Employment Type"
              value={profileData.employee.employmentType}
              icon="business-outline"
            />
            <ProfileField
              label="Status"
              value={profileData.employee.status}
              icon="checkmark-circle-outline"
            />
          </Card>
        )}
        
        <View style={styles.actions}>
          <Button
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
            variant="outline"
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.primary} />}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  profileEmail: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: 2,
  },
  profileUsername: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  editButton: {
    padding: spacing.sm,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  fieldValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginLeft: spacing.lg + spacing.sm,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  },
  actions: {
    marginTop: spacing.lg,
  },
});

export default MyProfileScreen;
