import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { DatePicker } from '../../components/common/DatePicker';
import { projectService } from '../../api/projectService';
import { employeeService } from '../../api/employeeService';
import { colors } from '../../constants/colors';

interface AddProjectScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

interface ProjectFormData {
  projectName: string;
  jobTitle: string;
  clientCompanyName: string;
  clientLocation: string;
  vendorCompanyName: string;
  vendorLocation: string;
  vendorEmail: string;
  pocName: string;
  pocTitle: string;
  pocEmail: string;
  pocPhone: string;
  workMode: string;
  vendorPayRate: string;
  candidatePayRate: string;
  projectStartDate: string;
  projectEndDate: string;
  extensionDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXTENDED' | 'TERMINATED';
  employeeId: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export const AddProjectScreen: React.FC<AddProjectScreenProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: '',
    jobTitle: '',
    clientCompanyName: '',
    clientLocation: '',
    vendorCompanyName: '',
    vendorLocation: '',
    vendorEmail: '',
    pocName: '',
    pocTitle: '',
    pocEmail: '',
    pocPhone: '',
    workMode: '',
    vendorPayRate: '',
    candidatePayRate: '',
    projectStartDate: '',
    projectEndDate: '',
    extensionDate: '',
    status: 'ACTIVE',
    employeeId: '',
  });
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to load employees');
      } else {
        Alert.alert('Error', 'Failed to load employees');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.clientCompanyName.trim()) newErrors.clientCompanyName = 'Client company is required';
    if (!formData.vendorCompanyName.trim()) newErrors.vendorCompanyName = 'Vendor company is required';
    if (!formData.projectStartDate.trim()) newErrors.projectStartDate = 'Start date is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Please select an employee';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (Platform.OS === 'web') {
        alert('Please fill in all required fields correctly');
      } else {
        Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      }
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        vendorPayRate: formData.vendorPayRate ? parseFloat(formData.vendorPayRate) : undefined,
        candidatePayRate: formData.candidatePayRate ? parseFloat(formData.candidatePayRate) : undefined,
        employeeId: parseInt(formData.employeeId),
      };
      
      const newProject = await projectService.create(submitData);
      
      if (Platform.OS === 'web') {
        alert('✓ Project created successfully');
        onNavigate('ViewProject', { id: newProject.id });
      } else {
        Alert.alert('Success', 'Project created successfully', [
          { text: 'OK', onPress: () => onNavigate('ViewProject', { id: newProject.id }) }
        ]);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('✗ Failed to create project. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to create project. Please try again.');
      }
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
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Projects')}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Project</Text>
        </View>

        {/* Project Information */}
        {renderSection('Project Information', 'work', (
          <>
            <Input
              label="Project Name *"
              value={formData.projectName}
              onChangeText={(value) => updateField('projectName', value)}
              error={errors.projectName}
              placeholder="Enter project name"
            />
            <Input
              label="Job Title *"
              value={formData.jobTitle}
              onChangeText={(value) => updateField('jobTitle', value)}
              error={errors.jobTitle}
              placeholder="Enter job title"
            />
            <Input
              label="Work Mode"
              value={formData.workMode}
              onChangeText={(value) => updateField('workMode', value)}
              placeholder="Remote, Hybrid, Onsite"
            />
          </>
        ))}

        {/* Client Information */}
        {renderSection('Client Information', 'business', (
          <>
            <Input
              label="Client Company Name *"
              value={formData.clientCompanyName}
              onChangeText={(value) => updateField('clientCompanyName', value)}
              error={errors.clientCompanyName}
              placeholder="Enter client company name"
            />
            <Input
              label="Client Location"
              value={formData.clientLocation}
              onChangeText={(value) => updateField('clientLocation', value)}
              placeholder="Enter client location"
            />
          </>
        ))}

        {/* Vendor Information */}
        {renderSection('Vendor Information', 'store', (
          <>
            <Input
              label="Vendor Company Name *"
              value={formData.vendorCompanyName}
              onChangeText={(value) => updateField('vendorCompanyName', value)}
              error={errors.vendorCompanyName}
              placeholder="Enter vendor company name"
            />
            <Input
              label="Vendor Location"
              value={formData.vendorLocation}
              onChangeText={(value) => updateField('vendorLocation', value)}
              placeholder="Enter vendor location"
            />
            <Input
              label="Vendor Email"
              value={formData.vendorEmail}
              onChangeText={(value) => updateField('vendorEmail', value)}
              placeholder="vendor@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        ))}

        {/* Point of Contact */}
        {renderSection('Point of Contact', 'person', (
          <>
            <Input
              label="POC Name"
              value={formData.pocName}
              onChangeText={(value) => updateField('pocName', value)}
              placeholder="Enter contact person name"
            />
            <Input
              label="POC Title"
              value={formData.pocTitle}
              onChangeText={(value) => updateField('pocTitle', value)}
              placeholder="Enter contact person title"
            />
            <Input
              label="POC Email"
              value={formData.pocEmail}
              onChangeText={(value) => updateField('pocEmail', value)}
              placeholder="poc@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="POC Phone"
              value={formData.pocPhone}
              onChangeText={(value) => updateField('pocPhone', value)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </>
        ))}

        {/* Financial Details */}
        {renderSection('Financial Details', 'attach-money', (
          <>
            <Input
              label="Vendor Pay Rate"
              value={formData.vendorPayRate}
              onChangeText={(value) => updateField('vendorPayRate', value)}
              placeholder="0.00"
              keyboardType="numeric"
            />
            <Input
              label="Candidate Pay Rate"
              value={formData.candidatePayRate}
              onChangeText={(value) => updateField('candidatePayRate', value)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </>
        ))}

        {/* Timeline */}
        {renderSection('Project Timeline', 'calendar-today', (
          <>
            <DatePicker
              label="Start Date *"
              value={formData.projectStartDate}
              onChangeDate={(value) => updateField('projectStartDate', value)}
              error={errors.projectStartDate}
              placeholder="Select start date"
            />
            <DatePicker
              label="End Date"
              value={formData.projectEndDate}
              onChangeDate={(value) => updateField('projectEndDate', value)}
              placeholder="Select end date"
              minimumDate={formData.projectStartDate ? new Date(formData.projectStartDate) : undefined}
            />
            <DatePicker
              label="Extension Date"
              value={formData.extensionDate}
              onChangeDate={(value) => updateField('extensionDate', value)}
              placeholder="Select extension date"
              minimumDate={formData.projectEndDate ? new Date(formData.projectEndDate) : undefined}
            />
          </>
        ))}

        {/* Employee Assignment */}
        {renderSection('Employee Assignment', 'person-pin', (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assign Employee *</Text>
            {errors.employeeId && <Text style={styles.errorText}>{errors.employeeId}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeScroll}>
              <View style={styles.employeeList}>
                {employees.map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.employeeCard,
                      formData.employeeId === emp.id.toString() && styles.employeeCardSelected,
                    ]}
                    onPress={() => updateField('employeeId', emp.id.toString())}
                  >
                    <MaterialIcons 
                      name="person" 
                      size={24} 
                      color={formData.employeeId === emp.id.toString() ? 'white' : colors.primary} 
                    />
                    <Text style={[
                      styles.employeeName,
                      formData.employeeId === emp.id.toString() && styles.employeeNameSelected,
                    ]}>
                      {emp.firstName} {emp.lastName}
                    </Text>
                    <Text style={[
                      styles.employeeId,
                      formData.employeeId === emp.id.toString() && styles.employeeIdSelected,
                    ]}>
                      {emp.employeeId}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}

        {/* Status */}
        {renderSection('Project Status', 'info', (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status *</Text>
            <View style={styles.statusButtons}>
              {['ACTIVE', 'COMPLETED', 'EXTENDED', 'TERMINATED'].map((status) => (
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
        ))}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => onNavigate('Projects')}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title={saving ? 'Creating...' : 'Create Project'}
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
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginBottom: 4,
  },
  employeeScroll: {
    marginTop: 8,
  },
  employeeList: {
    flexDirection: 'row',
    gap: 12,
  },
  employeeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    minWidth: 140,
    alignItems: 'center',
  },
  employeeCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  employeeNameSelected: {
    color: 'white',
  },
  employeeId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  employeeIdSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
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
