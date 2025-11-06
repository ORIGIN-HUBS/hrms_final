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
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { projectService } from '@/services/projectService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { gradients } from '@/theme/colors';
import { Project } from '@/types';

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

const ProjectEditScreen: React.FC<any> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjectById(projectId);
      setProject(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load project');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const projectData = {
        ...values,
        vendorPayRate: values.vendorPayRate ? parseFloat(values.vendorPayRate) : undefined,
        candidatePayRate: values.candidatePayRate ? parseFloat(values.candidatePayRate) : undefined,
      };

      await projectService.updateProject(projectId, projectData);
      
      Alert.alert(
        'Success',
        'Project updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading project data...</Text>
      </View>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.warning as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="briefcase" size={28} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Edit Project</Text>
            <Text style={styles.headerSubtitle}>Update project details</Text>
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
            projectName: project.projectName || '',
            jobTitle: project.jobTitle || '',
            vendorCompanyName: project.vendorCompanyName || '',
            pocName: project.pocName || '',
            pocTitle: project.pocTitle || '',
            pocEmail: project.pocEmail || '',
            pocPhone: project.pocPhone || '',
            vendorEmail: project.vendorEmail || '',
            agreementTerms: project.agreementTerms || '',
            vendorLocation: project.vendorLocation || '',
            clientCompanyName: project.clientCompanyName || '',
            clientLocation: project.clientLocation || '',
            workMode: project.workMode || '',
            vendorPayRate: project.vendorPayRate?.toString() || '',
            candidatePayRate: project.candidatePayRate?.toString() || '',
            projectStartDate: project.projectStartDate || '',
            projectEndDate: project.projectEndDate || '',
            extensionDate: project.extensionDate || '',
            status: project.status || 'ACTIVE',
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
                
                <Input
                  label="Status"
                  value={values.status}
                  onChangeText={handleChange('status')}
                  onBlur={handleBlur('status')}
                  placeholder="ACTIVE, COMPLETED, EXTENDED, TERMINATED"
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
                
                <Input
                  label="Extension Date"
                  value={values.extensionDate}
                  onChangeText={handleChange('extensionDate')}
                  onBlur={handleBlur('extensionDate')}
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
                  title="Update Project"
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
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    fontSize: typography.fontSize.xl,
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

export default ProjectEditScreen;

