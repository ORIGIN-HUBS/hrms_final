import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { timesheetService } from '@/services/timesheetService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Timesheet, TimesheetEntry } from '@/types';
import { RootState } from '@/store';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimesheetFormScreen: React.FC<any> = ({ navigation, route }) => {
  const { timesheetId } = route.params || {};
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (timesheetId) {
      fetchTimesheet();
    } else {
      initializeNewTimesheet();
    }
  }, [timesheetId]);

  const fetchTimesheet = async () => {
    setIsLoading(true);
    try {
      const data = await timesheetService.getTimesheetById(timesheetId);
      setTimesheet(data);
      if (data.timesheetEntries && data.timesheetEntries.length > 0) {
        setEntries(data.timesheetEntries);
      } else {
        initializeEntries(data.weekStartDate);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load timesheet');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeNewTimesheet = () => {
    const weekStart = getCurrentWeekStart();
    initializeEntries(weekStart);
  };

  const initializeEntries = (weekStartDate: string) => {
    const startDate = new Date(weekStartDate);
    const newEntries: TimesheetEntry[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      newEntries.push({
        workDate: date.toISOString().split('T')[0],
        hoursWorked: 0,
        billableHours: 0,
        overtimeHours: 0,
        workType: 'REGULAR',
        workLocation: 'OFFICE',
        notes: '',
      });
    }
    setEntries(newEntries);
  };

  const getCurrentWeekStart = (): string => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const sunday = new Date(today.setDate(diff));
    return sunday.toISOString().split('T')[0];
  };

  const handleHoursChange = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    const hours = parseFloat(value) || 0;
    newEntries[index] = {
      ...newEntries[index],
      [field]: hours,
    };

    // Auto-calculate billable hours if not manually set
    if (field === 'hoursWorked') {
      newEntries[index].billableHours = hours;
    }

    setEntries(newEntries);
  };

  const handleNotesChange = (index: number, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      notes: value,
    };
    setEntries(newEntries);
  };

  const calculateTotalHours = () => {
    return entries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
  };

  const calculateTotalBillable = () => {
    return entries.reduce((sum, entry) => sum + (entry.billableHours || 0), 0);
  };

  const calculateTotalOvertime = () => {
    return entries.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (timesheetId) {
        await timesheetService.saveTimesheetEntries(timesheetId, entries);
        Alert.alert('Success', 'Timesheet saved successfully');
      } else {
        // Create new timesheet
        const newTimesheet = await timesheetService.createTimesheet({
          employeeId: user?.employee?.id,
          weekStartDate: entries[0].workDate,
          weekEndDate: entries[6].workDate,
          status: 'DRAFT',
          timesheetEntries: entries,
        });
        Alert.alert('Success', 'Timesheet created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.replace('TimesheetView', { timesheetId: newTimesheet.id }),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save timesheet');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    const totalHours = calculateTotalHours();
    if (totalHours === 0) {
      Alert.alert('Error', 'Please enter hours before submitting');
      return;
    }

    Alert.alert(
      'Submit Timesheet',
      `Submit ${totalHours} hours for approval?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await handleSave();
              if (timesheetId) {
                await timesheetService.submitTimesheet(timesheetId);
                Alert.alert('Success', 'Timesheet submitted successfully', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              }
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Summary Card */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Week Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{calculateTotalHours()}h</Text>
                <Text style={styles.summaryLabel}>Total Hours</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{calculateTotalBillable()}h</Text>
                <Text style={styles.summaryLabel}>Billable</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{calculateTotalOvertime()}h</Text>
                <Text style={styles.summaryLabel}>Overtime</Text>
              </View>
            </View>
          </Card>

          {/* Daily Entries */}
          {entries.map((entry, index) => (
            <Card key={index} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{DAYS_OF_WEEK[index]}</Text>
                <Text style={styles.dayDate}>{entry.workDate}</Text>
              </View>

              <View style={styles.hoursRow}>
                <View style={styles.hoursInput}>
                  <Text style={styles.inputLabel}>Regular Hours</Text>
                  <TextInput
                    style={styles.input}
                    value={entry.hoursWorked?.toString() || '0'}
                    onChangeText={(value) => handleHoursChange(index, 'hoursWorked', value)}
                    keyboardType="decimal-pad"
                    placeholder="0"
                  />
                </View>
                <View style={styles.hoursInput}>
                  <Text style={styles.inputLabel}>Overtime</Text>
                  <TextInput
                    style={styles.input}
                    value={entry.overtimeHours?.toString() || '0'}
                    onChangeText={(value) => handleHoursChange(index, 'overtimeHours', value)}
                    keyboardType="decimal-pad"
                    placeholder="0"
                  />
                </View>
              </View>

              <Input
                label="Notes"
                value={entry.notes || ''}
                onChangeText={(value) => handleNotesChange(index, value)}
                placeholder="Task description..."
                multiline
                numberOfLines={2}
              />
            </Card>
          ))}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Save Draft"
              onPress={handleSave}
              loading={isSaving}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Submit"
              onPress={handleSubmit}
              loading={isSaving}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
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
  content: {
    padding: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.primary + '05',
    borderColor: colors.primary + '20',
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  dayCard: {
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  dayName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  dayDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  hoursRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  hoursInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
  },
});

export default TimesheetFormScreen;

