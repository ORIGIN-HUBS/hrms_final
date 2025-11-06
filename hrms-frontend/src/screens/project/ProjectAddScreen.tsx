import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { createProject } from '../../store/slices/projectSlice';
import { theme } from '../../theme';

export default function ProjectAddScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    clientCompanyName: '',
    clientContactPerson: '',
    clientContactEmail: '',
    clientContactPhone: '',
    vendorCompanyName: '',
    vendorContactPerson: '',
    vendorContactEmail: '',
    vendorContactPhone: '',
    projectStartDate: '',
    projectEndDate: '',
    candidatePayRate: '',
    vendorPayRate: '',
    projectLocation: '',
    projectType: '',
    projectStatus: 'ACTIVE'
  });

  const [currentSection, setCurrentSection] = useState('basic');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.project);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.projectName || !formData.clientCompanyName || !formData.projectStartDate) {
      return;
    }
    
    try {
      await dispatch(createProject(formData)).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const renderBasicInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Project Information" left={(props) => <Ionicons {...props} name="briefcase" size={24} />} />
      <Card.Content>
        <TextInput
          label="Project Name *"
          value={formData.projectName}
          onChangeText={(value) => updateField('projectName', value)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Project Description"
          value={formData.projectDescription}
          onChangeText={(value) => updateField('projectDescription', value)}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
        />
        <View style={styles.row}>
          <TextInput
            label="Project Start Date *"
            value={formData.projectStartDate}
            onChangeText={(value) => updateField('projectStartDate', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            placeholder="YYYY-MM-DD"
          />
          <TextInput
            label="Project End Date"
            value={formData.projectEndDate}
            onChangeText={(value) => updateField('projectEndDate', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.row}>
          <TextInput
            label="Project Location"
            value={formData.projectLocation}
            onChangeText={(value) => updateField('projectLocation', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
          />
          <TextInput
            label="Project Type"
            value={formData.projectType}
            onChangeText={(value) => updateField('projectType', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            placeholder="e.g., Development, Consulting"
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderClientInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Client Information" left={(props) => <Ionicons {...props} name="business" size={24} />} />
      <Card.Content>
        <TextInput
          label="Client Company Name *"
          value={formData.clientCompanyName}
          onChangeText={(value) => updateField('clientCompanyName', value)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Client Contact Person"
          value={formData.clientContactPerson}
          onChangeText={(value) => updateField('clientContactPerson', value)}
          mode="outlined"
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            label="Client Contact Email"
            value={formData.clientContactEmail}
            onChangeText={(value) => updateField('clientContactEmail', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Client Contact Phone"
            value={formData.clientContactPhone}
            onChangeText={(value) => updateField('clientContactPhone', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            keyboardType="phone-pad"
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderVendorInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Vendor Information" left={(props) => <Ionicons {...props} name="storefront" size={24} />} />
      <Card.Content>
        <TextInput
          label="Vendor Company Name"
          value={formData.vendorCompanyName}
          onChangeText={(value) => updateField('vendorCompanyName', value)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Vendor Contact Person"
          value={formData.vendorContactPerson}
          onChangeText={(value) => updateField('vendorContactPerson', value)}
          mode="outlined"
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            label="Vendor Contact Email"
            value={formData.vendorContactEmail}
            onChangeText={(value) => updateField('vendorContactEmail', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Vendor Contact Phone"
            value={formData.vendorContactPhone}
            onChangeText={(value) => updateField('vendorContactPhone', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            keyboardType="phone-pad"
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderFinancialInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Title title="Financial Information" left={(props) => <Ionicons {...props} name="cash" size={24} />} />
      <Card.Content>
        <View style={styles.row}>
          <TextInput
            label="Candidate Pay Rate"
            value={formData.candidatePayRate}
            onChangeText={(value) => updateField('candidatePayRate', value)}
            mode="outlined"
            style={[styles.input, styles.flex1]}
            keyboardType="numeric"
            placeholder="$/hour"
          />
          <TextInput
            label="Vendor Pay Rate"
            value={formData.vendorPayRate}
            onChangeText={(value) => updateField('vendorPayRate', value)}
            mode="outlined"
            style={[styles.input, styles.flex1, styles.marginLeft]}
            keyboardType="numeric"
            placeholder="$/hour"
          />
        </View>
      </Card.Content>
    </Card>
  );

  const sections = [
    { value: 'basic', label: 'Basic' },
    { value: 'client', label: 'Client' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'financial', label: 'Financial' }
  ];

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'basic': return renderBasicInfo();
      case 'client': return renderClientInfo();
      case 'vendor': return renderVendorInfo();
      case 'financial': return renderFinancialInfo();
      default: return renderBasicInfo();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New Project</Text>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          icon="close"
          compact
        >
          Cancel
        </Button>
      </View>

      <SegmentedButtons
        value={currentSection}
        onValueChange={setCurrentSection}
        buttons={sections}
        style={styles.segmentedButtons}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentSection()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !formData.projectName || !formData.clientCompanyName || !formData.projectStartDate}
          style={styles.saveButton}
          icon="content-save"
        >
          Save Project
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => {}}
        duration={4000}
      >
        {error}
      </Snackbar>
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
  segmentedButtons: {
    margin: theme.spacing.md,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  row: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'stretch',
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: Platform.OS === 'web' ? theme.spacing.md : 0,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  saveButton: {
    paddingVertical: theme.spacing.xs,
  },
});