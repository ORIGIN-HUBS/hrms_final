import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Button, DataTable } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch, RootState } from '../../store';
import { theme } from '../../theme';
import GradientCard from '../../components/common/GradientCard';

export default function InvoiceDashboardScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = {
    pendingCount: 12,
    sentCount: 8,
    paidCount: 25,
    overdueCount: 3,
    totalPaidAmount: 15420.50,
    totalPendingAmount: 8750.00
  };

  const pendingInvoices = [
    {
      id: 1,
      invoiceId: 'INV-202410-001',
      clientName: 'TechCorp Inc',
      vendorName: 'VendorCorp',
      totalAmount: 2400.00,
      periodStart: '2024-10-01',
      periodEnd: '2024-10-07'
    },
    {
      id: 2,
      invoiceId: 'INV-202410-002',
      clientName: 'StartupXYZ',
      vendorName: 'ConsultingCorp',
      totalAmount: 3200.00,
      periodStart: '2024-10-08',
      periodEnd: '2024-10-14'
    }
  ];

  const overdueInvoices = [
    {
      id: 3,
      invoiceId: 'INV-202409-012',
      clientName: 'TechCorp Inc',
      vendorName: 'VendorCorp',
      totalAmount: 3600.00,
      paymentDueDate: '2024-09-30'
    }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f1f5f9', '#e2e8f0']} style={styles.background}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              <Ionicons name="receipt" size={28} color={theme.colors.primary} />
              {' '}Invoice Dashboard
            </Text>
            <Text style={styles.breadcrumb}>
              Dashboard → Invoices
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Statistics Cards */}
          <View style={styles.statsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
              <GradientCard
                title="Pending Invoices"
                value={stats.pendingCount}
                icon="hourglass"
                gradient={['#d97706', '#f59e0b']}
                style={styles.statCard}
              />
              <GradientCard
                title="Sent Invoices"
                value={stats.sentCount}
                icon="send"
                gradient={['#0ea5e9', '#3b82f6']}
                style={styles.statCard}
              />
              <GradientCard
                title="Paid Invoices"
                value={stats.paidCount}
                icon="checkmark-circle"
                gradient={['#059669', '#10b981']}
                style={styles.statCard}
              />
              <GradientCard
                title="Overdue Invoices"
                value={stats.overdueCount}
                icon="warning"
                gradient={['#dc2626', '#ef4444']}
                style={styles.statCard}
              />
            </ScrollView>
          </View>

          {/* Quick Actions & Financial Summary */}
          <View style={styles.actionsRow}>
            <Card style={[styles.actionCard, styles.flex1]}>
              <Card.Title title="Quick Actions" />
              <Card.Content>
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('InvoiceGenerate')}
                    icon="plus-circle"
                    style={styles.generateButton}
                  >
                    Generate Invoice
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('InvoiceList')}
                    icon="list"
                    style={styles.actionButton}
                  >
                    View All Invoices
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <Card style={[styles.actionCard, styles.flex1, styles.marginLeft]}>
              <Card.Title title="Financial Summary" />
              <Card.Content>
                <View style={styles.financialSummary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Paid (This Month)</Text>
                    <Text style={styles.summaryValueSuccess}>
                      ${stats.totalPaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Outstanding Amount</Text>
                    <Text style={styles.summaryValueWarning}>
                      ${stats.totalPendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* Pending Invoices */}
          <Card style={styles.tableCard}>
            <Card.Title 
              title={
                <View style={styles.cardTitleWithBadge}>
                  <Ionicons name="time" size={20} color="#d97706" />
                  <Text style={styles.cardTitle}>Pending Invoices</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pendingInvoices.length}</Text>
                  </View>
                </View>
              }
            />
            <Card.Content>
              {pendingInvoices.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt" size={64} color={theme.colors.outline} />
                  <Text style={styles.emptyTitle}>No Pending Invoices</Text>
                  <Text style={styles.emptySubtitle}>All invoices have been processed.</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Invoice ID</DataTable.Title>
                      <DataTable.Title>Client</DataTable.Title>
                      <DataTable.Title>Vendor</DataTable.Title>
                      <DataTable.Title numeric>Amount</DataTable.Title>
                      <DataTable.Title>Period</DataTable.Title>
                      <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {pendingInvoices.map((invoice) => (
                      <DataTable.Row key={invoice.id}>
                        <DataTable.Cell>
                          <Text style={styles.invoiceId}>{invoice.invoiceId}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell>{invoice.clientName}</DataTable.Cell>
                        <DataTable.Cell>{invoice.vendorName}</DataTable.Cell>
                        <DataTable.Cell numeric>
                          <Text style={styles.amount}>
                            ${invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.period}>
                            {new Date(invoice.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                            {new Date(invoice.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Button
                            mode="outlined"
                            compact
                            onPress={() => navigation.navigate('InvoiceView', { invoiceId: invoice.id })}
                            icon="eye"
                            style={styles.viewButton}
                          >
                            View
                          </Button>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                </ScrollView>
              )}
            </Card.Content>
          </Card>

          {/* Overdue Invoices */}
          {overdueInvoices.length > 0 && (
            <Card style={styles.tableCard}>
              <Card.Title 
                title={
                  <View style={styles.cardTitleWithBadge}>
                    <Ionicons name="warning" size={20} color="#dc2626" />
                    <Text style={[styles.cardTitle, styles.dangerText]}>Overdue Invoices</Text>
                    <View style={[styles.badge, styles.dangerBadge]}>
                      <Text style={styles.badgeText}>{overdueInvoices.length}</Text>
                    </View>
                  </View>
                }
              />
              <Card.Content>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Invoice ID</DataTable.Title>
                      <DataTable.Title>Client</DataTable.Title>
                      <DataTable.Title>Vendor</DataTable.Title>
                      <DataTable.Title numeric>Amount</DataTable.Title>
                      <DataTable.Title>Due Date</DataTable.Title>
                      <DataTable.Title>Days Overdue</DataTable.Title>
                      <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {overdueInvoices.map((invoice) => {
                      const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.paymentDueDate).getTime()) / (1000 * 3600 * 24));
                      return (
                        <DataTable.Row key={invoice.id}>
                          <DataTable.Cell>
                            <Text style={styles.invoiceId}>{invoice.invoiceId}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell>{invoice.clientName}</DataTable.Cell>
                          <DataTable.Cell>{invoice.vendorName}</DataTable.Cell>
                          <DataTable.Cell numeric>
                            <Text style={[styles.amount, styles.dangerText]}>
                              ${invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text style={styles.dangerText}>
                              {new Date(invoice.paymentDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <View style={[styles.badge, styles.dangerBadge]}>
                              <Text style={styles.badgeText}>{daysOverdue} days</Text>
                            </View>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Button
                              mode="outlined"
                              compact
                              onPress={() => navigation.navigate('InvoiceView', { invoiceId: invoice.id })}
                              icon="eye"
                              style={styles.viewButton}
                            >
                              View
                            </Button>
                          </DataTable.Cell>
                        </DataTable.Row>
                      );
                    })}
                  </DataTable>
                </ScrollView>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
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
  breadcrumb: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statsSection: {
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    paddingVertical: theme.spacing.sm,
  },
  statCard: {
    width: 200,
    marginRight: theme.spacing.md,
  },
  actionsRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionCard: {
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: Platform.OS === 'web' ? theme.spacing.md : 0,
  },
  actionButtons: {
    gap: theme.spacing.sm,
  },
  generateButton: {
    backgroundColor: '#059669',
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    borderColor: theme.colors.primary,
  },
  financialSummary: {
    gap: theme.spacing.md,
  },
  summaryItem: {
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  summaryValueSuccess: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  summaryValueWarning: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d97706',
  },
  tableCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
  },
  cardTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  badge: {
    backgroundColor: '#d97706',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  dangerBadge: {
    backgroundColor: '#dc2626',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dangerText: {
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  invoiceId: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  amount: {
    fontWeight: '600',
  },
  period: {
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
});