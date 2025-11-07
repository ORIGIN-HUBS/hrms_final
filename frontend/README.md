# HRMS Frontend - React Native with Expo

This is the new React Native frontend for the HRMS application, built with Expo and TypeScript. It replaces the existing Thymeleaf-based frontend while maintaining the same UI/UX and functionality.

## Technology Stack

- **React Native**: 0.72+
- **Expo**: SDK 49+
- **TypeScript**: 5.0+
- **React Navigation**: 6.x for routing
- **React Native Web**: For web compatibility
- **Expo Vector Icons**: For icons
- **TanStack Query**: For server state management
- **Axios**: For API calls

## Project Structure

```
/frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input)
│   │   ├── forms/          # Form-specific components
│   │   └── layout/         # Layout components (Screen)
│   ├── screens/            # Screen components (pages)
│   │   ├── auth/          # Login, forgot password, etc.
│   │   ├── dashboard/     # Dashboard screens
│   │   ├── employee/      # Employee management screens
│   │   └── project/       # Project management screens
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

## Template Migration Mapping

### Thymeleaf → React Native Screen Mapping

| Thymeleaf Template | React Native Screen | Status |
|-------------------|-------------------|---------|
| `login.html` | `src/screens/auth/LoginScreen.tsx` | ✅ Implemented |
| `dashboard.html` | `src/screens/dashboard/DashboardScreen.tsx` | ✅ Implemented |
| `employee/list.html` | `src/screens/employee/EmployeeListScreen.tsx` | 🚧 Planned |
| `employee/add.html` | `src/screens/employee/AddEmployeeScreen.tsx` | 🚧 Planned |
| `employee/view.html` | `src/screens/employee/ViewEmployeeScreen.tsx` | 🚧 Planned |
| `project/list.html` | `src/screens/project/ProjectListScreen.tsx` | 🚧 Planned |
| `project/add.html` | `src/screens/project/AddProjectScreen.tsx` | 🚧 Planned |

## API Integration

The frontend communicates with the Spring Boot backend via REST APIs:

- **Base URL**: `http://localhost:8080` (configurable via `.env`)
- **Authentication**: Session-based with cookies
- **CORS**: Enabled for `http://localhost:3000`

### API Endpoints Used

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user info
- `GET /api/dashboard/analytics` - Dashboard statistics

## Installation & Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run web
```

4. **For mobile development:**
```bash
# iOS
npm run ios

# Android
npm run android
```

## Running the Application

### Prerequisites
- Spring Boot backend running on `http://localhost:8080`
- Node.js 16+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`

### Development Workflow

1. **Start the Spring Boot backend:**
```bash
cd /path/to/MVP
mvn spring-boot:run
```

2. **Start the React Native frontend:**
```bash
cd frontend
npm run web
```

3. **Access the application:**
   - Web: http://localhost:3000
   - Mobile: Use Expo Go app to scan QR code

## UI/UX Parity

The React Native frontend maintains visual parity with the original Thymeleaf design:

### Color Scheme
- Primary: `#667eea`
- Success: `#4facfe`
- Warning: `#43e97b`
- Danger: `#fa709a`
- Background: `#f8fafc`

### Components
- **Button**: Matches Bootstrap button styles with variants (primary, secondary, outline, danger)
- **Input**: Form inputs with validation, icons, and error states
- **Screen**: Base layout wrapper with safe area and scrolling support

### Login Screen Features
- Animated background shapes
- Glassmorphism card design
- Form validation
- Loading states
- Error handling

### Dashboard Features
- Statistics cards with icons and gradients
- Recent activities sections
- Responsive grid layout
- Real-time data from backend APIs

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```

For production:
```env
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

## Build & Deployment

### Web Build
```bash
npm run build:web
```

### Mobile Builds
```bash
# Android
expo build:android

# iOS
expo build:ios
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Migration Progress

### Phase 1: Foundation ✅
- [x] Project setup with Expo + TypeScript
- [x] Navigation structure
- [x] API client configuration
- [x] Base components (Button, Input, Screen)
- [x] Login screen implementation
- [x] Dashboard screen implementation

### Phase 2: Core Features 🚧
- [ ] Employee management screens
- [ ] Project management screens
- [ ] Form validation and error handling
- [ ] File upload functionality

### Phase 3: Advanced Features 📋
- [ ] Timesheet functionality
- [ ] Self-service portal
- [ ] Charts and analytics
- [ ] Notifications

### Phase 4: Polish & Optimization 📋
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Testing coverage
- [ ] Documentation updates

## Development Notes

### Authentication Flow
The app uses session-based authentication with the Spring Boot backend. The login flow:
1. User enters credentials
2. POST to `/api/auth/login`
3. Backend creates session and returns user info
4. Frontend stores user state and navigates to main app

### State Management
- **React Query**: For server state (API data, caching)
- **React Context**: For global app state (auth, theme)
- **Local State**: For component-specific state

### Styling Approach
- **StyleSheet API**: React Native's built-in styling
- **Consistent Design**: Matches original Thymeleaf design
- **Responsive**: Adapts to different screen sizes

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure Spring Boot backend is running on port 8080
   - Check CORS configuration in backend
   - Verify API_URL in `.env` file

2. **Metro Bundler Issues**
   - Clear cache: `npx expo start --clear`
   - Reset node_modules: `rm -rf node_modules && npm install`

3. **TypeScript Errors**
   - Check type definitions in `src/types/index.ts`
   - Ensure all imports have proper types

## Contributing

1. Follow the existing code structure and naming conventions
2. Add TypeScript types for all new interfaces
3. Test on both web and mobile platforms
4. Update this README when adding new features

## Support

For issues or questions:
- Check the troubleshooting section
- Review application logs in the console
- Verify backend API connectivity