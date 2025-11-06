import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { projectService } from '@/services/projectService';
import Card from '@/components/common/Card';
import StatusBadge from '@/components/common/StatusBadge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Project } from '@/types';
import { RootState } from '@/store';

const MyProjectsScreen: React.FC<any> = ({ navigation }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.employee?.id) {
      fetchMyProjects();
    }
  }, [user]);

  const fetchMyProjects = async () => {
    if (!user?.employee?.id) {
      Alert.alert('Error', 'Employee ID not found');
      return;
    }

    setIsLoading(true);
    try {
      const data = await projectService.getProjectsByEmployee(user.employee.id);
      setProjects(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProjectView', { projectId: item.id })}
    >
      <Card style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <View style={styles.projectIcon}>
            <Ionicons name="briefcase" size={24} color={colors.primary} />
          </View>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName} numberOfLines={1}>
              {item.projectName}
            </Text>
            <Text style={styles.projectClient} numberOfLines={1}>
              {item.clientCompanyName}
            </Text>
            <Text style={styles.projectDetail}>
              {item.jobTitle}
            </Text>
          </View>
          <StatusBadge status={item.status} size="small" />
        </View>

        <View style={styles.projectMeta}>
          {item.workMode && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>{item.workMode}</Text>
            </View>
          )}
          {item.projectStartDate && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>
                {item.projectStartDate}
                {item.projectEndDate && ` - ${item.projectEndDate}`}
              </Text>
            </View>
          )}
        </View>

        {item.candidatePayRate && (
          <View style={styles.rateContainer}>
            <Text style={styles.rateText}>
              Pay Rate: ${item.candidatePayRate}/hr
            </Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TimesheetList', { projectId: item.id })}
          >
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.actionText}>Timesheets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProjectView', { projectId: item.id })}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.actionText}>Details</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="briefcase-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyStateTitle}>No Projects Assigned</Text>
      <Text style={styles.emptyStateText}>
        You don't have any projects assigned yet. Contact your manager for project assignments.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Projects</Text>
      <Text style={styles.headerSubtitle}>
        {projects.length} {projects.length === 1 ? 'project' : 'projects'} assigned
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchMyProjects} />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  headerContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.md,
  },
  projectCard: {
    marginBottom: spacing.md,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  projectClient: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  projectDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  projectMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  rateContainer: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginBottom: spacing.sm,
  },
  rateText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default MyProjectsScreen;

