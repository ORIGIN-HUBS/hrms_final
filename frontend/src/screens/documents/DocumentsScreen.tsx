import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

interface Document {
  id: number;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  documentType: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  verifiedBy?: string;
  notes?: string;
  fileSize?: number;
}

interface DocumentsScreenProps {
  onNavigate?: (route: string, params?: any) => void;
}

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ onNavigate }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    rejectedDocuments: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      const params: any = {};
      if (filter) params.status = filter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await apiClient.get('/api/documents', { params });
      setDocuments(response.data.documents || []);
      setStats({
        totalDocuments: response.data.totalDocuments || 0,
        pendingDocuments: response.data.pendingDocuments || 0,
        verifiedDocuments: response.data.verifiedDocuments || 0,
        rejectedDocuments: response.data.rejectedDocuments || 0
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      await apiClient.post(`/api/documents/${selectedDocument}/verify`, {
        status: actionType,
        notes: notes
      });
      setModalVisible(false);
      setNotes('');
      setSelectedDocument(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error verifying document:', error);
    }
  };

  const showVerifyModal = (documentId: number, action: 'VERIFIED' | 'REJECTED') => {
    setSelectedDocument(documentId);
    setActionType(action);
    setModalVisible(true);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return { name: 'picture-as-pdf', color: '#dc3545' };
      case 'jpg':
      case 'jpeg':
      case 'png': return { name: 'image', color: '#198754' };
      case 'doc':
      case 'docx': return { name: 'description', color: '#0d6efd' };
      default: return { name: 'insert-drive-file', color: '#6c757d' };
    }
  };

  const renderStatCard = (title: string, value: number, color: string, onPress?: () => void) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]} 
      onPress={onPress}
    >
      <View style={styles.statCardContent}>
        <View>
          <Text style={styles.statLabel}>{title}</Text>
          <Text style={[styles.statNumber, { color }]}>{value}</Text>
        </View>
        <MaterialIcons 
          name={
            title === 'Total Documents' ? 'description' :
            title === 'Pending Review' ? 'schedule' :
            title === 'Verified' ? 'check-circle' : 'cancel'
          } 
          size={32} 
          color={color} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderDocumentItem = ({ item }: { item: Document }) => {
    const fileIcon = getFileIcon(item.fileName);
    
    return (
      <View style={styles.documentRow}>
        <View style={styles.employeeColumn}>
          <Text style={styles.employeeName}>
            {item.employee.firstName} {item.employee.lastName}
          </Text>
          <Text style={styles.employeeId}>{item.employee.employeeId}</Text>
        </View>
        
        <View style={styles.documentColumn}>
          <View style={styles.documentTypeContainer}>
            <Text style={styles.documentType}>{item.documentType.replace('_', ' ')}</Text>
          </View>
          <View style={styles.fileNameContainer}>
            <MaterialIcons name={fileIcon.name as any} size={16} color={fileIcon.color} />
            <Text style={styles.fileName}>{item.fileName}</Text>
          </View>
          {item.fileSize && (
            <Text style={styles.fileSize}>({Math.round(item.fileSize / 1024)} KB)</Text>
          )}
        </View>
        
        <View style={styles.statusColumn}>
          <Text style={styles.uploadDate}>
            {new Date(item.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <View style={[
            styles.statusBadge,
            item.status === 'VERIFIED' ? styles.statusVerified :
            item.status === 'REJECTED' ? styles.statusRejected : styles.statusPending
          ]}>
            <MaterialIcons 
              name={
                item.status === 'VERIFIED' ? 'check-circle' :
                item.status === 'REJECTED' ? 'cancel' : 'schedule'
              } 
              size={12} 
              color="white" 
            />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          {item.verifiedBy && (
            <Text style={styles.verifiedBy}>by {item.verifiedBy}</Text>
          )}
        </View>
        
        <View style={styles.actionsColumn}>
          <TouchableOpacity style={[styles.actionBtn, styles.viewBtn]}>
            <MaterialIcons name="visibility" size={16} color="#0dcaf0" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.downloadBtn]}>
            <MaterialIcons name="download" size={16} color="#0d6efd" />
          </TouchableOpacity>
          {item.status !== 'VERIFIED' && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.verifyBtn]}
              onPress={() => showVerifyModal(item.id, 'VERIFIED')}
            >
              <MaterialIcons name="check-circle" size={16} color="#198754" />
            </TouchableOpacity>
          )}
          {item.status !== 'REJECTED' && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => showVerifyModal(item.id, 'REJECTED')}
            >
              <MaterialIcons name="cancel" size={16} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <Header 
        title="Document Management" 
        onBack={() => onNavigate?.('Dashboard')}
      />
      
      <ScrollView style={styles.container}>
        {/* Header Actions */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.pageTitle}>All Employee Documents</Text>
            <Text style={styles.pageSubtitle}>Manage and review all document submissions</Text>
          </View>
          <TouchableOpacity style={styles.manageEmployeesBtn}>
            <MaterialIcons name="people" size={20} color="#6c757d" />
            <Text style={styles.manageEmployeesText}>Manage Employees</Text>
          </TouchableOpacity>
        </View>

        {/* Status Overview Cards */}
        <View style={styles.statsContainer}>
          {renderStatCard('Total Documents', stats.totalDocuments, '#ffc107', () => setFilter(''))}
          {renderStatCard('Pending Review', stats.pendingDocuments, '#dc3545', () => setFilter('PENDING'))}
          {renderStatCard('Verified', stats.verifiedDocuments, '#198754', () => setFilter('VERIFIED'))}
          {renderStatCard('Rejected', stats.rejectedDocuments, '#6c757d', () => setFilter('REJECTED'))}
        </View>

        {/* Search and Filter Controls */}
        <Card style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchLabel}>Search Documents</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Employee name, ID, or document type..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by Status</Text>
              <View style={styles.filterButtons}>
                {['', 'PENDING', 'VERIFIED', 'REJECTED'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      filter === status && styles.filterButtonActive
                    ]}
                    onPress={() => setFilter(status)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filter === status && styles.filterButtonTextActive
                    ]}>
                      {status || 'All Documents'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.searchActions}>
              <Button title="Search" onPress={fetchDocuments} variant="primary" style={styles.searchBtn} />
              <Button title="Reset" onPress={() => { setFilter(''); setSearchTerm(''); }} variant="outline" style={styles.resetBtn} />
            </View>
          </View>
        </Card>

        {/* Documents Table */}
        <Card style={styles.documentsCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="list" size={20} color="white" />
            <Text style={styles.cardHeaderText}>Documents</Text>
            <View style={styles.documentCount}>
              <Text style={styles.documentCountText}>{documents.length}</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            {documents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>No documents found</Text>
                <Text style={styles.emptySubtitle}>No documents match your current filters.</Text>
              </View>
            ) : (
              <FlatList
                data={documents}
                renderItem={renderDocumentItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </Card>
      </ScrollView>

      {/* Verification Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'VERIFIED' ? 'Verify Document' : 'Reject Document'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setNotes('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={actionType === 'VERIFIED' ? 'Verify' : 'Reject'}
                onPress={handleVerifyDocument}
                variant={actionType === 'VERIFIED' ? 'primary' : 'danger'}
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  manageEmployeesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    borderRadius: 6,
    gap: 6,
  },
  manageEmployeesText: {
    color: '#6c757d',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
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
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchCard: {
    margin: 16,
    marginTop: 0,
  },
  searchRow: {
    gap: 16,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
  },
  filterContainer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  searchActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  searchBtn: {
    flex: 1,
  },
  resetBtn: {
    flex: 1,
  },
  documentsCard: {
    margin: 16,
    marginTop: 0,
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#343a40',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 8,
  },
  cardHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  documentCount: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  documentCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  documentRow: {
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
  employeeId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  documentColumn: {
    flex: 3,
  },
  documentTypeContainer: {
    backgroundColor: '#0dcaf0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  documentType: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  fileName: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  fileSize: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  statusColumn: {
    flex: 2,
    alignItems: 'center',
  },
  uploadDate: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 2,
  },
  statusPending: {
    backgroundColor: '#ffc107',
  },
  statusVerified: {
    backgroundColor: '#198754',
  },
  statusRejected: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  verifiedBy: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  actionsColumn: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  viewBtn: {
    borderColor: '#0dcaf0',
  },
  downloadBtn: {
    borderColor: '#0d6efd',
  },
  verifyBtn: {
    borderColor: '#198754',
  },
  rejectBtn: {
    borderColor: '#dc3545',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
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