import React, { useState, useEffect } from 'react';
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
import { projectService } from '@/services/projectService';
import { employeeService } from '@/services/employeeService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Employee } from '@/types';

const projectValidationSchema = Yup.object().shape({
  projectName: Yup.string().required('Project name is required'),
  jobTitle: Yup.string().required('Job title is required'),
  vendorCompanyName: Yup.string().required('Vendor company name is required'),
  clientCompanyName: Yup.string().required('Client company name is required'),
  pocEmail: Yup.string().email('Invalid email'),
  vendorEmail: Yup.string().email('Invalid email'),
  vendorPayRate: Yup.number().min(0, 'Must be positive'),
  candidatePayRate: Yup.number().min(0, 'Must be positive'),
});

const ProjectAddScreen: React.FC<any> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const projectData = {
        ...values,
        vendorPayRate: values.vendorPayRate ? parseFloat(values.vendorPayRate) : undefined,
        candidatePayRate: values.candidatePayRate ? parseFloat(values.candidatePayRate) : undefined,
        status: 'ACTIVE',
      };

      await projectService.createProject(projectData);
      
      Alert.alert(
        'Success',
        'Project created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create project');
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
            projectName: '',
            jobTitle: '',
            vendorCompanyName: '',
            pocName: '',
            pocTitle: '',
            pocEmail: '',
            pocPhone: '',
            vendorEmail: '',
            agreementTerms: '',
            vendorLocation: '',
            clientCompanyName: '',
            clientLocation: '',
            workMode: 'Onsite',
            vendorPayRate: '',
            candidatePayRate: '',
            projectStartDate: '',
            projectEndDate: '',
          }}
          validationSchema={projectValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Basic Information */}
              <Card>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <Input
                  label="Project Name *"
                  value={values.projectName}
                  onChangeText={handleChange('projectName')}
                  onBlur={handleBlur('projectName')}
                  error={touched.projectName ? errors.projectName : undefined}
                  placeholder="Enter project name"
                />
                
                <Input
                  label="Job Title *"
                  value={values.jobTitle}
                  onChangeText={handleChange('jobTitle')}
                  onBlur={handleBlur('jobTitle')}
                  error={touched.jobTitle ? errors.jobTitle : undefined}
                  placeholder="Enter job title"
                />
              </Card>

              {/* Vendor Information */}
              <Card>
                <Text style={styles.sectionTitle}>Vendor Information</Text>
                
                <Input
                  label="Vendor Company Name *"
                  value={values.vendorCompanyName}
                  onChangeText={handleChange('vendorCompanyName')}
                  onBlur={handleBlur('vendorCompanyName')}
                  error={touched.vendorCompanyName ? errors.vendorCompanyName : undefined}
                  placeholder="Enter vendor company name"
                />
                
                <Input
                  label="POC Name"
                  value={values.pocName}
                  onChangeText={handleChange('pocName')}
                  onBlur={handleBlur('pocName')}
                  placeholder="Point of contact name"
                />
                
                <Input
                  label="POC Title"
                  value={values.pocTitle}
                  onChangeText={handleChange('pocTitle')}
                  onBlur={handleBlur('pocTitle')}
                  placeholder="Point of contact title"
                />
                
                <Input
                  label="POC Email"
                  value={values.pocEmail}
                  onChangeText={handleChange('pocEmail')}
                  onBlur={handleBlur('pocEmail')}
                  error={touched.pocEmail ? errors.pocEmail : undefined}
                  placeholder="poc@vendor.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <Input
                  label="POC Phone"
                  value={values.pocPhone}
                  onChangeText={handleChange('pocPhone')}
                  onBlur={handleBlur('pocPhone')}
                  placeholder="Contact phone number"
                  keyboardType="phone-pad"
                />
                
                <Input
                  label="Vendor Email (for invoices)"
                  value={values.vendorEmail}
                  onChangeText={handleChange('vendorEmail')}
                  onBlur={handleBlur('vendorEmail')}
                  error={touched.vendorEmail ? errors.vendorEmail : undefined}
                  placeholder="invoices@vendor.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <Input
                  label="Vendor Location"
                  value={values.vendorLocation}
                  onChangeText={handleChange('vendorLocation')}
                  onBlur={handleBlur('vendorLocation')}
                  placeholder="Vendor office location"
                />
                
                <Input
                  label="Agreement Terms"
                  value={values.agreementTerms}
                  onChangeText={handleChange('agreementTerms')}
                  onBlur={handleBlur('agreementTerms')}
                  placeholder="MSA, SOW, etc."
                  multiline
                  numberOfLines={3}
                />
              </Card>

              {/* Client Information */}
              <Card>
                <Text style={styles.sectionTitle}>Client Information</Text>
                
                <Input
                  label="Client Company Name *"
                  value={values.clientCompanyName}
                  onChangeText={handleChange('clientCompanyName')}
                  onBlur={handleBlur('clientCompanyName')}
                  error={touched.clientCompanyName ? errors.clientCompanyName : undefined}
                  placeholder="Enter client company name"
                />
                
                <Input
                  label="Client Location"
                  value={values.clientLocation}
                  onChangeText={handleChange('clientLocation')}
                  onBlur={handleBlur('clientLocation')}
                  placeholder="Client office location"
                />
                
                <Input
                  label="Work Mode"
                  value={values.workMode}
                  onChangeText={handleChange('workMode')}
                  onBlur={handleBlur('workMode')}
                  placeholder="Onsite, Remote, Hybrid"
                />
              </Card>

              {/* Financial Information */}
              <Card>
                <Text style={styles.sectionTitle}>Financial Information</Text>
                
                <Input
                  label="Vendor Pay Rate ($/hr)"
                  value={values.vendorPayRate}
                  onChangeText={handleChange('vendorPayRate')}
                  onBlur={handleBlur('vendorPayRate')}
                  error={touched.vendorPayRate ? errors.vendorPayRate : undefined}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
                
                <Input
                  label="Candidate Pay Rate ($/hr)"
                  value={values.candidatePayRate}
                  onChangeText={handleChange('candidatePayRate')}
                  onBlur={handleBlur('candidatePayRate')}
                  error={touched.candidatePayRate ? errors.candidatePayRate : undefined}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </Card>

              {/* Timeline */}
              <Card>
                <Text style={styles.sectionTitle}>Timeline</Text>
                
                <Input
                  label="Project Start Date"
                  value={values.projectStartDate}
                  onChangeText={handleChange('projectStartDate')}
                  onBlur={handleBlur('projectStartDate')}
                  placeholder="YYYY-MM-DD"
                />
                
                <Input
                  label="Project End Date"
                  value={values.projectEndDate}
                  onChangeText={handleChange('projectEndDate')}
                  onBlur={handleBlur('projectEndDate')}
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
                  title="Create Project"
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

export default ProjectAddScreen;

