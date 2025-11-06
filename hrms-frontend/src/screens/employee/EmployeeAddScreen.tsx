import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { createEmployee } from '../../store/slices/employeeSlice';
import { theme } from '../../theme';

export default function EmployeeAddScreen({ navigation }: any) {
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
    status: 'ONBOARDING'
  });

  const [currentSection, setCurrentSection] = useState('personal');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.employee);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.personalEmail || !formData.jobTitle) {
      return;
    }
    
    try {
      await dispatch(createEmployee(formData)).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

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
        <TextInput
          label="Pronouns"
          value={formData.pronouns}
          onChangeText={(value) => updateField('pronouns', value)}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., He/Him, She/Her"
        />
      </Card.Content>
    </Card>
  );

  const renderContactInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Contact Information" left={(props) => <Ionicons {...props} name="call" size={24} />} />
      <Card.Content>
        <View style={styles.row}>
          <TextInput
            label="Contact Number *"
            value={formData.contactNumber}
            onChangeText={(value) => updateField('contactNumber', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Alternate Contact"
            value={formData.alternateContactNumber}
            onChangeText={(value) => updateField('alternateContactNumber', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            keyboardType="phone-pad"
          />
        </View>
        <TextInput
          label="Personal Email *"
          value={formData.personalEmail}
          onChangeText={(value) => updateField('personalEmail', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          label="Residential Address"
          value={formData.residentialAddress}
          onChangeText={(value) => updateField('residentialAddress', value)}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
        />
      </Card.Content>
    </Card>
  );

  const renderEmergencyContact = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Emergency Contact" left={(props) => <Ionicons {...props} name="alert-circle" size={24} />} />
      <Card.Content>
        <TextInput
          label="Contact Name"
          value={formData.emergencyContactName}
          onChangeText={(value) => updateField('emergencyContactName', value)}
          mode="outlined"
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            label="Contact Number"
            value={formData.emergencyContactNumber}
            onChangeText={(value) => updateField('emergencyContactNumber', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Relationship"
            value={formData.emergencyContactRelation}
            onChangeText={(value) => updateField('emergencyContactRelation', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            placeholder="e.g., Spouse, Parent"
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmploymentDetails = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Employment Details" left={(props) => <Ionicons {...props} name="briefcase" size={24} />} />
      <Card.Content>
        <View style={styles.row}>
          <TextInput
            label="Job Title *"
            value={formData.jobTitle}
            onChangeText={(value) => updateField('jobTitle', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
          />
          <TextInput
            label="Supervisor"
            value={formData.supervisor}
            onChangeText={(value) => updateField('supervisor', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            label="Employment Type *"
            value={formData.employmentType}
            onChangeText={(value) => updateField('employmentType', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            placeholder="Full-time, Part-time, Contract"
          />
          <TextInput
            label="Work Location"
            value={formData.workLocation}
            onChangeText={(value) => updateField('workLocation', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            label="Work Mode"
            value={formData.workMode}
            onChangeText={(value) => updateField('workMode', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            placeholder="Onsite, Remote, Hybrid"
          />
          <TextInput
            label="Joining Date *"
            value={formData.joiningDate}
            onChangeText={(value) => updateField('joiningDate', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </Card.Content>
    </Card>
  );

  const sections = [
    { value: 'personal', label: 'Personal' },
    { value: 'contact', label: 'Contact' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'employment', label: 'Employment' }
  ];

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'personal': return renderPersonalInfo();
      case 'contact': return renderContactInfo();
      case 'emergency': return renderEmergencyContact();
      case 'employment': return renderEmploymentDetails();
      default: return renderPersonalInfo();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New Employee</Text>
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
          disabled={loading || !formData.firstName || !formData.lastName || !formData.personalEmail || !formData.jobTitle}
          style={styles.saveButton}
          icon="content-save"
        >
          Save Employee
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