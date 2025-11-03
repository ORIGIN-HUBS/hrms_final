import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { apiClient } from '@/services/api';
import { API_CONFIG } from '@/constants/config';
import { SelfServiceTicket } from '@/types';
import { RootState } from '@/store';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const SelfServiceDashboardScreen: React.FC<any> = ({ navigation }) => {
  const [tickets, setTickets] = useState<SelfServiceTicket[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<SelfServiceTicket[]>(
        API_CONFIG.ENDPOINTS.SELF_SERVICE_TICKETS
      );
      const ticketData = Array.isArray(response.data) ? response.data : [];
      setTickets(ticketData);
      
      // Calculate stats
      const total = ticketData.length;
      const open = ticketData.filter(t => t.status === 'OPEN').length;
      const inProgress = ticketData.filter(t => t.status === 'IN_PROGRESS').length;
      const resolved = ticketData.filter(t => t.status === 'RESOLVED').length;
      
      setStats({ total, open, inProgress, resolved });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      Alert.alert('Error', 'Failed to load tickets');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTickets();
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return colors.warning;
      case 'IN_PROGRESS': return colors.info;
      case 'RESOLVED': return colors.success;
      case 'CLOSED': return colors.gray[500];
      default: return colors.gray[400];
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return colors.error;
      case 'MEDIUM': return colors.warning;
      case 'LOW': return colors.success;
      default: return colors.gray[400];
    }
  };
  
  const renderTicket = ({ item }: { item: SelfServiceTicket }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ViewTicket', { ticketId: item.id })}
    >
      <Card style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketNumber}>#{item.ticketNumber}</Text>
            <Text style={styles.ticketSubject} numberOfLines={2}>
              {item.subject}
            </Text>
            <Text style={styles.ticketCategory}>{item.category}</Text>
          </View>
          <View style={styles.ticketMeta}>
            <StatusBadge status={item.status} size="small" />
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20', marginTop: spacing.xs }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketDate}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.assignedTo && (
            <Text style={[styles.assignedTo, { marginTop: spacing.xs }]}>
              Assigned to: {item.assignedTo.firstName} {item.assignedTo.lastName}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
  
  const quickActions = [
    {
      title: 'Create Ticket',
      icon: 'add-circle-outline',
      color: colors.primary,
      onPress: () => navigation.navigate('CreateTicket'),
    },
    {
      title: 'My Tickets',
      icon: 'list-outline',
      color: colors.info,
      onPress: () => navigation.navigate('ViewTicket'),
    },
    {
      title: 'FAQ',
      icon: 'help-circle-outline',
      color: colors.success,
      onPress: () => Alert.alert('FAQ', 'FAQ section coming soon'),
    },
    {
      title: 'Contact HR',
      icon: 'mail-outline',
      color: colors.warning,
      onPress: () => Alert.alert('Contact', 'Contact HR feature coming soon'),
    },
  ];
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchTickets} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Self Service Portal</Text>
        <Text style={styles.subtitle}>Manage your support requests</Text>
      </View>
      
      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Tickets</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats.open}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.info }]}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </Card>
        </View>
        
        {/* Quick Actions */}
        <Card>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        
        {/* Recent Tickets */}
        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tickets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ViewTicket')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {tickets.length > 0 ? (
            <FlatList
              data={tickets.slice(0, 3)}
              renderItem={renderTicket}
              keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={48} color={colors.gray[400]} />
              <Text style={styles.emptyText}>No tickets yet</Text>
              <Text style={styles.emptySubtext}>Create your first support ticket</Text>
              <Button
                title="Create Ticket"
                onPress={() => navigation.navigate('CreateTicket')}
                style={styles.createButton}
                icon={<Ionicons name="add" size={20} color={colors.white} />}
              />
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginRight: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    margin: spacing.xs,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  ticketCard: {
    marginBottom: spacing.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  ticketSubject: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  ticketCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  ticketMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
  },
  ticketDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  assignedTo: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  createButton: {
    paddingHorizontal: spacing.xl,
  },
});

export default SelfServiceDashboardScreen;
