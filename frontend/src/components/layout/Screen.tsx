import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { colors } from '../../constants/colors';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  padding?: number;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  backgroundColor = colors.background,
  padding = 20,
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor, padding },
  ];

  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={containerStyle}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={containerStyle}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});