import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
  }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
      ))}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Account Settings */}
      <Card>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon="person-outline"
          title="My Profile"
          subtitle="View and edit your profile"
          onPress={() => navigation.navigate('MyProfile')}
        />
        <SettingItem
          icon="key-outline"
          title="Change Password"
          subtitle="Update your password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <SettingItem
          icon="shield-checkmark-outline"
          title="Security"
          subtitle="Manage security settings"
          onPress={() => Alert.alert('Security', 'Security settings coming soon')}
        />
      </Card>

      {/* Notifications */}
      <Card>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          subtitle="Receive push notifications"
          showArrow={false}
          rightComponent={
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.gray[300], true: colors.primary + '50' }}
              thumbColor={pushNotifications ? colors.primary : colors.gray[400]}
            />
          }
        />
        <SettingItem
          icon="mail-outline"
          title="Email Notifications"
          subtitle="Receive email notifications"
          showArrow={false}
          rightComponent={
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.gray[300], true: colors.primary + '50' }}
              thumbColor={emailNotifications ? colors.primary : colors.gray[400]}
            />
          }
        />
      </Card>

      {/* Preferences */}
      <Card>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          icon="color-palette-outline"
          title="Theme"
          subtitle="Light mode"
          onPress={() => Alert.alert('Theme', 'Theme selection coming soon')}
        />
        <SettingItem
          icon="language-outline"
          title="Language"
          subtitle="English"
          onPress={() => Alert.alert('Language', 'Language selection coming soon')}
        />
        <SettingItem
          icon="finger-print-outline"
          title="Biometric Login"
          subtitle="Use fingerprint or face ID"
          showArrow={false}
          rightComponent={
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: colors.gray[300], true: colors.primary + '50' }}
              thumbColor={biometricEnabled ? colors.primary : colors.gray[400]}
            />
          }
        />
      </Card>

      {/* App Info */}
      <Card>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem
          icon="information-circle-outline"
          title="About"
          subtitle="App version and information"
          onPress={() => navigation.navigate('About')}
        />
        <SettingItem
          icon="document-text-outline"
          title="Terms & Conditions"
          subtitle="Read our terms"
          onPress={() => Alert.alert('Terms', 'Terms & Conditions coming soon')}
        />
        <SettingItem
          icon="shield-outline"
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() => Alert.alert('Privacy', 'Privacy Policy coming soon')}
        />
        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help and support"
          onPress={() => navigation.navigate('SelfServiceDashboard')}
        />
      </Card>

      {/* Danger Zone */}
      <Card style={styles.dangerCard}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <SettingItem
          icon="log-out-outline"
          title="Logout"
          subtitle="Sign out of your account"
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: () => navigation.replace('Login'),
                },
              ]
            );
          }}
        />
      </Card>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  dangerCard: {
    borderColor: colors.error + '30',
    borderWidth: 1,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default SettingsScreen;

