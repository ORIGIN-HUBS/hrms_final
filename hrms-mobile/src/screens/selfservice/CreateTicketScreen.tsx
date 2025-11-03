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
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { apiClient } from '@/services/api';
import { API_CONFIG } from '@/constants/config';
import { RootState } from '@/store';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface CreateTicketForm {
  category: string;
  priority: string;
  subject: string;
  description: string;
}

const validationSchema = Yup.object().shape({
  category: Yup.string().required('Category is required'),
  priority: Yup.string().required('Priority is required'),
  subject: Yup.string().required('Subject is required').min(5, 'Subject must be at least 5 characters'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
});

const CreateTicketScreen: React.FC<any> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const categories = [
    { label: 'Select Category', value: '' },
    { label: 'IT Support', value: 'IT_SUPPORT' },
    { label: 'HR Request', value: 'HR_REQUEST' },
    { label: 'Payroll', value: 'PAYROLL' },
    { label: 'Benefits', value: 'BENEFITS' },
    { label: 'Equipment', value: 'EQUIPMENT' },
    { label: 'Access Request', value: 'ACCESS_REQUEST' },
    { label: 'Training', value: 'TRAINING' },
    { label: 'Other', value: 'OTHER' },
  ];
  
  const priorities = [
    { label: 'Select Priority', value: '' },
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
  ];
  
  const handleCreateTicket = async (values: CreateTicketForm) => {
    if (!user?.employee?.id) {
      Alert.alert('Error', 'Employee information not found');
      return;
    }
    
    setIsLoading(true);
    try {
      const ticketData = {
        employeeId: user.employee.id,
        category: values.category,
        priority: values.priority,
        subject: values.subject,
        description: values.description,
        status: 'OPEN',
      };
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CREATE_TICKET,
        ticketData
      );
      
      Alert.alert(
        'Success',
        'Your ticket has been created successfully. You will receive updates via email.',
        [
          {
            text: 'View Ticket',
            onPress: () => {
              navigation.replace('ViewTicket', { ticketId: response.data.id });
            },
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Form will reset automatically
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Support Ticket</Text>
          <Text style={styles.subtitle}>
            Describe your issue and we'll help you resolve it
          </Text>
        </View>
        
        <View style={styles.content}>
          <Formik
            initialValues={{
              category: '',
              priority: '',
              subject: '',
              description: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleCreateTicket}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <Card>
                <View style={styles.form}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Category *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={values.category}
                        onValueChange={(value) => setFieldValue('category', value)}
                        style={styles.picker}
                      >
                        {categories.map((cat) => (
                          <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                        ))}
                      </Picker>
                    </View>
                    {touched.category && errors.category && (
                      <Text style={styles.errorText}>{errors.category}</Text>
                    )}
                  </View>
                  
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Priority *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={values.priority}
                        onValueChange={(value) => setFieldValue('priority', value)}
                        style={styles.picker}
                      >
                        {priorities.map((priority) => (
                          <Picker.Item key={priority.value} label={priority.label} value={priority.value} />
                        ))}
                      </Picker>
                    </View>
                    {touched.priority && errors.priority && (
                      <Text style={styles.errorText}>{errors.priority}</Text>
                    )}
                  </View>
                  
                  <Input
                    label="Subject *"
                    value={values.subject}
                    onChangeText={handleChange('subject')}
                    onBlur={handleBlur('subject')}
                    placeholder="Brief description of your issue"
                    error={touched.subject && errors.subject}
                    leftIcon={<Ionicons name="text-outline" size={20} color={colors.gray[400]} />}
                  />
                  
                  <Input
                    label="Description *"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    placeholder="Provide detailed information about your issue"
                    error={touched.description && errors.description}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    leftIcon={<Ionicons name="document-text-outline" size={20} color={colors.gray[400]} />}
                  />
                  
                  <View style={styles.helpText}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                    <Text style={styles.helpTextContent}>
                      Please provide as much detail as possible to help us resolve your issue quickly.
                    </Text>
                  </View>
                  
                  <View style={styles.actions}>
                    <Button
                      title="Create Ticket"
                      onPress={handleSubmit}
                      loading={isLoading}
                      icon={<Ionicons name="send-outline" size={20} color={colors.white} />}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => navigation.goBack()}
                      variant="outline"
                    />
                  </View>
                </View>
              </Card>
            )}
          </Formik>
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
  header: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helpText: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.info + '10',
    padding: spacing.md,
    borderRadius: 8,
  },
  helpTextContent: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.info,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});

export default CreateTicketScreen;
