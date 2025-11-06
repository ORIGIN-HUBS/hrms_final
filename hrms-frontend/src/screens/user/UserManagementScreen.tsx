import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { theme } from '../../theme';

export default function UserManagementScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="User Management" />
        <Card.Content>
          <Text>User management will be displayed here.</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.goBack()}>Back</Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
  },
});