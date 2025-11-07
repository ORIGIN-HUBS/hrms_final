import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { employeeService } from '../../api/employeeService';
import { colors } from '../../constants/colors';
import { Employee } from '../../types';

interface EmployeeDocumentsScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  employeeId: number;
}

interface Document {
  id: number;
  type: string;
  name: string;
  uploadDate: string;
  size?: string;
}

export const EmployeeDocumentsScreen: React.FC<EmployeeDocumentsScreenProps> = ({ onNavigate, employeeId }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(employeeId);
      setEmployee(data);
      
      // Mock documents - In real app, this would come from an API
      setDocuments([
        { id: 1, type: 'Offer Letter', name: 'offer_letter.pdf', uploadDate: '2024-01-15', size: '250 KB' },
        { id: 2, type: 'I-9 Form', name: 'i9_form.pdf', uploadDate: '2024-01-20', size: '180 KB' },
        { id: 3, type: 'Passport', name: 'passport_copy.pdf', uploadDate: '2024-01-20', size: '320 KB' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load employee data');
      onNavigate('EmployeeList');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    Alert.alert('View Document', `Opening ${doc.name}...`);
    // In real app, this would open the document
  };

  const handleDeleteDocument = (doc: Document) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${doc.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(d => d.id !== doc.id));
            Alert.alert('Success', 'Document deleted successfully');
          },
        },
      ]
    );
  };

  const handleUploadDocument = () => {
    Alert.alert('Upload Document', 'Document upload functionality would be implemented here.');
    // In real app, this would open a file picker
  };

  const getDocumentIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof MaterialIcons.glyphMap } = {
      'Offer Letter': 'description',
      'I-9 Form': 'assignment',
      'Passport': 'card-travel',
      'Visa': 'flight',
      'W-4': 'receipt',
      'Resume': 'person',
      'Contract': 'gavel',
      'NDA': 'lock',
    };
    return iconMap[type] || 'insert-drive-file';
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('ViewEmployee', { id: employeeId })}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Employee Documents</Text>
            {employee && (
              <Text style={styles.headerSubtitle}>
                {employee.firstName} {employee.lastName} ({employee.employeeId})
              </Text>
            )}
          </View>
        </View>

        {/* Upload Button */}
        <View style={styles.uploadSection}>
          <Button
            title="Upload Document"
            onPress={handleUploadDocument}
          />
        </View>

        {/* Documents List */}
        <View style={styles.documentsContainer}>
          {documents.length === 0 ? (
            <Card style={styles.emptyCard}>
              <MaterialIcons name="folder-open" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No documents uploaded yet</Text>
              <Button
                title="Upload First Document"
                onPress={handleUploadDocument}
                variant="secondary"
                style={styles.emptyButton}
              />
            </Card>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={styles.documentIconContainer}>
                    <MaterialIcons name={getDocumentIcon(doc.type)} size={32} color={colors.primary} />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentType}>{doc.type}</Text>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <View style={styles.documentMeta}>
                      <MaterialIcons name="calendar-today" size={12} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{doc.uploadDate}</Text>
                      {doc.size && (
                        <>
                          <Text style={styles.metaSeparator}>•</Text>
                          <MaterialIcons name="file-present" size={12} color={colors.textSecondary} />
                          <Text style={styles.metaText}>{doc.size}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.documentActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => handleViewDocument(doc)}
                  >
                    <MaterialIcons name="visibility" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.downloadButton]}
                    onPress={() => Alert.alert('Download', `Downloading ${doc.name}...`)}
                  >
                    <MaterialIcons name="download" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteDocument(doc)}
                  >
                    <MaterialIcons name="delete" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Document Types Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Required Documents</Text>
          <View style={styles.infoList}>
            {[
              'Offer Letter',
              'I-9 Form',
              'Passport / ID',
              'Visa (if applicable)',
              'W-4 Form',
              'Resume / CV',
            ].map((docType, index) => (
              <View key={index} style={styles.infoItem}>
                <MaterialIcons
                  name={documents.some(d => d.type === docType) ? 'check-circle' : 'radio-button-unchecked'}
                  size={20}
                  color={documents.some(d => d.type === docType) ? colors.success : colors.textSecondary}
                />
                <Text style={styles.infoText}>{docType}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  uploadSection: {
    padding: 20,
    paddingBottom: 12,
  },
  documentsContainer: {
    paddingHorizontal: 20,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  documentCard: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  documentName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaSeparator: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: colors.primary,
  },
  downloadButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
  },
  bottomSpace: {
    height: 40,
  },
});
