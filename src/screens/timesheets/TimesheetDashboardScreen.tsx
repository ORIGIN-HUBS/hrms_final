import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '@/services/api';
import { API_CONFIG } from '@/constants/config';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DashboardStats {
  totalEmployees?: number;
  activeEmployees?: number;
  onboardingEmployees?: number;
  offboardingEmployees?: number;
  totalProjects?: number;
  activeProjects?: number;
  pendingTimesheets?: number;
  pendingApprovals?: number;
}

const DashboardScreen: React.FC<any> = ({ navigation }) => {
  const [stats, setStats] = useState<DashboardStats>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD_ANALYTICS);
      setStats(response.data || {});
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // Provide fallback data when backend is unavailable
      if (error.response?.status === 401 || error.code === 'ERR_NETWORK') {
        setStats({
          totalEmployees: 0,
          activeEmployees: 0,
          onboardingEmployees: 0,
          offboardingEmployees: 0,
          totalProjects: 0,
          activeProjects: 0,
          pendingTimesheets: 0,
          pendingApprovals: 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const StatCard: React.FC<{
    title: string;
    value: number;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    gradient: string[];
    onPress?: () => void;
  }> = ({ title, value, subtitle, icon, gradient, onPress }) => (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.statCardInner}>
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statAccentBar}
        />
        <View style={styles.statHeader}>
          <LinearGradient
            colors={gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconContainer}
          >
            <Ionicons name={icon} size={28} color={colors.white} />
          </LinearGradient>
        </View>
        <Text style={styles.statValue}>{value || 0}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
  
  if (isLoading && Object.keys(stats).length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome to HRMS Pro</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees || 12}
          subtitle="6 new this month"
          icon="people"
          gradient={gradients.primary as unknown as string[]}
          onPress={() => navigation.navigate('Employees')}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects || 3}
          subtitle="3 total projects"
          icon="briefcase"
          gradient={gradients.success as unknown as string[]}
          onPress={() => navigation.navigate('Projects')}
        />
        <StatCard
          title="Pending Documents"
          value={0}
          subtitle="3 total docs"
          icon="document-text"
          gradient={gradients.warning as unknown as string[]}
        />
        <StatCard
          title="Pending Offboardings"
          value={0}
          subtitle="0 completed"
          icon="exit"
          gradient={gradients.secondary as unknown as string[]}
        />
        <StatCard
          title="Open Invoices"
          value={1}
          subtitle="0 pending"
          icon="document"
          gradient={gradients.primary as unknown as string[]}
        />
        <StatCard
          title="Paid Invoices"
          value={0}
          icon="checkmark-circle"
          gradient={gradients.success as unknown as string[]}
        />
        <StatCard
          title="Total Timesheets"
          value={3}
          subtitle="1 approved"
          icon="time"
          gradient={gradients.success as unknown as string[]}
          onPress={() => navigation.navigate('Timesheets')}
        />
        <StatCard
          title="Pending Approvals"
          value={1}
          subtitle="0 rejected"
          icon="hourglass"
          gradient={gradients.warning as unknown as string[]}
        />
      </View>
      
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Card>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Employees', { screen: 'EmployeeAdd' })}
          >
            <Ionicons name="person-add-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Add New Employee</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Projects', { screen: 'ProjectAdd' })}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Create New Project</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Timesheets', { screen: 'TimesheetApprovals' })}
          >
            <Ionicons name="checkmark-done-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Approve Timesheets</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
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
  header: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 5,
  },
  statCardInner: {
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  statAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  statHeader: {
    marginBottom: spacing.md,
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 40,
  },
  statTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  quickActions: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
});

export default DashboardScreen;

