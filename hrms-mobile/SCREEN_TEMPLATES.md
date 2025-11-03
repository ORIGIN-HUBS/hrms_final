# Screen Implementation Templates

This document provides templates for implementing all remaining screens. Each template follows the same structure and patterns established in the completed screens.

## Template Structure

Each screen should follow this structure:

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
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

const ScreenName: React.FC<any> = ({ navigation, route }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.YOUR_ENDPOINT);
      setData(response.data);
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
      {/* Screen content */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  // Add more styles
});

export default ScreenName;
```

## Screens to Implement

### 1. Dashboard Module
- [x] DashboardScreen.tsx (Admin) - COMPLETED
- [ ] EmployeeDashboardScreen.tsx

### 2. Employee Module
- [ ] EmployeeListScreen.tsx
- [ ] EmployeeAddScreen.tsx
- [ ] EmployeeEditScreen.tsx
- [ ] EmployeeViewScreen.tsx
- [ ] EmployeeDocumentsScreen.tsx

### 3. Project Module
- [ ] ProjectListScreen.tsx
- [ ] ProjectAddScreen.tsx
- [ ] ProjectEditScreen.tsx
- [ ] ProjectViewScreen.tsx
- [ ] MyProjectsScreen.tsx

### 4. Timesheet Module
- [ ] TimesheetListScreen.tsx
- [ ] MyTimesheetsScreen.tsx
- [ ] TimesheetFormScreen.tsx
- [ ] TimesheetViewScreen.tsx
- [ ] TimesheetApprovalsScreen.tsx
- [ ] TimesheetDashboardScreen.tsx

### 5. Self-Service Module
- [ ] SelfServiceDashboardScreen.tsx
- [ ] CreateTicketScreen.tsx
- [ ] ViewTicketScreen.tsx
- [ ] AdminTicketsScreen.tsx

### 6. Notification Module
- [ ] NotificationListScreen.tsx

### 7. User Module
- [ ] UserListScreen.tsx
- [ ] UserAddScreen.tsx
- [ ] UserEditScreen.tsx
- [ ] UserViewScreen.tsx

### 8. Offboarding Module
- [ ] OffboardingListScreen.tsx
- [ ] OffboardingInitiateScreen.tsx
- [ ] OffboardingEditScreen.tsx
- [ ] OffboardingViewScreen.tsx

### 9. Document Module
- [ ] DocumentsScreen.tsx

### 10. Invoice Module
- [ ] InvoiceDashboardScreen.tsx
- [ ] InvoiceGenerateScreen.tsx
- [ ] InvoiceViewScreen.tsx

### 11. Profile Module
- [ ] MyProfileScreen.tsx
- [ ] ChangePasswordScreen.tsx

## Implementation Guidelines

### List Screens
- Use FlatList or ScrollView with map
- Implement search and filter functionality
- Add pull-to-refresh
- Include empty state handling
- Add navigation to detail/edit screens

### Form Screens (Add/Edit)
- Use Formik for form management
- Use Yup for validation
- Include all required fields
- Add file upload support where needed
- Show loading state during submission
- Navigate back on success

### View/Detail Screens
- Display all relevant information
- Use Cards for grouping related data
- Add action buttons (Edit, Delete, etc.)
- Show related data (e.g., employee's projects)
- Include status badges

### Common Patterns

#### API Call Pattern
```typescript
const fetchData = async () => {
  setIsLoading(true);
  try {
    const response = await apiClient.get(endpoint);
    setData(response.data);
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'Failed to load data');
  } finally {
    setIsLoading(false);
  }
};
```

#### Form Submission Pattern
```typescript
const handleSubmit = async (values) => {
  setIsLoading(true);
  try {
    await apiClient.post(endpoint, values);
    Alert.alert('Success', 'Data saved successfully');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', error.message || 'Failed to save');
  } finally {
    setIsLoading(false);
  }
};
```

#### File Upload Pattern
```typescript
import * as DocumentPicker from 'expo-document-picker';

const handleFileUpload = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });
    
    if (result.type === 'success') {
      const formData = new FormData();
      formData.append('file', {
        uri: result.uri,
        name: result.name,
        type: result.mimeType || 'application/octet-stream',
      } as any);
      
      await apiClient.upload(endpoint, formData);
      Alert.alert('Success', 'File uploaded successfully');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to upload file');
  }
};
```

## Next Steps

1. Create all screen files using the template structure
2. Implement API service methods for each module
3. Add proper TypeScript types for all data models
4. Implement form validation schemas
5. Add charts and analytics components
6. Test on all platforms (iOS, Android, Web)
7. Add error boundaries and fallback UI
8. Implement offline support (optional)
9. Add unit tests (optional)
10. Performance optimization

