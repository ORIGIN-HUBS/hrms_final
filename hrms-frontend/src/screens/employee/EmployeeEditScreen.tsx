import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { updateEmployee, fetchEmployeeById } from '../../store/slices/employeeSlice';
import { theme } from '../../theme';

export default function EmployeeEditScreen({ route, navigation }: any) {
  const { employeeId } = route.params;
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    pronouns: '',
    contactNumber: '',
    alternateContactNumber: '',
    personalEmail: '',
    residentialAddress: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyContactRelation: '',
    ssn: '',
    workPermit: '',
    jobTitle: '',
    supervisor: '',
    employmentType: '',
    workLocation: '',
    workMode: '',
    joiningDate: '',
    status: 'ACTIVE'
  });

  const [currentSection, setCurrentSection] = useState('personal');
  const dispatch = useDispatch<AppDispatch>();
  const { selectedEmployee, loading, error } = useSelector((state: RootState) => state.employee);

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeById(employeeId));
    }
  }, [dispatch, employeeId]);

  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        firstName: selectedEmployee.firstName || '',
        middleName: selectedEmployee.middleName || '',
        lastName: selectedEmployee.lastName || '',
        dateOfBirth: selectedEmployee.dateOfBirth || '',
        gender: selectedEmployee.gender || '',
        pronouns: selectedEmployee.pronouns || '',
        contactNumber: selectedEmployee.contactNumber || '',
        alternateContactNumber: selectedEmployee.alternateContactNumber || '',
        personalEmail: selectedEmployee.personalEmail || '',
        residentialAddress: selectedEmployee.residentialAddress || '',
        emergencyContactName: selectedEmployee.emergencyContactName || '',
        emergencyContactNumber: selectedEmployee.emergencyContactNumber || '',
        emergencyContactRelation: selectedEmployee.emergencyContactRelation || '',
        ssn: selectedEmployee.ssn || '',
        workPermit: selectedEmployee.workPermit || '',
        jobTitle: selectedEmployee.jobTitle || '',
        supervisor: selectedEmployee.supervisor || '',
        employmentType: selectedEmployee.employmentType || '',
        workLocation: selectedEmployee.workLocation || '',
        workMode: selectedEmployee.workMode || '',
        joiningDate: selectedEmployee.joiningDate || '',
        status: selectedEmployee.status || 'ACTIVE'
      });
    }
  }, [selectedEmployee]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.personalEmail || !formData.jobTitle) {
      return;
    }
    
    try {
      await dispatch(updateEmployee({ id: employeeId, data: formData })).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  };

  const sections = [
    { value: 'personal', label: 'Personal' },
    { value: 'contact', label: 'Contact' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'employment', label: 'Employment' }
  ];

  const renderPersonalInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Personal Information" left={(props) => <Ionicons {...props} name="person" size={24} />} />
      <Card.Content>
        <View style={styles.row}>
          <TextInput
            label="First Name *"
            value={formData.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
          />
          <TextInput
            label="Middle Name"
            value={formData.middleName}
            onChangeText={(value) => updateField('middleName', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
          />
        </View>
        <TextInput
          label="Last Name *"
          value={formData.lastName}
          onChangeText={(value) => updateField('lastName', value)}
          mode="outlined"
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChangeText={(value) => updateField('dateOfBirth', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            placeholder="YYYY-MM-DD"
          />
          <TextInput
            label="Gender"
            value={formData.gender}
            onChangeText={(value) => updateField('gender', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'personal': return renderPersonalInfo();
      default: return renderPersonalInfo();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Employee</Text>
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
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          icon="content-save"
        >
          Update Employee
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => {}}
        duration={4000}
      >
        {error}
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
    fontSize: 24,
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
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  saveButton: {
    paddingVertical: theme.spacing.xs,
  },
});