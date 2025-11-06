import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { timesheetService } from '@/services/timesheetService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimesheetFormScreen: React.FC<any> = ({ navigation, route }) => {
  const timesheetId = route?.params?.id;
  const [projectId, setProjectId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [hours, setHours] = useState<{ [key: string]: string }>({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: '',
  });
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getTotalHours = () => {
    return Object.values(hours).reduce((sum, h) => sum + (parseFloat(h) || 0), 0);
  };

  const handleSubmit = async () => {
    if (!projectId || !weekStartDate || !weekEndDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const timesheetData = {
        projectId: parseInt(projectId),
        weekStartDate,
        weekEndDate,
        status: 'DRAFT',
        totalHoursLogged: getTotalHours(),
        timesheetEntries: DAYS.map((day, index) => ({
          workDate: weekStartDate,
          hoursWorked: parseFloat(hours[day]) || 0,
          notes: `${day} hours`,
        })).filter(entry => entry.hoursWorked > 0),
      };

      if (timesheetId) {
        await timesheetService.updateTimesheet(timesheetId, timesheetData);
        Alert.alert('Success', 'Timesheet updated successfully');
      } else {
        await timesheetService.createTimesheet(timesheetData);
        Alert.alert('Success', 'Timesheet created successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save timesheet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.primary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {timesheetId ? 'Edit Timesheet' : 'New Timesheet'}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <LinearGradient
            colors={gradients.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Ionicons name="information-circle" size={20} color={colors.white} />
            <Text style={styles.sectionTitle}>Timesheet Information</Text>
          </LinearGradient>

          <View style={styles.sectionContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Project ID *</Text>
              <TextInput
                style={styles.input}
                value={projectId}
                onChangeText={setProjectId}
                placeholder="Enter project ID"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Week Start *</Text>
                <TextInput
                  style={styles.input}
                  value={weekStartDate}
                  onChangeText={setWeekStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Week End *</Text>
                <TextInput
                  style={styles.input}
                  value={weekEndDate}
                  onChangeText={setWeekEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <LinearGradient
            colors={gradients.success as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Ionicons name="time" size={20} color={colors.white} />
            <Text style={styles.sectionTitle}>Daily Hours</Text>
          </LinearGradient>

          <View style={styles.sectionContent}>
            {DAYS.map((day) => (
              <View key={day} style={styles.formGroup}>
                <Text style={styles.label}>{day}</Text>
                <TextInput
                  style={styles.input}
                  value={hours[day]}
                  onChangeText={(value) => setHours({ ...hours, [day]: value })}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Hours:</Text>
              <Text style={styles.totalValue}>{getTotalHours().toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <LinearGradient
            colors={gradients.warning as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Ionicons name="document-text" size={20} color={colors.white} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </LinearGradient>

          <View style={styles.sectionContent}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any additional notes..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <LinearGradient
            colors={gradients.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>
              {isLoading ? 'Saving...' : timesheetId ? 'Update Timesheet' : 'Create Timesheet'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  sectionContent: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  submitButton: {
    marginBottom: spacing.xl,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  submitText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

export default TimesheetFormScreen;
