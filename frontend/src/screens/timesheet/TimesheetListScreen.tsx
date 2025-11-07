import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

interface Timesheet {
  id: number;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  project: {
    projectName: string;
    clientName: string;
  };
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedOn?: string;
  approvedOn?: string;
}

interface TimesheetStats {
  totalTimesheets: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  totalHours: number;
}

interface TimesheetListScreenProps {
  onNavigate?: (route: string, params?: any) => void;
}

export const TimesheetListScreen: React.FC<TimesheetListScreenProps> = ({ onNavigate }) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [stats, setStats] = useState<TimesheetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const response = await apiClient.get('/api/timesheets/all');
      setTimesheets(response.data.timesheets || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimesheets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return colors.success;
      case 'SUBMITTED': return '#ffc107';
      case 'REJECTED': return colors.danger;
      case 'DRAFT': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const renderStatsCard = (title: string, value: number, icon: string, color: string) => (
    <Card style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <MaterialIcons name={icon as any} size={24} color={color} />
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
      </View>
    </Card>
  );

  const renderTimesheetItem = ({ item }: { item: Timesheet }) => (
    <Card style={styles.timesheetCard}>
      <View style={styles.timesheetHeader}>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>
            {item.employee.firstName} {item.employee.lastName}
          </Text>
          <Text style={styles.employeeId}>{item.employee.employeeId}</Text>
          <Text style={styles.projectName}>{item.project?.projectName || 'No Project'}</Text>
        </View>
        <View style={styles.timesheetMeta}>
          <Text style={styles.totalHours}>{item.totalHours}h</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.timesheetDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {new Date(item.weekStartDate).toLocaleDateString()} - {new Date(item.weekEndDate).toLocaleDateString()}
          </Text>
        </View>
        {item.submittedOn && (
          <View style={styles.detailRow}>
            <MaterialIcons name="send" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Submitted: {new Date(item.submittedOn).toLocaleDateString()}
            </Text>
          </View>
        )}
        {item.approvedOn && (
          <View style={styles.detailRow}>
            <MaterialIcons name="check-circle" size={16} color={colors.success} />
            <Text style={styles.detailText}>
              Approved: {new Date(item.approvedOn).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <Screen>
      <Header 
        title="All Timesheets" 
        onBack={() => onNavigate?.('Dashboard')}
      />
      
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatsCard('Total', stats.totalTimesheets, 'assignment', colors.primary)}
            {renderStatsCard('Pending', stats.pendingApproval, 'pending', '#ffc107')}
          </View>
          <View style={styles.statsRow}>
            {renderStatsCard('Approved', stats.approved, 'check-circle', colors.success)}
            {renderStatsCard('Rejected', stats.rejected, 'cancel', colors.danger)}
          </View>
        </View>
      )}
      
      <FlatList
        data={timesheets}
        renderItem={renderTimesheetItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="assignment" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No timesheets found</Text>
            <Text style={styles.emptySubtext}>Employee timesheets will appear here once submitted</Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    borderLeftWidth: 4,
    paddingVertical: 12,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 12,
    flex: 1,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  timesheetCard: {
    marginBottom: 16,
  },
  timesheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  employeeId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  projectName: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  timesheetMeta: {
    alignItems: 'flex-end',
  },
  totalHours: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  timesheetDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});