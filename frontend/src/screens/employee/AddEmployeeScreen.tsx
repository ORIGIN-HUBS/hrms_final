import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { DatePicker } from '../../components/common/DatePicker';
import { employeeService } from '../../api/employeeService';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

interface AddEmployeeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

interface EmployeeFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  pronouns: string;
  contactNumber: string;
  alternateContactNumber: string;
  personalEmail: string;
  residentialAddress: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactRelation: string;
  ssn: string;
  workPermit: string;
  jobTitle: string;
  supervisor: string;
  employmentType: string;
  workLocation: string;
  workMode: string;
  joiningDate: string;
  status: string;
}

export const AddEmployeeScreen: React.FC<AddEmployeeScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  
  // Debug navigation function
  React.useEffect(() => {
    console.log('AddEmployeeScreen mounted with onNavigate:', typeof onNavigate);
  }, []);
  const [formData, setFormData] = useState<EmployeeFormData>({
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

  const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});

  const updateField = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EmployeeFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.personalEmail.trim()) newErrors.personalEmail = 'Personal email is required';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.employmentType.trim()) newErrors.employmentType = 'Employment type is required';
    if (!formData.joiningDate.trim()) newErrors.joiningDate = 'Joining date is required';

    if (formData.personalEmail && !/\S+@\S+\.\S+/.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Please enter a valid email address';
    }

    if (formData.joiningDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.joiningDate)) {
      newErrors.joiningDate = 'Please enter date in YYYY-MM-DD format';
    }

    if (formData.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Please enter date in YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showAlert('Validation Error', 'Please fill in all required fields correctly.', 'warning');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting employee creation...');
      const submitData = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        pronouns: formData.pronouns,
        contactNumber: formData.contactNumber,
        alternateContactNumber: formData.alternateContactNumber,
        personalEmail: formData.personalEmail,
        residentialAddress: formData.residentialAddress,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
        emergencyContactRelation: formData.emergencyContactRelation,
        ssn: formData.ssn,
        workPermit: formData.workPermit,
        jobTitle: formData.jobTitle,
        supervisor: formData.supervisor,
        employmentType: formData.employmentType,
        workLocation: formData.workLocation,
        workMode: formData.workMode,
        joiningDate: formData.joiningDate,
        status: formData.status
      };
      
      console.log('Submitting data:', submitData);
      const result = await employeeService.create(submitData);
      console.log('Employee created successfully:', result);
      
      // Navigate immediately after success
      console.log('Navigating to Employees...');
      onNavigate('Employees');
      
      // Show success message with credentials after navigation
      setTimeout(() => {
        if (result.credentials) {
          const credentials = result.credentials;
          const message = `Employee added successfully!\n\nLogin Credentials Created:\nUsername: ${credentials.username}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.password}\n\n${credentials.emailSent ? 'Credentials have been sent to the employee\'s email.' : 'Please share these credentials with the employee.'}`;
          showAlert('Success', message, 'success');
        } else {
          showAlert('Success', 'Employee added successfully!', 'success');
        }
      }, 100);
    } catch (error: any) {
      console.error('Error creating employee:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to add employee. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || 'Invalid employee data. Please check all fields.';
        } else if (status === 401) {
          errorMessage = 'You are not authorized to add employees.';
        } else if (status === 403) {
          errorMessage = 'Access denied. You do not have permission to add employees.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data?.message || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error - no response received
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      showAlert('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon as any} size={20} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderSelectField = (
    label: string,
    field: keyof EmployeeFormData,
    options: { label: string; value: string }[],
    required = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.selectContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectOption,
              formData[field] === option.value && styles.selectOptionActive
            ]}
            onPress={() => updateField(field, option.value)}
          >
            <Text style={[
              styles.selectOptionText,
              formData[field] === option.value && styles.selectOptionTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => onNavigate('Employees')} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <MaterialIcons name="person-add" size={28} color={colors.text} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Add New Employee</Text>
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.userInfo}>{user?.username || 'User'}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="person-add" size={20} color="white" />
                <Text style={styles.cardTitle}>Employee Onboarding Form</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              {/* Personal Information */}
              {renderSection('Personal Information', 'person', (
                <>
                  <View style={styles.row}>
                    <View style={styles.col4}>
                      <Input
                        label="First Name *"
                        value={formData.firstName}
                        onChangeText={(value) => updateField('firstName', value)}
                        error={errors.firstName}
                        required
                      />
                    </View>
                    <View style={styles.col4}>
                      <Input
                        label="Middle Name"
                        value={formData.middleName}
                        onChangeText={(value) => updateField('middleName', value)}
                      />
                    </View>
                    <View style={styles.col4}>
                      <Input
                        label="Last Name *"
                        value={formData.lastName}
                        onChangeText={(value) => updateField('lastName', value)}
                        error={errors.lastName}
                        required
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.col4}>
                      <DatePicker
                        label="Date of Birth"
                        value={formData.dateOfBirth}
                        onChangeDate={(value) => updateField('dateOfBirth', value)}
                        error={errors.dateOfBirth}
                        placeholder="Select date of birth"
                        maximumDate={new Date()}
                      />
                    </View>
                    <View style={styles.col4}>
                      {renderSelectField('Gender', 'gender', [
                        { label: 'Select...', value: '' },
                        { label: 'Male', value: 'Male' },
                        { label: 'Female', value: 'Female' },
                        { label: 'Other', value: 'Other' }
                      ])}
                    </View>
                    <View style={styles.col4}>
                      <Input
                        label="Pronouns"
                        value={formData.pronouns}
                        onChangeText={(value) => updateField('pronouns', value)}
                        placeholder="e.g., He/Him, She/Her"
                      />
                    </View>
                  </View>
                </>
              ))}

              {/* Contact Information */}
              {renderSection('Contact Information', 'phone', (
                <>
                  <View style={styles.row}>
                    <View style={styles.col6}>
                      <Input
                        label="Contact Number *"
                        value={formData.contactNumber}
                        onChangeText={(value) => updateField('contactNumber', value)}
                        error={errors.contactNumber}
                        keyboardType="phone-pad"
                        required
                      />
                    </View>
                    <View style={styles.col6}>
                      <Input
                        label="Alternate Contact"
                        value={formData.alternateContactNumber}
                        onChangeText={(value) => updateField('alternateContactNumber', value)}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Input
                        label="Personal Email *"
                        value={formData.personalEmail}
                        onChangeText={(value) => updateField('personalEmail', value)}
                        error={errors.personalEmail}
                        keyboardType="email-address"
                        required
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Input
                        label="Residential Address"
                        value={formData.residentialAddress}
                        onChangeText={(value) => updateField('residentialAddress', value)}
                        multiline
                        numberOfLines={2}
                      />
                    </View>
                  </View>
                </>
              ))}

              {/* Emergency Contact */}
              {renderSection('Emergency Contact', 'emergency', (
                <View style={styles.row}>
                  <View style={styles.col4}>
                    <Input
                      label="Contact Name"
                      value={formData.emergencyContactName}
                      onChangeText={(value) => updateField('emergencyContactName', value)}
                    />
                  </View>
                  <View style={styles.col4}>
                    <Input
                      label="Contact Number"
                      value={formData.emergencyContactNumber}
                      onChangeText={(value) => updateField('emergencyContactNumber', value)}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.col4}>
                    <Input
                      label="Relationship"
                      value={formData.emergencyContactRelation}
                      onChangeText={(value) => updateField('emergencyContactRelation', value)}
                      placeholder="e.g., Spouse, Parent"
                    />
                  </View>
                </View>
              ))}

              {/* Legal Information */}
              {renderSection('Legal Information', 'security', (
                <View style={styles.row}>
                  <View style={styles.col6}>
                    <Input
                      label="SSN (Last 4 digits)"
                      value={formData.ssn}
                      onChangeText={(value) => updateField('ssn', value)}
                      maxLength={4}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.col6}>
                    <Input
                      label="Work Permit"
                      value={formData.workPermit}
                      onChangeText={(value) => updateField('workPermit', value)}
                    />
                  </View>
                </View>
              ))}

              {/* Employment Details */}
              {renderSection('Employment Details', 'work', (
                <>
                  <View style={styles.row}>
                    <View style={styles.col6}>
                      <Input
                        label="Job Title *"
                        value={formData.jobTitle}
                        onChangeText={(value) => updateField('jobTitle', value)}
                        error={errors.jobTitle}
                        required
                      />
                    </View>
                    <View style={styles.col6}>
                      <Input
                        label="Supervisor"
                        value={formData.supervisor}
                        onChangeText={(value) => updateField('supervisor', value)}
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.col4}>
                      {renderSelectField('Employment Type *', 'employmentType', [
                        { label: 'Select...', value: '' },
                        { label: 'Full-time', value: 'Full-time' },
                        { label: 'Part-time', value: 'Part-time' },
                        { label: 'Contract', value: 'Contract' }
                      ], true)}
                    </View>
                    <View style={styles.col4}>
                      <Input
                        label="Work Location"
                        value={formData.workLocation}
                        onChangeText={(value) => updateField('workLocation', value)}
                      />
                    </View>
                    <View style={styles.col4}>
                      {renderSelectField('Work Mode', 'workMode', [
                        { label: 'Select...', value: '' },
                        { label: 'Onsite', value: 'Onsite' },
                        { label: 'Remote', value: 'Remote' },
                        { label: 'Hybrid', value: 'Hybrid' }
                      ])}
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.col6}>
                      <DatePicker
                        label="Joining Date *"
                        value={formData.joiningDate}
                        onChangeDate={(value) => updateField('joiningDate', value)}
                        error={errors.joiningDate}
                        placeholder="Select joining date"
                      />
                    </View>
                    <View style={styles.col6}>
                      {renderSelectField('Status', 'status', [
                        { label: 'Onboarding', value: 'ONBOARDING' },
                        { label: 'Active', value: 'ACTIVE' }
                      ])}
                    </View>
                  </View>
                </>
              ))}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  title="Save Employee"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.saveButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => onNavigate('Employees')}
                  variant="secondary"
                  style={styles.cancelButton}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 70,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  col4: {
    flex: 1,
    paddingHorizontal: 8,
    maxWidth: '33.333%',
  },
  col6: {
    flex: 1,
    paddingHorizontal: 8,
    maxWidth: '50%',
  },
  col12: {
    flex: 1,
    paddingHorizontal: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  required: {
    color: '#dc3545',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectOptionTextActive: {
    color: 'white',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    minWidth: 140,
  },
  cancelButton: {
    minWidth: 100,
  },
});