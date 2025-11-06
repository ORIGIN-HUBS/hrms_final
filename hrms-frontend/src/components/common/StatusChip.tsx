import React from 'react';
import { Chip } from 'react-native-paper';

interface StatusChipProps {
  status: string;
  style?: any;
}

export default function StatusChip({ status, style }: StatusChipProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return '#28a745';
      case 'ONBOARDING': return '#ffc107';
      case 'OFFBOARDING': return '#dc3545';
      case 'TERMINATED': return '#6c757d';
      case 'DRAFT': return '#6c757d';
      case 'SUBMITTED': return '#ffc107';
      case 'APPROVED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      case 'PAID': return '#20c997';
      case 'PENDING': return '#ffc107';
      case 'IN_PROGRESS': return '#17a2b8';
      case 'COMPLETED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      case 'OPEN': return '#ffc107';
      case 'RESOLVED': return '#28a745';
      case 'CLOSED': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <Chip
      style={[{ backgroundColor: getStatusColor(status) }, style]}
      textStyle={{ color: 'white', fontSize: 10, fontWeight: '600' }}
    >
      {status}
    </Chip>
  );
}