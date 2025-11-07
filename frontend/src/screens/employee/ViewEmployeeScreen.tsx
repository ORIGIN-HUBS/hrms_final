import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { employeeService } from '../../api/employeeService';
import { colors } from '../../constants/colors';
import { Employee } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ViewEmployeeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  employeeId: number;
}

export const ViewEmployeeScreen: React.FC<ViewEmployeeScreenProps> = ({ onNavigate, employeeId }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(employeeId);
      setEmployee(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load employee details');
      onNavigate('EmployeeList');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteDialogVisible(false);
    
    try {
      await employeeService.delete(employeeId);
      Alert.alert('Success', 'Employee deleted successfully');
      onNavigate('EmployeeList');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete employee');
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      ACTIVE: '#28a745',
      ONBOARDING: '#ffc107',
      OFFBOARDING: '#dc3545',
      TERMINATED: '#6c757d',
    };
    return statusColors[status] || '#6c757d';
  };

  const InfoRow: React.FC<{ icon: keyof typeof MaterialIcons.glyphMap; label: string; value?: string }> = ({
    icon,
    label,
    value,
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.valueText}>{value || 'N/A'}</Text>
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

  if (!employee) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>Employee not found</Text>
          <Button title="Back to List" onPress={() => onNavigate('EmployeeList')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('EmployeeList')}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Employee Profile</Text>
          <View style={styles.headerActions}>
            {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
              <>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => onNavigate('EditEmployee', { id: employeeId })}
                >
                  <MaterialIcons name="edit" size={24} color={colors.primary} />
                </TouchableOpacity>
                {user?.roles?.includes('ROLE_ADMIN') && (
                  <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
                    <MaterialIcons name="delete" size={24} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Employee Overview Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="person" size={60} color={colors.surface} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.employeeName}>
                {employee.firstName} {employee.lastName}
              </Text>
              <Text style={styles.employeeTitle}>{employee.jobTitle}</Text>
              <Text style={styles.employeeId}>ID: {employee.employeeId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(employee.status) }]}>
                <Text style={styles.statusText}>{employee.status}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow icon="email" label="Personal Email" value={employee.email} />
          <InfoRow icon="work" label="Work Email" value={employee.workEmail} />
          <InfoRow icon="phone" label="Phone Number" value={employee.phoneNumber} />
          <InfoRow icon="location-on" label="Address" value={employee.address} />
        </Card>

        {/* Employment Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Details</Text>
          <InfoRow icon="work" label="Job Title" value={employee.jobTitle} />
          <InfoRow icon="business" label="Department" value={employee.department} />
          <InfoRow icon="calendar-today" label="Joining Date" value={employee.joiningDate} />
          <InfoRow icon="badge" label="Status" value={employee.status} />
        </Card>

        {/* Emergency Contact */}
        {(employee.emergencyContactName || employee.emergencyContactPhone) && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <InfoRow icon="person" label="Contact Name" value={employee.emergencyContactName} />
            <InfoRow icon="phone" label="Contact Phone" value={employee.emergencyContactPhone} />
          </Card>
        )}

        {/* Action Buttons */}
        {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
          <View style={styles.actionSection}>
            <Button
              title="View Documents"
              onPress={() => onNavigate('EmployeeDocuments', { id: employeeId })}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Edit Employee"
              onPress={() => onNavigate('EditEmployee', { id: employeeId })}
              style={styles.actionButton}
            />
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor={colors.danger}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        icon="delete-forever"
        iconColor={colors.danger}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  overviewCard: {
    margin: 20,
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  employeeTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  valueText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionSection: {
    marginHorizontal: 20,
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    marginVertical: 4,
  },
  bottomSpace: {
    height: 40,
  },
});
