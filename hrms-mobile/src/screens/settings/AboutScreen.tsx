import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const AboutScreen: React.FC = () => {
  const appVersion = '1.0.0';
  const buildNumber = '100';

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const LinkItem = ({ icon, title, url }: { icon: string; title: string; url: string }) => (
    <TouchableOpacity
      style={styles.linkItem}
      onPress={() => Linking.openURL(url)}
    >
      <Ionicons name={icon as any} size={24} color={colors.primary} />
      <Text style={styles.linkText}>{title}</Text>
      <Ionicons name="open-outline" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="business" size={64} color={colors.white} />
        </View>
        <Text style={styles.appName}>OriginHubs HRMS</Text>
        <Text style={styles.tagline}>Human Resource Management System</Text>
      </View>

      {/* Version Info */}
      <Card>
        <Text style={styles.sectionTitle}>Version Information</Text>
        <InfoRow label="Version" value={appVersion} />
        <InfoRow label="Build Number" value={buildNumber} />
        <InfoRow label="Platform" value="React Native + Expo" />
        <InfoRow label="Backend" value="Spring Boot 3.5.7" />
      </Card>

      {/* Company Info */}
      <Card>
        <Text style={styles.sectionTitle}>Company Information</Text>
        <InfoRow label="Company" value="OriginHubs" />
        <InfoRow label="Email" value="support@originhubs.com" />
        <InfoRow label="Website" value="www.originhubs.com" />
        <InfoRow label="Location" value="United States" />
      </Card>

      {/* Features */}
      <Card>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featureList}>
          <FeatureItem text="Employee Management" />
          <FeatureItem text="Project Tracking" />
          <FeatureItem text="Timesheet Management" />
          <FeatureItem text="Offboarding Process" />
          <FeatureItem text="User Administration" />
          <FeatureItem text="Notifications" />
          <FeatureItem text="Self-Service Portal" />
          <FeatureItem text="Invoice Generation" />
        </View>
      </Card>

      {/* Links */}
      <Card>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <LinkItem
          icon="globe-outline"
          title="Visit Website"
          url="https://www.originhubs.com"
        />
        <LinkItem
          icon="mail-outline"
          title="Contact Support"
          url="mailto:support@originhubs.com"
        />
        <LinkItem
          icon="logo-github"
          title="GitHub Repository"
          url="https://github.com/originhubs"
        />
      </Card>

      {/* Legal */}
      <Card>
        <Text style={styles.sectionTitle}>Legal</Text>
        <Text style={styles.legalText}>
          © 2024 OriginHubs. All rights reserved.{'\n\n'}
          This application is proprietary software developed by OriginHubs for internal use.
          Unauthorized copying, distribution, or modification is strictly prohibited.
        </Text>
      </Card>

      {/* Credits */}
      <Card>
        <Text style={styles.sectionTitle}>Built With</Text>
        <View style={styles.techStack}>
          <TechBadge name="React Native" />
          <TechBadge name="Expo" />
          <TechBadge name="TypeScript" />
          <TechBadge name="Redux" />
          <TechBadge name="Spring Boot" />
          <TechBadge name="PostgreSQL" />
        </View>
      </Card>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const TechBadge = ({ name }: { name: string }) => (
  <View style={styles.techBadge}>
    <Text style={styles.techBadgeText}>{name}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    gap: spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  legalText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  techBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
  },
  techBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default AboutScreen;

