# HRMS Mobile App - Navigation Guide

## 📱 Navigation Architecture

The HRMS Mobile App uses **React Navigation 6** with a hierarchical navigation structure combining:
- **Drawer Navigator** (Main menu)
- **Stack Navigators** (Screen flows within each module)
- **Role-Based Access Control** (Admin, HR, Employee)

---

## 🏗️ Navigation Structure

```
AppNavigator (Root)
├── AuthNavigator (Stack) - Unauthenticated users
│   ├── Login
│   ├── ForgotPassword
│   └── ResetPassword
│
└── MainNavigator (Drawer) - Authenticated users
    ├── Dashboard (Stack)
    │   ├── AdminDashboard (Admin/HR)
    │   └── EmployeeDashboard (Employee)
    │
    ├── Employees (Stack) [Admin/HR only]
    │   ├── EmployeeList
    │   ├── EmployeeAdd
    │   ├── EmployeeEdit
    │   ├── EmployeeView
    │   └── EmployeeDocuments
    │
    ├── Projects (Stack) [All users]
    │   ├── ProjectList
    │   ├── MyProjects
    │   ├── ProjectAdd
    │   ├── ProjectEdit
    │   └── ProjectView
    │
    ├── Timesheets (Stack) [All users]
    │   ├── TimesheetList
    │   ├── MyTimesheets
    │   ├── TimesheetForm
    │   ├── TimesheetView
    │   ├── TimesheetApprovals
    │   └── TimesheetDashboard
    │
    ├── SelfService (Stack) [All users]
    │   ├── SelfServiceDashboard
    │   ├── CreateTicket
    │   ├── ViewTicket
    │   └── AdminTickets
    │
    ├── Notifications (Stack) [All users]
    │   └── NotificationList
    │
    ├── Users (Stack) [Admin/HR only]
    │   ├── UserList
    │   ├── UserAdd
    │   ├── UserEdit
    │   └── UserView
    │
    ├── Offboarding (Stack) [Admin/HR only]
    │   ├── OffboardingList
    │   ├── OffboardingInitiate
    │   ├── OffboardingView
    │   └── OffboardingEdit
    │
    ├── Documents (Screen) [Admin/HR only]
    │
    ├── Invoices (Stack) [Admin/HR only]
    │   ├── InvoiceDashboard
    │   ├── InvoiceGenerate
    │   └── InvoiceView
    │
    ├── Reports (Stack) [Admin/HR only]
    │   ├── ReportsList
    │   └── Analytics
    │
    ├── Profile (Stack) [All users]
    │   ├── MyProfile
    │   └── ChangePassword
    │
    └── Settings (Stack) [All users]
        ├── SettingsMain
        └── About
```

---

## 🔐 Role-Based Access Control

### All Users (EMPLOYEE, HR, ADMIN)
- Dashboard
- Projects
- Timesheets
- Self Service
- Notifications
- Profile
- Settings

### Admin & HR Only
- Employees
- Users
- Offboarding
- Documents
- Invoices
- Reports & Analytics

---

## 📂 Navigator Files

### Core Navigators
- `AppNavigator.tsx` - Root navigator with auth check
- `MainNavigator.tsx` - Main drawer navigator
- `AuthNavigator.tsx` - Authentication flow

### Module Navigators
- `DashboardNavigator.tsx` - Dashboard screens
- `EmployeeNavigator.tsx` - Employee management
- `ProjectNavigator.tsx` - Project management
- `TimesheetNavigator.tsx` - Timesheet management
- `SelfServiceNavigator.tsx` - Support tickets
- `NotificationNavigator.tsx` - Notifications
- `UserNavigator.tsx` - User management
- `OffboardingNavigator.tsx` - Offboarding process
- `InvoiceNavigator.tsx` - Invoice management
- `ProfileNavigator.tsx` - User profile
- `SettingsNavigator.tsx` - App settings
- `ReportsNavigator.tsx` - Reports & analytics

### Type Definitions
- `types.ts` - TypeScript navigation types

---

## 🎯 Navigation Usage Examples

### Navigate to a screen
```typescript
import { useNavigation } from '@react-navigation/native';

const MyComponent = () => {
  const navigation = useNavigation();
  
  // Navigate to a screen
  navigation.navigate('EmployeeList');
  
  // Navigate with parameters
  navigation.navigate('EmployeeView', { employeeId: 123 });
  
  // Navigate to nested screen
  navigation.navigate('Employees', {
    screen: 'EmployeeView',
    params: { employeeId: 123 }
  });
};
```

### Go back
```typescript
navigation.goBack();
```

### Replace current screen
```typescript
navigation.replace('Login');
```

### Reset navigation stack
```typescript
navigation.reset({
  index: 0,
  routes: [{ name: 'Dashboard' }],
});
```

---

## 🎨 Drawer Menu Icons

| Menu Item | Icon | Access |
|-----------|------|--------|
| Dashboard | home-outline | All |
| Employees | people-outline | Admin/HR |
| Projects | briefcase-outline | All |
| Timesheets | time-outline | All |
| Self Service | help-circle-outline | All |
| Notifications | notifications-outline | All |
| Users | people-circle-outline | Admin/HR |
| Offboarding | exit-outline | Admin/HR |
| Documents | document-text-outline | Admin/HR |
| Invoices | receipt-outline | Admin/HR |
| Reports & Analytics | bar-chart-outline | Admin/HR |
| Profile | person-circle-outline | All |
| Settings | settings-outline | All |

---

## 🔄 Navigation Flow Examples

### Employee Management Flow
1. User opens drawer → Employees
2. EmployeeList screen loads
3. User taps "Add Employee"
4. EmployeeAdd screen opens
5. User fills form and submits
6. Navigate back to EmployeeList with success message

### Timesheet Submission Flow
1. User opens drawer → Timesheets
2. MyTimesheets screen loads
3. User taps "Create Timesheet"
4. TimesheetForm screen opens
5. User fills timesheet entries
6. User submits timesheet
7. Navigate back to MyTimesheets

### Support Ticket Flow
1. User opens drawer → Self Service
2. SelfServiceDashboard screen loads
3. User taps "Create Ticket"
4. CreateTicket screen opens
5. User fills ticket details
6. User submits ticket
7. Navigate to ViewTicket with new ticket ID

---

## 🛠️ Custom Drawer Content

The app uses a custom drawer with:
- **Header Section**
  - User avatar with initials
  - User full name
  - User email
  - Gradient background

- **Menu Items**
  - Role-based menu items
  - Icon-based navigation
  - Active state highlighting

- **Footer Section**
  - Logout button

---

## 📱 Screen Options

### Global Options (MainNavigator)
```typescript
screenOptions={{
  headerShown: true,
  drawerActiveTintColor: '#667eea',
  drawerInactiveTintColor: '#6b7280',
  headerStyle: {
    backgroundColor: '#667eea',
  },
  headerTintColor: '#fff',
}}
```

### Stack Navigator Options
```typescript
screenOptions={{
  headerShown: false,
  animation: 'slide_from_right',
}}
```

---

## 🔍 Deep Linking (Future Enhancement)

The navigation structure supports deep linking for:
- `/employees/:id` → EmployeeView
- `/projects/:id` → ProjectView
- `/timesheets/:id` → TimesheetView
- `/tickets/:id` → ViewTicket
- `/invoices/:id` → InvoiceView

---

## 🧪 Testing Navigation

### Test navigation flows
```typescript
// In your test file
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent } from '@testing-library/react-native';

test('navigates to employee view', () => {
  const { getByText } = render(
    <NavigationContainer>
      <EmployeeNavigator />
    </NavigationContainer>
  );
  
  fireEvent.press(getByText('View Employee'));
  // Assert navigation occurred
});
```

---

## 📊 Navigation Statistics

- **Total Navigators**: 14
- **Total Screens**: 45
- **Drawer Menu Items**: 13
- **Role-Based Items**: 6 (Admin/HR only)
- **Public Items**: 7 (All users)

---

## 🚀 Best Practices

1. **Always use typed navigation**
   ```typescript
   import { NativeStackNavigationProp } from '@react-navigation/native-stack';
   import { EmployeeStackParamList } from '@/navigation/types';
   
   type Props = {
     navigation: NativeStackNavigationProp<EmployeeStackParamList, 'EmployeeView'>;
   };
   ```

2. **Use useNavigation hook for functional components**
   ```typescript
   const navigation = useNavigation();
   ```

3. **Use useRoute hook for route params**
   ```typescript
   const route = useRoute();
   const { employeeId } = route.params;
   ```

4. **Check user roles before navigation**
   ```typescript
   const { isAdmin, isHR } = useAuth();
   if (isAdmin() || isHR()) {
     navigation.navigate('Employees');
   }
   ```

5. **Handle navigation errors gracefully**
   ```typescript
   try {
     navigation.navigate('EmployeeView', { employeeId });
   } catch (error) {
     console.error('Navigation error:', error);
   }
   ```

---

**Last Updated**: 2025-10-30

