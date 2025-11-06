import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Button, Chip, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch, RootState } from '../../store';
import { theme } from '../../theme';
import GradientCard from '../../components/common/GradientCard';

export default function SelfServiceDashboardScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);

  const tickets = [
    {
      id: 1,
      ticketNumber: 'TKT-20241201-001',
      subject: 'Password Reset Request',
      category: 'IT_SUPPORT',
      priority: 'MEDIUM',
      status: 'OPEN',
      createdAt: '2024-12-01T10:00:00Z'
    },
    {
      id: 2,
      ticketNumber: 'TKT-20241130-002',
      subject: 'Leave Request',
      category: 'HR_REQUEST',
      priority: 'LOW',
      status: 'RESOLVED',
      createdAt: '2024-11-30T14:30:00Z'
    }
  ];

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'OPEN').length,
    resolvedTickets: tickets.filter(t => t.status === 'RESOLVED').length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return '#28a745';
      case 'MEDIUM': return '#ffc107';
      case 'HIGH': return '#fd7e14';
      case 'URGENT': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#ffc107';
      case 'IN_PROGRESS': return '#17a2b8';
      case 'RESOLVED': return '#28a745';
      case 'CLOSED': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'IT_SUPPORT': return 'IT Support';
      case 'HR_REQUEST': return 'HR Request';
      case 'PAYROLL': return 'Payroll';
      case 'BENEFITS': return 'Benefits';
      case 'GENERAL': return 'General';
      default: return category;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.primary} style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              <Ionicons name="headset" size={28} color="white" />
              {' '}Self Service Portal
            </Text>
            <Text style={styles.headerSubtitle}>
              Welcome, {user?.username}!
            </Text>
          </View>
          <Button
            mode="outlined"
            onPress={() => navigation.openDrawer()}
            icon="menu"
            compact
            textColor="white"
            style={styles.menuButton}
          >
            Menu
          </Button>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
            <GradientCard
              title="Total Tickets"
              value={stats.totalTickets}
              icon="ticket"
              gradient={theme.gradients.primary}
              style={styles.statCard}
            />
            <GradientCard
              title="Open Tickets"
              value={stats.openTickets}
              icon="hourglass"
              gradient={theme.gradients.warning}
              style={styles.statCard}
            />
            <GradientCard
              title="Resolved"
              value={stats.resolvedTickets}
              icon="checkmark-circle"
              gradient={theme.gradients.success}
              style={styles.statCard}
            />
          </ScrollView>
        </View>

        {/* My Support Tickets */}
        <View style={styles.ticketsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Support Tickets</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CreateTicket')}
              icon="plus"
              compact
            >
              Create Ticket
            </Button>
          </View>

          {tickets.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="inbox" size={64} color={theme.colors.outline} />
                <Text style={styles.emptyTitle}>No tickets yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first support ticket to get help with any issues.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('CreateTicket')}
                  icon="plus"
                  style={styles.emptyButton}
                >
                  Create Ticket
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.ticketsGrid}>
              {tickets.map((ticket) => (
                <Card key={ticket.id} style={styles.ticketCard}>
                  <Card.Content>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                      <Chip
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                        textStyle={{ color: 'white', fontSize: 10 }}
                      >
                        {ticket.status}
                      </Chip>
                    </View>
                    
                    <Text style={styles.ticketSubject} numberOfLines={2}>
                      {ticket.subject}
                    </Text>
                    
                    <Text style={styles.ticketCategory}>
                      {getCategoryDisplayName(ticket.category)}
                    </Text>
                    
                    <View style={styles.ticketFooter}>
                      <Text style={styles.ticketDate}>
                        <Ionicons name="calendar" size={12} />
                        {' '}{new Date(ticket.createdAt).toLocaleDateString()}
                      </Text>
                      <Chip
                        style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                        textStyle={{ color: 'white', fontSize: 10 }}
                      >
                        {ticket.priority}
                      </Chip>
                    </View>
                    
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('ViewTicket', { ticketId: ticket.id })}
                      icon="eye"
                      style={styles.viewButton}
                    >
                      View Details
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionContent}>
                <Ionicons name="document-text" size={32} color={theme.colors.primary} />
                <Text style={styles.actionTitle}>View Documents</Text>
                <Text style={styles.actionSubtitle}>Access your personal documents</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Documents')}
                  compact
                >
                  View
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionContent}>
                <Ionicons name="person" size={32} color={theme.colors.primary} />
                <Text style={styles.actionTitle}>My Profile</Text>
                <Text style={styles.actionSubtitle}>Update personal information</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Profile')}
                  compact
                >
                  View
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionContent}>
                <Ionicons name="time" size={32} color={theme.colors.primary} />
                <Text style={styles.actionTitle}>Timesheets</Text>
                <Text style={styles.actionSubtitle}>Submit and track timesheets</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('MyTimesheets')}
                  compact
                >
                  View
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionContent}>
                <Ionicons name="help-circle" size={32} color={theme.colors.primary} />
                <Text style={styles.actionTitle}>Help & Support</Text>
                <Text style={styles.actionSubtitle}>Get help with common issues</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('CreateTicket')}
                  compact
                >
                  Get Help
                </Button>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTicket')}
        label="Create Ticket"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: theme.spacing.xs,
  },
  menuButton: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statsSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    paddingVertical: theme.spacing.sm,
  },
  statCard: {
    width: 160,
    marginRight: theme.spacing.md,
  },
  ticketsSection: {
    marginBottom: theme.spacing.lg,
  },
  ticketsGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  ticketCard: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  ticketCategory: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  ticketDate: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  viewButton: {
    marginTop: theme.spacing.sm,
  },
  emptyCard: {
    borderRadius: theme.borderRadius.lg,
  },
  emptyContent: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: theme.spacing.lg,
  },
  actionsSection: {
    marginBottom: theme.spacing.xl,
  },
  actionsGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionCard: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
  },
  actionContent: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  actionSubtitle: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});