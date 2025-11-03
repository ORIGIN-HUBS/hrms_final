import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { timesheetService } from '@/services/timesheetService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Timesheet } from '@/types';

const TimesheetListScreen: React.FC<any> = ({ navigation }) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState<Timesheet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchTimesheets();
  }, []);

  useEffect(() => {
    if (!Array.isArray(timesheets)) {
      setFilteredTimesheets([]);
      return;
    }

    let filtered = timesheets;

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((ts) => ts.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (ts) =>
          ts.timesheetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ts.employee?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ts.employee?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ts.project?.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTimesheets(filtered);
  }, [searchQuery, filterStatus, timesheets]);

  const fetchTimesheets = async () => {
    setIsLoading(true);
    try {
      const data = await timesheetService.getAllTimesheets();
      const timesheetsArray = Array.isArray(data) ? data : [];
      setTimesheets(timesheetsArray);
      setFilteredTimesheets(timesheetsArray);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load timesheets');
      setTimesheets([]);
      setFilteredTimesheets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTimesheet = ({ item }: { item: Timesheet }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TimesheetView', { timesheetId: item.id })}
    >
      <Card style={styles.timesheetCard}>
        <View style={styles.timesheetHeader}>
          <View style={styles.timesheetIcon}>
            <Ionicons name="time" size={24} color={colors.primary} />
          </View>
          <View style={styles.timesheetInfo}>
            <Text style={styles.timesheetId} numberOfLines={1}>
              {item.timesheetId || `TS-${item.id}`}
            </Text>
            <Text style={styles.employeeName} numberOfLines={1}>
              {item.employee?.firstName} {item.employee?.lastName}
            </Text>
            <Text style={styles.weekRange}>
              {item.weekStartDate} - {item.weekEndDate}
            </Text>
          </View>
          <StatusBadge status={item.status} size="small" />
        </View>

        <View style={styles.timesheetMeta}>
          {item.project && (
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.project.projectName}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.metaText}>
              {item.totalHoursLogged || 0}h logged
            </Text>
          </View>
        </View>

        {item.totalBillableAmount && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Billable Amount:</Text>
            <Text style={styles.amountValue}>${item.totalBillableAmount.toFixed(2)}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyStateTitle}>No Timesheets</Text>
      <Text style={styles.emptyStateText}>
        No timesheets found. Create a new timesheet to get started.
      </Text>
    </View>
  );

  const StatusFilter = () => (
    <View style={styles.filterContainer}>
      {['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            filterStatus === status && styles.filterButtonActive,
            { marginRight: spacing.xs }
          ]}
          onPress={() => setFilterStatus(status)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterStatus === status && styles.filterButtonTextActive,
            ]}
          >
            {status}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search timesheets..."
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
        <Button
          title="Add"
          onPress={() => navigation.navigate('TimesheetForm')}
          icon={<Ionicons name="add" size={20} color={colors.white} />}
          style={styles.addButton}
        />
      </View>

      <StatusFilter />

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Array.isArray(timesheets) ? timesheets.length : 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Array.isArray(timesheets) ? timesheets.filter((ts) => ts.status === 'SUBMITTED').length : 0}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Array.isArray(timesheets) ? timesheets.filter((ts) => ts.status === 'APPROVED').length : 0}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
      </View>

      <FlatList
        data={filteredTimesheets}
        renderItem={renderTimesheet}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchTimesheets} />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  addButton: {
    paddingHorizontal: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.md,
  },
  timesheetCard: {
    marginBottom: spacing.md,
  },
  timesheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  timesheetIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timesheetInfo: {
    flex: 1,
  },
  timesheetId: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  employeeName: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  weekRange: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  timesheetMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
    marginLeft: spacing.xs,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  amountValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default TimesheetListScreen;

