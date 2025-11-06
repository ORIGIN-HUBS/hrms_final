import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
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

  // Sample data - replace with actual API calls
  const employeeGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [45, 48, 52, 55, 58, 62],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const projectStatusData = [
    {
      name: 'Active',
      population: 15,
      color: colors.success,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: 'On Hold',
      population: 5,
      color: colors.warning,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: 'Completed',
      population: 25,
      color: colors.info,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
  ];

  const timesheetHoursData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        data: [420, 450, 380, 460, 440],
      },
    ],
  };

  const ticketCategoryData = {
    labels: ['Payroll', 'IT', 'Leave', 'Benefits', 'Other'],
    datasets: [
      {
        data: [12, 8, 15, 6, 9],
      },
    ],
  };

  const StatCard = ({ icon, title, value, change, color }: any) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {change && (
          <View style={styles.changeRow}>
            <Ionicons
              name={change > 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={change > 0 ? colors.success : colors.error}
            />
            <Text style={[styles.changeText, { color: change > 0 ? colors.success : colors.error }]}>
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      {/* Key Metrics */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="people"
          title="Total Employees"
          value="62"
          change={8}
          color={colors.primary}
        />
        <StatCard
          icon="briefcase"
          title="Active Projects"
          value="15"
          change={-5}
          color={colors.info}
        />
        <StatCard
          icon="time"
          title="Hours This Week"
          value="2,150"
          change={12}
          color={colors.success}
        />
        <StatCard
          icon="help-circle"
          title="Open Tickets"
          value="23"
          change={-15}
          color={colors.warning}
        />
      </View>

      {/* Employee Growth */}
      <Card>
        <Text style={styles.chartTitle}>Employee Growth</Text>
        <Text style={styles.chartSubtitle}>Last 6 months</Text>
        <LineChart
          data={employeeGrowthData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>

      {/* Project Status Distribution */}
      <Card>
        <Text style={styles.chartTitle}>Project Status Distribution</Text>
        <Text style={styles.chartSubtitle}>Current projects by status</Text>
        <PieChart
          data={projectStatusData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </Card>

      {/* Weekly Timesheet Hours */}
      <Card>
        <Text style={styles.chartTitle}>Weekly Timesheet Hours</Text>
        <Text style={styles.chartSubtitle}>Total hours logged this week</Text>
        <BarChart
          data={timesheetHoursData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix="h"
          showValuesOnTopOfBars
        />
      </Card>

      {/* Support Tickets by Category */}
      <Card>
        <Text style={styles.chartTitle}>Support Tickets by Category</Text>
        <Text style={styles.chartSubtitle}>Open tickets distribution</Text>
        <BarChart
          data={ticketCategoryData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars
        />
      </Card>

      {/* Insights */}
      <Card>
        <View style={styles.insightsHeader}>
          <Ionicons name="bulb" size={24} color={colors.warning} />
          <Text style={styles.insightsTitle}>Key Insights</Text>
        </View>
        <View style={styles.insightsList}>
          <InsightItem
            icon="trending-up"
            text="Employee count increased by 8% this quarter"
            color={colors.success}
          />
          <InsightItem
            icon="alert-circle"
            text="5 projects are currently on hold"
            color={colors.warning}
          />
          <InsightItem
            icon="checkmark-circle"
            text="Average timesheet submission rate: 95%"
            color={colors.success}
          />
          <InsightItem
            icon="time"
            text="Average ticket resolution time: 2.5 days"
            color={colors.info}
          />
        </View>
      </Card>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const InsightItem = ({ icon, text, color }: any) => (
  <View style={styles.insightItem}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={styles.insightText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - spacing.md * 3) / 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  changeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  insightsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  insightsList: {
    gap: spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default AnalyticsScreen;

