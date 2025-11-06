import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
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

const TimesheetApprovalsScreen: React.FC<any> = ({ navigation }) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingTimesheets();
  }, []);

  const fetchPendingTimesheets = async () => {
    setIsLoading(true);
    try {
      const data = await timesheetService.getPendingTimesheets();
      setTimesheets(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load pending timesheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (timesheetId: number) => {
    Alert.alert(
      'Approve Timesheet',
      'Are you sure you want to approve this timesheet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await timesheetService.approveTimesheet(timesheetId);
              Alert.alert('Success', 'Timesheet approved successfully');
              fetchPendingTimesheets();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve timesheet');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (timesheetId: number) => {
    setSelectedTimesheetId(timesheetId);
    Alert.prompt(
      'Reject Timesheet',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (reason) => {
            if (!reason || reason.trim() === '') {
              Alert.alert('Error', 'Please provide a rejection reason');
              return;
            }
            try {
              await timesheetService.rejectTimesheet(timesheetId, reason);
              Alert.alert('Success', 'Timesheet rejected');
              fetchPendingTimesheets();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject timesheet');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderTimesheet = ({ item }: { item: Timesheet }) => (
    <Card style={styles.timesheetCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('TimesheetView', { timesheetId: item.id })}
      >
        <View style={styles.timesheetHeader}>
          <View style={styles.timesheetIcon}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.timesheetInfo}>
            <Text style={styles.employeeName}>
              {item.employee?.firstName} {item.employee?.lastName}
            </Text>
            <Text style={styles.timesheetId}>{item.timesheetId || `TS-${item.id}`}</Text>
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
            <Text style={styles.metaText}>{item.totalHoursLogged || 0}h logged</Text>
          </View>
        </View>

        {item.totalBillableAmount && (
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Billable Amount:</Text>
            <Text style={styles.amountValue}>${item.totalBillableAmount.toFixed(2)}</Text>
          </View>
        )}

        {item.submittedOn && (
          <View style={styles.submittedRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.disabled} />
            <Text style={styles.submittedText}>
              Submitted: {new Date(item.submittedOn).toLocaleDateString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <Button
          title="View Details"
          onPress={() => navigation.navigate('TimesheetView', { timesheetId: item.id })}
          variant="outline"
          style={styles.actionButton}
          icon={<Ionicons name="eye-outline" size={18} color={colors.primary} />}
        />
        <Button
          title="Approve"
          onPress={() => handleApprove(item.id)}
          style={styles.actionButton}
          icon={<Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />}
        />
        <Button
          title="Reject"
          onPress={() => handleReject(item.id)}
          variant="outline"
          style={[styles.actionButton, styles.rejectButton]}
          icon={<Ionicons name="close-circle-outline" size={18} color={colors.error} />}
        />
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyStateTitle}>No Pending Approvals</Text>
      <Text style={styles.emptyStateText}>
        All timesheets have been reviewed. Check back later for new submissions.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Timesheet Approvals</Text>
      <Text style={styles.headerSubtitle}>
        {timesheets.length} {timesheets.length === 1 ? 'timesheet' : 'timesheets'} pending approval
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={timesheets}
        renderItem={renderTimesheet}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchPendingTimesheets} />
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
  headerContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
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
  employeeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timesheetId: {
    fontSize: typography.fontSize.sm,
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
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginBottom: spacing.sm,
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
  submittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  submittedText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  rejectButton: {
    borderColor: colors.error,
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

export default TimesheetApprovalsScreen;

