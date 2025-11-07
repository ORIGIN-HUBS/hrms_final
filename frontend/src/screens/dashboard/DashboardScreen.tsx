import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { dashboardService } from '../../api/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import { DashboardAnalytics } from '../../types';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  subtitle?: string;
  variant: 'primary' | 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, variant }) => {
  const gradientColors = {
    primary: ['#667eea', '#764ba2'],
    success: ['#4facfe', '#00f2fe'],
    warning: ['#43e97b', '#38f9d7'],
    danger: ['#fa709a', '#fee140'],
  };

  return (
    <View style={[styles.statCard, styles[`statCard${variant.charAt(0).toUpperCase() + variant.slice(1)}`]]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <MaterialIcons name={icon} size={28} color="white" />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
      {subtitle && (
        <View style={styles.statChange}>
          <MaterialIcons name="trending-up" size={16} color={colors.success} />
          <Text style={styles.statChangeText}>{subtitle}</Text>
        </View>
      )}
    </View>
  );
};

interface ActivityItemProps {
  name: string;
  subtitle: string;
  time: string;
  initials: string;
  color: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ name, subtitle, time, initials, color }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityAvatar, { backgroundColor: color }]}>
      <Text style={styles.activityInitials}>{initials}</Text>
    </View>
    <View style={styles.activityDetails}>
      <Text style={styles.activityName}>{name}</Text>
      <Text style={styles.activityMeta}>{subtitle}</Text>
    </View>
    <Text style={styles.activityTime}>{time}</Text>
  </View>
);

export const DashboardScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await dashboardService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="dashboard" size={28} color={colors.text} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.username || 'User'}</Text>
              <Text style={styles.userRole}>Administrator</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Employees"
            value={analytics?.totalEmployees || 0}
            icon="people"
            color={colors.primary}
            subtitle={`${analytics?.onboardingEmployees || 0} new this month`}
            variant="primary"
          />
          <StatCard
            title="Active Projects"
            value={analytics?.activeProjects || 0}
            icon="work"
            color={colors.success}
            subtitle={`${analytics?.totalProjects || 0} total projects`}
            variant="success"
          />
          <StatCard
            title="Pending Documents"
            value={analytics?.pendingDocuments || 0}
            icon="schedule"
            color={colors.warning}
            subtitle={`${analytics?.totalDocuments || 0} total docs`}
            variant="warning"
          />
          <StatCard
            title="Pending Offboardings"
            value={analytics?.pendingOffboardings || 0}
            icon="exit-to-app"
            color={colors.danger}
            subtitle={`${analytics?.completedOffboardings || 0} completed`}
            variant="danger"
          />
          
          {/* Additional Stats Cards */}
          <StatCard
            title="Total Invoices"
            value={analytics?.totalInvoices || 0}
            icon="receipt"
            color={colors.primary}
            subtitle={`$${analytics?.totalInvoiceAmount || 0}`}
            variant="primary"
          />
          <StatCard
            title="Paid Invoices"
            value={analytics?.paidInvoices || 0}
            icon="check-circle"
            color={colors.success}
            subtitle={`${analytics?.pendingInvoices || 0} pending`}
            variant="success"
          />
          <StatCard
            title="Total Timesheets"
            value={analytics?.totalTimesheets || 0}
            icon="event-available"
            color={colors.warning}
            subtitle={`${analytics?.approvedTimesheets || 0} approved`}
            variant="warning"
          />
          <StatCard
            title="Pending Approvals"
            value={analytics?.pendingApprovalTimesheets || 0}
            icon="schedule"
            color={colors.danger}
            subtitle={`${analytics?.rejectedTimesheets || 0} rejected`}
            variant="danger"
          />
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <View style={styles.chartGrid}>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Employee Distribution by Department</Text>
                  <Text style={styles.chartSubtitle}>Breakdown by work location</Text>
                </View>
              </View>
              <View style={styles.chartContainer}>
                <Text style={styles.chartPlaceholder}>Chart will be rendered here</Text>
              </View>
            </View>
            
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Monthly Hiring Trend</Text>
                  <Text style={styles.chartSubtitle}>Last 6 months</Text>
                </View>
              </View>
              <View style={styles.chartContainer}>
                <Text style={styles.chartPlaceholder}>Chart will be rendered here</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <View style={styles.activitiesGrid}>
            {/* Recent Hires */}
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={[styles.activityIcon, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="person-add" size={20} color="white" />
                </View>
                <Text style={styles.activityTitle}>Recent Hires</Text>
              </View>
              <View style={styles.activityList}>
                {analytics?.recentEmployees?.length ? (
                  analytics.recentEmployees.slice(0, 3).map((employee, index) => (
                    <ActivityItem
                      key={employee.id}
                      name={`${employee.firstName} ${employee.lastName}`}
                      subtitle={employee.jobTitle}
                      time={new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      initials={`${employee.firstName[0]}${employee.lastName[0]}`}
                      color={colors.success}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="inbox" size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No recent hires</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Latest Projects */}
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={[styles.activityIcon, { backgroundColor: colors.warning }]}>
                  <MaterialIcons name="work" size={20} color="white" />
                </View>
                <Text style={styles.activityTitle}>Latest Projects</Text>
              </View>
              <View style={styles.activityList}>
                {analytics?.recentProjects?.length ? (
                  analytics.recentProjects.slice(0, 3).map((project, index) => (
                    <ActivityItem
                      key={project.id}
                      name={project.projectName}
                      subtitle={project.clientCompanyName}
                      time={new Date(project.projectStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      initials={project.projectName.substring(0, 2).toUpperCase()}
                      color={colors.warning}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="inbox" size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No recent projects</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 70,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  userRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    display: 'grid' as any,
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 25,
    padding: 30,
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardPrimary: {
    borderTopWidth: 4,
    borderTopColor: colors.primary,
  },
  statCardSuccess: {
    borderTopWidth: 4,
    borderTopColor: colors.success,
  },
  statCardWarning: {
    borderTopWidth: 4,
    borderTopColor: colors.warning,
  },
  statCardDanger: {
    borderTopWidth: 4,
    borderTopColor: colors.danger,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  statLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
  },
  statChangeText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  chartsSection: {
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  chartGrid: {
    display: 'grid' as any,
    gridTemplateColumns: '2fr 1fr',
    gap: 30,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#f7fafc',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  chartSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chartContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  activitiesSection: {
    paddingHorizontal: 30,
  },
  activitiesGrid: {
    display: 'grid' as any,
    gridTemplateColumns: '1fr 1fr',
    gap: 30,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#f7fafc',
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInitials: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  activityMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
  },
});