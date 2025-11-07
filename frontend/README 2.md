# HRMS Frontend - React Native with Expo

This is the new React Native frontend for the HRMS application, built with Expo and TypeScript.

## Technology Stack

- **React Native**: 0.72.6
- **Expo**: SDK 49
- **TypeScript**: 5.1.3
- **React Navigation**: 6.x
- **React Query**: 5.8.4
- **Axios**: HTTP client
- **Expo Vector Icons**: Icon library

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, Card)
│   ├── forms/          # Form-specific components
│   ├── layout/         # Layout components (Sidebar, Header)
│   └── charts/         # Chart components
├── screens/            # Screen components (pages)
│   ├── auth/          # Login, forgot password, etc.
│   ├── dashboard/     # Dashboard screens
│   ├── employee/      # Employee management screens
│   └── ...            # Other feature screens
├── api/               # API layer and HTTP client
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── constants/         # App constants (colors, spacing)
├── styles/            # Global styles and themes
└── navigation/        # Navigation configuration
```

## Template Migration Mapping

### Completed Migrations

| Thymeleaf Template | React Native Screen | Status |
|-------------------|-------------------|---------|
| `login.html` | `src/screens/auth/LoginScreen.tsx` | ✅ Complete |
| `dashboard.html` | `src/screens/dashboard/DashboardScreen.tsx` | ✅ Complete |

### Pending Migrations

| Thymeleaf Template | React Native Screen | Priority |
|-------------------|-------------------|----------|
| `employee/list.html` | `src/screens/employee/EmployeeListScreen.tsx` | High |
| `employee/add.html` | `src/screens/employee/AddEmployeeScreen.tsx` | High |
| `project/list.html` | `src/screens/project/ProjectListScreen.tsx` | High |
| `timesheet/list.html` | `src/screens/timesheet/TimesheetListScreen.tsx` | Medium |
| ... | ... | ... |

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

### Running the Application

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Run on web:**
   ```bash
   npm run web
   ```

3. **Run on mobile (iOS/Android):**
   ```bash
   npm run ios    # iOS simulator
   npm run android # Android emulator
   ```

## Backend Integration

The frontend connects to the Spring Boot backend running on `http://localhost:8080` by default.

### API Endpoints Used

- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/recent-employees` - Recent hires
- `GET /api/dashboard/recent-projects` - Recent projects

### Authentication

The app uses session-based authentication with CSRF protection, matching the existing Spring Security configuration.

## UI/UX Preservation

The React Native implementation preserves the original Thymeleaf design:

- **Colors**: Maintains the gradient color scheme (#667eea, #764ba2, etc.)
- **Layout**: Sidebar navigation with main content area
- **Components**: Cards, buttons, and forms match Bootstrap styling
- **Icons**: Bootstrap Icons mapped to Material Icons
- **Responsive**: Adapts to different screen sizes

## Development Guidelines

### Component Structure

```typescript
interface ComponentProps {
  // Define props with TypeScript
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <View style={styles.container}>
      {/* JSX content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // React Native styles
  },
});
```

### API Integration

```typescript
// Use React Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: apiFunction,
});
```

### Styling

- Use `StyleSheet.create()` for component styles
- Import colors and spacing from constants
- Follow React Native Web best practices

## Building for Production

### Web Build

```bash
npm run build:web
```

### Mobile Builds

```bash
# iOS
expo build:ios

# Android  
expo build:android
```

## Migration Progress

- [x] Project setup and configuration
- [x] Core components (Button, Input, Card)
- [x] Login screen with authentication
- [x] Dashboard screen with statistics
- [x] Navigation structure with sidebar
- [ ] Employee management screens
- [ ] Project management screens
- [ ] Timesheet functionality
- [ ] Self-service portal
- [ ] File upload components

## Next Steps

1. **Complete core screens**: Employee and Project management
2. **Add form validation**: Client-side validation matching server rules
3. **Implement file uploads**: Document management functionality
4. **Add charts**: Dashboard analytics with react-native-chart-kit
5. **Testing**: Unit and integration tests
6. **Performance optimization**: Code splitting and lazy loading

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Web compatibility**: Some React Native components may need web alternatives
3. **API connection**: Ensure backend is running on correct port

### Development Tips

- Use Expo DevTools for debugging
- Test on both web and mobile platforms
- Use TypeScript strict mode for better code quality
- Follow React Native performance best practices