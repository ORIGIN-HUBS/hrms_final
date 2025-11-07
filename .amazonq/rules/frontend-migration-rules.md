# Frontend Migration Rules: Thymeleaf to React Native with Expo

## Project Structure Rules

### New Frontend Module Structure
```
/frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, Modal)
│   │   ├── forms/          # Form-specific components
│   │   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   │   └── charts/         # Chart components
│   ├── screens/            # Screen components (pages)
│   │   ├── auth/          # Login, forgot password, etc.
│   │   ├── dashboard/     # Dashboard screens
│   │   ├── employee/      # Employee management screens
│   │   ├── project/       # Project management screens
│   │   ├── timesheet/     # Timesheet screens
│   │   └── profile/       # Profile screens
│   ├── api/               # API layer and HTTP client
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants
│   ├── styles/            # Global styles and themes
│   └── navigation/        # Navigation configuration
├── assets/                # Static assets (images, fonts)
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Template Analysis & Mapping Rules

### Identified Thymeleaf Templates
```
Authentication:
- login.html → /frontend/src/screens/auth/LoginScreen.tsx
- forgot-password.html → /frontend/src/screens/auth/ForgotPasswordScreen.tsx
- reset-password.html → /frontend/src/screens/auth/ResetPasswordScreen.tsx

Dashboard:
- dashboard.html → /frontend/src/screens/dashboard/DashboardScreen.tsx
- employee_dashboard.html → /frontend/src/screens/dashboard/EmployeeDashboardScreen.tsx

Employee Management:
- employee/list.html → /frontend/src/screens/employee/EmployeeListScreen.tsx
- employee/add.html → /frontend/src/screens/employee/AddEmployeeScreen.tsx
- employee/edit.html → /frontend/src/screens/employee/EditEmployeeScreen.tsx
- employee/view.html → /frontend/src/screens/employee/ViewEmployeeScreen.tsx
- employee/documents.html → /frontend/src/screens/employee/EmployeeDocumentsScreen.tsx

Project Management:
- project/list.html → /frontend/src/screens/project/ProjectListScreen.tsx
- project/add.html → /frontend/src/screens/project/AddProjectScreen.tsx
- project/edit.html → /frontend/src/screens/project/EditProjectScreen.tsx
- project/view.html → /frontend/src/screens/project/ViewProjectScreen.tsx

Timesheet:
- timesheet/list.html → /frontend/src/screens/timesheet/TimesheetListScreen.tsx
- timesheet/form.html → /frontend/src/screens/timesheet/TimesheetFormScreen.tsx
- timesheet/approvals.html → /frontend/src/screens/timesheet/ApprovalsScreen.tsx

Self Service:
- self-service/dashboard.html → /frontend/src/screens/self-service/SelfServiceDashboardScreen.tsx
- self-service/create-ticket.html → /frontend/src/screens/self-service/CreateTicketScreen.tsx

Offboarding:
- offboarding/list.html → /frontend/src/screens/offboarding/OffboardingListScreen.tsx
- offboarding/initiate.html → /frontend/src/screens/offboarding/InitiateOffboardingScreen.tsx
```

## Technology Stack Rules

### Core Technologies
- **React Native**: 0.72+
- **Expo**: SDK 49+
- **TypeScript**: 5.0+
- **React Navigation**: 6.x for routing
- **React Native Web**: For web compatibility
- **Expo Vector Icons**: Replace Bootstrap Icons

### State Management
- **React Hooks**: useState, useEffect, useContext
- **Context API**: For global state (auth, theme)
- **React Query/TanStack Query**: For server state management

### Styling Approach
- **StyleSheet API**: React Native's built-in styling
- **Styled Components**: For complex styling needs
- **React Native Elements**: UI component library
- **Tamagui**: Alternative modern UI library

### HTTP Client
- **Axios**: For API calls
- **React Query**: For caching and synchronization

## UI/UX Migration Rules

### Bootstrap to React Native Mapping
```typescript
// Bootstrap Classes → React Native Styles
.container → { paddingHorizontal: 20 }
.row → { flexDirection: 'row' }
.col → { flex: 1 }
.d-flex → { display: 'flex' }
.justify-content-center → { justifyContent: 'center' }
.align-items-center → { alignItems: 'center' }
.text-center → { textAlign: 'center' }
.mb-3 → { marginBottom: 12 }
.p-4 → { padding: 16 }
.btn-primary → Custom Button component with primary styling
.form-control → Custom TextInput component
.card → Custom Card component
.modal → React Native Modal component
```

### Color Scheme Preservation
```typescript
const colors = {
  primary: '#667eea',
  primaryGradient: ['#667eea', '#764ba2'],
  secondary: '#f093fb',
  success: '#4facfe',
  warning: '#43e97b',
  danger: '#fa709a',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#2d3748',
  textSecondary: '#718096',
  border: '#e2e8f0'
};
```

### Icon Mapping
```typescript
// Bootstrap Icons → Expo Vector Icons
bi-speedometer2 → MaterialIcons: dashboard
bi-people → MaterialIcons: people
bi-briefcase → MaterialIcons: work
bi-clock-history → MaterialIcons: history
bi-person → MaterialIcons: person
bi-shield-lock → MaterialIcons: lock
bi-eye → MaterialIcons: visibility
bi-eye-slash → MaterialIcons: visibility-off
```

## Component Architecture Rules

### Reusable Components
```typescript
// Common Components
- Button: Primary, Secondary, Outline variants
- Input: Text, Password, Email, Number variants
- Card: Basic card with shadow and border radius
- Modal: Overlay modal with backdrop
- Loading: Spinner and skeleton loaders
- Alert: Success, Error, Warning, Info variants
- Avatar: User avatar with initials fallback
- Badge: Notification badges and status indicators

// Form Components
- FormField: Input with label and validation
- FormSelect: Dropdown selection
- FormCheckbox: Checkbox with label
- FormDatePicker: Date selection
- FormFileUpload: File upload component

// Layout Components
- Screen: Base screen wrapper with safe area
- Header: Navigation header with title and actions
- Sidebar: Navigation sidebar (web only)
- TabBar: Bottom tab navigation (mobile)
- FloatingActionButton: FAB for primary actions

// Data Display Components
- Table: Data table with sorting and pagination
- List: Scrollable list with pull-to-refresh
- Chart: Chart components using react-native-chart-kit
- StatCard: Dashboard statistics cards
```

### Screen Component Pattern
```typescript
interface ScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const ExampleScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  
  // API calls
  const { data: apiData, isLoading, error } = useQuery(['key'], fetchFunction);
  
  // Effects
  useEffect(() => {
    // Component initialization
  }, []);
  
  // Render
  return (
    <Screen>
      <Header title="Screen Title" />
      {/* Screen content */}
    </Screen>
  );
};
```

## API Integration Rules

### API Client Setup
```typescript
// api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Service Pattern
```typescript
// api/employeeService.ts
export const employeeService = {
  getAll: () => apiClient.get('/employee/list'),
  getById: (id: string) => apiClient.get(`/employee/view/${id}`),
  create: (data: CreateEmployeeRequest) => apiClient.post('/employee/add', data),
  update: (id: string, data: UpdateEmployeeRequest) => 
    apiClient.post(`/employee/edit/${id}`, data),
  delete: (id: string) => apiClient.post(`/employee/delete/${id}`),
  uploadDocument: (id: string, file: FormData) => 
    apiClient.post(`/employee/${id}/documents/upload`, file, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
```

### Type Definitions
```typescript
// types/employee.ts
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  status: 'ONBOARDING' | 'ACTIVE' | 'OFFBOARDING' | 'TERMINATED';
  // ... other fields
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  // ... other fields
}
```

## Navigation Rules

### Navigation Structure
```typescript
// navigation/AppNavigator.tsx
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Main App Navigation
const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);

// Main App Tabs (Mobile)
const MainNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Employees" component={EmployeeNavigator} />
    <Tab.Screen name="Projects" component={ProjectNavigator} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
```

### Route Mapping
```typescript
// Route mapping from Thymeleaf URLs to React Navigation
const routeMapping = {
  '/login': 'Auth/Login',
  '/dashboard': 'Main/Dashboard',
  '/employee/list': 'Main/Employees/List',
  '/employee/add': 'Main/Employees/Add',
  '/employee/view/:id': 'Main/Employees/View',
  '/project/list': 'Main/Projects/List',
  '/timesheet/list': 'Main/Timesheets/List',
  // ... other routes
};
```

## Authentication Rules

### Auth Context
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth implementation
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Routes
```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'HR' | 'EMPLOYEE';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  
  if (requiredRole && !hasRole(user, requiredRole)) {
    return <AccessDeniedScreen />;
  }
  
  return <>{children}</>;
};
```

## Form Handling Rules

### Form Validation
```typescript
// hooks/useFormValidation.ts
import { useState } from 'react';

interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

export const useFormValidation = (initialValues: any, rules: ValidationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const validate = (fieldName?: string) => {
    const fieldsToValidate = fieldName ? [fieldName] : Object.keys(rules);
    const newErrors: { [key: string]: string } = {};
    
    fieldsToValidate.forEach(field => {
      const error = rules[field]?.(values[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };
  
  return { values, setValues, errors, validate };
};
```

### Form Components
```typescript
// components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  ...props
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);
```

## Data Management Rules

### React Query Setup
```typescript
// hooks/queries/useEmployees.ts
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: employeeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
```

## File Upload Rules

### File Upload Component
```typescript
// components/FileUpload.tsx
import * as DocumentPicker from 'expo-document-picker';

interface FileUploadProps {
  onFileSelect: (file: DocumentPicker.DocumentResult) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = ['application/pdf', 'image/*'],
  maxSize = 10
}) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedTypes,
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        if (result.size && result.size > maxSize * 1024 * 1024) {
          Alert.alert('Error', `File size must be less than ${maxSize}MB`);
          return;
        }
        onFileSelect(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };
  
  return (
    <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
      <MaterialIcons name="cloud-upload" size={24} color="#667eea" />
      <Text style={styles.uploadText}>Choose File</Text>
    </TouchableOpacity>
  );
};
```

## Testing Rules

### Component Testing
```typescript
// __tests__/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockPress).toHaveBeenCalled();
  });
});
```

## Performance Rules

### Optimization Guidelines
- Use `React.memo` for components that receive stable props
- Implement `useMemo` and `useCallback` for expensive computations
- Use `FlatList` for large data sets instead of `ScrollView`
- Implement lazy loading for screens using `React.lazy`
- Optimize images with appropriate sizes and formats
- Use `InteractionManager` for heavy operations

### Bundle Optimization
- Enable Hermes engine for better performance
- Use Metro bundler optimization settings
- Implement code splitting for web builds
- Minimize bundle size by removing unused dependencies

## Deployment Rules

### Environment Configuration
```typescript
// config/environment.ts
const config = {
  development: {
    API_URL: 'http://localhost:8080',
    DEBUG: true,
  },
  production: {
    API_URL: 'https://api.hrms.com',
    DEBUG: false,
  },
};

export default config[process.env.NODE_ENV || 'development'];
```

### Build Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:web": "expo build:web",
    "build:android": "expo build:android",
    "build:ios": "expo build:ios"
  }
}
```

## Migration Strategy Rules

### Phase 1: Foundation
1. Set up Expo project structure
2. Create base components and navigation
3. Implement authentication flow
4. Migrate login and dashboard screens

### Phase 2: Core Features
1. Migrate employee management screens
2. Migrate project management screens
3. Implement file upload functionality
4. Add form validation and error handling

### Phase 3: Advanced Features
1. Migrate timesheet functionality
2. Migrate self-service portal
3. Add charts and analytics
4. Implement notifications

### Phase 4: Polish & Optimization
1. Performance optimization
2. Accessibility improvements
3. Testing coverage
4. Documentation updates

## Code Quality Rules

### TypeScript Standards
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper typing for props and state
- Avoid `any` type usage

### Code Organization
- Follow single responsibility principle
- Use consistent naming conventions
- Implement proper error boundaries
- Add comprehensive error handling

### Documentation
- Document all public APIs
- Add inline comments for complex logic
- Maintain README files for each module
- Keep migration mapping updated

---

**Rules Version**: 1.0  
**Effective Date**: Current  
**Review Cycle**: Sprint-based updates