import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { DatePicker } from '../../components/common/DatePicker';
import { employeeService } from '../../api/employeeService';
import { colors } from '../../constants/colors';
import { Employee } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface EditEmployeeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  employeeId: number;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  workEmail: string;
  phoneNumber: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  status: 'ONBOARDING' | 'ACTIVE' | 'OFFBOARDING' | 'TERMINATED';
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export const EditEmployeeScreen: React.FC<EditEmployeeScreenProps> = ({ onNavigate, employeeId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    workEmail: '',
    phoneNumber: '',
    jobTitle: '',
    department: '',
    joiningDate: '',
    status: 'ACTIVE',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(employeeId);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        workEmail: data.workEmail || '',
        phoneNumber: data.phoneNumber || '',
        jobTitle: data.jobTitle || '',
        department: data.department || '',
        joiningDate: data.joiningDate || '',
        status: data.status || 'ACTIVE',
        address: data.address || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load employee details');
      onNavigate('EmployeeList');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EmployeeFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.joiningDate.trim()) newErrors.joiningDate = 'Joining date is required';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setSaving(true);
    try {
      await employeeService.update(employeeId, formData);
      Alert.alert('Success', 'Employee updated successfully', [
        { text: 'OK', onPress: () => onNavigate('ViewEmployee', { id: employeeId }) }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update employee. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (title: string, icon: keyof typeof MaterialIcons.glyphMap, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon} size={24} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading employee details...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('ViewEmployee', { id: employeeId })}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Employee</Text>
        </View>

        {/* Personal Information */}
        {renderSection('Personal Information', 'person', (
          <>
            <Input
              label="First Name *"
              value={formData.firstName}
              onChangeText={(value) => updateField('firstName', value)}
              error={errors.firstName}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(value) => updateField('lastName', value)}
              error={errors.lastName}
              placeholder="Enter last name"
            />
            <Input
              label="Personal Email *"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              error={errors.email}
              placeholder="employee@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Work Email"
              value={formData.workEmail}
              onChangeText={(value) => updateField('workEmail', value)}
              placeholder="employee@originhubs.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Input
              label="Phone Number *"
              value={formData.phoneNumber}
              onChangeText={(value) => updateField('phoneNumber', value)}
              error={errors.phoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <Input
              label="Address"
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="Enter residential address"
            />
          </>
        ))}

        {/* Employment Details */}
        {renderSection('Employment Details', 'work', (
          <>
            <Input
              label="Job Title *"
              value={formData.jobTitle}
              onChangeText={(value) => updateField('jobTitle', value)}
              error={errors.jobTitle}
              placeholder="Enter job title"
            />
            <Input
              label="Department *"
              value={formData.department}
              onChangeText={(value) => updateField('department', value)}
              error={errors.department}
              placeholder="Enter department"
            />
            <DatePicker
              label="Joining Date *"
              value={formData.joiningDate}
              onChangeDate={(value) => updateField('joiningDate', value)}
              error={errors.joiningDate}
              placeholder="Select joining date"
            />
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status *</Text>
              <View style={styles.statusButtons}>
                {['ONBOARDING', 'ACTIVE', 'OFFBOARDING', 'TERMINATED'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.status === status && styles.statusButtonActive,
                    ]}
                    onPress={() => updateField('status', status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        formData.status === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ))}

        {/* Emergency Contact */}
        {renderSection('Emergency Contact', 'emergency', (
          <>
            <Input
              label="Contact Name"
              value={formData.emergencyContactName}
              onChangeText={(value) => updateField('emergencyContactName', value)}
              placeholder="Enter emergency contact name"
            />
            <Input
              label="Contact Phone"
              value={formData.emergencyContactPhone}
              onChangeText={(value) => updateField('emergencyContactPhone', value)}
              placeholder="Enter emergency contact phone"
              keyboardType="phone-pad"
            />
          </>
        ))}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => onNavigate('ViewEmployee', { id: employeeId })}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSubmit}
            disabled={saving}
            style={styles.button}
          />
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  sectionContent: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statusButtonTextActive: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
  bottomSpace: {
    height: 40,
  },
});
