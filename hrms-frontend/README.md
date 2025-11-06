# HRMS Frontend - React Native & Web Application

A comprehensive HRMS frontend application built with React Native and Expo, providing both mobile and web interfaces that mirror all Thymeleaf template functionality.

## 🚀 Features

### Complete Template Migration
- **Login & Authentication** - JWT-based authentication with role management
- **Dashboard** - Role-based dashboards with statistics and analytics
- **Employee Management** - CRUD operations with document management
- **Project Management** - Project lifecycle with client/vendor tracking
- **Timesheet Management** - Time tracking with approval workflows
- **Offboarding** - Employee exit process management
- **Self Service Portal** - Employee ticket system and support
- **Invoice Management** - Financial tracking and invoice generation
- **Document Management** - File upload and document tracking

### Role-Based Access Control
- **Admin** - Full system access and user management
- **HR** - Employee and project management capabilities
- **Employee** - Personal dashboard and self-service features

### Cross-Platform Support
- **Mobile** - Native iOS and Android applications
- **Web** - Progressive web application
- **Responsive Design** - Adaptive UI for all screen sizes

## 🛠 Technology Stack

### Core Framework
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and toolchain
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation library with drawer navigation

### State Management
- **Redux Toolkit** - State management with RTK Query
- **React Redux** - React bindings for Redux

### UI Components
- **React Native Paper** - Material Design components
- **Expo Linear Gradient** - Gradient backgrounds
- **Expo Vector Icons** - Icon library

### Development Tools
- **Metro** - JavaScript bundler
- **Babel** - JavaScript compiler
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📱 Screen Structure

### Authentication
- `LoginScreen` - User authentication with role detection
- `ForgotPasswordScreen` - Password recovery
- `ResetPasswordScreen` - Password reset functionality

### Dashboard
- `DashboardScreen` - Role-based main dashboard with statistics

### Employee Management
- `EmployeeListScreen` - Employee listing with search and filters
- `EmployeeAddScreen` - Multi-step employee onboarding form
- `EmployeeViewScreen` - Detailed employee information display
- `EmployeeEditScreen` - Employee information editing

### Project Management
- `ProjectListScreen` - Project listing and management
- `ProjectAddScreen` - Multi-section project creation
- `ProjectViewScreen` - Project details and team assignment

### Timesheet Management
- `TimesheetListScreen` - Timesheet listing with approval actions
- `TimesheetFormScreen` - Complex timesheet creation with time entries and expenses
- `TimesheetViewScreen` - Timesheet details and approval workflow

### Offboarding
- `OffboardingListScreen` - Exit process tracking with statistics
- `OffboardingInitiateScreen` - Start employee offboarding process
- `OffboardingViewScreen` - Offboarding progress tracking

### Self Service
- `SelfServiceDashboardScreen` - Employee portal with ticket management
- `CreateTicketScreen` - Support ticket creation
- `ViewTicketScreen` - Ticket details and status tracking

### Invoice Management
- `InvoiceDashboardScreen` - Financial overview with pending/overdue invoices
- `InvoiceGenerateScreen` - Invoice creation and generation
- `InvoiceViewScreen` - Invoice details and payment tracking

## 🎨 UI/UX Features

### Design System
- **Material Design 3** - Modern design language
- **Gradient Cards** - Statistics display with visual appeal
- **Status Chips** - Color-coded status indicators
- **Data Tables** - Responsive table components with pagination
- **FAB Actions** - Floating action buttons for primary actions

### Navigation
- **Drawer Navigation** - Role-based sidebar menu
- **Stack Navigation** - Screen-to-screen navigation
- **Custom Drawer** - User profile and role display

### Components
- **GradientCard** - Reusable statistics card component
- **StatusChip** - Status indicator component
- **CustomDrawerContent** - Role-based navigation drawer

## 🔧 Installation & Setup

### Prerequisites
```bash
Node.js 18+
npm or yarn
Expo CLI
Android Studio (for Android development)
Xcode (for iOS development, macOS only)
```

### Installation
```bash
# Navigate to frontend directory
cd hrms-frontend

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### Environment Configuration
```typescript
// Create .env file
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_APP_NAME=HRMS Mobile
```

## 📊 State Management

### Redux Store Structure
```typescript
store/
├── index.ts              # Store configuration
└── slices/
    ├── authSlice.ts      # Authentication state
    ├── employeeSlice.ts  # Employee management
    ├── projectSlice.ts   # Project management
    ├── timesheetSlice.ts # Timesheet functionality
    ├── offboardingSlice.ts # Offboarding process
    └── dashboardSlice.ts # Dashboard statistics
```

### API Integration
```typescript
services/
└── api.ts               # Axios configuration and interceptors
```

## 🎯 Key Features Implementation

### Role-Based Navigation
- Dynamic menu items based on user roles
- Conditional screen access
- Role-specific functionality

### Data Tables
- Horizontal scrolling for mobile
- Pagination support
- Search and filtering
- Action buttons per row

### Form Management
- Multi-step forms with validation
- Dynamic form sections
- File upload support
- Auto-calculation features

### Statistics Dashboard
- Gradient cards for visual appeal
- Real-time data updates
- Interactive charts (planned)
- Role-specific metrics

## 🔐 Security Features

### Authentication
- JWT token management
- Automatic token refresh
- Secure storage with Expo SecureStore
- Role-based access control

### Data Protection
- Input validation
- Secure API communication
- Error handling and logging

## 📱 Platform-Specific Features

### Mobile
- Native navigation patterns
- Touch-optimized interactions
- Platform-specific styling
- Offline capability (planned)

### Web
- Responsive design
- Keyboard navigation
- Desktop-optimized layouts
- Progressive Web App features

## 🚀 Deployment

### Mobile Deployment
```bash
# Build for production
expo build:android
expo build:ios

# Or using EAS Build
eas build --platform android
eas build --platform ios
```

### Web Deployment
```bash
# Build web version
expo build:web

# Deploy to hosting service
npm run deploy
```

## 🧪 Testing

### Test Structure
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance Optimization

### Bundle Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis

### Runtime Performance
- Memoization
- Efficient re-renders
- Optimized list rendering
- Memory management

## 🔄 Migration from Thymeleaf

### Complete Feature Parity
- ✅ All screens migrated
- ✅ Role-based access control
- ✅ Form functionality
- ✅ Data tables and pagination
- ✅ Statistics and dashboards
- ✅ File upload capabilities
- ✅ Search and filtering
- ✅ CRUD operations

### Enhanced Features
- 📱 Mobile-first design
- 🎨 Modern UI components
- ⚡ Better performance
- 🔄 Real-time updates
- 📊 Interactive elements

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use React Native Paper components
3. Implement responsive design
4. Add proper error handling
5. Write comprehensive tests

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component documentation

## 📄 License

Proprietary - OriginHubs HRMS System

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready