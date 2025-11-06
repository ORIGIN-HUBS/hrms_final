import React from 'react';import React, { useEffect, useState } from 'react';import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';import {import {

import { spacing } from '@/theme/spacing';

import { typography } from '@/theme/typography';  View,  View,



const InvoiceDashboardScreen: React.FC = () => {  Text,  Text,

  return (

    <View style={styles.container}>  StyleSheet,  StyleSheet,

      <Text style={styles.text}>Invoice Dashboard Screen</Text>

      <Text style={styles.subtext}>Coming soon...</Text>  FlatList,  ScrollView,

    </View>

  );  TouchableOpacity,  RefreshControl,

};

  RefreshControl,  Alert,

const styles = StyleSheet.create({

  container: {  Alert,} from 'react-native';

    flex: 1,

    backgroundColor: colors.background.default,  ScrollView,import { Ionicons } from '@expo/vector-icons';

    alignItems: 'center',

    justifyContent: 'center',} from 'react-native';import { apiClient } from '@/services/api';

  },

  text: {import { Ionicons } from '@expo/vector-icons';import { API_CONFIG } from '@/constants/config';

    fontSize: typography.fontSize.xl,

    fontWeight: typography.fontWeight.bold,import { LinearGradient } from 'expo-linear-gradient';import Card from '@/components/common/Card';

    color: colors.text.primary,

    marginBottom: spacing.sm,import { apiClient } from '@/services/api';import Button from '@/components/common/Button';

  },

  subtext: {import { API_CONFIG } from '@/constants/config';import { colors } from '@/theme/colors';

    fontSize: typography.fontSize.base,

    color: colors.text.secondary,import LoadingSpinner from '@/components/common/LoadingSpinner';import { spacing } from '@/theme/spacing';

  },

});import { colors } from '@/theme/colors';import { typography } from '@/theme/typography';



export default InvoiceDashboardScreen;import { spacing } from '@/theme/spacing';


import { typography } from '@/theme/typography';const InvoiceDashboardScreen: React.FC<any> = ({ navigation, route }) => {

import { gradients } from '@/theme/colors';  const [data, setData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);

interface Invoice {  

  id: number;  const fetchData = async () => {

  invoiceNumber: string;    setIsLoading(true);

  employeeName: string;    try {

  projectName: string;      // TODO: Implement API call

  clientName: string;      // const response = await apiClient.get(API_CONFIG.ENDPOINTS.YOUR_ENDPOINT);

  period: string;      // setData(response.data);

  amount: number;    } catch (error) {

  status: string;      console.error('Error fetching data:', error);

  generatedDate: string;      Alert.alert('Error', 'Failed to load data');

}    } finally {

      setIsLoading(false);

const InvoiceDashboardScreen: React.FC<any> = ({ navigation }) => {    }

  const [invoices, setInvoices] = useState<Invoice[]>([]);  };

  const [stats, setStats] = useState({  

    totalInvoices: 0,  useEffect(() => {

    pendingAmount: 0,    fetchData();

    paidAmount: 0,  }, []);

    thisMonth: 0,  

  });  return (

  const [isLoading, setIsLoading] = useState(false);    <ScrollView

      style={styles.container}

  const fetchInvoices = async () => {      refreshControl={

    setIsLoading(true);        <RefreshControl refreshing={isLoading} onRefresh={fetchData} />

    try {      }

      console.log('Fetching invoices from:', API_CONFIG.ENDPOINTS.INVOICES);    >

      const response = await apiClient.get(API_CONFIG.ENDPOINTS.INVOICES);      <View style={styles.header}>

      console.log('Invoices fetched:', response.data);        <Text style={styles.title}>Invoices</Text>

            </View>

      if (response.data && typeof response.data === 'object') {      

        const invoicesData = response.data.invoices || [];      <View style={styles.content}>

        setInvoices(invoicesData);        <Card>

                  <Text style={styles.placeholder}>

        // Calculate stats            TODO: Implement Invoices screen

        const totalInvoices = invoicesData.length;          </Text>

        const pendingAmount = invoicesData          <Text style={styles.instructions}>

          .filter((inv: Invoice) => inv.status === 'PENDING')            This screen should display and manage Invoices data.

          .reduce((sum: number, inv: Invoice) => sum + (inv.amount || 0), 0);            Follow the patterns established in completed screens.

        const paidAmount = invoicesData          </Text>

          .filter((inv: Invoice) => inv.status === 'PAID')        </Card>

          .reduce((sum: number, inv: Invoice) => sum + (inv.amount || 0), 0);      </View>

            </ScrollView>

        setStats({  );

          totalInvoices,};

          pendingAmount,

          paidAmount,const styles = StyleSheet.create({

          thisMonth: invoicesData.filter((inv: Invoice) => {  container: {

            const generatedDate = new Date(inv.generatedDate);    flex: 1,

            const now = new Date();    backgroundColor: colors.background.default,

            return generatedDate.getMonth() === now.getMonth() &&   },

                   generatedDate.getFullYear() === now.getFullYear();  header: {

          }).length,    padding: spacing.xl,

        });    backgroundColor: colors.white,

      }  },

    } catch (error: any) {  title: {

      console.error('Error fetching invoices:', error);    fontSize: typography.fontSize['2xl'],

      Alert.alert('Error', error.message || 'Failed to load invoices');    fontWeight: typography.fontWeight.bold,

    } finally {    color: colors.text.primary,

      setIsLoading(false);  },

    }  content: {

  };    padding: spacing.md,

  },

  useEffect(() => {  placeholder: {

    fetchInvoices();    fontSize: typography.fontSize.lg,

  }, []);    fontWeight: typography.fontWeight.semibold,

    color: colors.text.primary,

  const getStatusColor = (status: string) => {    marginBottom: spacing.md,

    switch (status?.toUpperCase()) {  },

      case 'PAID':  instructions: {

        return colors.success;    fontSize: typography.fontSize.base,

      case 'PENDING':    color: colors.text.secondary,

        return colors.warning;    lineHeight: 24,

      case 'OVERDUE':  },

        return colors.danger;});

      default:

        return colors.gray[500];export default InvoiceDashboardScreen;

    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    gradient: string[];
  }> = ({ title, value, icon, gradient }) => (
    <View style={styles.statCard}>
      <View style={styles.statCardInner}>
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statAccent}
        />
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statIcon}
        >
          <Ionicons name={icon} size={24} color={colors.white} />
        </LinearGradient>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderInvoiceRow = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      style={styles.invoiceRow}
      onPress={() => navigation.navigate('InvoiceView', { invoiceId: item.id })}
    >
      <View style={styles.invoiceCell}>
        <Text style={styles.invoiceNumber}>{item.invoiceNumber || '-'}</Text>
      </View>
      <View style={[styles.invoiceCell, { flex: 1.5 }]}>
        <Text style={styles.invoiceBold}>{item.employeeName || '-'}</Text>
        <Text style={styles.invoiceSubtext}>{item.projectName || '-'}</Text>
      </View>
      <View style={styles.invoiceCell}>
        <Text style={styles.invoiceText}>{item.period || '-'}</Text>
      </View>
      <View style={styles.invoiceCell}>
        <Text style={styles.invoiceBold}>${item.amount?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={styles.invoiceCell}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && invoices.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.danger as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Invoice Management</Text>
        <Text style={styles.headerSubtitle}>Manage and track invoices</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon="documents"
            gradient={gradients.primary}
          />
          <StatCard
            title="Pending Amount"
            value={`$${stats.pendingAmount.toFixed(2)}`}
            icon="time"
            gradient={gradients.warning}
          />
          <StatCard
            title="Paid Amount"
            value={`$${stats.paidAmount.toFixed(2)}`}
            icon="checkmark-circle"
            gradient={gradients.success}
          />
          <StatCard
            title="This Month"
            value={stats.thisMonth}
            icon="calendar"
            gradient={gradients.info}
          />
        </ScrollView>

        {/* Generate Invoice Button */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => navigation.navigate('InvoiceGenerate')}
        >
          <LinearGradient
            colors={gradients.success as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color={colors.white} />
            <Text style={styles.generateButtonText}>Generate New Invoice</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Invoices List */}
        <View style={styles.invoicesCard}>
          <View style={styles.invoicesHeader}>
            <Text style={styles.invoicesTitle}>Recent Invoices</Text>
            <Text style={styles.invoicesCount}>{invoices.length} invoices</Text>
          </View>

          <View style={styles.tableHeader}>
            <View style={styles.invoiceCell}>
              <Text style={styles.headerText}>Invoice #</Text>
            </View>
            <View style={[styles.invoiceCell, { flex: 1.5 }]}>
              <Text style={styles.headerText}>Employee/Project</Text>
            </View>
            <View style={styles.invoiceCell}>
              <Text style={styles.headerText}>Period</Text>
            </View>
            <View style={styles.invoiceCell}>
              <Text style={styles.headerText}>Amount</Text>
            </View>
            <View style={styles.invoiceCell}>
              <Text style={styles.headerText}>Status</Text>
            </View>
          </View>

          <FlatList
            data={invoices}
            renderItem={renderInvoiceRow}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchInvoices} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={colors.gray[300]} />
                <Text style={styles.emptyText}>No invoices found</Text>
                <Text style={styles.emptySubtext}>Generate your first invoice to get started</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  statsRow: {
    padding: spacing.lg,
  },
  statCard: {
    width: 160,
    marginRight: spacing.md,
  },
  statCardInner: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  generateButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  generateButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  invoicesCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  invoicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  invoicesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  invoicesCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  invoiceRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  invoiceCell: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  headerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  invoiceNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  invoiceBold: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  invoiceText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  invoiceSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

export default InvoiceDashboardScreen;
