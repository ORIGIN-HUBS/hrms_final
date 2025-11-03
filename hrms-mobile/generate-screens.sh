#!/bin/bash

# Script to generate all remaining screen template files
# This creates placeholder screens that follow the established patterns

# Create directories
mkdir -p src/screens/employees
mkdir -p src/screens/projects
mkdir -p src/screens/timesheets
mkdir -p src/screens/selfservice
mkdir -p src/screens/notifications
mkdir -p src/screens/users
mkdir -p src/screens/offboarding
mkdir -p src/screens/documents
mkdir -p src/screens/invoice
mkdir -p src/screens/profile

# Function to create a basic screen template
create_screen() {
  local file_path=$1
  local screen_name=$2
  local title=$3
  
  cat > "$file_path" << 'EOF'
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/services/api';
import { API_CONFIG } from '@/constants/config';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const SCREEN_NAME: React.FC<any> = ({ navigation, route }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call
      // const response = await apiClient.get(API_CONFIG.ENDPOINTS.YOUR_ENDPOINT);
      // setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>SCREEN_TITLE</Text>
      </View>
      
      <View style={styles.content}>
        <Card>
          <Text style={styles.placeholder}>
            TODO: Implement SCREEN_TITLE screen
          </Text>
          <Text style={styles.instructions}>
            This screen should display and manage SCREEN_TITLE data.
            Follow the patterns established in completed screens.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    padding: spacing.md,
  },
  placeholder: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  instructions: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
});

export default SCREEN_NAME;
EOF

  # Replace placeholders
  sed -i '' "s/SCREEN_NAME/$screen_name/g" "$file_path"
  sed -i '' "s/SCREEN_TITLE/$title/g" "$file_path"
  
  echo "Created: $file_path"
}

# Employee screens
create_screen "src/screens/employees/EmployeeAddScreen.tsx" "EmployeeAddScreen" "Add Employee"
create_screen "src/screens/employees/EmployeeEditScreen.tsx" "EmployeeEditScreen" "Edit Employee"
create_screen "src/screens/employees/EmployeeViewScreen.tsx" "EmployeeViewScreen" "Employee Details"
create_screen "src/screens/employees/EmployeeDocumentsScreen.tsx" "EmployeeDocumentsScreen" "Employee Documents"

# Project screens
create_screen "src/screens/projects/ProjectListScreen.tsx" "ProjectListScreen" "Projects"
create_screen "src/screens/projects/ProjectAddScreen.tsx" "ProjectAddScreen" "Add Project"
create_screen "src/screens/projects/ProjectEditScreen.tsx" "ProjectEditScreen" "Edit Project"
create_screen "src/screens/projects/ProjectViewScreen.tsx" "ProjectViewScreen" "Project Details"
create_screen "src/screens/projects/MyProjectsScreen.tsx" "MyProjectsScreen" "My Projects"

# Timesheet screens
create_screen "src/screens/timesheets/TimesheetListScreen.tsx" "TimesheetListScreen" "Timesheets"
create_screen "src/screens/timesheets/MyTimesheetsScreen.tsx" "MyTimesheetsScreen" "My Timesheets"
create_screen "src/screens/timesheets/TimesheetFormScreen.tsx" "TimesheetFormScreen" "Submit Timesheet"
create_screen "src/screens/timesheets/TimesheetViewScreen.tsx" "TimesheetViewScreen" "Timesheet Details"
create_screen "src/screens/timesheets/TimesheetApprovalsScreen.tsx" "TimesheetApprovalsScreen" "Timesheet Approvals"
create_screen "src/screens/timesheets/TimesheetDashboardScreen.tsx" "TimesheetDashboardScreen" "Timesheet Dashboard"

# Self-service screens
create_screen "src/screens/selfservice/SelfServiceDashboardScreen.tsx" "SelfServiceDashboardScreen" "Self Service"
create_screen "src/screens/selfservice/CreateTicketScreen.tsx" "CreateTicketScreen" "Create Ticket"
create_screen "src/screens/selfservice/ViewTicketScreen.tsx" "ViewTicketScreen" "Ticket Details"
create_screen "src/screens/selfservice/AdminTicketsScreen.tsx" "AdminTicketsScreen" "Manage Tickets"

# Notification screens
create_screen "src/screens/notifications/NotificationListScreen.tsx" "NotificationListScreen" "Notifications"

# User screens
create_screen "src/screens/users/UserListScreen.tsx" "UserListScreen" "Users"
create_screen "src/screens/users/UserAddScreen.tsx" "UserAddScreen" "Add User"
create_screen "src/screens/users/UserEditScreen.tsx" "UserEditScreen" "Edit User"
create_screen "src/screens/users/UserViewScreen.tsx" "UserViewScreen" "User Details"

# Offboarding screens
create_screen "src/screens/offboarding/OffboardingListScreen.tsx" "OffboardingListScreen" "Offboarding"
create_screen "src/screens/offboarding/OffboardingInitiateScreen.tsx" "OffboardingInitiateScreen" "Initiate Offboarding"
create_screen "src/screens/offboarding/OffboardingEditScreen.tsx" "OffboardingEditScreen" "Edit Offboarding"
create_screen "src/screens/offboarding/OffboardingViewScreen.tsx" "OffboardingViewScreen" "Offboarding Details"

# Document screens
create_screen "src/screens/documents/DocumentsScreen.tsx" "DocumentsScreen" "Documents"

# Invoice screens
create_screen "src/screens/invoice/InvoiceDashboardScreen.tsx" "InvoiceDashboardScreen" "Invoices"
create_screen "src/screens/invoice/InvoiceGenerateScreen.tsx" "InvoiceGenerateScreen" "Generate Invoice"
create_screen "src/screens/invoice/InvoiceViewScreen.tsx" "InvoiceViewScreen" "Invoice Details"

# Profile screens
create_screen "src/screens/profile/MyProfileScreen.tsx" "MyProfileScreen" "My Profile"
create_screen "src/screens/profile/ChangePasswordScreen.tsx" "ChangePasswordScreen" "Change Password"

echo "All screen templates created successfully!"
echo "Total screens created: 35"
echo ""
echo "Next steps:"
echo "1. Review each screen template"
echo "2. Implement API calls and data fetching"
echo "3. Add forms and validation where needed"
echo "4. Implement UI components and layouts"
echo "5. Test on all platforms"

