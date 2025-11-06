import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface GradientCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  subtitle?: string;
  style?: ViewStyle;
}

export default function GradientCard({ 
  title, 
  value, 
  icon, 
  gradient, 
  subtitle,
  style 
}: GradientCardProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient colors={gradient} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={28} color="white" />
          </View>
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    padding: theme.spacing.lg,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: theme.spacing.xs,
  },
});