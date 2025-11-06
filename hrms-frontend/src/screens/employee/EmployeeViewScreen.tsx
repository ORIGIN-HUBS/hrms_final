import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Button, Chip, Divider, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchEmployeeById } from '../../store/slices/employeeSlice';
import { theme } from '../../theme';
import StatusChip from '../../components/common/StatusChip';

export default function EmployeeViewScreen({ route, navigation }: any) {
  const { employeeId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedEmployee, loading } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');
  const isHR = user?.roles?.some(role => role.name === 'HR');

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeById(employeeId));
    }
  }, [dispatch, employeeId]);

  if (!selectedEmployee) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderPersonalInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title 
        title="Personal Information" 
        left={(props) => <Ionicons {...props} name="person" size={24} color={theme.colors.primary} />}
      />
      <Card.Content>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Full Name:</Text>
          <Text style={styles.value}>
            {`${selectedEmployee.firstName} ${selectedEmployee.middleName || ''} ${selectedEmployee.lastName}`.trim()}
          </Text>
        </View>
        <Divider style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Employee ID:</Text>
          <Text style={styles.value}>{selectedEmployee.employeeId}</Text>
        </View>
        <Divider style={styles.divider} />
        
        {selectedEmployee.dateOfBirth && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date of Birth:</Text>
              <Text style={styles.value}>{selectedEmployee.dateOfBirth}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        {selectedEmployee.gender && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{selectedEmployee.gender}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        {selectedEmployee.pronouns && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Pronouns:</Text>
              <Text style={styles.value}>{selectedEmployee.pronouns}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
      </Card.Content>
    </Card>
  );

  const renderContactInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title 
        title="Contact Information" 
        left={(props) => <Ionicons {...props} name="call" size={24} color={theme.colors.primary} />}
      />
      <Card.Content>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Personal Email:</Text>
          <Text style={styles.value}>{selectedEmployee.personalEmail}</Text>
        </View>
        <Divider style={styles.divider} />
        
        {selectedEmployee.workEmail && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Work Email:</Text>
              <Text style={styles.value}>{selectedEmployee.workEmail}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Contact Number:</Text>
          <Text style={styles.value}>{selectedEmployee.contactNumber}</Text>
        </View>
        <Divider style={styles.divider} />
        
        {selectedEmployee.alternateContactNumber && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Alternate Contact:</Text>
              <Text style={styles.value}>{selectedEmployee.alternateContactNumber}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        {selectedEmployee.residentialAddress && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{selectedEmployee.residentialAddress}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmergencyContact = () => (
    <Card style={styles.sectionCard}>
      <Card.Title 
        title="Emergency Contact" 
        left={(props) => <Ionicons {...props} name="alert-circle" size={24} color={theme.colors.primary} />}
      />
      <Card.Content>
        {selectedEmployee.emergencyContactName && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contact Name:</Text>
              <Text style={styles.value}>{selectedEmployee.emergencyContactName}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        {selectedEmployee.emergencyContactNumber && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contact Number:</Text>
              <Text style={styles.value}>{selectedEmployee.emergencyContactNumber}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        {selectedEmployee.emergencyContactRelation && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Relationship:</Text>
            <Text style={styles.value}>{selectedEmployee.emergencyContactRelation}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmploymentDetails = () => (
    <Card style={styles.sectionCard}>
      <Card.Title 
        title="Employment Details" 
        left={(props) => <Ionicons {...props} name="briefcase" size={24} color={theme.colors.primary} />}
      />
      <Card.Content>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Job Title:</Text>
          <Text style={styles.value}>{selectedEmployee.jobTitle}</Text>
        </View>
        <Divider style={styles.divider} />
        
        {selectedEmployee.supervisor && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Supervisor:</Text>
              <Text style={styles.value}>{selectedEmployee.supervisor}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Employment Type:</Text>
          <Text style={styles.value}>{selectedEmployee.employmentType}</Text>
        </View>
        <Divider style={styles.divider} />
        
        {selectedEmployee.workLocation && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Work Location:</Text>
              <Text style={styles.value}>{selectedEmployee.workLocation}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        {selectedEmployee.workMode && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Work Mode:</Text>
              <Text style={styles.value}>{selectedEmployee.workMode}</Text>
            </View>
            <Divider style={styles.divider} />
          </>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Joining Date:</Text>
          <Text style={styles.value}>{selectedEmployee.joiningDate}</Text>
        </View>
        <Divider style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <StatusChip status={selectedEmployee.status} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
          </Text>
          <Text style={styles.headerSubtitle}>{selectedEmployee.jobTitle}</Text>
        </View>
        <StatusChip status={selectedEmployee.status} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPersonalInfo()}
        {renderContactInfo()}
        {renderEmergencyContact()}
        {renderEmploymentDetails()}
      </ScrollView>

      {(isAdmin || isHR) && (
        <FAB
          icon="pencil"
          style={styles.fab}
          onPress={() => navigation.navigate('EmployeeEdit', { employeeId })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  infoRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    minWidth: Platform.OS === 'web' ? 150 : undefined,
    marginBottom: Platform.OS === 'web' ? 0 : theme.spacing.xs,
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  divider: {
    marginVertical: theme.spacing.xs,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});