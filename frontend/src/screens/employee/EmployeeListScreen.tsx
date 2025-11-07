import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { employeeService } from '../../api/employeeService';
import { colors } from '../../constants/colors';
import { Employee } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

interface EmployeeListScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const EmployeeListScreen: React.FC<EmployeeListScreenProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [bulkDeleteDialogVisible, setBulkDeleteDialogVisible] = useState(false);
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // Debug user roles
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User roles:', user?.roles);
  }, [user]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, statusFilter]);

  const handleRefresh = () => {
    loadEmployees(true);
  };

  const handleBulkDelete = () => {
    if (selectedEmployees.length === 0) {
      showAlert('Please select employees to delete', 'warning');
      return;
    }

    setBulkDeleteDialogVisible(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedEmployees.map(id => employeeService.delete(id)));
      setSelectedEmployees([]);
      setBulkDeleteDialogVisible(false);
      loadEmployees();
      showAlert(`Successfully deleted ${selectedEmployees.length} employee(s)`, 'success');
    } catch (error) {
      showAlert('Failed to delete some employees', 'error');
    }
  };

  const toggleEmployeeSelection = (id: number) => {
    setSelectedEmployees(prev => 
      prev.includes(id) 
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const loadEmployees = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(employee => employee.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(employee =>
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.workEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleDelete = (id: number) => {
    console.log('Delete button clicked for employee ID:', id);
    setEmployeeToDelete(id);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setDeleteDialogVisible(false);

    try {
      console.log('Attempting to delete employee with ID:', employeeToDelete);
      await employeeService.delete(employeeToDelete);
      console.log('Delete successful, reloading employees...');
      loadEmployees();
      
      if (Platform.OS === 'web') {
        alert('✓ Employee deleted successfully');
      } else {
        Alert.alert('Success', 'Employee deleted successfully');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response);
      let errorMessage = 'Failed to delete employee';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to delete employees';
        } else if (error.response.status === 404) {
          errorMessage = 'Employee not found';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      if (Platform.OS === 'web') {
        alert('✗ ' + errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setEmployeeToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: '#28a745', icon: 'check-circle' as const, label: 'Active' },
      ONBOARDING: { color: '#ffc107', icon: 'person-add' as const, label: 'Onboarding' },
      OFFBOARDING: { color: '#dc3545', icon: 'person-remove' as const, label: 'Offboarding' },
      TERMINATED: { color: '#6c757d', icon: 'cancel' as const, label: 'Terminated' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <MaterialIcons name={config.icon} size={12} color="white" />
        <Text style={styles.statusText}>{config.label}</Text>
      </View>
    );
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.employeeId}>ID: {item.employeeId}</Text>
        </View>
        {getStatusBadge(item.status)}
      </View>

      <View style={styles.employeeDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="email" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.workEmail || item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="work" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.jobTitle}</Text>
        </View>
        {item.phoneNumber && (
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{item.phoneNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onNavigate('ViewEmployee', { id: item.id })}
        >
          <MaterialIcons name="visibility" size={18} color="white" />
        </TouchableOpacity>

        {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onNavigate('EditEmployee', { id: item.id })}
            >
              <MaterialIcons name="edit" size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.documentsButton]}
              onPress={() => onNavigate('EmployeeDocuments', { id: item.id })}
            >
              <MaterialIcons name="description" size={18} color="white" />
            </TouchableOpacity>
          </>
        )}

        {user?.roles?.includes('ROLE_ADMIN') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              console.log('Delete button clicked for employee ID:', item.id);
              handleDelete(item.id);
            }}
          >
            <MaterialIcons name="delete" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text>Loading employees...</Text>
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
            <MaterialIcons name="people" size={28} color={colors.text} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Employee Management</Text>
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.userInfo}>{user?.username || 'User'}</Text>
            {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
              <Button
                title="Add New Employee"
                onPress={() => onNavigate('AddEmployee')}
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
                <MaterialIcons name="people" size={20} color="white" />
                <Text style={styles.cardTitle}>Employee List</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              {/* Search and Filter Section */}
              <View style={styles.searchSection}>
                <View style={styles.searchRow}>
                  <View style={styles.searchBox}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.searchButton}>
                      <MaterialIcons name="search" size={16} color="white" />
                      <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Status:</Text>
                    <View style={styles.statusFilter}>
                      {['ALL', 'ACTIVE', 'ONBOARDING', 'OFFBOARDING', 'TERMINATED'].map(status => (
                        <TouchableOpacity
                          key={status}
                          style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
                          onPress={() => setStatusFilter(status)}
                        >
                          <Text style={[styles.filterButtonText, statusFilter === status && styles.filterButtonTextActive]}>
                            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <View style={styles.leftActions}>
                    <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                      <MaterialIcons name="refresh" size={16} color={colors.primary} />
                      <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                    {selectedEmployees.length > 0 && user?.roles?.includes('ROLE_ADMIN') && (
                      <TouchableOpacity style={styles.bulkDeleteButton} onPress={handleBulkDelete}>
                        <MaterialIcons name="delete" size={16} color="white" />
                        <Text style={styles.bulkDeleteButtonText}>Delete Selected ({selectedEmployees.length})</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.totalCount}>
                    Showing: <Text style={styles.totalCountBold}>{filteredEmployees.length}</Text> of {employees.length} employees
                  </Text>
                </View>
              </View>

              {/* Employee Table */}
              {filteredEmployees.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="people" size={64} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No employees found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No employees found matching your search criteria.' : 'Start by creating your first employee.'}
                  </Text>
                  {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && !searchQuery && (
                    <Button
                      title="Add First Employee"
                      onPress={() => onNavigate('AddEmployee')}
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
                        {user?.roles?.includes('ROLE_ADMIN') && (
                          <View style={[styles.tableHeaderCell, styles.selectColumn]}>
                            <TouchableOpacity onPress={selectAllEmployees}>
                              <MaterialIcons 
                                name={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0 ? "check-box" : "check-box-outline-blank"} 
                                size={18} 
                                color="white" 
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                        <View style={[styles.tableHeaderCell, styles.employeeIdColumn]}>
                          <Text style={styles.tableHeaderText}>Employee ID</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.nameColumn]}>
                          <Text style={styles.tableHeaderText}>Name</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.emailColumn]}>
                          <Text style={styles.tableHeaderText}>Work Email</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.phoneColumn]}>
                          <Text style={styles.tableHeaderText}>Phone</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.jobTitleColumn]}>
                          <Text style={styles.tableHeaderText}>Job Title</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.employmentTypeColumn]}>
                          <Text style={styles.tableHeaderText}>Employment Type</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.statusColumn]}>
                          <Text style={styles.tableHeaderText}>Status</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.actionsColumn]}>
                          <Text style={styles.tableHeaderText}>Actions</Text>
                        </View>
                      </View>
                      
                      {/* Table Body */}
                      <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={true}>
                        {filteredEmployees.map((employee, index) => (
                          <View key={employee.id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                            {user?.roles?.includes('ROLE_ADMIN') && (
                              <View style={[styles.tableCell, styles.selectColumn]}>
                                <TouchableOpacity onPress={() => toggleEmployeeSelection(employee.id)}>
                                  <MaterialIcons 
                                    name={selectedEmployees.includes(employee.id) ? "check-box" : "check-box-outline-blank"} 
                                    size={18} 
                                    color={colors.primary} 
                                  />
                                </TouchableOpacity>
                              </View>
                            )}
                            <View style={[styles.tableCell, styles.employeeIdColumn]}>
                              <Text style={styles.employeeIdText}>{employee.employeeId}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.nameColumn]}>
                              <Text style={styles.employeeName}>
                                {employee.firstName} {employee.lastName}
                              </Text>
                            </View>
                            <View style={[styles.tableCell, styles.emailColumn]}>
                              <Text style={styles.tableCellText}>{employee.workEmail || employee.email}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.phoneColumn]}>
                              <Text style={styles.tableCellText}>{employee.phoneNumber || 'N/A'}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.jobTitleColumn]}>
                              <Text style={styles.tableCellText}>{employee.jobTitle}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.employmentTypeColumn]}>
                              <Text style={styles.tableCellText}>{employee.employmentType || 'Full-time'}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.statusColumn]}>
                              {getStatusBadge(employee.status)}
                            </View>
                            <View style={[styles.tableCell, styles.actionsColumn]}>
                              <View style={styles.actionButtons}>
                                <TouchableOpacity
                                  style={[styles.actionButton, styles.viewButton]}
                                  onPress={() => onNavigate('ViewEmployee', { id: employee.id })}
                                >
                                  <MaterialIcons name="visibility" size={14} color="white" />
                                </TouchableOpacity>
                                {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR')) && (
                                  <>
                                    <TouchableOpacity
                                      style={[styles.actionButton, styles.documentsButton]}
                                      onPress={() => onNavigate('EmployeeDocuments', { id: employee.id })}
                                    >
                                      <MaterialIcons name="description" size={14} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={[styles.actionButton, styles.editButton]}
                                      onPress={() => onNavigate('EditEmployee', { id: employee.id })}
                                    >
                                      <MaterialIcons name="edit" size={14} color="white" />
                                    </TouchableOpacity>
                                  </>
                                )}
                                {user?.roles?.includes('ROLE_ADMIN') && (
                                  <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => handleDelete(employee.id)}
                                  >
                                    <MaterialIcons name="delete" size={14} color="white" />
                                  </TouchableOpacity>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor={colors.danger}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        icon="delete-forever"
        iconColor={colors.danger}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={bulkDeleteDialogVisible}
        title="Delete Selected Employees"
        message={`Are you sure you want to delete ${selectedEmployees.length} employee(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        confirmColor={colors.danger}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteDialogVisible(false)}
        icon="delete-forever"
        iconColor={colors.danger}
      />
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
    justifyContent: 'space-between',
    gap: 20,
  },
  searchBox: {
    flexDirection: 'row',
    flex: 1,
    maxWidth: '70%',
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
  totalCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalCountBold: {
    fontWeight: '600',
    color: colors.text,
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
    minWidth: 1200,
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
  selectColumn: { width: 50 },
  employeeIdColumn: { width: 120 },
  nameColumn: { width: 180 },
  emailColumn: { width: 200 },
  phoneColumn: { width: 140 },
  jobTitleColumn: { width: 150 },
  employmentTypeColumn: { width: 120 },
  statusColumn: { width: 120 },
  actionsColumn: { width: 160 },
  employeeIdText: {
    fontWeight: '600',
    color: colors.text,
  },
  employeeName: {
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 2,
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
  documentsButton: {
    backgroundColor: '#6c757d',
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
  emptyActionButton: {
    marginTop: 16,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  statusFilter: {
    flexDirection: 'row',
    gap: 4,
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    gap: 4,
  },
  refreshButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  bulkDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#dc3545',
    gap: 4,
  },
  bulkDeleteButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
});