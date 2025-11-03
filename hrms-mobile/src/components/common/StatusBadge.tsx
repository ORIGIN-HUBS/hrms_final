import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor } from '@/utils/helpers';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  if (!status || typeof status !== 'string') {
    return null;
  }
  
  const color = getStatusColor(status);
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 2, paddingHorizontal: 6, fontSize: 10 };
      case 'large':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 16 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 12, fontSize: 12 };
    }
  };
  
  const sizeStyles = getSizeStyles();
  
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}20`,
          borderColor: color,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
      ]}
    >
      <Text style={[styles.text, { color, fontSize: sizeStyles.fontSize }]}>
        {status.replace(/_/g, ' ').replace(/[<>"'&]/g, '')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
});

export default StatusBadge;

