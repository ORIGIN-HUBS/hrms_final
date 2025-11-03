import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { projectService } from '@/services/projectService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Project } from '@/types';

const ProjectViewScreen: React.FC<any> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjectById(projectId);
      setProject(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load project');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading project details...</Text>
      </View>
    );
  }

  if (!project) {
    return null;
  }

  const InfoRow = ({ label, value }: { label: string; value?: string | number }) => {
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
          <View style={styles.projectIcon}>
            <Ionicons name="briefcase" size={32} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.projectName}>{project.projectName}</Text>
            <Text style={styles.projectClient}>{project.clientCompanyName}</Text>
            <Text style={styles.projectJob}>{project.jobTitle}</Text>
          </View>
          <StatusBadge status={project.status} />
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Edit"
          onPress={() => navigation.navigate('ProjectEdit', { projectId })}
          icon={<Ionicons name="create-outline" size={20} color={colors.white} />}
          style={styles.actionButton}
        />
        <Button
          title="Timesheets"
          onPress={() => navigation.navigate('TimesheetList', { projectId })}
          icon={<Ionicons name="time-outline" size={20} color={colors.white} />}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {/* Basic Information */}
      <Card>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InfoRow label="Project Name" value={project.projectName} />
        <InfoRow label="Job Title" value={project.jobTitle} />
        <InfoRow label="Status" value={project.status} />
        <InfoRow label="Work Mode" value={project.workMode} />
      </Card>

      {/* Vendor Information */}
      <Card>
        <Text style={styles.sectionTitle}>Vendor Information</Text>
        <InfoRow label="Company Name" value={project.vendorCompanyName} />
        <InfoRow label="POC Name" value={project.pocName} />
        <InfoRow label="POC Title" value={project.pocTitle} />
        <InfoRow label="POC Email" value={project.pocEmail} />
        <InfoRow label="POC Phone" value={project.pocPhone} />
        <InfoRow label="Vendor Email" value={project.vendorEmail} />
        <InfoRow label="Location" value={project.vendorLocation} />
        <InfoRow label="Agreement Terms" value={project.agreementTerms} />
      </Card>

      {/* Client Information */}
      <Card>
        <Text style={styles.sectionTitle}>Client Information</Text>
        <InfoRow label="Company Name" value={project.clientCompanyName} />
        <InfoRow label="Location" value={project.clientLocation} />
      </Card>

      {/* Financial Information */}
      <Card>
        <Text style={styles.sectionTitle}>Financial Information</Text>
        <InfoRow 
          label="Vendor Pay Rate" 
          value={project.vendorPayRate ? `$${project.vendorPayRate}/hr` : undefined} 
        />
        <InfoRow 
          label="Candidate Pay Rate" 
          value={project.candidatePayRate ? `$${project.candidatePayRate}/hr` : undefined} 
        />
        {project.vendorPayRate && project.candidatePayRate && (
          <InfoRow 
            label="Margin" 
            value={`$${(project.vendorPayRate - project.candidatePayRate).toFixed(2)}/hr`} 
          />
        )}
      </Card>

      {/* Timeline */}
      <Card>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <InfoRow label="Start Date" value={project.projectStartDate} />
        <InfoRow label="End Date" value={project.projectEndDate} />
        <InfoRow label="Extension Date" value={project.extensionDate} />
      </Card>

      {/* Employee Assignment */}
      {project.employee && (
        <Card>
          <Text style={styles.sectionTitle}>Assigned Employee</Text>
          <InfoRow 
            label="Name" 
            value={`${project.employee.firstName} ${project.employee.lastName}`} 
          />
          <InfoRow label="Email" value={project.employee.workEmail || project.employee.personalEmail} />
          <InfoRow label="Job Title" value={project.employee.jobTitle} />
        </Card>
      )}

      {/* Audit Information */}
      <Card style={styles.lastCard}>
        <Text style={styles.sectionTitle}>Audit Information</Text>
        <InfoRow label="Created At" value={project.createdAt} />
        <InfoRow label="Updated At" value={project.updatedAt} />
        <InfoRow label="Created By" value={project.createdBy} />
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
  projectIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  projectClient: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  projectJob: {
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

export default ProjectViewScreen;

