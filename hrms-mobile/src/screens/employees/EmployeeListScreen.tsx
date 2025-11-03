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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/services/api';
import { API_CONFIG } from '@/constants/config';
import { Employee } from '@/types';
import Card from '@/components/common/Card';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { getInitials } from '@/utils/helpers';

const EmployeeListScreen: React.FC<any> = ({ navigation }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.EMPLOYEES);
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  useEffect(() => {
    if (searchQuery) {
      const filtered = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.workEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchQuery, employees]);
  
  const renderEmployee = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EmployeeView', { employeeId: item.id })}
    >
      <Card>
        <View style={styles.employeeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(`${item.firstName} ${item.lastName}`)}
            </Text>
          </View>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.employeeDetail}>{item.jobTitle}</Text>
            <Text style={styles.employeeDetail}>{item.employeeId}</Text>
          </View>
          <View style={styles.employeeActions}>
            <StatusBadge status={item.status} size="small" />
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
  
  if (isLoading && employees.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray[400]}
          />
        </View>
        <Button
          title="Add Employee"
          onPress={() => navigation.navigate('EmployeeAdd')}
          icon={<Ionicons name="add" size={20} color={colors.white} />}
        />
      </View>
      
      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployee}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchEmployees} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No employees found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  list: {
    padding: spacing.md,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  employeeDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  employeeActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

export default EmployeeListScreen;

