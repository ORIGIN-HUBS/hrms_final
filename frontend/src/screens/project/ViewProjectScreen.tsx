import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { projectService, Project } from '../../api/projectService';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

interface ViewProjectScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  projectId: number;
}

export const ViewProjectScreen: React.FC<ViewProjectScreenProps> = ({ onNavigate, projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(projectId);
      setProject(data);
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to load project details');
      } else {
        Alert.alert('Error', 'Failed to load project details');
      }
      onNavigate('Projects');
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
      await projectService.delete(projectId);
      if (Platform.OS === 'web') {
        alert('✓ Project deleted successfully');
      } else {
        Alert.alert('Success', 'Project deleted successfully');
      }
      onNavigate('Projects');
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('✗ Failed to delete project');
      } else {
        Alert.alert('Error', 'Failed to delete project');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      ACTIVE: '#28a745',
      COMPLETED: '#0d6efd',
      EXTENDED: '#17a2b8',
      TERMINATED: '#dc3545',
    };
    return statusColors[status] || '#6c757d';
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <Text style={styles.loadingText}>Loading project details...</Text>
        </View>
      </Screen>
    );
  }

  if (!project) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>Project not found</Text>
          <Button title="Back to List" onPress={() => onNavigate('Projects')} />
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
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={styles.headerActions}>
            {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
              <>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => onNavigate('EditProject', { id: projectId })}
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

        {/* Project Overview Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.projectHeader}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="work" size={48} color={colors.surface} />
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{project.projectName}</Text>
              <Text style={styles.jobTitle}>{project.jobTitle}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                <Text style={styles.statusText}>{project.status}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Client Information */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <InfoRow icon="business" label="Client Company" value={project.clientCompanyName} />
          <InfoRow icon="location-on" label="Client Location" value={project.clientLocation} />
        </Card>

        {/* Vendor Information */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Information</Text>
          <InfoRow icon="store" label="Vendor Company" value={project.vendorCompanyName} />
          <InfoRow icon="location-city" label="Vendor Location" value={project.vendorLocation} />
          <InfoRow icon="email" label="Vendor Email" value={project.vendorEmail} />
        </Card>

        {/* Point of Contact */}
        {(project.pocName || project.pocEmail || project.pocPhone) && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Point of Contact</Text>
            <InfoRow icon="person" label="Name" value={project.pocName} />
            <InfoRow icon="badge" label="Title" value={project.pocTitle} />
            <InfoRow icon="email" label="Email" value={project.pocEmail} />
            <InfoRow icon="phone" label="Phone" value={project.pocPhone} />
          </Card>
        )}

        {/* Project Timeline */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Project Timeline</Text>
          <InfoRow icon="calendar-today" label="Start Date" value={formatDate(project.projectStartDate)} />
          <InfoRow icon="event" label="End Date" value={formatDate(project.projectEndDate)} />
          {project.extensionDate && (
            <InfoRow icon="update" label="Extension Date" value={formatDate(project.extensionDate)} />
          )}
        </Card>

        {/* Financial Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Details</Text>
          <InfoRow icon="attach-money" label="Vendor Pay Rate" value={formatCurrency(project.vendorPayRate)} />
          <InfoRow icon="payment" label="Candidate Pay Rate" value={formatCurrency(project.candidatePayRate)} />
          <InfoRow icon="work-outline" label="Work Mode" value={project.workMode} />
        </Card>

        {/* Assigned Employee */}
        {project.employee && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Employee</Text>
            <View style={styles.employeeCard}>
              <View style={styles.employeeInfo}>
                <MaterialIcons name="person" size={24} color={colors.primary} />
                <View style={styles.employeeDetails}>
                  <Text style={styles.employeeName}>
                    {project.employee.firstName} {project.employee.lastName}
                  </Text>
                  <Text style={styles.employeeId}>ID: {project.employee.employeeId}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewEmployeeButton}
                onPress={() => onNavigate('ViewEmployee', { id: project.employee?.id })}
              >
                <Text style={styles.viewEmployeeText}>View</Text>
                <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
          <View style={styles.actionSection}>
            <Button
              title="Edit Project"
              onPress={() => onNavigate('EditProject', { id: projectId })}
              style={styles.actionButton}
            />
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and all associated data will be permanently removed."
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
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
  employeeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeDetails: {
    marginLeft: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  employeeId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewEmployeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 6,
    gap: 4,
  },
  viewEmployeeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  actionSection: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  actionButton: {
    marginVertical: 4,
  },
  bottomSpace: {
    height: 40,
  },
});
