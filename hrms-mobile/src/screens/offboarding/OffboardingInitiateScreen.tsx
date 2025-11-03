import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { offboardingService } from '@/services/offboardingService';
import { employeeService } from '@/services/employeeService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Employee } from '@/types';

const offboardingValidationSchema = Yup.object().shape({
  employeeId: Yup.number().required('Employee is required'),
  resignationDate: Yup.string().required('Resignation date is required'),
  lastWorkingDay: Yup.string().required('Last working day is required'),
  reasonForLeaving: Yup.string().required('Reason for leaving is required'),
  noticePeriod: Yup.number().min(0, 'Must be positive'),
});

const OffboardingInitiateScreen: React.FC<any> = ({ navigation, route }) => {
  const { employeeId: preSelectedEmployeeId } = route.params || {};
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getAllEmployees();
      // Filter only active employees
      const activeEmployees = data.filter((emp) => emp.status === 'ACTIVE');
      setEmployees(activeEmployees);
    } catch (error: any) {
      const errorMessage = typeof error.message === 'string' ? error.message : 'Failed to load employees';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const offboardingData = {
        employeeId: values.employeeId,
        resignationDate: values.resignationDate,
        lastWorkingDay: values.lastWorkingDay,
        reasonForLeaving: values.reasonForLeaving,
        noticePeriod: values.noticePeriod ? parseInt(values.noticePeriod) : undefined,
        assetsToCollect: values.assetsToCollect,
        feedbackAndSuggestions: values.feedbackAndSuggestions,
        status: 'INITIATED',
        settlementStatus: 'PENDING',
      };

      const result = await offboardingService.initiateOffboarding(offboardingData);

      Alert.alert(
        'Success',
        'Offboarding process initiated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('OffboardingView', { offboardingId: result.id }),
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = typeof error.message === 'string' ? error.message : 'Failed to initiate offboarding';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Formik
          initialValues={{
            employeeId: preSelectedEmployeeId || '',
            resignationDate: '',
            lastWorkingDay: '',
            reasonForLeaving: '',
            noticePeriod: '30',
            assetsToCollect: '',
            feedbackAndSuggestions: '',
          }}
          validationSchema={offboardingValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View style={styles.form}>
              {/* Employee Selection */}
              <Card>
                <Text style={styles.sectionTitle}>Employee Information</Text>

                <Text style={styles.inputLabel}>Select Employee *</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowEmployeeList(!showEmployeeList)}
                >
                  <Text style={styles.selectButtonText}>
                    {values.employeeId
                      ? (() => {
                          const emp = employees.find((e) => e.id === values.employeeId);
                          return emp ? `${String(emp.firstName || '').replace(/[<>"'&]/g, '')} ${String(emp.lastName || '').replace(/[<>"'&]/g, '')}` : 'Select an employee';
                        })()
                      : 'Select an employee'}
                  </Text>
                  <Ionicons
                    name={showEmployeeList ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
                {touched.employeeId && errors.employeeId && (
                  <Text style={styles.errorText}>{String(errors.employeeId)}</Text>
                )}

                {showEmployeeList && (
                  <View style={styles.employeeList}>
                    {employees.map((employee) => (
                      <TouchableOpacity
                        key={employee.id}
                        style={styles.employeeItem}
                        onPress={() => {
                          setFieldValue('employeeId', employee.id);
                          setShowEmployeeList(false);
                        }}
                      >
                        <View style={styles.employeeAvatar}>
                          <Text style={styles.employeeAvatarText}>
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </Text>
                        </View>
                        <View style={styles.employeeDetails}>
                          <Text style={styles.employeeItemName}>
                            {String(employee.firstName || '').replace(/[<>"'&]/g, '')} {String(employee.lastName || '').replace(/[<>"'&]/g, '')}
                          </Text>
                          <Text style={styles.employeeItemId}>{String(employee.employeeId || '').replace(/[<>"'&]/g, '')}</Text>
                          <Text style={styles.employeeItemJob}>{String(employee.jobTitle || '').replace(/[<>"'&]/g, '')}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Card>

              {/* Exit Details */}
              <Card>
                <Text style={styles.sectionTitle}>Exit Details</Text>

                <Input
                  label="Resignation Date *"
                  value={values.resignationDate}
                  onChangeText={handleChange('resignationDate')}
                  onBlur={handleBlur('resignationDate')}
                  error={touched.resignationDate ? errors.resignationDate : undefined}
                  placeholder="YYYY-MM-DD"
                />

                <Input
                  label="Last Working Day *"
                  value={values.lastWorkingDay}
                  onChangeText={handleChange('lastWorkingDay')}
                  onBlur={handleBlur('lastWorkingDay')}
                  error={touched.lastWorkingDay ? errors.lastWorkingDay : undefined}
                  placeholder="YYYY-MM-DD"
                />

                <Input
                  label="Notice Period (days)"
                  value={values.noticePeriod}
                  onChangeText={handleChange('noticePeriod')}
                  onBlur={handleBlur('noticePeriod')}
                  error={touched.noticePeriod ? errors.noticePeriod : undefined}
                  placeholder="30"
                  keyboardType="number-pad"
                />

                <Input
                  label="Reason for Leaving *"
                  value={values.reasonForLeaving}
                  onChangeText={handleChange('reasonForLeaving')}
                  onBlur={handleBlur('reasonForLeaving')}
                  error={touched.reasonForLeaving ? errors.reasonForLeaving : undefined}
                  placeholder="Enter reason for leaving"
                  multiline
                  numberOfLines={4}
                />
              </Card>

              {/* Additional Information */}
              <Card>
                <Text style={styles.sectionTitle}>Additional Information</Text>

                <Input
                  label="Assets to Collect"
                  value={values.assetsToCollect}
                  onChangeText={handleChange('assetsToCollect')}
                  onBlur={handleBlur('assetsToCollect')}
                  placeholder="Laptop, ID card, access cards, etc."
                  multiline
                  numberOfLines={3}
                />

                <Input
                  label="Feedback & Suggestions"
                  value={values.feedbackAndSuggestions}
                  onChangeText={handleChange('feedbackAndSuggestions')}
                  onBlur={handleBlur('feedbackAndSuggestions')}
                  placeholder="Employee feedback and suggestions"
                  multiline
                  numberOfLines={4}
                />
              </Card>

              {/* Info Box */}
              <Card style={styles.infoBox}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={24} color={colors.info} />
                  <Text style={styles.infoTitle}>What happens next?</Text>
                </View>
                <Text style={styles.infoText}>
                  • IT access will need to be revoked{'\n'}
                  • Final settlement will be calculated{'\n'}
                  • Relieving letter and experience certificate will be generated{'\n'}
                  • Exit interview will be scheduled{'\n'}
                  • Assets will be collected
                </Text>
              </Card>

              <View style={styles.buttonContainer}>
                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  variant="outline"
                  style={styles.button}
                />
                <Button
                  title="Initiate Offboarding"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  style={styles.button}
                />
              </View>
            </View>
          )}
        </Formik>
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
  form: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  selectButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  employeeList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  employeeItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  employeeAvatarText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeItemName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  employeeItemId: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  employeeItemJob: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  infoBox: {
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '30',
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.info,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
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

export default OffboardingInitiateScreen;

