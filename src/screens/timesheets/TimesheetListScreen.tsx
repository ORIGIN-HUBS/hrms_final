import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { timesheetService } from '@/services/timesheetService';
import { Timesheet } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { gradients } from '@/theme/colors';

const TimesheetListScreen: React.FC<any> = ({ navigation }) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState<Timesheet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchTimesheets = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching timesheets...');
      const data = await timesheetService.getAllTimesheets();
      console.log('Timesheets fetched:', data?.length || 0);
      setTimesheets(data || []);
      setFilteredTimesheets(data || []);
    } catch (error: any) {
      console.error('Error fetching timesheets:', error);
      Alert.alert('Error', error.message || 'Failed to load timesheets');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTimesheets();
  }, []);
  
  useEffect(() => {
    let filtered = timesheets;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((ts: Timesheet) =>
        ts.timesheetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ts.employee?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ts.employee?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ts.project?.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((ts: Timesheet) => ts.status === statusFilter);
    }
    
    setFilteredTimesheets(filtered);
  }, [searchQuery, statusFilter, timesheets]);
  
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return colors.success;
      case 'SUBMITTED':
        return colors.info;
      case 'DRAFT':
        return colors.gray[500];
      case 'REJECTED':
        return colors.danger;
      case 'PAID':
        return colors.primary;
      default:
        return colors.gray[500];
    }
  };
  
  const formatWeek = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };
  
  const handleDelete = (timesheetId: number) => {
    Alert.alert(
      'Delete Timesheet',
      'Are you sure you want to delete this timesheet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement deleteTimesheet in service
              // await timesheetService.deleteTimesheet(timesheetId);
              Alert.alert('Info', 'Delete functionality coming soon');
              // fetchTimesheets();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete timesheet');
            }
          },
        },
      ]
    );
  };
  
  const handleApprove = async (timesheetId: number) => {
    try {
      await timesheetService.approveTimesheet(timesheetId);
      Alert.alert('Success', 'Timesheet approved successfully');
      fetchTimesheets();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve timesheet');
    }
  };
  
  const handleReject = async (timesheetId: number) => {
    Alert.alert(
      'Reject Timesheet',
      'Please provide a rejection reason:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await timesheetService.rejectTimesheet(timesheetId, 'Rejected by manager');
              Alert.alert('Success', 'Timesheet rejected');
              fetchTimesheets();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject timesheet');
            }
          },
        },
      ]
    );
  };
  
  const renderTimesheetRow = ({ item }: { item: Timesheet }) => (
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text style={styles.cellText} numberOfLines={1}>{item.id || '-'}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText} numberOfLines={1}>{formatWeek(item.weekStartDate, item.weekEndDate)}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '-'}
        </Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText} numberOfLines={1}>{item.project?.projectName || '-'}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.cellText}>{item.totalHoursLogged || 0}</Text>
      </View>
      <View style={styles.tableCell}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.tableCell}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TimesheetView', { id: item.id })}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TimesheetForm', { id: item.id })}
          >
            <Ionicons name="create-outline" size={18} color={colors.info} />
          </TouchableOpacity>
          {item.status === 'SUBMITTED' && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleApprove(item.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleReject(item.id)}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  if (isLoading && timesheets.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.success as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Timesheet Management</Text>
        <Text style={styles.headerSubtitle}>{filteredTimesheets.length} timesheets found</Text>
      </LinearGradient>
      
      <View style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.filtersCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.gray[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by timesheet ID, employee, or project..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.gray[400]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('TimesheetForm')}
            >
              <LinearGradient
                colors={gradients.success as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={22} color={colors.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterButtons}>
                {['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      statusFilter === status && styles.filterButtonActive,
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        statusFilter === status && styles.filterButtonTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
        
        {/* Table */}
        <View style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>ID</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.headerText}>Week</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.headerText}>Employee</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.headerText}>Project</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>Hours</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>Status</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>Actions</Text>
                </View>
              </View>
              
              {/* Table Body */}
              <FlatList
                data={filteredTimesheets}
                renderItem={renderTimesheetRow}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl refreshing={isLoading} onRefresh={fetchTimesheets} />
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={64} color={colors.gray[300]} />
                    <Text style={styles.emptyText}>No timesheets found</Text>
                    <Text style={styles.emptySubtext}>
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Try adjusting your filters'
                        : 'Add your first timesheet to get started'}
                    </Text>
                  </View>
                }
              />
            </View>
          </ScrollView>
        </View>
      </View>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TimesheetForm')}
      >
        <LinearGradient
          colors={gradients.success as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  filtersCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  addButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  filterRow: {
    gap: spacing.md,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  tableCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  table: {
    minWidth: 1000,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[200],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    minWidth: 100,
  },
  headerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  cellText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  cellTextBold: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TimesheetListScreen;
