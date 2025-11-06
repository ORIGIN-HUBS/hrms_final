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
import { employeeService } from '@/services/employeeService';
import { Employee } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { gradients } from '@/theme/colors';

const EmployeeListScreen: React.FC<any> = ({ navigation }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await employeeService.getAllEmployees();
      console.log('Employees fetched:', response?.length || 0);
      setEmployees(response || []);
      setFilteredEmployees(response || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', error.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  useEffect(() => {
    let filtered = employees;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.workEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(emp => emp.employmentType === typeFilter);
    }
    
    setFilteredEmployees(filtered);
  }, [searchQuery, statusFilter, typeFilter, employees]);
  
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
  
  const handleDelete = (employeeId: number) => {
    console.log('Attempting to delete employee ID:', employeeId);
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Calling deleteEmployee service...');
              await employeeService.deleteEmployee(employeeId);
              console.log('Delete successful!');
              Alert.alert('Success', 'Employee deleted successfully');
              fetchEmployees();
            } catch (error: any) {
              console.error('Delete error:', error);
              Alert.alert('Error', error.message || 'Failed to delete employee');
            }
          },
        },
      ]
    );
  };
  
  const renderEmployeeRow = ({ item }: { item: Employee }) => (
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text style={styles.cellText} numberOfLines={1}>{item.employeeId || '-'}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellTextBold} numberOfLines={1}>
          {item.firstName} {item.lastName}
        </Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText} numberOfLines={1}>{item.workEmail || '-'}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.cellText} numberOfLines={1}>{item.contactNumber || '-'}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.2 }]}>
        <Text style={styles.cellText} numberOfLines={1}>{item.jobTitle || '-'}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.cellText} numberOfLines={1}>{item.employmentType || '-'}</Text>
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
            onPress={() => navigation.navigate('EmployeeView', { employeeId: item.id })}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EmployeeEdit', { employeeId: item.id })}
          >
            <Ionicons name="create-outline" size={18} color={colors.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EmployeeDocuments', { employeeId: item.id })}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.success} />
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
  
  if (isLoading && employees.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.primary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Employee Management</Text>
        <Text style={styles.headerSubtitle}>{filteredEmployees.length} employees found</Text>
      </LinearGradient>
      
      <View style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.filtersCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.gray[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, ID, email, or phone..."
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
                {['ALL', 'ACTIVE', 'INACTIVE', 'ON_LEAVE'].map((status) => (
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
                      {status === 'ON_LEAVE' ? 'On Leave' : status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Type:</Text>
              <View style={styles.filterButtons}>
                {['ALL', 'FULL_TIME', 'PART_TIME', 'CONTRACT'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      typeFilter === type && styles.filterButtonActive,
                    ]}
                    onPress={() => setTypeFilter(type)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        typeFilter === type && styles.filterButtonTextActive,
                      ]}
                    >
                      {type.replace('_', ' ')}
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
                  <Text style={styles.headerText}>Name</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.headerText}>Email</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>Phone</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1.2 }]}>
                  <Text style={styles.headerText}>Job Title</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.headerText}>Type</Text>
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
                data={filteredEmployees}
                renderItem={renderEmployeeRow}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl refreshing={isLoading} onRefresh={fetchEmployees} />
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={64} color={colors.gray[300]} />
                    <Text style={styles.emptyText}>No employees found</Text>
                    <Text style={styles.emptySubtext}>
                      {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                        ? 'Try adjusting your filters'
                        : 'Add your first employee to get started'}
                    </Text>
                  </View>
                }
              />
            </View>
          </ScrollView>
        </View>
      </View>
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
});

export default EmployeeListScreen;
