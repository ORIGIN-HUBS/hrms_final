import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Text, Card, Button, Searchbar, DataTable, Modal, Portal, TextInput, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch, RootState } from '../../store';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import StatusChip from '../../components/common/StatusChip';

export default function EmployeeListScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading, error } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');
  const isHR = user?.roles?.some(role => role.name === 'HR');

  useEffect(() => {
    dispatch(fetchEmployees({ search: searchQuery }));
  }, [dispatch, searchQuery]);

  const generateResetLink = async (employeeId: number) => {
    try {
      // Mock API call - replace with actual implementation
      const mockLink = `http://localhost:8080/auth/reset-password?token=mock-token-${employeeId}`;
      setResetLink(mockLink);
      setShowResetModal(true);
    } catch (error) {
      setSnackbarMessage('Failed to generate reset link. Please try again.');
      setShowSnackbar(true);
    }
  };

  const copyResetLink = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(resetLink);
    }
    setSnackbarMessage('Reset link copied to clipboard!');
    setShowSnackbar(true);
    setShowResetModal(false);
  };

  const confirmDelete = (employeeId: number, employeeName: string) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employeeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEmployee(employeeId) }
      ]
    );
  };

  const deleteEmployee = async (employeeId: number) => {
    // Mock delete - replace with actual implementation
    setSnackbarMessage('Employee deleted successfully');
    setShowSnackbar(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.navbar}>
        <View style={styles.navbarContent}>
          <View style={styles.navbarBrand}>
            <Ionicons name="people" size={24} color="#2d3748" />
            <Text style={styles.navbarTitle}>Employee Management</Text>
          </View>
          <View style={styles.navbarActions}>
            <Text style={styles.userName}>{user?.username}</Text>
            {isAdmin && <View style={[styles.roleBadge, styles.adminBadge]}><Text style={styles.badgeText}>Admin</Text></View>}
            {isHR && <View style={[styles.roleBadge, styles.hrBadge]}><Text style={styles.badgeText}>HR</Text></View>}
            <Button
              mode="outlined"
              onPress={() => navigation.openDrawer()}
              icon="logout"
              compact
              style={styles.logoutButton}
            >
              Logout
            </Button>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.mainCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.cardHeader}
          >
            <View style={styles.cardHeaderContent}>
              <View style={styles.cardTitle}>
                <Ionicons name="people" size={20} color="white" />
                <Text style={styles.cardTitleText}>Employee List</Text>
              </View>
              {(isAdmin || isHR) && (
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('EmployeeAdd')}
                  icon="person-add"
                  textColor="white"
                  style={styles.addButton}
                >
                  Add New Employee
                </Button>
              )}
            </View>
          </LinearGradient>

          <Card.Content style={styles.cardBody}>
            {/* Search and Total Count */}
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Searchbar
                  placeholder="Search employees..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={styles.searchbar}
                  icon={() => <Ionicons name="search" size={20} color="#667eea" />}
                />
              </View>
              <View style={styles.totalCount}>
                <Text style={styles.totalText}>
                  Total: <Text style={styles.totalNumber}>{employees.length}</Text> employees
                </Text>
              </View>
            </View>

            {/* Employee Table */}
            <View style={styles.tableContainer}>
              {employees.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={64} color="#e2e8f0" />
                  <Text style={styles.emptyTitle}>No employees found</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <DataTable style={styles.dataTable}>
                    <DataTable.Header style={styles.tableHeader}>
                      <DataTable.Title textStyle={styles.headerText}>Employee ID</DataTable.Title>
                      <DataTable.Title textStyle={styles.headerText}>Name</DataTable.Title>
                      <DataTable.Title textStyle={styles.headerText}>Work Email</DataTable.Title>
                      <DataTable.Title textStyle={styles.headerText}>Phone</DataTable.Title>
                      <DataTable.Title textStyle={styles.headerText}>Job Title</DataTable.Title>
                      <DataTable.Title textStyle={styles.headerText}>Employment Type</DataTable.Title>
                      <DataTable.Title textStyle={styles.headerText}>Status</DataTable.Title>
                      <DataTable.Title textStyle={styles.headerText}>Actions</DataTable.Title>
                    </DataTable.Header>

                    {employees.map((employee: any) => (
                      <DataTable.Row key={employee.id} style={styles.tableRow}>
                        <DataTable.Cell>
                          <Text style={styles.employeeId}>{employee.employeeId}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.employeeName}>
                            {employee.firstName} {employee.lastName}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.cellText}>
                            {employee.workEmail || employee.personalEmail}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.cellText}>{employee.contactNumber}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.cellText}>{employee.jobTitle}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.cellText}>{employee.employmentType}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <StatusChip status={employee.status} />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View style={styles.actionButtons}>
                            <Button
                              mode="outlined"
                              compact
                              onPress={() => navigation.navigate('EmployeeView', { employeeId: employee.id })}
                              icon="eye"
                              style={[styles.actionBtn, styles.viewBtn]}
                            />
                            
                            {(isAdmin || isHR) && (
                              <>
                                <Button
                                  mode="outlined"
                                  compact
                                  onPress={() => {/* Navigate to documents */}}
                                  icon="document-text"
                                  style={[styles.actionBtn, styles.docsBtn]}
                                />
                                <Button
                                  mode="outlined"
                                  compact
                                  onPress={() => generateResetLink(employee.id)}
                                  icon="key"
                                  style={[styles.actionBtn, styles.keyBtn]}
                                />
                                <Button
                                  mode="outlined"
                                  compact
                                  onPress={() => navigation.navigate('EmployeeEdit', { employeeId: employee.id })}
                                  icon="pencil"
                                  style={[styles.actionBtn, styles.editBtn]}
                                />
                                {employee.status === 'ACTIVE' && (
                                  <Button
                                    mode="outlined"
                                    compact
                                    onPress={() => navigation.navigate('OffboardingInitiate', { employeeId: employee.id })}
                                    icon="person-remove"
                                    style={[styles.actionBtn, styles.offboardBtn]}
                                  />
                                )}
                              </>
                            )}
                            
                            {employee.status === 'OFFBOARDING' && (
                              <Button
                                mode="outlined"
                                compact
                                onPress={() => navigation.navigate('OffboardingList', { employeeId: employee.id })}
                                icon="exit"
                                style={[styles.actionBtn, styles.infoBtn]}
                              />
                            )}
                            
                            {isAdmin && (
                              <Button
                                mode="outlined"
                                compact
                                onPress={() => confirmDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                                icon="trash"
                                style={[styles.actionBtn, styles.deleteBtn]}
                              />
                            )}
                          </View>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                </ScrollView>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Password Reset Modal */}
      <Portal>
        <Modal visible={showResetModal} onDismiss={() => setShowResetModal(false)} contentContainerStyle={styles.modal}>
          <Card>
            <Card.Title title="Password Reset Link Generated" />
            <Card.Content>
              <View style={styles.successAlert}>
                <Ionicons name="checkmark-circle" size={16} color="#22543d" />
                <Text style={styles.successText}>Password reset link has been generated successfully!</Text>
              </View>
              
              <Text style={styles.modalLabel}>Reset Link:</Text>
              <View style={styles.linkContainer}>
                <TextInput
                  value={resetLink}
                  mode="outlined"
                  style={styles.linkInput}
                  editable={false}
                />
                <Button
                  mode="outlined"
                  onPress={copyResetLink}
                  icon="content-copy"
                  compact
                >
                  Copy
                </Button>
              </View>
              
              <Text style={styles.modalNote}>
                <Ionicons name="information-circle" size={14} color="#718096" />
                {' '}This link will expire in 24 hours. Share it securely with the employee.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setShowResetModal(false)}>Close</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  navbar: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  navbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navbarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navbarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  navbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    color: '#4a5568',
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#0d6efd',
  },
  hrBadge: {
    backgroundColor: '#17a2b8',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    borderColor: '#dc3545',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainCard: {
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardBody: {
    padding: 25,
  },
  searchRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    marginBottom: 20,
    gap: 15,
  },
  searchContainer: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    maxWidth: Platform.OS === 'web' ? '50%' : undefined,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f8f9fa',
  },
  totalCount: {
    alignItems: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
  },
  totalText: {
    color: '#6c757d',
    fontSize: 14,
  },
  totalNumber: {
    fontWeight: 'bold',
    color: '#2d3748',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  dataTable: {
    backgroundColor: 'white',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  headerText: {
    fontWeight: '600',
    color: '#495057',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  employeeId: {
    fontWeight: 'bold',
    color: '#2d3748',
  },
  employeeName: {
    fontWeight: 'bold',
    color: '#2d3748',
  },
  cellText: {
    color: '#495057',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  actionBtn: {
    minWidth: 40,
    borderRadius: 6,
  },
  viewBtn: {
    borderColor: '#0d6efd',
  },
  docsBtn: {
    borderColor: '#6c757d',
  },
  keyBtn: {
    borderColor: '#17a2b8',
  },
  editBtn: {
    borderColor: '#ffc107',
  },
  offboardBtn: {
    borderColor: '#ffc107',
  },
  infoBtn: {
    borderColor: '#17a2b8',
  },
  deleteBtn: {
    borderColor: '#dc3545',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#6c757d',
    marginTop: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  successAlert: {
    backgroundColor: '#d1e7dd',
    borderLeftWidth: 4,
    borderLeftColor: '#0f5132',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#0f5132',
    fontWeight: '500',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  linkInput: {
    flex: 1,
  },
  modalNote: {
    fontSize: 12,
    color: '#6c757d',
  },
});