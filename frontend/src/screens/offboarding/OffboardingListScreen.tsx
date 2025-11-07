import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

interface Offboarding {
  id: number;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  resignationDate: string;
  lastWorkingDay: string;
  status: string;
  reason: string;
}

interface OffboardingListScreenProps {
  onNavigate?: (route: string, params?: any) => void;
}

export const OffboardingListScreen: React.FC<OffboardingListScreenProps> = ({ onNavigate }) => {
  const [offboardings, setOffboardings] = useState<Offboarding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffboardings();
  }, []);

  const fetchOffboardings = async () => {
    try {
      const response = await apiClient.get('/api/offboarding/list');
      setOffboardings(response.data || []);
    } catch (error) {
      console.error('Error fetching offboardings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOffboardingItem = ({ item }: { item: Offboarding }) => (
    <Card style={styles.offboardingCard}>
      <View style={styles.offboardingHeader}>
        <Text style={styles.employeeName}>
          {item.employee.firstName} {item.employee.lastName}
        </Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      
      <View style={styles.offboardingDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Resignation: {new Date(item.resignationDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="event" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Last Day: {new Date(item.lastWorkingDay).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="info" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Reason: {item.reason}</Text>
        </View>
      </View>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return colors.warning;
      case 'IN_PROGRESS': return colors.primary;
      case 'COMPLETED': return colors.success;
      default: return colors.textSecondary;
    }
  };

  return (
    <Screen>
      <Header 
        title="Offboarding" 
        onBack={() => onNavigate?.('Dashboard')}
      />
      
      <FlatList
        data={offboardings}
        renderItem={renderOffboardingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchOffboardings}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="person-remove" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No offboarding processes</Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  offboardingCard: {
    marginBottom: 16,
  },
  offboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  offboardingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});