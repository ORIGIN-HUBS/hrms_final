import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { employeeService } from '@/services/employeeService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Employee } from '@/types';

const EmployeeViewScreen: React.FC<any> = ({ navigation, route }) => {
  const { employeeId } = route.params;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getEmployeeById(employeeId);
      setEmployee(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load employee');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUserAccount = async () => {
    Alert.alert(
      'Create User Account',
      'Are you sure you want to create a user account for this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            setIsCreatingAccount(true);
            try {
              await employeeService.createUserAccount(employeeId, {});
              Alert.alert('Success', 'User account created successfully');
              fetchEmployee();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to create user account');
            } finally {
              setIsCreatingAccount(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading employee details...</Text>
      </View>
    );
  }

  if (!employee) {
    return null;
  }

  const InfoRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {employee.firstName[0]}{employee.lastName[0]}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.employeeName}>
              {employee.firstName} {employee.middleName} {employee.lastName}
            </Text>
            <Text style={styles.employeeTitle}>{employee.jobTitle}</Text>
            <Text style={styles.employeeId}>ID: {employee.employeeId}</Text>
          </View>
          <StatusBadge status={employee.status} />
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Edit"
          onPress={() => navigation.navigate('EmployeeEdit', { employeeId })}
          icon={<Ionicons name="create-outline" size={20} color={colors.white} />}
          style={styles.actionButton}
        />
        <Button
          title="Documents"
          onPress={() => navigation.navigate('EmployeeDocuments', { employeeId })}
          icon={<Ionicons name="document-text-outline" size={20} color={colors.white} />}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Create Account"
          onPress={handleCreateUserAccount}
          loading={isCreatingAccount}
          icon={<Ionicons name="person-add-outline" size={20} color={colors.white} />}
          variant="success"
          style={styles.actionButton}
        />
      </View>

      {/* Personal Information */}
      <Card>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoRow label="Full Name" value={`${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`} />
        <InfoRow label="Date of Birth" value={employee.dateOfBirth} />
        <InfoRow label="Gender" value={employee.gender} />
        <InfoRow label="Pronouns" value={employee.pronouns} />
      </Card>

      {/* Contact Information */}
      <Card>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <InfoRow label="Contact Number" value={employee.contactNumber} />
        <InfoRow label="Alternate Contact" value={employee.alternateContactNumber} />
        <InfoRow label="Personal Email" value={employee.personalEmail} />
        <InfoRow label="Work Email" value={employee.workEmail} />
        <InfoRow label="Residential Address" value={employee.residentialAddress} />
      </Card>

      {/* Emergency Contact */}
      <Card>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <InfoRow label="Name" value={employee.emergencyContactName} />
        <InfoRow label="Contact Number" value={employee.emergencyContactNumber} />
        <InfoRow label="Relationship" value={employee.emergencyContactRelation} />
      </Card>

      {/* Employment Details */}
      <Card>
        <Text style={styles.sectionTitle}>Employment Details</Text>
        <InfoRow label="Job Title" value={employee.jobTitle} />
        <InfoRow label="Employee ID" value={employee.employeeId} />
        <InfoRow label="Employment Type" value={employee.employmentType} />
        <InfoRow label="Supervisor" value={employee.supervisor} />
        <InfoRow label="Manager" value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : undefined} />
        <InfoRow label="Work Location" value={employee.workLocation} />
        <InfoRow label="Current Location" value={employee.currentLocation} />
        <InfoRow label="Work Mode" value={employee.workMode} />
        <InfoRow label="Joining Date" value={employee.joiningDate} />
        <InfoRow label="Status" value={employee.status} />
      </Card>

      {/* Legal Information */}
      <Card>
        <Text style={styles.sectionTitle}>Legal Information</Text>
        <InfoRow label="SSN" value={employee.ssn ? '***-**-' + employee.ssn.slice(-4) : undefined} />
        <InfoRow label="Work Permit" value={employee.workPermit} />
      </Card>

      {/* Audit Information */}
      <Card style={styles.lastCard}>
        <Text style={styles.sectionTitle}>Audit Information</Text>
        <InfoRow label="Created At" value={employee.createdAt} />
        <InfoRow label="Updated At" value={employee.updatedAt} />
        <InfoRow label="Created By" value={employee.createdBy} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
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
  headerCard: {
    marginTop: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  employeeTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  employeeId: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    flex: 2,
    textAlign: 'right',
  },
  lastCard: {
    marginBottom: spacing.xl,
  },
});

export default EmployeeViewScreen;

