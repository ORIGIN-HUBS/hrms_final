import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

import { projectService, Project } from '../../api/projectService';

interface ProjectListScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const ProjectListScreen: React.FC<ProjectListScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery]);

  const loadProjects = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      showAlert('Error', 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const filterProjects = () => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project =>
      project.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientCompanyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const handleRefresh = () => {
    loadProjects(true);
  };

  const handleDelete = async (id: number) => {
    showAlert('Confirm Delete', 'Are you sure you want to delete this project?', 'warning');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: '#28a745', label: 'Active' },
      COMPLETED: { color: '#0d6efd', label: 'Completed' },
      EXTENDED: { color: '#17a2b8', label: 'Extended' },
      TERMINATED: { color: '#dc3545', label: 'Terminated' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: '#6c757d', label: status };

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <Text style={styles.statusText}>{config.label}</Text>
      </View>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text>Loading projects...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="work" size={28} color={colors.text} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Project Management</Text>
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.userInfo}>{user?.username || 'User'}</Text>
            {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
              <Button
                title="Add New Project"
                onPress={() => onNavigate('AddProject')}
                size="small"
              />
            )}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="work" size={20} color="white" />
                <Text style={styles.cardTitle}>Project List</Text>
              </View>
              {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
                <TouchableOpacity style={styles.addButton} onPress={() => onNavigate('AddProject')}>
                  <MaterialIcons name="add-circle" size={16} color="white" />
                  <Text style={styles.addButtonText}>Add New Project</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.cardBody}>
              {/* Search Section */}
              <View style={styles.searchSection}>
                <View style={styles.searchRow}>
                  <View style={styles.searchBox}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search projects by name, client company, or job title..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.searchButton}>
                      <MaterialIcons name="search" size={16} color="white" />
                      <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Projects Table */}
              {filteredProjects.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="work" size={64} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No Projects Found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No projects found matching your search criteria.' : 'Start by creating your first project.'}
                  </Text>
                  {searchQuery && (
                    <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
                      <MaterialIcons name="refresh" size={16} color={colors.textSecondary} />
                      <Text style={styles.clearSearchText}>Clear Search</Text>
                    </TouchableOpacity>
                  )}
                  {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && !searchQuery && (
                    <Button
                      title="Create First Project"
                      onPress={() => onNavigate('AddProject')}
                      style={styles.emptyActionButton}
                    />
                  )}
                </View>
              ) : (
                <View style={styles.tableContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
                    <View style={styles.table}>
                      {/* Table Header */}
                      <View style={styles.tableHeader}>
                        <View style={[styles.tableHeaderCell, styles.projectNameColumn]}>
                          <Text style={styles.tableHeaderText}>Project Name</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.clientColumn]}>
                          <Text style={styles.tableHeaderText}>Client Company</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.jobTitleColumn]}>
                          <Text style={styles.tableHeaderText}>Job Title</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.dateColumn]}>
                          <Text style={styles.tableHeaderText}>Start Date</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.dateColumn]}>
                          <Text style={styles.tableHeaderText}>End Date</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.statusColumn]}>
                          <Text style={styles.tableHeaderText}>Status</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.payRateColumn]}>
                          <Text style={styles.tableHeaderText}>Pay Rate</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.actionsColumn]}>
                          <Text style={styles.tableHeaderText}>Actions</Text>
                        </View>
                      </View>
                      
                      {/* Table Body */}
                      <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={true}>
                        {filteredProjects.map((project, index) => (
                          <View key={project.id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                            <View style={[styles.tableCell, styles.projectNameColumn]}>
                              <Text style={styles.projectName}>{project.projectName}</Text>
                              <Text style={styles.projectSubtitle}>{project.jobTitle}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.clientColumn]}>
                              <Text style={styles.tableCellText}>{project.clientCompanyName}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.jobTitleColumn]}>
                              <Text style={styles.tableCellText}>{project.jobTitle}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.dateColumn]}>
                              <Text style={styles.tableCellText}>{formatDate(project.projectStartDate)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.dateColumn]}>
                              <Text style={styles.tableCellText}>
                                {project.projectEndDate ? formatDate(project.projectEndDate) : 'Ongoing'}
                              </Text>
                            </View>
                            <View style={[styles.tableCell, styles.statusColumn]}>
                              {getStatusBadge(project.status)}
                            </View>
                            <View style={[styles.tableCell, styles.payRateColumn]}>
                              <Text style={styles.tableCellText}>
                                {project.candidatePayRate ? formatCurrency(project.candidatePayRate) : 'N/A'}
                              </Text>
                            </View>
                            <View style={[styles.tableCell, styles.actionsColumn]}>
                              <View style={styles.actionButtons}>
                                <TouchableOpacity
                                  style={[styles.actionButton, styles.viewButton]}
                                  onPress={() => onNavigate('ViewProject', { id: project.id })}
                                >
                                  <MaterialIcons name="visibility" size={14} color="white" />
                                </TouchableOpacity>
                                {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
                                  <>
                                    <TouchableOpacity
                                      style={[styles.actionButton, styles.editButton]}
                                      onPress={() => onNavigate('EditProject', { id: project.id })}
                                    >
                                      <MaterialIcons name="edit" size={14} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={[styles.actionButton, styles.deleteButton]}
                                      onPress={() => handleDelete(project.id)}
                                    >
                                      <MaterialIcons name="delete" size={14} color="white" />
                                    </TouchableOpacity>
                                  </>
                                )}
                              </View>
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </ScrollView>
                </View>
              )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 20,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  horizontalScroll: {
    maxHeight: 600,
  },
  table: {
    minWidth: 1400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#343a40',
  },
  tableHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#495057',
    justifyContent: 'center',
  },
  tableHeaderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 500,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    backgroundColor: colors.surface,
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  projectNameColumn: { width: 200 },
  clientColumn: { width: 180 },
  jobTitleColumn: { width: 150 },
  dateColumn: { width: 120 },
  statusColumn: { width: 100 },
  payRateColumn: { width: 100 },
  actionsColumn: { width: 120 },
  projectName: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 14,
  },
  projectSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#17a2b8',
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clearSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    marginBottom: 16,
    gap: 4,
  },
  clearSearchText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyActionButton: {
    marginTop: 16,
  },
});