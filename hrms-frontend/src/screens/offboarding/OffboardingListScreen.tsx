import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Button, Chip, DataTable, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch, RootState } from '../../store';
import { theme } from '../../theme';
import GradientCard from '../../components/common/GradientCard';

export default function OffboardingListScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);

  const offboardings = [
    {
      id: 1,
      employee: { firstName: 'John', lastName: 'Doe', employeeId: 'EMP001', department: 'Engineering' },
      lastWorkingDay: '2024-01-31',
      reason: 'Resignation',
      status: 'IN_PROGRESS',
      initiatedDate: '2024-01-15'
    }
  ];

  const stats = {
    totalOffboardings: 5,
    inProgressOffboardings: 2,
    completedOffboardings: 2,
    cancelledOffboardings: 1
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'IN_PROGRESS': return '#17a2b8';
      case 'COMPLETED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f5f7fa', '#c3cfe2']} style={styles.background}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              <Ionicons name="exit" size={28} color={theme.colors.primary} />
              {' '}Offboarding Management
            </Text>
            <Text style={styles.headerSubtitle}>
              Employee Exit Process Management
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          <GradientCard
            title="Total Cases"
            value={stats?.totalOffboardings || 0}
            icon="people"
            gradient={theme.gradients.primary}
            style={styles.statCard}
          />
          <GradientCard
            title="In Progress"
            value={stats?.inProgressOffboardings || 0}
            icon="hourglass"
            gradient={theme.gradients.warning}
            style={styles.statCard}
          />
          <GradientCard
            title="Completed"
            value={stats?.completedOffboardings || 0}
            icon="checkmark-circle"
            gradient={theme.gradients.success}
            style={styles.statCard}
          />
          <GradientCard
            title="Cancelled"
            value={stats?.cancelledOffboardings || 0}
            icon="close-circle"
            gradient={theme.gradients.danger}
            style={styles.statCard}
          />
        </ScrollView>

        <Card style={styles.tableCard}>
          <Card.Title 
            title="Employee Offboarding Cases" 
            left={(props) => <Ionicons {...props} name="clipboard" size={24} />}
          />
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Employee</DataTable.Title>
                  <DataTable.Title>Department</DataTable.Title>
                  <DataTable.Title>Last Working Day</DataTable.Title>
                  <DataTable.Title>Reason</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>

                {offboardings.map((offboarding) => (
                  <DataTable.Row key={offboarding.id}>
                    <DataTable.Cell>
                      <View style={styles.employeeCell}>
                        <View style={styles.employeeAvatar}>
                          <Text style={styles.avatarText}>
                            {offboarding.employee?.firstName?.charAt(0)}{offboarding.employee?.lastName?.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.employeeDetails}>
                          <Text style={styles.employeeName}>
                            {offboarding.employee?.firstName} {offboarding.employee?.lastName}
                          </Text>
                          <Text style={styles.employeeId}>
                            {offboarding.employee?.employeeId}
                          </Text>
                        </View>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      {offboarding.employee?.department || 'N/A'}
                    </DataTable.Cell>
                    <DataTable.Cell>
                      {offboarding.lastWorkingDay ? new Date(offboarding.lastWorkingDay).toLocaleDateString() : 'Not set'}
                    </DataTable.Cell>
                    <DataTable.Cell>
                      {offboarding.reason || 'Not specified'}
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip 
                        style={{ backgroundColor: getStatusColor(offboarding.status) }}
                        textStyle={{ color: 'white', fontSize: 10 }}
                      >
                        {offboarding.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Button
                        mode="outlined"
                        compact
                        icon="eye"
                      >
                        View
                      </Button>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
          </Card.Content>
        </Card>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: 'white',
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
  statsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  statCard: {
    width: 200,
    marginRight: theme.spacing.md,
  },
  tableCard: {
    flex: 1,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    elevation: 4,
  },
  employeeCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontWeight: '600',
    fontSize: 14,
    color: theme.colors.text,
  },
  employeeId: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
});