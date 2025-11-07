import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

interface Timesheet {
  id: number;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  status: string;
  submittedOn: string;
}

interface ApprovalsScreenProps {
  onNavigate?: (route: string, params?: any) => void;
}

export const ApprovalsScreen: React.FC<ApprovalsScreenProps> = ({ onNavigate }) => {
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([]);
  const [recentTimesheets, setRecentTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalEmployees: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await apiClient.get('/api/timesheets/approvals');
      setPendingTimesheets(response.data.pendingTimesheets || []);
      setRecentTimesheets(response.data.recentTimesheets || []);
      setStats({
        pendingCount: response.data.pendingCount || 0,
        approvedToday: response.data.approvedToday || 0,
        rejectedToday: response.data.rejectedToday || 0,
        totalEmployees: response.data.totalEmployees || 0
      });
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedTimesheet) return;
    
    try {
      if (actionType === 'approve') {
        await apiClient.post(`/api/timesheets/${selectedTimesheet}/approve`, { comments });
        Alert.alert('Success', 'Timesheet approved successfully');
      } else {
        if (!comments.trim()) {
          Alert.alert('Error', 'Rejection reason is required');
          return;
        }
        await apiClient.post(`/api/timesheets/${selectedTimesheet}/reject`, { rejectionReason: comments });
        Alert.alert('Success', 'Timesheet rejected');
      }
      setModalVisible(false);
      setComments('');
      setSelectedTimesheet(null);
      fetchPendingApprovals();
    } catch (error) {
      Alert.alert('Error', `Failed to ${actionType} timesheet`);
    }
  };

  const showActionModal = (timesheetId: number, action: 'approve' | 'reject') => {
    setSelectedTimesheet(timesheetId);
    setActionType(action);
    setModalVisible(true);
  };

  const renderPendingTimesheetItem = ({ item }: { item: Timesheet }) => (
    <View style={styles.timesheetRow}>
      <View style={styles.employeeColumn}>
        <Text style={styles.employeeName}>
          {item.employee.firstName} {item.employee.lastName}
        </Text>
        <Text style={styles.employeeEmail}>{item.employee.employeeId}</Text>
      </View>
      <View style={styles.detailsColumn}>
        <Text style={styles.weekPeriod}>
          {new Date(item.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
          {new Date(item.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text style={styles.totalHours}>{item.totalHours} hours</Text>
        <Text style={styles.submittedDate}>
          Submitted: {new Date(item.submittedOn).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.actionsColumn}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => {}}
        >
          <MaterialIcons name="visibility" size={16} color="#0dcaf0" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => showActionModal(item.id, 'approve')}
        >
          <MaterialIcons name="check-circle" size={16} color="#198754" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => showActionModal(item.id, 'reject')}
        >
          <MaterialIcons name="cancel" size={16} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentTimesheetItem = ({ item }: { item: Timesheet }) => (
    <View style={styles.timesheetRow}>
      <View style={styles.employeeColumn}>
        <Text style={styles.employeeName}>
          {item.employee.firstName} {item.employee.lastName}
        </Text>
        <Text style={styles.employeeEmail}>{item.employee.employeeId}</Text>
      </View>
      <View style={styles.detailsColumn}>
        <Text style={styles.weekPeriod}>
          {new Date(item.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
          {new Date(item.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text style={styles.totalHours}>{item.totalHours} hours</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'APPROVED' ? styles.statusApproved : 
          item.status === 'REJECTED' ? styles.statusRejected : styles.statusSubmitted
        ]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.actionsColumn}>
        <TouchableOpacity style={[styles.actionBtn, styles.viewBtn]}>
          <MaterialIcons name="visibility" size={16} color="#0dcaf0" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen>
      <Header 
        title="Timesheet Approvals" 
        onBack={() => onNavigate?.('Dashboard')}
      />
      
      <ScrollView style={styles.container}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: '#ffc107' }]}>
            <Text style={[styles.statNumber, { color: '#ffc107' }]}>{stats.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Approval</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#198754' }]}>
            <Text style={[styles.statNumber, { color: '#198754' }]}>{stats.approvedToday}</Text>
            <Text style={styles.statLabel}>Approved Today</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#dc3545' }]}>
            <Text style={[styles.statNumber, { color: '#dc3545' }]}>{stats.rejectedToday}</Text>
            <Text style={styles.statLabel}>Rejected Today</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#0dcaf0' }]}>
            <Text style={[styles.statNumber, { color: '#0dcaf0' }]}>{stats.totalEmployees}</Text>
            <Text style={styles.statLabel}>Active Employees</Text>
          </View>
        </View>

        {/* Pending Approvals */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="hourglass-empty" size={20} color="white" />
            <Text style={styles.cardHeaderText}>Pending Timesheet Approvals</Text>
          </View>
          <View style={styles.cardBody}>
            {pendingTimesheets.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="check-circle" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No pending approvals</Text>
              </View>
            ) : (
              <FlatList
                data={pendingTimesheets}
                renderItem={renderPendingTimesheetItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </Card>

        {/* Recent Approvals */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="history" size={20} color="white" />
            <Text style={styles.cardHeaderText}>Recent Approved/Rejected Timesheets</Text>
          </View>
          <View style={styles.cardBody}>
            <FlatList
              data={recentTimesheets}
              renderItem={renderRecentTimesheetItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'approve' ? 'Approve Timesheet' : 'Reject Timesheet'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={actionType === 'approve' ? 'Optional approval comments' : 'Rejection reason (required)'}
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setComments('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={actionType === 'approve' ? 'Approve' : 'Reject'}
                onPress={handleAction}
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 8,
  },
  cardHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  timesheetRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  employeeColumn: {
    flex: 2,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  employeeEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsColumn: {
    flex: 3,
  },
  weekPeriod: {
    fontSize: 13,
    color: colors.text,
  },
  totalHours: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  submittedDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsColumn: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  viewBtn: {
    borderColor: '#0dcaf0',
  },
  approveBtn: {
    borderColor: '#198754',
  },
  rejectBtn: {
    borderColor: '#dc3545',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusSubmitted: {
    backgroundColor: '#ffc107',
  },
  statusApproved: {
    backgroundColor: '#198754',
  },
  statusRejected: {
    backgroundColor: '#dc3545',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});