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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    icon: keyof typeof Ionicons.glyphMap;
    gradient: string[];
    onPress?: () => void;
  }> = ({ title, value, icon, gradient, onPress }) => (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statGradient}
      >
        <View style={styles.statContent}>
          <Ionicons name={icon} size={32} color={colors.white} />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{value || 0}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  
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
          value={stats.totalEmployees || 0}
          icon="people"
          gradient={gradients.primary}
          onPress={() => navigation.navigate('Employees')}
        />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees || 0}
          icon="checkmark-circle"
          gradient={gradients.success}
        />
        <StatCard
          title="Onboarding"
          value={stats.onboardingEmployees || 0}
          icon="person-add"
          gradient={gradients.info}
        />
        <StatCard
          title="Offboarding"
          value={stats.offboardingEmployees || 0}
          icon="exit"
          gradient={gradients.warning}
        />
        <StatCard
          title="Total Projects"
          value={stats.totalProjects || 0}
          icon="briefcase"
          gradient={gradients.secondary}
          onPress={() => navigation.navigate('Projects')}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects || 0}
          icon="rocket"
          gradient={gradients.success}
        />
        <StatCard
          title="Pending Timesheets"
          value={stats.pendingTimesheets || 0}
          icon="time"
          gradient={gradients.warning}
          onPress={() => navigation.navigate('Timesheets')}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals || 0}
          icon="hourglass"
          gradient={gradients.danger}
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    padding: spacing.lg,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  statTitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
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

