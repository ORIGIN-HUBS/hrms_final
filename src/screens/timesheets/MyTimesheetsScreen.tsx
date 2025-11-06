import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { timesheetService } from '@/services/timesheetService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Timesheet } from '@/types';
import { RootState } from '@/store';

const MyTimesheetsScreen: React.FC<any> = ({ navigation }) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWeekTimesheet, setCurrentWeekTimesheet] = useState<Timesheet | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.employee?.id) {
      fetchMyTimesheets();
      fetchCurrentWeekTimesheet();
    }
  }, [user]);

  const fetchMyTimesheets = async () => {
    if (!user?.employee?.id) return;

    setIsLoading(true);
    try {
      const data = await timesheetService.getTimesheetsByEmployee(user.employee.id);
      setTimesheets(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load timesheets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentWeekTimesheet = async () => {
    if (!user?.employee?.id) return;

    try {
      const data = await timesheetService.getCurrentWeekTimesheet(user.employee.id);
      setCurrentWeekTimesheet(data);
    } catch (error: any) {
      console.log('No current week timesheet:', error.message);
    }
  };

  const handleCreateCurrentWeek = async () => {
    if (!user?.employee?.id) return;

    try {
      const newTimesheet = await timesheetService.createTimesheet({
        employeeId: user.employee.id,
        weekStartDate: getCurrentWeekStart(),
        weekEndDate: getCurrentWeekEnd(),
        status: 'DRAFT',
      });
      setCurrentWeekTimesheet(newTimesheet);
      navigation.navigate('TimesheetForm', { timesheetId: newTimesheet.id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create timesheet');
    }
  };

  const getCurrentWeekStart = (): string => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const sunday = new Date(today.setDate(diff));
    return sunday.toISOString().split('T')[0];
  };

  const getCurrentWeekEnd = (): string => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + 6;
    const saturday = new Date(today.setDate(diff));
    return saturday.toISOString().split('T')[0];
  };

  const renderTimesheet = ({ item }: { item: Timesheet }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TimesheetView', { timesheetId: item.id })}
    >
      <Card style={styles.timesheetCard}>
        <View style={styles.timesheetHeader}>
          <View style={styles.timesheetIcon}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
          </View>
          <View style={styles.timesheetInfo}>
            <Text style={styles.weekRange}>
              {item.weekStartDate} - {item.weekEndDate}
            </Text>
            {item.project && (
              <Text style={styles.projectName} numberOfLines={1}>
                {item.project.projectName}
              </Text>
            )}
            <Text style={styles.hoursText}>
              {item.totalHoursLogged || 0}h logged
            </Text>
          </View>
          <StatusBadge status={item.status} size="small" />
        </View>

        {item.status === 'DRAFT' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TimesheetForm', { timesheetId: item.id })}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSubmit(item.id)}
            >
              <Ionicons name="send-outline" size={20} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.success }]}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'REJECTED' && item.rejectionReason && (
          <View style={styles.rejectionContainer}>
            <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
            <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const handleSubmit = async (timesheetId: number) => {
    Alert.alert(
      'Submit Timesheet',
      'Are you sure you want to submit this timesheet for approval?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await timesheetService.submitTimesheet(timesheetId);
              Alert.alert('Success', 'Timesheet submitted successfully');
              fetchMyTimesheets();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to submit timesheet');
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyStateTitle}>No Timesheets</Text>
      <Text style={styles.emptyStateText}>
        You haven't created any timesheets yet. Start by creating one for the current week.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Timesheets</Text>
      <Text style={styles.headerSubtitle}>
        {timesheets.length} {timesheets.length === 1 ? 'timesheet' : 'timesheets'}
      </Text>

      {currentWeekTimesheet ? (
        <Card style={styles.currentWeekCard}>
          <View style={styles.currentWeekHeader}>
            <Text style={styles.currentWeekTitle}>Current Week</Text>
            <StatusBadge status={currentWeekTimesheet.status} size="small" />
          </View>
          <Text style={styles.currentWeekRange}>
            {currentWeekTimesheet.weekStartDate} - {currentWeekTimesheet.weekEndDate}
          </Text>
          <Text style={styles.currentWeekHours}>
            {currentWeekTimesheet.totalHoursLogged || 0} hours logged
          </Text>
          <Button
            title={currentWeekTimesheet.status === 'DRAFT' ? 'Continue Editing' : 'View Details'}
            onPress={() =>
              navigation.navigate(
                currentWeekTimesheet.status === 'DRAFT' ? 'TimesheetForm' : 'TimesheetView',
                { timesheetId: currentWeekTimesheet.id }
              )
            }
            style={styles.currentWeekButton}
          />
        </Card>
      ) : (
        <Card style={styles.currentWeekCard}>
          <Text style={styles.currentWeekTitle}>Current Week</Text>
          <Text style={styles.currentWeekRange}>
            {getCurrentWeekStart()} - {getCurrentWeekEnd()}
          </Text>
          <Text style={styles.noTimesheetText}>No timesheet created yet</Text>
          <Button
            title="Create Timesheet"
            onPress={handleCreateCurrentWeek}
            icon={<Ionicons name="add" size={20} color={colors.white} />}
            style={styles.currentWeekButton}
          />
        </Card>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={timesheets}
        renderItem={renderTimesheet}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              fetchMyTimesheets();
              fetchCurrentWeekTimesheet();
            }}
          />
        }
        ListHeaderComponent={renderHeader}
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
  headerContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    marginBottom: spacing.md,
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
    marginBottom: spacing.lg,
  },
  currentWeekCard: {
    backgroundColor: colors.primary + '05',
    borderColor: colors.primary + '20',
    borderWidth: 1,
  },
  currentWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currentWeekTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  currentWeekRange: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  currentWeekHours: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  noTimesheetText: {
    fontSize: typography.fontSize.base,
    color: colors.text.disabled,
    marginBottom: spacing.md,
  },
  currentWeekButton: {
    marginTop: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  timesheetCard: {
    marginBottom: spacing.md,
  },
  timesheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  weekRange: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  projectName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  hoursText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  rejectionContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.error + '10',
    borderRadius: 8,
  },
  rejectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  rejectionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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

export default MyTimesheetsScreen;

