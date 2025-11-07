import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, spacing, borderRadius } from '@/constants/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  gradient: string[];
  change?: {
    value: string | number;
    label: string;
    positive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  gradient,
  change,
}) => {
  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={['transparent', 'transparent']}
        style={styles.topBorder}
      />
      <View style={[styles.topBorder, { backgroundColor: gradient[0] }]} />
      
      <View style={styles.header}>
        <LinearGradient
          colors={gradient}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name={icon} size={28} color={colors.surface} />
        </LinearGradient>
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>

      {change && (
        <View style={styles.change}>
          <MaterialIcons
            name={change.positive ? 'arrow-upward' : 'arrow-downward'}
            size={16}
            color={change.positive ? colors.success : colors.danger}
          />
          <Text style={[
            styles.changeText,
            { color: change.positive ? colors.success : colors.danger }
          ]}>
            {change.value} {change.label}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    minHeight: 160,
    padding: spacing.lg,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  change: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});