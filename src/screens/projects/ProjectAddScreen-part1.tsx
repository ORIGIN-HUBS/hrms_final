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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { projectService } from '@/services/projectService';
import { employeeService } from '@/services/employeeService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { gradients } from '@/theme/colors';

const projectValidationSchema = Yup.object().shape({
  projectName: Yup.string().required('Project name is required'),
  jobTitle: Yup.string().required('Job title is required'),
  vendorCompanyName: Yup.string().required('Vendor company name is required'),
  clientCompanyName: Yup.string().required('Client company name is required'),
  clientPocEmail: Yup.string().email('Invalid email').required('Client POC email is required'),
  vendorPocEmail: Yup.string().email('Invalid email').required('Vendor POC email is required'),
});

const ProjectAddScreen: React.FC<any> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      console.log('Creating project with data:', values);
      await projectService.createProject(values);
      Alert.alert('Success', 'Project created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error creating project:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.warning as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="briefcase" size={28} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Add Project</Text>
            <Text style={styles.headerSubtitle}>Create a new project assignment</Text>
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
              projectName: '',
              jobTitle: '',
              vendorCompanyName: '',
              vendorPocName: '',
              vendorPocEmail: '',
              vendorPocPhone: '',
              clientCompanyName: '',
              clientPocName: '',
              clientPocEmail: '',
              clientPocPhone: '',
              employeeId: '',
              employeePayRate: '',
              clientBillRate: '',
              workMode: 'REMOTE',
              startDate: '',
              endDate: '',
              status: 'ACTIVE',
            }}
            validationSchema={projectValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
