import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Button, TextInput, SegmentedButtons, FAB, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { createTimesheet, updateTimesheet, fetchTimesheetById } from '../../store/slices/timesheetSlice';
import { fetchProjects } from '../../store/slices/projectSlice';
import { theme } from '../../theme';

interface TimeEntry {
  id?: number;
  entryDate: string;
  projectId: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  description: string;
  workType: string;
  workLocation: string;
  billableToClient: boolean;
}

interface Expense {
  id?: number;
  expenseDate: string;
  projectId: string;
  category: string;
  expenseAmount: number;
  description: string;
  vendorName: string;
}

export default function TimesheetFormScreen({ route, navigation }: any) {
  const { timesheetId } = route.params || {};
  const isEdit = !!timesheetId;

  const [formData, setFormData] = useState({
    employeeId: '',
    weekStartDate: '',
    weekEndDate: '',
    notes: '',
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentSection, setCurrentSection] = useState('info');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { selectedTimesheet, loading, error } = useSelector((state: RootState) => state.timesheet);
  const { projects } = useSelector((state: RootState) => state.project);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchProjects());
    if (isEdit && timesheetId) {
      dispatch(fetchTimesheetById(timesheetId));
    }
  }, [dispatch, isEdit, timesheetId]);

  useEffect(() => {
    if (selectedTimesheet && isEdit) {
      setFormData({
        employeeId: selectedTimesheet.employee?.id?.toString() || '',
        weekStartDate: selectedTimesheet.weekStartDate || '',
        weekEndDate: selectedTimesheet.weekEndDate || '',
        notes: selectedTimesheet.rejectionReason || '',
      });
      setTimeEntries(selectedTimesheet.timeEntries || []);
      setExpenses(selectedTimesheet.expenses || []);
    }
  }, [selectedTimesheet, isEdit]);

  const addTimeEntry = () => {
    const newEntry: TimeEntry = {
      entryDate: '',
      projectId: '',
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 8,
      description: '',
      workType: 'REGULAR',
      workLocation: 'OFFICE',
      billableToClient: true,
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  const updateTimeEntry = (index: number, field: keyof TimeEntry, value: any) => {
    const updated = [...timeEntries];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate hours when start/end time changes
    if (field === 'startTime' || field === 'endTime') {
      const entry = updated[index];
      if (entry.startTime && entry.endTime) {
        const start = new Date(`2000-01-01T${entry.startTime}`);
        const end = new Date(`2000-01-01T${entry.endTime}`);
        let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (diff < 0) diff += 24; // Handle overnight work
        updated[index].hoursWorked = Math.round(diff * 4) / 4; // Round to nearest 0.25
      }
    }
    
    setTimeEntries(updated);
  };

  const removeTimeEntry = (index: number) => {
    setTimeEntries(timeEntries.filter((_, i) => i !== index));
  };

  const addExpense = () => {
    const newExpense: Expense = {
      expenseDate: '',
      projectId: '',
      category: 'TRAVEL',
      expenseAmount: 0,
      description: '',
      vendorName: '',
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (index: number, field: keyof Expense, value: any) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
    const regularHours = timeEntries.filter(e => e.workType === 'REGULAR').reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
    const overtimeHours = timeEntries.filter(e => e.workType === 'OVERTIME').reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.expenseAmount || 0), 0);
    
    const hourlyRate = 30; // This should come from employee data
    const overtimeRate = hourlyRate * 1.5;
    const totalPay = (regularHours * hourlyRate) + (overtimeHours * overtimeRate);

    return { totalHours, regularHours, overtimeHours, totalExpenses, totalPay };
  };

  const handleSubmit = async (action: 'save' | 'submit') => {
    try {
      const timesheetData = {
        ...formData,
        timeEntries,
        expenses,
        status: action === 'submit' ? 'SUBMITTED' : 'DRAFT',
      };

      if (isEdit) {
        await dispatch(updateTimesheet({ id: timesheetId, data: timesheetData })).unwrap();
      } else {
        await dispatch(createTimesheet(timesheetData)).unwrap();
      }

      setSnackbarMessage(`Timesheet ${action === 'submit' ? 'submitted' : 'saved'} successfully!`);
      setShowSnackbar(true);
      
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Failed to save timesheet. Please try again.');
      setShowSnackbar(true);
    }
  };

  const totals = calculateTotals();

  const sections = [
    { value: 'info', label: 'Info' },
    { value: 'time', label: 'Time Entries' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'summary', label: 'Summary' }
  ];

  const renderTimesheetInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Timesheet Information" left={(props) => <Ionicons {...props} name="information-circle" size={24} />} />
      <Card.Content>
        <View style={styles.row}>
          <TextInput
            label="Week Start Date"
            value={formData.weekStartDate}
            onChangeText={(value) => setFormData(prev => ({ ...prev, weekStartDate: value }))}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            placeholder="YYYY-MM-DD"
          />
          <TextInput
            label="Week End Date"
            value={formData.weekEndDate}
            onChangeText={(value) => setFormData(prev => ({ ...prev, weekEndDate: value }))}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <TextInput
          label="Notes"
          value={formData.notes}
          onChangeText={(value) => setFormData(prev => ({ ...prev, notes: value }))}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
        />
      </Card.Content>
    </Card>
  );

  const renderTimeEntries = () => (
    <Card style={styles.sectionCard}>
      <Card.Title 
        title="Time Entries" 
        left={(props) => <Ionicons {...props} name="time" size={24} />}
        right={(props) => (
          <Button mode="outlined" onPress={addTimeEntry} icon="plus" compact>
            Add Entry
          </Button>
        )}
      />
      <Card.Content>
        {timeEntries.map((entry, index) => (
          <Card key={index} style={styles.entryCard}>
            <Card.Content>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>Time Entry {index + 1}</Text>
                <Button
                  mode="text"
                  onPress={() => removeTimeEntry(index)}
                  icon="delete"
                  compact
                  textColor={theme.colors.error}
                >
                  Remove
                </Button>
              </View>
              
              <View style={styles.row}>
                <TextInput
                  label="Date"
                  value={entry.entryDate}
                  onChangeText={(value) => updateTimeEntry(index, 'entryDate', value)}
                  mode="outlined"
                  style={[styles.input, styles.flex1]}
                  placeholder="YYYY-MM-DD"
                />
                <TextInput
                  label="Project"
                  value={entry.projectId}
                  onChangeText={(value) => updateTimeEntry(index, 'projectId', value)}
                  mode="outlined"
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  label="Start Time"
                  value={entry.startTime}
                  onChangeText={(value) => updateTimeEntry(index, 'startTime', value)}
                  mode="outlined"
                  style={[styles.input, styles.flex1]}
                  placeholder="09:00"
                />
                <TextInput
                  label="End Time"
                  value={entry.endTime}
                  onChangeText={(value) => updateTimeEntry(index, 'endTime', value)}
                  mode="outlined"
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  placeholder="17:00"
                />
                <TextInput
                  label="Hours"
                  value={entry.hoursWorked.toString()}
                  mode="outlined"
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  editable={false}
                />
              </View>

              <TextInput
                label="Description"
                value={entry.description}
                onChangeText={(value) => updateTimeEntry(index, 'description', value)}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={2}
              />

              <View style={styles.row}>
                <TextInput
                  label="Work Type"
                  value={entry.workType}
                  onChangeText={(value) => updateTimeEntry(index, 'workType', value)}
                  mode="outlined"
                  style={[styles.input, styles.flex1]}
                />
                <TextInput
                  label="Work Location"
                  value={entry.workLocation}
                  onChangeText={(value) => updateTimeEntry(index, 'workLocation', value)}
                  mode="outlined"
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
        
        {timeEntries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No time entries added yet</Text>
            <Button mode="contained" onPress={addTimeEntry} icon="plus">
              Add First Entry
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderExpenses = () => (
    <Card style={styles.sectionCard}>
      <Card.Title 
        title="Expenses" 
        left={(props) => <Ionicons {...props} name="receipt" size={24} />}
        right={(props) => (
          <Button mode="outlined" onPress={addExpense} icon="plus" compact>
            Add Expense
          </Button>
        )}
      />
      <Card.Content>
        {expenses.map((expense, index) => (
          <Card key={index} style={styles.expenseCard}>
            <Card.Content>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>Expense {index + 1}</Text>
                <Button
                  mode="text"
                  onPress={() => removeExpense(index)}
                  icon="delete"
                  compact
                  textColor={theme.colors.error}
                >
                  Remove
                </Button>
              </View>
              
              <View style={styles.row}>
                <TextInput
                  label="Date"
                  value={expense.expenseDate}
                  onChangeText={(value) => updateExpense(index, 'expenseDate', value)}
                  mode="outlined"
                  style={[styles.input, styles.flex1]}
                />
                <TextInput
                  label="Category"
                  value={expense.category}
                  onChangeText={(value) => updateExpense(index, 'category', value)}
                  mode="outlined"
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                />
                <TextInput
                  label="Amount ($)"
                  value={expense.expenseAmount.toString()}
                  onChangeText={(value) => updateExpense(index, 'expenseAmount', parseFloat(value) || 0)}
                  mode="outlined"
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  keyboardType="numeric"
                />
              </View>

              <TextInput
                label="Description"
                value={expense.description}
                onChangeText={(value) => updateExpense(index, 'description', value)}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Vendor"
                value={expense.vendorName}
                onChangeText={(value) => updateExpense(index, 'vendorName', value)}
                mode="outlined"
                style={styles.input}
              />
            </Card.Content>
          </Card>
        ))}
      </Card.Content>
    </Card>
  );

  const renderSummary = () => (
    <Card style={[styles.sectionCard, styles.summaryCard]}>
      <Card.Title title="Timesheet Summary" left={(props) => <Ionicons {...props} name="calculator" size={24} />} />
      <Card.Content>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.totalHours.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Total Hours</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>${totals.totalPay.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Pay</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.regularHours.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Regular Hours</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.overtimeHours.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Overtime Hours</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>${totals.totalExpenses.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'info': return renderTimesheetInfo();
      case 'time': return renderTimeEntries();
      case 'expenses': return renderExpenses();
      case 'summary': return renderSummary();
      default: return renderTimesheetInfo();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEdit ? `Edit Timesheet #${timesheetId}` : 'Create New Timesheet'}
        </Text>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          icon="close"
          compact
        >
          Cancel
        </Button>
      </View>

      <SegmentedButtons
        value={currentSection}
        onValueChange={setCurrentSection}
        buttons={sections}
        style={styles.segmentedButtons}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentSection()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Button
            mode="outlined"
            onPress={() => handleSubmit('save')}
            loading={loading}
            disabled={loading}
            style={styles.footerButton}
            icon="content-save"
          >
            Save as Draft
          </Button>
          <Button
            mode="contained"
            onPress={() => handleSubmit('submit')}
            loading={loading}
            disabled={loading}
            style={styles.footerButton}
            icon="send"
          >
            Submit for Approval
          </Button>
        </View>
      </View>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  segmentedButtons: {
    margin: theme.spacing.md,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  summaryCard: {
    backgroundColor: theme.colors.primaryContainer,
  },
  row: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'stretch',
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: Platform.OS === 'web' ? theme.spacing.md : 0,
  },
  entryCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  expenseCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.tertiaryContainer,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  footerButtons: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: theme.spacing.sm,
  },
  footerButton: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    paddingVertical: theme.spacing.xs,
  },
});