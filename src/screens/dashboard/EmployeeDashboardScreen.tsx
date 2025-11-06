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
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/api';
import { API_CONFIG } from '@/constants/config';
import Card from '@/components/common/Card';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const EmployeeDashboardScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (user?.employee?.id) {
        const response = await apiClient.get(
          API_CONFIG.ENDPOINTS.EMPLOYEE_ANALYTICS(user.employee.id.toString())
        );
        setStats(response.data || {});
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {user?.fullName}</Text>
        <Text style={styles.headerSubtitle}>Employee Dashboard</Text>
      </View>
      
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Card>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Timesheets', { screen: 'MyTimesheets' })}
          >
            <Ionicons name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>My Timesheets</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Projects', { screen: 'MyProjects' })}
          >
            <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>My Projects</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('SelfService', { screen: 'CreateTicket' })}
          >
            <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Create Support Ticket</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Profile', { screen: 'MyProfile' })}
          >
            <Ionicons name="person-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>My Profile</Text>
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
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
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

export default EmployeeDashboardScreen;

