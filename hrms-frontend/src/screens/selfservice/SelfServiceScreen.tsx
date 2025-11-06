import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchTickets, fetchMyTickets } from '../../store/slices/ticketSlice';
import { SelfServiceTicket } from '../../types';
import { theme } from '../../theme';

interface TicketCardProps {
  ticket: SelfServiceTicket;
  onPress: () => void;
  showEmployee?: boolean;
}

function TicketCard({ ticket, onPress, showEmployee = false }: TicketCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return theme.colors.success;
      case 'IN_PROGRESS': return theme.colors.warning;
      case 'OPEN': return theme.colors.primary;
      case 'CLOSED': return theme.colors.disabled;
      default: return theme.colors.onSurface;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return theme.colors.error;
      case 'HIGH': return '#ff6b35';
      case 'MEDIUM': return theme.colors.warning;
      case 'LOW': return theme.colors.success;
      default: return theme.colors.onSurface;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'checkmark-circle';
      case 'IN_PROGRESS': return 'time';
      case 'OPEN': return 'mail-open';
      case 'CLOSED': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <Card style={styles.ticketCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            {showEmployee && (
              <Text style={styles.employeeName}>
                {ticket.employee.firstName} {ticket.employee.lastName}
              </Text>
            )}
          </View>
          <View style={styles.chipContainer}>
            <Chip
              style={[styles.priorityChip, { backgroundColor: getPriorityColor(ticket.priority) }]}
              textStyle={styles.chipText}
            >
              {ticket.priority}
            </Chip>
            <Chip
              icon={() => (
                <Ionicons 
                  name={getStatusIcon(ticket.status)} 
                  size={16} 
                  color="white" 
                />
              )}
              style={[styles.statusChip, { backgroundColor: getStatusColor(ticket.status) }]}
              textStyle={styles.chipText}
            >
              {ticket.status.replace('_', ' ')}
            </Chip>
          </View>
        </View>
        
        <View style={styles.ticketDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="folder" size={16} color={theme.colors.onSurface} />
            <Text style={styles.detailText}>Category: {ticket.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={theme.colors.onSurface} />
            <Text style={styles.detailText}>
              Created: {new Date(ticket.createdDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color={theme.colors.onSurface} />
            <Text style={styles.detailText}>
              Updated: {new Date(ticket.updatedDate).toLocaleDateString()}
            </Text>
          </View>
          {ticket.assignedTo && (
            <View style={styles.detailRow}>
              <Ionicons name="person" size={16} color={theme.colors.onSurface} />
              <Text style={styles.detailText}>Assigned to: {ticket.assignedTo}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {ticket.description}
        </Text>
      </Card.Content>
    </Card>
  );
}

export default function SelfServiceScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tickets, myTickets, loading } = useSelector((state: RootState) => state.ticket);

  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');
  const isHR = user?.roles?.some(role => role.name === 'HR');
  const isEmployee = user?.roles?.some(role => role.name === 'EMPLOYEE');

  useEffect(() => {
    if (isAdmin || isHR) {
      dispatch(fetchTickets());
    } else if (isEmployee) {
      dispatch(fetchMyTickets());
    }
  }, [dispatch, isAdmin, isHR, isEmployee]);

  const displayTickets = (isAdmin || isHR) ? tickets : myTickets;

  const handleTicketPress = (ticket: SelfServiceTicket) => {
    navigation.navigate('TicketDetail', { ticket });
  };

  const handleCreateTicket = () => {
    navigation.navigate('CreateTicket');
  };

  if (loading && displayTickets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Ionicons name="headset" size={28} color={theme.colors.primary} />
          {' '}{(isAdmin || isHR) ? 'Support Tickets' : 'My Tickets'}
        </Text>
        <Text style={styles.headerSubtitle}>
          Total: {displayTickets.length} tickets
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {displayTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="headset-outline" size={64} color={theme.colors.disabled} />
            <Text style={styles.emptyText}>No tickets found</Text>
            <Text style={styles.emptySubtext}>
              {isEmployee ? 'Create your first support ticket' : 'No tickets submitted yet'}
            </Text>
          </View>
        ) : (
          displayTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={() => handleTicketPress(ticket)}
              showEmployee={isAdmin || isHR}
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateTicket}
        label={Platform.OS === 'web' ? 'Create Ticket' : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  header: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  ticketCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  employeeName: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
  },
  chipContainer: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  priorityChip: {
    marginLeft: theme.spacing.sm,
  },
  statusChip: {
    marginLeft: theme.spacing.sm,
  },
  chipText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  ticketDetails: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.onSurface,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});