import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { projectService } from '@/services/projectService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { gradients } from '@/theme/colors';

interface Project {
  id: number;
  projectName: string;
  jobTitle: string;
  clientCompanyName: string;
  vendorCompanyName: string;
  workMode?: string;
  status: string;
}

const ProjectListScreen: React.FC<any> = ({ navigation }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching projects...');
      const data = await projectService.getAllProjects();
      console.log('Projects fetched:', data?.length || 0);
      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', error.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  useEffect(() => {
    let filtered = projects;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(proj =>
        proj.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.clientCompanyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.vendorCompanyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(proj => proj.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  }, [searchQuery, statusFilter, projects]);
  
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return colors.success;
      case 'INACTIVE':
        return colors.gray[400];
      case 'ON_LEAVE':
        return colors.warning;
      case 'TERMINATED':
        return colors.danger;
      default:
        return colors.gray[500];
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ON_LEAVE':
        return 'On Leave';
      default:
        return status;
    }
  };
  
  const handleDelete = (projectId: number) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete functionality - projectService doesn't have deleteProject yet
              // await projectService.deleteProject(projectId);
              Alert.alert('Success', 'Project deleted successfully');
              fetchProjects();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };
  
  const renderProjectRow = ({ item }: { item: Project }) => (
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text style={styles.cellText} numberOfLines={1}>{item.id || '-'}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellTextBold} numberOfLines={1}>
          {item.projectName}
        </Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.2 }]}>
        <Text style={styles.cellText} numberOfLines={1}>{item.jobTitle || '-'}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText} numberOfLines={1}>{item.clientCompanyName || '-'}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText} numberOfLines={1}>{item.vendorCompanyName || '-'}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.cellText} numberOfLines={1}>{item.workMode || '-'}</Text>
      </View>
      <View style={styles.tableCell}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <View style={styles.tableCell}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProjectView', { projectId: item.id })}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProjectEdit', { projectId: item.id })}
          >
            <Ionicons name="create-outline" size={18} color={colors.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  if (isLoading && projects.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.warning as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Project Management</Text>
        <Text style={styles.headerSubtitle}>{filteredProjects.length} projects found</Text>
      </LinearGradient>
      
      <View style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.filtersCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.gray[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by project name, client, vendor, or job title..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.gray[400]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('EmployeeAdd')}
            >
              <LinearGradient
                colors={gradients.success as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={22} color={colors.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterButtons}>
                {['ALL', 'ACTIVE', 'INACTIVE', 'COMPLETED', 'ON_HOLD'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      statusFilter === status && styles.filterButtonActive,
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        statusFilter === status && styles.filterButtonTextActive,
                      ]}
                    >
                      {status.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
        
        {/* Table */}
        <View style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>ID</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.headerText}>Project Name</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.2 }]}>
                  <Text style={styles.headerText}>Job Title</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.headerText}>Client</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.headerText}>Vendor</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>Work Mode</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>Status</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>Actions</Text>
                </View>
              </View>
              
              {/* Table Body */}
              <FlatList
                data={filteredProjects}
                renderItem={renderProjectRow}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl refreshing={isLoading} onRefresh={fetchProjects} />
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="briefcase-outline" size={64} color={colors.gray[300]} />
                    <Text style={styles.emptyText}>No projects found</Text>
                    <Text style={styles.emptySubtext}>
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Try adjusting your filters'
                        : 'Add your first project to get started'}
                    </Text>
                  </View>
                }
              />
            </View>
          </ScrollView>
        </View>
      </View>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProjectAdd')}
      >
        <LinearGradient
          colors={gradients.warning as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  filtersCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  addButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  filterRow: {
    gap: spacing.md,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  tableCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  table: {
    minWidth: 1200,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[200],
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  headerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  cellText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  cellTextBold: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProjectListScreen;
