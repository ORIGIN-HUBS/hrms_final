import React from 'react';import React, { useState, useEffect } from 'react';import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';import {import {

import { spacing } from '@/theme/spacing';

import { typography } from '@/theme/typography';  View,  View,



const InvoiceGenerateScreen: React.FC = () => {  Text,  Text,

  return (

    <View style={styles.container}>  StyleSheet,  StyleSheet,

      <Text style={styles.text}>Invoice Generate Screen</Text>

      <Text style={styles.subtext}>Coming soon...</Text>  ScrollView,  ScrollView,

    </View>

  );  Alert,  RefreshControl,

};

  KeyboardAvoidingView,  Alert,

const styles = StyleSheet.create({

  container: {  Platform,} from 'react-native';

    flex: 1,

    backgroundColor: colors.background.default,} from 'react-native';import { Ionicons } from '@expo/vector-icons';

    alignItems: 'center',

    justifyContent: 'center',import { Formik } from 'formik';import { apiClient } from '@/services/api';

  },

  text: {import * as Yup from 'yup';import { API_CONFIG } from '@/constants/config';

    fontSize: typography.fontSize.xl,

    fontWeight: typography.fontWeight.bold,import { LinearGradient } from 'expo-linear-gradient';import Card from '@/components/common/Card';

    color: colors.text.primary,

    marginBottom: spacing.sm,import { Ionicons } from '@expo/vector-icons';import Button from '@/components/common/Button';

  },

  subtext: {import { apiClient } from '@/services/api';import { colors } from '@/theme/colors';

    fontSize: typography.fontSize.base,

    color: colors.text.secondary,import { API_CONFIG } from '@/constants/config';import { spacing } from '@/theme/spacing';

  },

});import { employeeService } from '@/services/employeeService';import { typography } from '@/theme/typography';



export default InvoiceGenerateScreen;import { projectService } from '@/services/projectService';


import Input from '@/components/common/Input';const InvoiceGenerateScreen: React.FC<any> = ({ navigation, route }) => {

import Button from '@/components/common/Button';  const [data, setData] = useState<any>(null);

import { colors } from '@/theme/colors';  const [isLoading, setIsLoading] = useState(false);

import { spacing } from '@/theme/spacing';  

import { typography } from '@/theme/typography';  const fetchData = async () => {

import { gradients } from '@/theme/colors';    setIsLoading(true);

    try {

const invoiceValidationSchema = Yup.object().shape({      // TODO: Implement API call

  employeeId: Yup.number().required('Employee is required'),      // const response = await apiClient.get(API_CONFIG.ENDPOINTS.YOUR_ENDPOINT);

  projectId: Yup.number().required('Project is required'),      // setData(response.data);

  startDate: Yup.string().required('Start date is required'),    } catch (error) {

  endDate: Yup.string().required('End date is required'),      console.error('Error fetching data:', error);

  hoursWorked: Yup.number().min(0, 'Must be positive').required('Hours worked is required'),      Alert.alert('Error', 'Failed to load data');

  hourlyRate: Yup.number().min(0, 'Must be positive').required('Hourly rate is required'),    } finally {

});      setIsLoading(false);

    }

const InvoiceGenerateScreen: React.FC<any> = ({ navigation }) => {  };

  const [isSubmitting, setIsSubmitting] = useState(false);  

  const [employees, setEmployees] = useState<any[]>([]);  useEffect(() => {

  const [projects, setProjects] = useState<any[]>([]);    fetchData();

  }, []);

  useEffect(() => {  

    fetchData();  return (

  }, []);    <ScrollView

      style={styles.container}

  const fetchData = async () => {      refreshControl={

    try {        <RefreshControl refreshing={isLoading} onRefresh={fetchData} />

      const [employeesData, projectsData] = await Promise.all([      }

        employeeService.getAllEmployees(),    >

        projectService.getAllProjects(),      <View style={styles.header}>

      ]);        <Text style={styles.title}>Generate Invoice</Text>

      setEmployees(employeesData || []);      </View>

      setProjects(projectsData || []);      

    } catch (error) {      <View style={styles.content}>

      console.error('Failed to fetch data:', error);        <Card>

    }          <Text style={styles.placeholder}>

  };            TODO: Implement Generate Invoice screen

          </Text>

  const handleSubmit = async (values: any) => {          <Text style={styles.instructions}>

    setIsSubmitting(true);            This screen should display and manage Generate Invoice data.

    try {            Follow the patterns established in completed screens.

      console.log('Generating invoice with data:', values);          </Text>

              </Card>

      const invoiceData = {      </View>

        employeeId: parseInt(values.employeeId),    </ScrollView>

        projectId: parseInt(values.projectId),  );

        startDate: values.startDate,};

        endDate: values.endDate,

        hoursWorked: parseFloat(values.hoursWorked),const styles = StyleSheet.create({

        hourlyRate: parseFloat(values.hourlyRate),  container: {

        totalAmount: parseFloat(values.hoursWorked) * parseFloat(values.hourlyRate),    flex: 1,

        description: values.description || '',    backgroundColor: colors.background.default,

      };  },

  header: {

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.GENERATE_INVOICE, invoiceData);    padding: spacing.xl,

      console.log('Invoice generated:', response.data);    backgroundColor: colors.white,

        },

      Alert.alert(  title: {

        'Success',    fontSize: typography.fontSize['2xl'],

        'Invoice generated successfully',    fontWeight: typography.fontWeight.bold,

        [    color: colors.text.primary,

          {  },

            text: 'View Invoice',  content: {

            onPress: () => navigation.navigate('InvoiceView', { invoiceId: response.data.id }),    padding: spacing.md,

          },  },

          {  placeholder: {

            text: 'Back to Dashboard',    fontSize: typography.fontSize.lg,

            onPress: () => navigation.goBack(),    fontWeight: typography.fontWeight.semibold,

          },    color: colors.text.primary,

        ]    marginBottom: spacing.md,

      );  },

    } catch (error: any) {  instructions: {

      console.error('Error generating invoice:', error);    fontSize: typography.fontSize.base,

      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to generate invoice');    color: colors.text.secondary,

    } finally {    lineHeight: 24,

      setIsSubmitting(false);  },

    }});

  };

export default InvoiceGenerateScreen;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.danger as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="document-text" size={28} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Generate Invoice</Text>
            <Text style={styles.headerSubtitle}>Create a new invoice for employee</Text>
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
              employeeId: '',
              projectId: '',
              startDate: '',
              endDate: '',
              hoursWorked: '',
              hourlyRate: '',
              description: '',
            }}
            validationSchema={invoiceValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View style={styles.form}>
                {/* Invoice Details */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={gradients.primary as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionAccent}
                    />
                    <Ionicons name="information-circle" size={22} color={colors.primary} style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Invoice Details</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Input
                      label="Employee ID *"
                      value={values.employeeId}
                      onChangeText={handleChange('employeeId')}
                      onBlur={handleBlur('employeeId')}
                      error={touched.employeeId ? errors.employeeId : undefined}
                      placeholder="Enter employee ID"
                      keyboardType="numeric"
                    />

                    <Input
                      label="Project ID *"
                      value={values.projectId}
                      onChangeText={handleChange('projectId')}
                      onBlur={handleBlur('projectId')}
                      error={touched.projectId ? errors.projectId : undefined}
                      placeholder="Enter project ID"
                      keyboardType="numeric"
                    />

                    <Input
                      label="Description"
                      value={values.description}
                      onChangeText={handleChange('description')}
                      onBlur={handleBlur('description')}
                      placeholder="Invoice description (optional)"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                {/* Time Period */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={gradients.info as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionAccent}
                    />
                    <Ionicons name="calendar" size={22} color={colors.info} style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Time Period</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Input
                      label="Start Date *"
                      value={values.startDate}
                      onChangeText={handleChange('startDate')}
                      onBlur={handleBlur('startDate')}
                      error={touched.startDate ? errors.startDate : undefined}
                      placeholder="YYYY-MM-DD"
                    />

                    <Input
                      label="End Date *"
                      value={values.endDate}
                      onChangeText={handleChange('endDate')}
                      onBlur={handleBlur('endDate')}
                      error={touched.endDate ? errors.endDate : undefined}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>

                {/* Financial Details */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={gradients.success as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionAccent}
                    />
                    <Ionicons name="cash" size={22} color={colors.success} style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Financial Details</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Input
                      label="Hours Worked *"
                      value={values.hoursWorked}
                      onChangeText={(text) => {
                        handleChange('hoursWorked')(text);
                        // Auto-calculate total if hourly rate is available
                        if (values.hourlyRate) {
                          const total = parseFloat(text || '0') * parseFloat(values.hourlyRate);
                          // You can display this total somewhere
                        }
                      }}
                      onBlur={handleBlur('hoursWorked')}
                      error={touched.hoursWorked ? errors.hoursWorked : undefined}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                    />

                    <Input
                      label="Hourly Rate ($/hr) *"
                      value={values.hourlyRate}
                      onChangeText={(text) => {
                        handleChange('hourlyRate')(text);
                        // Auto-calculate total if hours worked is available
                        if (values.hoursWorked) {
                          const total = parseFloat(values.hoursWorked) * parseFloat(text || '0');
                          // You can display this total somewhere
                        }
                      }}
                      onBlur={handleBlur('hourlyRate')}
                      error={touched.hourlyRate ? errors.hourlyRate : undefined}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                    />

                    {values.hoursWorked && values.hourlyRate && (
                      <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total Amount:</Text>
                        <Text style={styles.totalAmount}>
                          ${(parseFloat(values.hoursWorked) * parseFloat(values.hourlyRate)).toFixed(2)}
                        </Text>
                      </View>
                    )}
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
                    title="Generate Invoice"
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    padding: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
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

export default InvoiceGenerateScreen;
