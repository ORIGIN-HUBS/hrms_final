import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const ReportsScreen: React.FC<any> = ({ navigation }) => {
  const ReportCard = ({
    icon,
    title,
    description,
    color,
    onPress,
  }: {
    icon: string;
    title: string;
    description: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.reportCard}>
        <View style={[styles.reportIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={32} color={color} />
        </View>
        <View style={styles.reportContent}>
          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.reportDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card>
        <View style={styles.header}>
          <Ionicons name="bar-chart" size={48} color={colors.primary} />
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Generate and view comprehensive reports
          </Text>
        </View>
      </Card>

      {/* Employee Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Reports</Text>
        <ReportCard
          icon="people"
          title="Employee Directory"
          description="Complete list of all employees with details"
          color={colors.primary}
          onPress={() => Alert.alert('Report', 'Employee Directory report coming soon')}
        />
        <ReportCard
          icon="person-add"
          title="New Hires Report"
          description="Recently joined employees"
          color={colors.success}
          onPress={() => Alert.alert('Report', 'New Hires report coming soon')}
        />
        <ReportCard
          icon="person-remove"
          title="Offboarding Report"
          description="Employees in offboarding process"
          color={colors.warning}
          onPress={() => Alert.alert('Report', 'Offboarding report coming soon')}
        />
      </View>

      {/* Project Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Reports</Text>
        <ReportCard
          icon="briefcase"
          title="Active Projects"
          description="All active projects and their status"
          color={colors.info}
          onPress={() => Alert.alert('Report', 'Active Projects report coming soon')}
        />
        <ReportCard
          icon="stats-chart"
          title="Project Performance"
          description="Project metrics and KPIs"
          color={colors.secondary}
          onPress={() => Alert.alert('Report', 'Project Performance report coming soon')}
        />
      </View>

      {/* Timesheet Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timesheet Reports</Text>
        <ReportCard
          icon="time"
          title="Hours Summary"
          description="Total hours logged by employees"
          color={colors.success}
          onPress={() => Alert.alert('Report', 'Hours Summary report coming soon')}
        />
        <ReportCard
          icon="calendar"
          title="Weekly Timesheets"
          description="Timesheet submissions by week"
          color={colors.primary}
          onPress={() => Alert.alert('Report', 'Weekly Timesheets report coming soon')}
        />
        <ReportCard
          icon="checkmark-done"
          title="Approval Status"
          description="Timesheet approval statistics"
          color={colors.info}
          onPress={() => Alert.alert('Report', 'Approval Status report coming soon')}
        />
      </View>

      {/* Financial Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Reports</Text>
        <ReportCard
          icon="cash"
          title="Invoice Summary"
          description="Generated invoices and revenue"
          color={colors.success}
          onPress={() => Alert.alert('Report', 'Invoice Summary report coming soon')}
        />
        <ReportCard
          icon="card"
          title="Billing Report"
          description="Billable hours and amounts"
          color={colors.secondary}
          onPress={() => Alert.alert('Report', 'Billing Report report coming soon')}
        />
      </View>

      {/* Support Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support Reports</Text>
        <ReportCard
          icon="help-circle"
          title="Ticket Statistics"
          description="Support ticket metrics"
          color={colors.warning}
          onPress={() => Alert.alert('Report', 'Ticket Statistics report coming soon')}
        />
        <ReportCard
          icon="trending-up"
          title="Resolution Time"
          description="Average ticket resolution time"
          color={colors.info}
          onPress={() => Alert.alert('Report', 'Resolution Time report coming soon')}
        />
      </View>

      {/* Custom Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Reports</Text>
        <Card style={styles.customReportCard}>
          <Ionicons name="construct" size={48} color={colors.gray[400]} />
          <Text style={styles.customReportTitle}>Build Custom Report</Text>
          <Text style={styles.customReportDescription}>
            Create custom reports with your own filters and parameters
          </Text>
          <Button
            title="Create Custom Report"
            onPress={() => Alert.alert('Custom Report', 'Custom report builder coming soon')}
            variant="outline"
          />
        </Card>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  reportDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  customReportCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  customReportTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  customReportDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default ReportsScreen;

