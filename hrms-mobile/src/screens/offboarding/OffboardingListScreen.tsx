import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { offboardingService } from '@/services/offboardingService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Offboarding } from '@/types';

const OffboardingListScreen: React.FC<any> = ({ navigation }) => {
  const [offboardings, setOffboardings] = useState<Offboarding[]>([]);
  const [filteredOffboardings, setFilteredOffboardings] = useState<Offboarding[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchOffboardings();
  }, []);

  useEffect(() => {
    let filtered = offboardings;

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((ob) => ob.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (ob) =>
          ob.employee?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ob.employee?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ob.employee?.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ob.reasonForLeaving?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOffboardings(filtered);
  }, [searchQuery, filterStatus, offboardings]);

  const fetchOffboardings = async () => {
    setIsLoading(true);
    try {
      const data = await offboardingService.getAllOffboardings();
      setOffboardings(data);
      setFilteredOffboardings(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load offboarding records');
    } finally {
      setIsLoading(false);
    }
  };

  const renderOffboarding = ({ item }: { item: Offboarding }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OffboardingView', { offboardingId: item.id })}
    >
      <Card style={styles.offboardingCard}>
        <View style={styles.offboardingHeader}>
          <View style={styles.employeeIcon}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName} numberOfLines={1}>
              {item.employee?.firstName} {item.employee?.lastName}
            </Text>
            <Text style={styles.employeeId}>{item.employee?.employeeId}</Text>
            <Text style={styles.department}>{item.employee?.jobTitle}</Text>
          </View>
          <StatusBadge status={item.status} size="small" />
        </View>

        <View style={styles.offboardingMeta}>
          {item.lastWorkingDay && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>Last Day: {item.lastWorkingDay}</Text>
            </View>
          )}
          {item.resignationDate && (
            <View style={styles.metaItem}>
              <Ionicons name="exit-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>Resigned: {item.resignationDate}</Text>
            </View>
          )}
        </View>

        {item.reasonForLeaving && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason:</Text>
            <Text style={styles.reasonText} numberOfLines={2}>
              {item.reasonForLeaving}
            </Text>
          </View>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <Ionicons
              name={item.emailRevoked ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={item.emailRevoked ? colors.success : colors.gray[400]}
            />
            <Text style={styles.progressText}>Email Revoked</Text>
          </View>
          <View style={styles.progressItem}>
            <Ionicons
              name={item.relievingLetterGenerated ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={item.relievingLetterGenerated ? colors.success : colors.gray[400]}
            />
            <Text style={styles.progressText}>Relieving Letter</Text>
          </View>
          <View style={styles.progressItem}>
            <Ionicons
              name={item.settlementStatus === 'COMPLETED' ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={item.settlementStatus === 'COMPLETED' ? colors.success : colors.gray[400]}
            />
            <Text style={styles.progressText}>Settlement</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="exit-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyStateTitle}>No Offboarding Records</Text>
      <Text style={styles.emptyStateText}>
        No offboarding processes found. Initiate a new offboarding to get started.
      </Text>
    </View>
  );

  const StatusFilter = () => (
    <View style={styles.filterContainer}>
      {['ALL', 'INITIATED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            filterStatus === status && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus(status)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterStatus === status && styles.filterButtonTextActive,
            ]}
          >
            {status.replace('_', ' ')}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search offboarding..."
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
        <Button
          title="Initiate"
          onPress={() => navigation.navigate('OffboardingInitiate')}
          icon={<Ionicons name="add" size={20} color={colors.white} />}
          style={styles.addButton}
        />
      </View>

      <StatusFilter />

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{offboardings.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {offboardings.filter((ob) => ob.status === 'IN_PROGRESS').length}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {offboardings.filter((ob) => ob.status === 'COMPLETED').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <FlatList
        data={filteredOffboardings}
        renderItem={renderOffboarding}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchOffboardings} />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
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
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  addButton: {
    paddingHorizontal: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    gap: spacing.xs,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.md,
  },
  offboardingCard: {
    marginBottom: spacing.md,
  },
  offboardingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  employeeIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  employeeId: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  department: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  offboardingMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  reasonContainer: {
    padding: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  reasonLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default OffboardingListScreen;

