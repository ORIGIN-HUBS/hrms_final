import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { employeeService } from '@/services/employeeService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

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

      await employeeService.createEmployee(employeeData);

      Alert.alert(
        'Success',
        'Employee created successfully',
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
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
            employmentType: 'Full-time',
            workLocation: '',
            currentLocation: '',
            workMode: 'Onsite',
            joiningDate: '',
          }}
          validationSchema={employeeValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Personal Information */}
              <Card>
                <Text style={styles.sectionTitle}>Personal Information</Text>

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
              </Card>


              {/* Contact Information */}
              <Card>
                <Text style={styles.sectionTitle}>Contact Information</Text>

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
              </Card>

              {/* Emergency Contact */}
              <Card>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>

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
              </Card>

              {/* Employment Details */}
              <Card>
                <Text style={styles.sectionTitle}>Employment Details</Text>

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
                  placeholder="Full-time, Part-time, Contract"
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
                  placeholder="Onsite, Remote, Hybrid"
                />

                <Input
                  label="Joining Date"
                  value={values.joiningDate}
                  onChangeText={handleChange('joiningDate')}
                  onBlur={handleBlur('joiningDate')}
                  placeholder="YYYY-MM-DD"
                />
              </Card>

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

export default EmployeeAddScreen;

