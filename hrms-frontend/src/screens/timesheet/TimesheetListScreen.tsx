import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Button, Chip, DataTable, Searchbar, Menu, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchTimesheets, approveTimesheet, rejectTimesheet } from '../../store/slices/timesheetSlice';
import { theme } from '../../theme';
import StatusChip from '../../components/common/StatusChip';

export default function TimesheetListScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const dispatch = useDispatch<AppDispatch>();
  const { timesheets, loading, error } = useSelector((state: RootState) => state.timesheet);
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');
  const isHR = user?.roles?.some(role => role.name === 'HR');
  const isEmployee = user?.roles?.some(role => role.name === 'EMPLOYEE');

  useEffect(() => {
    dispatch(fetchTimesheets({ 
      status: statusFilter,
      search: searchQuery,
      page,
      size: itemsPerPage 
    }));
  }, [dispatch, statusFilter, searchQuery, page, itemsPerPage]);

  const handleApprove = async (timesheetId: number) => {
    try {
      await dispatch(approveTimesheet({ id: timesheetId, comments: '' })).unwrap();
      dispatch(fetchTimesheets({ status: statusFilter, search: searchQuery, page, size: itemsPerPage }));
    } catch (error) {
      console.error('Failed to approve timesheet:', error);
    }
  };

  const handleReject = async (timesheetId: number) => {
    try {
      await dispatch(rejectTimesheet({ id: timesheetId, comments: 'Rejected by manager' })).unwrap();
      dispatch(fetchTimesheets({ status: statusFilter, search: searchQuery, page, size: itemsPerPage }));
    } catch (error) {
      console.error('Failed to reject timesheet:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return '#6c757d';
      case 'SUBMITTED': return '#ffc107';
      case 'APPROVED': return '#198754';
      case 'REJECTED': return '#dc3545';
      case 'PAID': return '#20c997';
      default: return '#6c757d';
    }
  };

  const renderTimesheetRow = (timesheet: any) => (
    <DataTable.Row key={timesheet.id}>
      <DataTable.Cell>{timesheet.id}</DataTable.Cell>
      <DataTable.Cell>
        <View>
          <Text style={styles.employeeName}>
            {timesheet.employee?.firstName} {timesheet.employee?.lastName}
          </Text>
          <Text style={styles.employeeEmail}>
            {timesheet.employee?.workEmail || timesheet.employee?.personalEmail}
          </Text>
        </View>
      </DataTable.Cell>
      <DataTable.Cell>
        <Text>{timesheet.weekStartDate} - {timesheet.weekEndDate}</Text>
      </DataTable.Cell>
      <DataTable.Cell numeric>{timesheet.totalHoursLogged || 0}</DataTable.Cell>
      <DataTable.Cell numeric>{timesheet.totalBillableHours || 0}</DataTable.Cell>
      <DataTable.Cell numeric>{timesheet.totalOvertimeHours || 0}</DataTable.Cell>
      <DataTable.Cell numeric>${timesheet.totalPayableAmount?.toFixed(2) || '0.00'}</DataTable.Cell>
      <DataTable.Cell>
        <Chip 
          style={{ backgroundColor: getStatusColor(timesheet.status) }}
          textStyle={{ color: 'white', fontSize: 10 }}
        >
          {timesheet.status}
        </Chip>
      </DataTable.Cell>
      <DataTable.Cell>
        <Text style={styles.dateText}>
          {timesheet.submittedOn ? new Date(timesheet.submittedOn).toLocaleDateString() : '-'}
        </Text>
      </DataTable.Cell>
      <DataTable.Cell>
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            compact
            onPress={() => navigation.navigate('TimesheetView', { timesheetId: timesheet.id })}
            icon="eye"
            style={styles.actionButton}
          >
            View
          </Button>
          {timesheet.status === 'DRAFT' && (
            <Button
              mode="outlined"
              compact
              onPress={() => navigation.navigate('TimesheetForm', { timesheetId: timesheet.id })}
              icon="pencil"
              style={styles.actionButton}
            >
              Edit
            </Button>
          )}
          {timesheet.status === 'SUBMITTED' && (isAdmin || isHR) && (
            <>
              <Button
                mode="contained"
                compact
                onPress={() => handleApprove(timesheet.id)}
                icon="check"
                buttonColor={theme.colors.success}
                style={styles.actionButton}
              >
                Approve
              </Button>
              <Button
                mode="contained"
                compact
                onPress={() => handleReject(timesheet.id)}
                icon="close"
                buttonColor={theme.colors.error}
                style={styles.actionButton}
              >
                Reject
              </Button>
            </>
          )}
        </View>
      </DataTable.Cell>
    </DataTable.Row>
  );

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Paid', value: 'PAID' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            <Ionicons name="time" size={28} color={theme.colors.primary} />
            {' '}Timesheets Management
          </Text>
          <Text style={styles.headerSubtitle}>
            {isAdmin ? 'Administrator View' : isHR ? 'HR Manager View' : 'Employee View'}
          </Text>
        </View>
        <Button
          mode="outlined"
          onPress={() => navigation.openDrawer()}
          icon="menu"
          compact
        >
          Menu
        </Button>
      </View>

      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Search timesheets..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <Menu
          visible={showFilterMenu}
          onDismiss={() => setShowFilterMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowFilterMenu(true)}
              icon="filter"
              style={styles.filterButton}
            >
              Status: {statusOptions.find(opt => opt.value === statusFilter)?.label || 'All'}
            </Button>
          }
        >
          {statusOptions.map((option) => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                setStatusFilter(option.value);
                setShowFilterMenu(false);
              }}
              title={option.label}
            />
          ))}
        </Menu>
      </View>

      <Card style={styles.tableCard}>
        <Card.Title 
          title="Timesheets List" 
          left={(props) => <Ionicons {...props} name="list" size={24} />}
        />
        <Card.Content>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>ID</DataTable.Title>
                <DataTable.Title>Employee</DataTable.Title>
                <DataTable.Title>Week Period</DataTable.Title>
                <DataTable.Title numeric>Total Hours</DataTable.Title>
                <DataTable.Title numeric>Billable Hours</DataTable.Title>
                <DataTable.Title numeric>Overtime Hours</DataTable.Title>
                <DataTable.Title numeric>Total Pay</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Submitted On</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {timesheets.map(renderTimesheetRow)}

              <DataTable.Pagination
                page={page}
                numberOfPages={Math.ceil(timesheets.length / itemsPerPage)}
                onPageChange={setPage}
                label={`${page * itemsPerPage + 1}-${Math.min((page + 1) * itemsPerPage, timesheets.length)} of ${timesheets.length}`}
                numberOfItemsPerPageList={[10, 25, 50]}
                numberOfItemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                showFastPaginationControls
              />
            </DataTable>
          </ScrollView>
        </Card.Content>
      </Card>

      {isEmployee && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('TimesheetForm')}
          label="Create Timesheet"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
  },
  filtersContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchbar: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    marginBottom: Platform.OS === 'web' ? 0 : theme.spacing.sm,
  },
  filterButton: {
    minWidth: Platform.OS === 'web' ? 200 : undefined,
  },
  tableCard: {
    flex: 1,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  employeeName: {
    fontWeight: '600',
    fontSize: 14,
  },
  employeeEmail: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  dateText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: theme.spacing.xs,
  },
  actionButton: {
    minWidth: Platform.OS === 'web' ? 80 : undefined,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});