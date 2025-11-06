import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Searchbar, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchProjects } from '../../store/slices/projectSlice';
import { Project } from '../../types';
import { theme } from '../../theme';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

function ProjectCard({ project, onPress }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return theme.colors.success;
      case 'COMPLETED': return theme.colors.primary;
      case 'ON_HOLD': return theme.colors.warning;
      default: return theme.colors.disabled;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'play-circle';
      case 'COMPLETED': return 'checkmark-circle';
      case 'ON_HOLD': return 'pause-circle';
      default: return 'help-circle';
    }
  };

  return (
    <Card style={styles.projectCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.projectHeader}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{project.projectName}</Text>
            <Text style={styles.clientName}>{project.clientCompanyName}</Text>
          </View>
          <Chip
            icon={() => (
              <Ionicons 
                name={getStatusIcon(project.status)} 
                size={16} 
                color="white" 
              />
            )}
            style={[styles.statusChip, { backgroundColor: getStatusColor(project.status) }]}
            textStyle={styles.statusText}
          >
            {project.status.replace('_', ' ')}
          </Chip>
        </View>
        
        <View style={styles.projectDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="business" size={16} color={theme.colors.onSurface} />
            <Text style={styles.detailText}>Vendor: {project.vendorCompanyName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={theme.colors.onSurface} />
            <Text style={styles.detailText}>
              Start: {new Date(project.projectStartDate).toLocaleDateString()}
            </Text>
          </View>
          {project.projectEndDate && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurface} />
              <Text style={styles.detailText}>
                End: {new Date(project.projectEndDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          {project.assignedEmployees && project.assignedEmployees.length > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="people" size={16} color={theme.colors.onSurface} />
              <Text style={styles.detailText}>
                {project.assignedEmployees.length} employee(s) assigned
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

export default function ProjectListScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading } = useSelector((state: RootState) => state.project);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clientCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.vendorCompanyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectPress = (project: Project) => {
    navigation.navigate('ProjectDetail', { project });
  };

  const handleAddProject = () => {
    navigation.navigate('AddProject');
  };

  if (loading && projects.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Ionicons name="briefcase" size={28} color={theme.colors.primary} />
          {' '}Projects
        </Text>
        <Text style={styles.headerSubtitle}>
          Total: {filteredProjects.length} projects
        </Text>
      </View>

      <Searchbar
        placeholder="Search projects..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={theme.colors.primary}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={theme.colors.disabled} />
            <Text style={styles.emptyText}>No projects found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first project'}
            </Text>
          </View>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => handleProjectPress(project)}
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddProject}
        label={Platform.OS === 'web' ? 'Add Project' : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  header: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
  },
  searchbar: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  projectCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  clientName: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
  },
  statusChip: {
    marginLeft: theme.spacing.sm,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  projectDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});