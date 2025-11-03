import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
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

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimesheetViewScreen: React.FC<any> = ({ navigation, route }) => {
  const { timesheetId } = route.params;
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimesheet();
  }, [timesheetId]);

  const fetchTimesheet = async () => {
    setIsLoading(true);
    try {
      const data = await timesheetService.getTimesheetById(timesheetId);
      setTimesheet(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load timesheet');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('TimesheetForm', { timesheetId });
  };

  const handleSubmit = async () => {
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
              fetchTimesheet();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to submit timesheet');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading timesheet...</Text>
      </View>
    );
  }

  if (!timesheet) {
    return null;
  }

  const InfoRow = ({ label, value }: { label: string; value?: string | number }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.timesheetIcon}>
            <Ionicons name="calendar" size={32} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.timesheetId}>{timesheet.timesheetId || `TS-${timesheet.id}`}</Text>
            <Text style={styles.weekRange}>
              {timesheet.weekStartDate} - {timesheet.weekEndDate}
            </Text>
            <Text style={styles.employeeName}>
              {timesheet.employee?.firstName} {timesheet.employee?.lastName}
            </Text>
          </View>
          <StatusBadge status={timesheet.status} />
        </View>
      </Card>

      {/* Action Buttons */}
      {timesheet.status === 'DRAFT' && (
        <View style={styles.actionButtons}>
          <Button
            title="Edit"
            onPress={handleEdit}
            icon={<Ionicons name="create-outline" size={20} color={colors.white} />}
            style={styles.actionButton}
          />
          <Button
            title="Submit"
            onPress={handleSubmit}
            icon={<Ionicons name="send-outline" size={20} color={colors.white} />}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      )}

      {/* Summary Card */}
      <Card>
        <Text style={styles.sectionTitle}>Summary</Text>
        <InfoRow label="Total Hours" value={`${timesheet.totalHoursLogged || 0}h`} />
        <InfoRow label="Regular Hours" value={`${timesheet.totalRegularHours || 0}h`} />
        <InfoRow label="Overtime Hours" value={`${timesheet.totalOvertimeHours || 0}h`} />
        <InfoRow label="Billable Hours" value={`${timesheet.totalBillableHours || 0}h`} />
        {timesheet.totalBillableAmount && (
          <InfoRow label="Billable Amount" value={`$${timesheet.totalBillableAmount.toFixed(2)}`} />
        )}
        {timesheet.totalPayableAmount && (
          <InfoRow label="Payable Amount" value={`$${timesheet.totalPayableAmount.toFixed(2)}`} />
        )}
      </Card>

      {/* Daily Entries */}
      {timesheet.timesheetEntries && timesheet.timesheetEntries.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Daily Breakdown</Text>
          {timesheet.timesheetEntries.map((entry, index) => (
            <View key={entry.id || index} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.dayName}>{DAYS_OF_WEEK[new Date(entry.workDate).getDay()]}</Text>
                <Text style={styles.dayDate}>{entry.workDate}</Text>
              </View>
              <View style={styles.entryDetails}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryLabel}>Regular:</Text>
                  <Text style={styles.entryValue}>{entry.hoursWorked || 0}h</Text>
                </View>
                {entry.overtimeHours && entry.overtimeHours > 0 && (
                  <View style={styles.entryRow}>
                    <Text style={styles.entryLabel}>Overtime:</Text>
                    <Text style={styles.entryValue}>{entry.overtimeHours}h</Text>
                  </View>
                )}
                {entry.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{entry.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Project Information */}
      {timesheet.project && (
        <Card>
          <Text style={styles.sectionTitle}>Project</Text>
          <InfoRow label="Project Name" value={timesheet.project.projectName} />
          <InfoRow label="Client" value={timesheet.project.clientCompanyName} />
          <InfoRow label="Job Title" value={timesheet.project.jobTitle} />
        </Card>
      )}

      {/* Approval Information */}
      {(timesheet.status === 'APPROVED' || timesheet.status === 'REJECTED') && (
        <Card>
          <Text style={styles.sectionTitle}>Approval Details</Text>
          {timesheet.approvedBy && (
            <InfoRow
              label="Approved By"
              value={`${timesheet.approvedBy.firstName} ${timesheet.approvedBy.lastName}`}
            />
          )}
          <InfoRow label="Approval Date" value={timesheet.approvalDate} />
          {timesheet.rejectionReason && (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
              <Text style={styles.rejectionText}>{timesheet.rejectionReason}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Payment Information */}
      {timesheet.paymentStatus && (
        <Card>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <InfoRow label="Payment Status" value={timesheet.paymentStatus} />
          <InfoRow label="Invoice ID" value={timesheet.invoiceId} />
          <InfoRow label="Invoice Date" value={timesheet.invoiceDate} />
          <InfoRow label="Payment Due Date" value={timesheet.paymentDueDate} />
        </Card>
      )}

      {/* Audit Information */}
      <Card style={styles.lastCard}>
        <Text style={styles.sectionTitle}>Audit Information</Text>
        <InfoRow label="Created At" value={timesheet.createdAt} />
        <InfoRow label="Updated At" value={timesheet.updatedAt} />
        <InfoRow label="Created By" value={timesheet.createdBy} />
        {timesheet.autoPopulated && (
          <View style={styles.aiTag}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.aiText}>Auto-populated from calendar</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  headerCard: {
    marginTop: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timesheetIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  timesheetId: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  weekRange: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  employeeName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },
  entryCard: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dayName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  dayDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  entryDetails: {
    gap: spacing.xs,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  entryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  notesContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
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
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 4,
  },
  aiText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  lastCard: {
    marginBottom: spacing.xl,
  },
});

export default TimesheetViewScreen;

