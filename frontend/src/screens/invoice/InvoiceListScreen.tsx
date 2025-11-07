import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

interface Invoice {
  id: number;
  invoiceId: string;
  project: {
    projectName: string;
    clientName?: string;
  };
  clientName: string;
  totalAmount: number;
  status: 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  invoiceDate: string;
  paymentDueDate: string;
  description?: string;
}

interface InvoiceStats {
  pending: number;
  sent: number;
  paid: number;
  overdue: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

interface InvoiceListScreenProps {
  onNavigate?: (route: string, params?: any) => void;
}

export const InvoiceListScreen: React.FC<InvoiceListScreenProps> = ({ onNavigate }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await apiClient.get('/api/invoice/dashboard');
      setInvoices(response.data.invoices || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const handleMarkAsSent = async (invoiceId: number) => {
    try {
      await apiClient.post(`/api/invoice/mark-sent/${invoiceId}`);
      Alert.alert('Success', 'Invoice marked as sent');
      fetchInvoices();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark invoice as sent');
    }
  };

  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await apiClient.post(`/api/invoice/mark-paid/${invoiceId}`);
      Alert.alert('Success', 'Invoice marked as paid');
      fetchInvoices();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark invoice as paid');
    }
  };

  const renderStatsCard = (title: string, value: number, icon: string, color: string, isAmount = false) => (
    <Card style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <MaterialIcons name={icon as any} size={24} color={color} />
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>
            {isAmount ? `$${value.toLocaleString()}` : value.toString()}
          </Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
      </View>
    </Card>
  );

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <Card style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>{item.invoiceId}</Text>
          <Text style={styles.projectName}>{item.project?.projectName || 'N/A'}</Text>
          <Text style={styles.clientName}>{item.clientName}</Text>
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${item.totalAmount.toLocaleString()}</Text>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Invoice: {new Date(item.invoiceDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Due: {new Date(item.paymentDueDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {(item.status === 'PENDING' || item.status === 'SENT') && (
        <View style={styles.actionButtons}>
          {item.status === 'PENDING' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.sentButton]}
              onPress={() => handleMarkAsSent(item.id)}
            >
              <MaterialIcons name="send" size={16} color="white" />
              <Text style={styles.actionButtonText}>Mark Sent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionButton, styles.paidButton]}
            onPress={() => handleMarkAsPaid(item.id)}
          >
            <MaterialIcons name="check-circle" size={16} color="white" />
            <Text style={styles.actionButtonText}>Mark Paid</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return colors.success;
      case 'PENDING': return '#ffc107';
      case 'SENT': return colors.primary;
      case 'OVERDUE': return colors.danger;
      case 'CANCELLED': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  return (
    <Screen>
      <Header 
        title="Invoice Management" 
        onBack={() => onNavigate?.('Dashboard')}
      />
      
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatsCard('Pending', stats.pending, 'pending', '#ffc107')}
            {renderStatsCard('Sent', stats.sent, 'send', colors.primary)}
          </View>
          <View style={styles.statsRow}>
            {renderStatsCard('Paid', stats.paid, 'check-circle', colors.success)}
            {renderStatsCard('Overdue', stats.overdue, 'warning', colors.danger)}
          </View>
          <View style={styles.statsRow}>
            {renderStatsCard('Total Paid', stats.totalPaidAmount, 'attach-money', colors.success, true)}
            {renderStatsCard('Pending Amount', stats.totalPendingAmount, 'schedule', '#ffc107', true)}
          </View>
        </View>
      )}
      
      <FlatList
        data={invoices}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={styles.emptySubtext}>Invoices will appear here once generated from approved timesheets</Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    borderLeftWidth: 4,
    paddingVertical: 12,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 12,
    flex: 1,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  invoiceCard: {
    marginBottom: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  projectName: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  clientName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  invoiceDetails: {
    gap: 8,
    marginBottom: 12,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  sentButton: {
    backgroundColor: colors.primary,
  },
  paidButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});