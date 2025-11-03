import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
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

const OffboardingViewScreen: React.FC<any> = ({ navigation, route }) => {
  const { offboardingId } = route.params;
  const [offboarding, setOffboarding] = useState<Offboarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOffboarding();
  }, [offboardingId]);

  const fetchOffboarding = async () => {
    setIsLoading(true);
    try {
      const data = await offboardingService.getOffboardingById(offboardingId);
      setOffboarding(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load offboarding details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (accessType: 'email' | 'slack' | 'all') => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to revoke ${accessType} access?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await offboardingService.revokeAccess(offboardingId, accessType);
              Alert.alert('Success', `${accessType} access revoked successfully`);
              fetchOffboarding();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to revoke access');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleGenerateDocument = async (type: 'relieving' | 'experience') => {
    setIsProcessing(true);
    try {
      if (type === 'relieving') {
        await offboardingService.generateRelievingLetter(offboardingId);
        Alert.alert('Success', 'Relieving letter generated successfully');
      } else {
        await offboardingService.generateExperienceCertificate(offboardingId);
        Alert.alert('Success', 'Experience certificate generated successfully');
      }
      fetchOffboarding();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteOffboarding = async () => {
    Alert.alert(
      'Complete Offboarding',
      'Are you sure you want to mark this offboarding as completed? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await offboardingService.completeOffboarding(offboardingId);
              Alert.alert('Success', 'Offboarding process completed successfully');
              fetchOffboarding();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to complete offboarding');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading offboarding details...</Text>
      </View>
    );
  }

  if (!offboarding) {
    return null;
  }

  const InfoRow = ({ label, value }: { label: string; value?: string | number }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  };

  const ChecklistItem = ({
    label,
    completed,
    onPress,
  }: {
    label: string;
    completed: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.checklistItem}
      onPress={onPress}
      disabled={!onPress || completed}
    >
      <Ionicons
        name={completed ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={completed ? colors.success : colors.gray[400]}
      />
      <Text style={[styles.checklistText, completed && styles.checklistTextCompleted]}>
        {label}
      </Text>
      {onPress && !completed && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.disabled} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.employeeIcon}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.employeeName}>
              {offboarding.employee?.firstName} {offboarding.employee?.lastName}
            </Text>
            <Text style={styles.employeeId}>{offboarding.employee?.employeeId}</Text>
            <Text style={styles.jobTitle}>{offboarding.employee?.jobTitle}</Text>
          </View>
          <StatusBadge status={offboarding.status} />
        </View>
      </Card>

      {/* Exit Details */}
      <Card>
        <Text style={styles.sectionTitle}>Exit Details</Text>
        <InfoRow label="Resignation Date" value={offboarding.resignationDate} />
        <InfoRow label="Last Working Day" value={offboarding.lastWorkingDay} />
        <InfoRow label="Notice Period" value={offboarding.noticePeriod ? `${offboarding.noticePeriod} days` : undefined} />
        {offboarding.reasonForLeaving && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason for Leaving:</Text>
            <Text style={styles.reasonText}>{offboarding.reasonForLeaving}</Text>
          </View>
        )}
      </Card>

      {/* Offboarding Checklist */}
      <Card>
        <Text style={styles.sectionTitle}>Offboarding Checklist</Text>

        <ChecklistItem
          label="Revoke Email Access"
          completed={offboarding.emailRevoked || false}
          onPress={
            !offboarding.emailRevoked
              ? () => handleRevokeAccess('email')
              : undefined
          }
        />
        <ChecklistItem
          label="Revoke Slack Access"
          completed={offboarding.slackRevoked || false}
          onPress={
            !offboarding.slackRevoked
              ? () => handleRevokeAccess('slack')
              : undefined
          }
        />
        <ChecklistItem
          label="Generate Relieving Letter"
          completed={offboarding.relievingLetterGenerated || false}
          onPress={
            !offboarding.relievingLetterGenerated
              ? () => handleGenerateDocument('relieving')
              : undefined
          }
        />
        <ChecklistItem
          label="Generate Experience Certificate"
          completed={offboarding.experienceCertificateGenerated || false}
          onPress={
            !offboarding.experienceCertificateGenerated
              ? () => handleGenerateDocument('experience')
              : undefined
          }
        />
        <ChecklistItem
          label="NDA Signed"
          completed={offboarding.ndaSigned || false}
        />
        <ChecklistItem
          label="Final Settlement Completed"
          completed={offboarding.settlementStatus === 'COMPLETED'}
        />
      </Card>

      {/* Settlement Details */}
      <Card>
        <Text style={styles.sectionTitle}>Settlement Details</Text>
        <InfoRow
          label="Settlement Status"
          value={offboarding.settlementStatus}
        />
        <InfoRow
          label="Final Settlement"
          value={offboarding.finalSettlement ? `$${offboarding.finalSettlement.toFixed(2)}` : undefined}
        />
        <InfoRow
          label="Pending Salary"
          value={offboarding.pendingSalary ? `$${offboarding.pendingSalary.toFixed(2)}` : undefined}
        />
      </Card>

      {/* Assets & Feedback */}
      {(offboarding.assetsToCollect || offboarding.feedbackAndSuggestions) && (
        <Card>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          {offboarding.assetsToCollect && (
            <View style={styles.textContainer}>
              <Text style={styles.textLabel}>Assets to Collect:</Text>
              <Text style={styles.textValue}>{offboarding.assetsToCollect}</Text>
            </View>
          )}
          {offboarding.feedbackAndSuggestions && (
            <View style={styles.textContainer}>
              <Text style={styles.textLabel}>Feedback & Suggestions:</Text>
              <Text style={styles.textValue}>{offboarding.feedbackAndSuggestions}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Audit Information */}
      <Card>
        <Text style={styles.sectionTitle}>Audit Information</Text>
        <InfoRow label="Initiated At" value={offboarding.initiatedAt} />
        <InfoRow label="Initiated By" value={offboarding.initiatedBy} />
        <InfoRow label="Completed At" value={offboarding.completedAt} />
      </Card>

      {/* Action Buttons */}
      {offboarding.status !== 'COMPLETED' && (
        <View style={styles.actionButtons}>
          <Button
            title="Revoke All Access"
            onPress={() => handleRevokeAccess('all')}
            loading={isProcessing}
            variant="outline"
            style={styles.actionButton}
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.error} />}
          />
          <Button
            title="Complete Offboarding"
            onPress={handleCompleteOffboarding}
            loading={isProcessing}
            style={styles.actionButton}
            icon={<Ionicons name="checkmark-done-outline" size={20} color={colors.white} />}
          />
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  headerCard: {
    marginTop: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  employeeId: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  jobTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },
  reasonContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  reasonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  checklistText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  checklistTextCompleted: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  textContainer: {
    marginBottom: spacing.md,
  },
  textLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  textValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default OffboardingViewScreen;

