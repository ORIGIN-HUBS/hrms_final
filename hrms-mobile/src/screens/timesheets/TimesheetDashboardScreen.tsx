import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { timesheetService } from '@/services/timesheetService';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const screenWidth = Dimensions.get('window').width;

const TimesheetDashboardScreen: React.FC<any> = ({ navigation }) => {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const data = await timesheetService.getTimesheetSummary();
      setSummary(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load timesheet summary');
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const weeklyHoursData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: summary?.weeklyHours || [0, 8, 8, 8, 8, 8, 0],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const monthlyHoursData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: summary?.monthlyHours || [40, 42, 38, 40],
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchSummary} />}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Timesheet Dashboard</Text>
          <Text style={styles.headerSubtitle}>Overview of your time tracking</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="time" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{summary?.currentWeekHours || 0}h</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar" size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{summary?.currentMonthHours || 0}h</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="trending-up" size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{summary?.averageWeeklyHours || 0}h</Text>
            <Text style={styles.statLabel}>Avg/Week</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="cash" size={24} color={colors.info} />
            </View>
            <Text style={styles.statValue}>
              ${summary?.currentMonthEarnings?.toFixed(0) || 0}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </Card>
        </View>

        {/* Weekly Hours Chart */}
        <Card>
          <Text style={styles.chartTitle}>Weekly Hours Breakdown</Text>
          <LineChart
            data={weeklyHoursData}
            width={screenWidth - spacing.md * 4}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Monthly Trend */}
        <Card>
          <Text style={styles.chartTitle}>Monthly Trend</Text>
          <BarChart
            data={monthlyHoursData}
            width={screenWidth - spacing.md * 4}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix="h"
          />
        </Card>

        {/* Status Summary */}
        <Card>
          <Text style={styles.sectionTitle}>Timesheet Status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.statusLabel}>Draft</Text>
              <Text style={styles.statusValue}>{summary?.draftCount || 0}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.info }]} />
              <Text style={styles.statusLabel}>Submitted</Text>
              <Text style={styles.statusValue}>{summary?.submittedCount || 0}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusLabel}>Approved</Text>
              <Text style={styles.statusValue}>{summary?.approvedCount || 0}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
              <Text style={styles.statusLabel}>Rejected</Text>
              <Text style={styles.statusValue}>{summary?.rejectedCount || 0}</Text>
            </View>
          </View>
        </Card>

        {/* Billable vs Non-Billable */}
        <Card>
          <Text style={styles.sectionTitle}>Billable Hours</Text>
          <View style={styles.billableContainer}>
            <View style={styles.billableItem}>
              <Text style={styles.billableLabel}>Billable</Text>
              <Text style={styles.billableValue}>
                {summary?.billableHours || 0}h ({summary?.billablePercentage || 0}%)
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${summary?.billablePercentage || 0}%`, backgroundColor: colors.success },
                  ]}
                />
              </View>
            </View>
            <View style={styles.billableItem}>
              <Text style={styles.billableLabel}>Non-Billable</Text>
              <Text style={styles.billableValue}>
                {summary?.nonBillableHours || 0}h ({summary?.nonBillablePercentage || 0}%)
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${summary?.nonBillablePercentage || 0}%`, backgroundColor: colors.gray[400] },
                  ]}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.lastCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <View style={styles.quickActionItem}>
              <Ionicons name="add-circle" size={32} color={colors.primary} />
              <Text style={styles.quickActionText}>New Timesheet</Text>
            </View>
            <View style={styles.quickActionItem}>
              <Ionicons name="list" size={32} color={colors.primary} />
              <Text style={styles.quickActionText}>View All</Text>
            </View>
            <View style={styles.quickActionItem}>
              <Ionicons name="checkmark-done" size={32} color={colors.primary} />
              <Text style={styles.quickActionText}>Approvals</Text>
            </View>
            <View style={styles.quickActionItem}>
              <Ionicons name="document-text" size={32} color={colors.primary} />
              <Text style={styles.quickActionText}>Reports</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - spacing.md * 3) / 2 - spacing.md,
    alignItems: 'center',
    padding: spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  statusLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  billableContainer: {
    gap: spacing.md,
  },
  billableItem: {
    gap: spacing.xs,
  },
  billableLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  billableValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  lastCard: {
    marginBottom: spacing.xl,
  },
});

export default TimesheetDashboardScreen;

