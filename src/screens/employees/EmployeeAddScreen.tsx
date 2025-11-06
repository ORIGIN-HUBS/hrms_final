import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { employeeService } from '@/services/employeeService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { gradients } from '@/theme/colors';

const employeeValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  contactNumber: Yup.string()
    .required('Contact number is required')
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),
  personalEmail: Yup.string()
    .email('Invalid email')
    .required('Personal email is required'),
  workEmail: Yup.string().email('Invalid email'),
  jobTitle: Yup.string().required('Job title is required'),
  employmentType: Yup.string().required('Employment type is required'),
});

const EmployeeAddScreen: React.FC<any> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const employeeData = {
        ...values,
        dateOfBirth: values.dateOfBirth || undefined,
        joiningDate: values.joiningDate || undefined,
      };

      const response = await employeeService.createEmployee(employeeData);
      
      console.log('Employee created response:', response);
      console.log('Username:', (response as any).username);
      console.log('TempPassword:', (response as any).temporaryPassword);

      // Check if response contains user credentials
      const username = (response as any).username || (response as any).employeeId || 'N/A';
      const tempPassword = (response as any).temporaryPassword || (response as any).password || 'N/A';

      Alert.alert(
        '✅ Employee Created Successfully',
        `Employee has been added to the system.\n\n` +
        `Username: ${username}\n` +
        `Temporary Password: ${tempPassword}\n\n` +
        `Please share these credentials with the employee.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.success as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="person-add" size={28} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Add New Employee</Text>
            <Text style={styles.headerSubtitle}>Fill in employee details below</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Formik
            initialValues={{
              firstName: '',
              middleName: '',
              lastName: '',
              dateOfBirth: '',
              gender: '',
              pronouns: '',
              contactNumber: '',
              alternateContactNumber: '',
              personalEmail: '',
              workEmail: '',
              residentialAddress: '',
              emergencyContactName: '',
              emergencyContactNumber: '',
              emergencyContactRelation: '',
              jobTitle: '',
              supervisor: '',
              employmentType: 'FULL_TIME',
              workLocation: '',
              currentLocation: '',
              workMode: 'ONSITE',
              joiningDate: '',
            }}
            validationSchema={employeeValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={gradients.primary as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionAccent}
                    />
                    <Ionicons name="person" size={22} color={colors.primary} style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Input
                      label="First Name *"
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      error={touched.firstName ? errors.firstName : undefined}
                      placeholder="Enter first name"
                    />

                    <Input
                      label="Middle Name"
                      value={values.middleName}
                      onChangeText={handleChange('middleName')}
                      onBlur={handleBlur('middleName')}
                      placeholder="Enter middle name"
                    />

                    <Input
                      label="Last Name *"
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={touched.lastName ? errors.lastName : undefined}
                      placeholder="Enter last name"
                    />

                    <Input
                      label="Date of Birth"
                      value={values.dateOfBirth}
                      onChangeText={handleChange('dateOfBirth')}
                      onBlur={handleBlur('dateOfBirth')}
                      placeholder="YYYY-MM-DD"
                    />

                    <Input
                      label="Gender"
                      value={values.gender}
                      onChangeText={handleChange('gender')}
                      onBlur={handleBlur('gender')}
                      placeholder="Male/Female/Other"
                    />

                    <Input
                      label="Pronouns"
                      value={values.pronouns}
                      onChangeText={handleChange('pronouns')}
                      onBlur={handleBlur('pronouns')}
                      placeholder="He/Him, She/Her, They/Them"
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={gradients.info as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionAccent}
                    />
                    <Ionicons name="mail" size={22} color={colors.info} style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Input
                      label="Contact Number *"
                      value={values.contactNumber}
                      onChangeText={handleChange('contactNumber')}
                      onBlur={handleBlur('contactNumber')}
                      error={touched.contactNumber ? errors.contactNumber : undefined}
                      placeholder="10-digit phone number"
                      keyboardType="phone-pad"
                    />

                    <Input
                      label="Alternate Contact Number"
                      value={values.alternateContactNumber}
                      onChangeText={handleChange('alternateContactNumber')}
                      onBlur={handleBlur('alternateContactNumber')}
                      placeholder="10-digit phone number"
                      keyboardType="phone-pad"
                    />

                    <Input
                      label="Personal Email *"
                      value={values.personalEmail}
                      onChangeText={handleChange('personalEmail')}
                      onBlur={handleBlur('personalEmail')}
                      error={touched.personalEmail ? errors.personalEmail : undefined}
                      placeholder="personal@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <Input
                      label="Work Email"
                      value={values.workEmail}
                      onChangeText={handleChange('workEmail')}
                      onBlur={handleBlur('workEmail')}
                      error={touched.workEmail ? errors.workEmail : undefined}
                      placeholder="work@company.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <Input
                      label="Residential Address"
                      value={values.residentialAddress}
                      onChangeText={handleChange('residentialAddress')}
                      onBlur={handleBlur('residentialAddress')}
                      placeholder="Enter full address"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={gradients.warning as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionAccent}
                    />
                    <Ionicons name="briefcase" size={22} color={colors.warning} style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Employment Details</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Input
                      label="Job Title *"
                      value={values.jobTitle}
                      onChangeText={handleChange('jobTitle')}
                      onBlur={handleBlur('jobTitle')}
                      error={touched.jobTitle ? errors.jobTitle : undefined}
                      placeholder="Enter job title"
                    />

                    <Input
                      label="Supervisor"
                      value={values.supervisor}
                      onChangeText={handleChange('supervisor')}
                      onBlur={handleBlur('supervisor')}
                      placeholder="Enter supervisor name"
                    />

                    <Input
                      label="Employment Type *"
                      value={values.employmentType}
                      onChangeText={handleChange('employmentType')}
                      onBlur={handleBlur('employmentType')}
                      error={touched.employmentType ? errors.employmentType : undefined}
                      placeholder="FULL_TIME, PART_TIME, CONTRACT"
                    />

                    <Input
                      label="Work Location"
                      value={values.workLocation}
                      onChangeText={handleChange('workLocation')}
                      onBlur={handleBlur('workLocation')}
                      placeholder="Office location"
                    />

                    <Input
                      label="Current Location"
                      value={values.currentLocation}
                      onChangeText={handleChange('currentLocation')}
                      onBlur={handleBlur('currentLocation')}
                      placeholder="Current city/location"
                    />

                    <Input
                      label="Work Mode"
                      value={values.workMode}
                      onChangeText={handleChange('workMode')}
                      onBlur={handleBlur('workMode')}
                      placeholder="ONSITE, REMOTE, HYBRID"
                    />

                    <Input
                      label="Joining Date"
                      value={values.joiningDate}
                      onChangeText={handleChange('joiningDate')}
                      onBlur={handleBlur('joiningDate')}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={gradients.danger as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionAccent}
                    />
                    <Ionicons name="alert-circle" size={22} color={colors.danger} style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Emergency Contact</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Input
                      label="Emergency Contact Name"
                      value={values.emergencyContactName}
                      onChangeText={handleChange('emergencyContactName')}
                      onBlur={handleBlur('emergencyContactName')}
                      placeholder="Enter name"
                    />

                    <Input
                      label="Emergency Contact Number"
                      value={values.emergencyContactNumber}
                      onChangeText={handleChange('emergencyContactNumber')}
                      onBlur={handleBlur('emergencyContactNumber')}
                      placeholder="10-digit phone number"
                      keyboardType="phone-pad"
                    />

                    <Input
                      label="Relationship"
                      value={values.emergencyContactRelation}
                      onChangeText={handleChange('emergencyContactRelation')}
                      onBlur={handleBlur('emergencyContactRelation')}
                      placeholder="Spouse, Parent, Sibling, etc."
                    />
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    onPress={() => navigation.goBack()}
                    variant="outline"
                    style={styles.button}
                  />
                  <Button
                    title="Create Employee"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sectionAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  sectionContent: {
    padding: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
  },
  button: {
    flex: 1,
  },
});

export default EmployeeAddScreen;
