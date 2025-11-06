import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export default function LoadingScreen() {
  return (
    <LinearGradient
      colors={theme.gradients.primary}
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.text}>Loading HRMS Pro...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
});