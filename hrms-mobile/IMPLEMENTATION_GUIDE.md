# HRMS Mobile - Implementation Guide

## Overview

This guide provides detailed instructions for completing the implementation of all screens and features in the HRMS mobile application.

## Current Status

### ✅ Phase 1: Project Setup & Foundation - COMPLETED
- [x] Expo project initialized with TypeScript
- [x] Project structure created
- [x] Navigation configured (Drawer + Stack navigators)
- [x] Redux store setup with slices
- [x] API client with Axios configured
- [x] Authentication flow implemented
- [x] Environment configuration
- [x] Secure storage setup
- [x] Theme system (colors, typography, spacing)
- [x] Core utilities (validation, helpers, storage)

### ✅ Phase 2: Core Components & UI Library - COMPLETED
- [x] Button component with gradient support
- [x] Input component with validation
- [x] Card component
- [x] StatusBadge component
- [x] CustomDrawerContent component
- [x] LoadingScreen component

### ✅ Phase 3: Authentication & Authorization - COMPLETED
- [x] LoginScreen
- [x] ForgotPasswordScreen
- [x] ResetPasswordScreen
- [x] Auth service with API integration
- [x] Role-based access control
- [x] Session management

### 🚧 Phase 4: Dashboard Implementation - IN PROGRESS
- [x] Admin DashboardScreen
- [x] Employee DashboardScreen
- [ ] Charts and analytics components
- [ ] Dashboard widgets

### 🚧 Phase 5: Employee Management - IN PROGRESS
- [x] EmployeeListScreen (completed)
- [ ] EmployeeAddScreen (template created)
- [ ] EmployeeEditScreen (template created)
- [ ] EmployeeViewScreen (template created)
- [ ] EmployeeDocumentsScreen (template created)
- [x] Employee service (completed)

### 📋 Phase 6-10: Remaining Modules - TEMPLATES CREATED

All screen templates have been created. Implementation needed for:
- Projects (5 screens)
- Timesheets (6 screens)
- Self-Service (4 screens)
- Notifications (1 screen)
- Users (4 screens)
- Offboarding (4 screens)
- Documents (1 screen)
- Invoices (3 screens)
- Profile (2 screens)

## Implementation Steps

### Step 1: Complete Employee Module

#### EmployeeAddScreen
1. Create form with Formik
2. Add all required fields from Employee model
3. Implement validation with Yup
4. Add file picker for profile photo
5. Call employeeService.createEmployee()
6. Navigate back on success

**Key Fields:**
- Personal: firstName, lastName, middleName, dateOfBirth, gender
- Contact: contactNumber, personalEmail, workEmail, residentialAddress
- Employment: jobTitle, employmentType, joiningDate, workLocation, workMode
- Emergency: emergencyContactName, emergencyContactNumber, emergencyContactRelation

#### EmployeeEditScreen
1. Fetch employee data by ID
2. Pre-populate form with existing data
3. Allow editing all fields
4. Call employeeService.updateEmployee()
5. Show success message

#### EmployeeViewScreen
1. Fetch employee details by ID
2. Display all information in Cards
3. Show status badge
4. Add action buttons (Edit, Documents, Create User Account)
5. Display related data (projects, timesheets)

#### EmployeeDocumentsScreen
1. Fetch employee documents
2. Display document list with icons
3. Add upload button
4. Implement file picker
5. Call employeeService.uploadDocument()
6. Show download/view options

### Step 2: Complete Project Module

Follow similar pattern as Employee module:
- ProjectListScreen: List with search/filter
- ProjectAddScreen: Form with validation
- ProjectEditScreen: Edit existing project
- ProjectViewScreen: Display project details
- MyProjectsScreen: Show current user's projects

**Use projectService for API calls**

### Step 3: Complete Timesheet Module

#### TimesheetListScreen
- Display all timesheets (admin/HR view)
- Filter by status, employee, date range
- Show summary statistics

#### MyTimesheetsScreen
- Display current user's timesheets
- Quick submit button
- Status indicators

#### TimesheetFormScreen
- Weekly timesheet entry form
- Add entries for each day
- Calculate total hours
- Add expenses section
- Submit for approval

#### TimesheetViewScreen
- Display timesheet details
- Show all entries and expenses
- Display approval status
- Add approve/reject buttons (for managers)

#### TimesheetApprovalsScreen
- List pending timesheets
- Bulk approve functionality
- Filter and search

#### TimesheetDashboardScreen
- Analytics and charts
- Pending approvals count
- Recent submissions

### Step 4: Complete Self-Service Module

#### SelfServiceDashboardScreen
- Display user's tickets
- Quick create button
- Status summary

#### CreateTicketScreen
- Form with category, priority, subject, description
- File attachment support
- Submit ticket

#### ViewTicketScreen
- Display ticket details
- Show conversation/updates
- Add reply functionality

#### AdminTicketsScreen
- List all tickets (admin view)
- Assign to users
- Update status
- Add resolution

### Step 5: Complete Remaining Modules

Follow the same patterns for:
- Notifications
- Users
- Offboarding
- Documents
- Invoices
- Profile

## Component Patterns

### List Screen Pattern
```typescript
const [data, setData] = useState([]);
const [filteredData, setFilteredData] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [isLoading, setIsLoading] = useState(false);

// Fetch data
const fetchData = async () => {
  setIsLoading(true);
  try {
    const response = await service.getAll();
    setData(response);
    setFilteredData(response);
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setIsLoading(false);
  }
};

// Search/filter
useEffect(() => {
  if (searchQuery) {
    const filtered = data.filter(item => 
      // filter logic
    );
    setFilteredData(filtered);
  } else {
    setFilteredData(data);
  }
}, [searchQuery, data]);

// Render with FlatList
<FlatList
  data={filteredData}
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()}
  refreshControl={
    <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
  }
/>
```

### Form Screen Pattern
```typescript
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  field1: Yup.string().required('Required'),
  field2: Yup.string().email('Invalid email'),
});

<Formik
  initialValues={{ field1: '', field2: '' }}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
>
  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
    <View>
      <Input
        label="Field 1"
        value={values.field1}
        onChangeText={handleChange('field1')}
        onBlur={handleBlur('field1')}
        error={touched.field1 && errors.field1}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  )}
</Formik>
```

### File Upload Pattern
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
      
      await service.upload(formData);
      Alert.alert('Success', 'File uploaded');
    }
  } catch (error) {
    Alert.alert('Error', 'Upload failed');
  }
};
```

## Testing Checklist

For each screen, test:
- [ ] Data loading and display
- [ ] Search/filter functionality
- [ ] Form validation
- [ ] API integration
- [ ] Error handling
- [ ] Loading states
- [ ] Navigation
- [ ] Role-based access
- [ ] iOS compatibility
- [ ] Android compatibility
- [ ] Web compatibility
- [ ] Responsive design

## Additional Components Needed

### Charts Component
```typescript
import { LineChart, BarChart } from 'react-native-chart-kit';

// Use for dashboard analytics
```

### DataTable Component
```typescript
// For displaying tabular data
// Use react-native-table-component or custom FlatList
```

### DatePicker Component
```typescript
import DateTimePicker from '@react-native-community/datetimepicker';

// For date selection in forms
```

### Dropdown Component
```typescript
import DropDownPicker from 'react-native-dropdown-picker';

// For select inputs
```

## Performance Optimization

1. **Use React.memo for list items**
2. **Implement pagination for large lists**
3. **Use FlatList instead of ScrollView for long lists**
4. **Optimize images with proper sizing**
5. **Implement lazy loading**
6. **Cache API responses where appropriate**

## Deployment

### iOS
1. Configure app.json with proper bundle identifier
2. Add required permissions in Info.plist
3. Build with `expo build:ios`
4. Submit to App Store

### Android
1. Configure app.json with proper package name
2. Add required permissions in AndroidManifest.xml
3. Build with `expo build:android`
4. Submit to Google Play

### Web
1. Build with `expo build:web`
2. Deploy to hosting service (Netlify, Vercel, etc.)

## Next Steps

1. Run `chmod +x generate-screens.sh && ./generate-screens.sh` to create all screen templates
2. Implement screens module by module
3. Test each module thoroughly
4. Add charts and analytics
5. Optimize performance
6. Deploy to app stores

## Support

For questions or issues during implementation:
1. Review completed screens for patterns
2. Check API documentation
3. Refer to React Native and Expo docs
4. Test on multiple devices/platforms

