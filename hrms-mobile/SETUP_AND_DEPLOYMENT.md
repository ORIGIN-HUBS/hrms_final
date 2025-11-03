# HRMS Pro Mobile - Setup and Deployment Guide

## 📋 Table of Contents
1. [Development Setup](#development-setup)
2. [Running the Application](#running-the-application)
3. [Backend Configuration](#backend-configuration)
4. [Building for Production](#building-for-production)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

## 🛠️ Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   ```bash
   node --version  # Should be v16+
   ```

2. **npm or Yarn**
   ```bash
   npm --version
   # or
   yarn --version
   ```

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   expo --version
   ```

4. **Git**
   ```bash
   git --version
   ```

### Platform-Specific Requirements

#### For iOS Development (macOS only)
1. **Xcode** (latest version from App Store)
2. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```
3. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```
4. **iOS Simulator** (included with Xcode)

#### For Android Development
1. **Android Studio** (latest version)
2. **Android SDK** (API level 31+)
3. **Android Emulator** or physical device
4. **Java Development Kit (JDK)** 11 or higher

#### For Web Development
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Initial Setup

1. **Navigate to the project directory**
   ```bash
   cd hrms-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
   
   This will install all required packages including:
   - React Native and Expo
   - Navigation libraries
   - Redux Toolkit
   - Axios
   - Formik and Yup
   - UI components
   - And more...

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   API_BASE_URL=http://localhost:8080
   API_TIMEOUT=30000
   NODE_ENV=development
   APP_NAME=HRMS Pro
   APP_VERSION=1.0.0
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
   SESSION_TIMEOUT=3600000
   ```

4. **Verify TypeScript configuration**
   ```bash
   npm run type-check
   ```

## 🚀 Running the Application

### Start Development Server

```bash
npm start
# or
yarn start
# or
expo start
```

This will start the Metro bundler and open Expo DevTools in your browser.

### Run on iOS Simulator

```bash
npm run ios
# or
yarn ios
# or
expo start --ios
```

**Note**: Requires macOS with Xcode installed.

### Run on Android Emulator

```bash
npm run android
# or
yarn android
# or
expo start --android
```

**Note**: Requires Android Studio and emulator setup.

### Run on Web Browser

```bash
npm run web
# or
yarn web
# or
expo start --web
```

Opens in your default browser at `http://localhost:19006`

### Run on Physical Device

1. Install **Expo Go** app from App Store (iOS) or Google Play (Android)
2. Start the development server: `npm start`
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## 🔧 Backend Configuration

### Spring Boot Backend Setup

1. **Ensure backend is running**
   ```bash
   cd /path/to/hrms_final
   ./mvnw spring-boot:run
   ```
   
   Backend should be accessible at `http://localhost:8080`

2. **Verify CORS configuration**
   
   In `SecurityConfig.java`, ensure CORS allows mobile app:
   ```java
   @Bean
   public CorsConfigurationSource corsConfigurationSource() {
       CorsConfiguration configuration = new CorsConfiguration();
       configuration.setAllowedOrigins(Arrays.asList(
           "http://localhost:3000",
           "http://localhost:19006",  // Expo web
           "exp://localhost:19000"     // Expo mobile
       ));
       configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
       configuration.setAllowCredentials(true);
       configuration.setAllowedHeaders(Arrays.asList("*"));
       // ...
   }
   ```

3. **Test API connectivity**
   ```bash
   curl http://localhost:8080/api/auth/user
   ```

### Network Configuration

#### For iOS Simulator
- Use `http://localhost:8080` (localhost works)

#### For Android Emulator
- Use `http://10.0.2.2:8080` (Android emulator's localhost)
- Update `.env`:
  ```env
  API_BASE_URL=http://10.0.2.2:8080
  ```

#### For Physical Device
- Use your computer's IP address
- Find your IP:
  ```bash
  # macOS/Linux
  ifconfig | grep "inet "
  
  # Windows
  ipconfig
  ```
- Update `.env`:
  ```env
  API_BASE_URL=http://192.168.1.100:8080
  ```
- Ensure device and computer are on same network

## 📦 Building for Production

### iOS Build

1. **Configure app.json**
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.originhubs.hrms",
         "buildNumber": "1.0.0"
       }
     }
   }
   ```

2. **Build with EAS (Recommended)**
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform ios
   ```

3. **Or build locally**
   ```bash
   expo build:ios
   ```

### Android Build

1. **Configure app.json**
   ```json
   {
     "expo": {
       "android": {
         "package": "com.originhubs.hrms",
         "versionCode": 1
       }
     }
   }
   ```

2. **Build with EAS (Recommended)**
   ```bash
   eas build --platform android
   ```

3. **Or build locally**
   ```bash
   expo build:android
   ```

### Web Build

```bash
expo build:web
```

Output will be in `web-build/` directory.

## 🌐 Deployment

### iOS Deployment (App Store)

1. **Prerequisites**
   - Apple Developer Account ($99/year)
   - App Store Connect access

2. **Build and Submit**
   ```bash
   eas build --platform ios
   eas submit --platform ios
   ```

3. **Manual Submission**
   - Download IPA from build
   - Upload to App Store Connect using Transporter
   - Fill in app metadata
   - Submit for review

### Android Deployment (Google Play)

1. **Prerequisites**
   - Google Play Developer Account ($25 one-time)

2. **Build and Submit**
   ```bash
   eas build --platform android
   eas submit --platform android
   ```

3. **Manual Submission**
   - Download APK/AAB from build
   - Upload to Google Play Console
   - Fill in app metadata
   - Submit for review

### Web Deployment

#### Deploy to Netlify

1. **Build the app**
   ```bash
   expo build:web
   ```

2. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --dir=web-build --prod
   ```

#### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   expo build:web
   vercel --prod
   ```

#### Deploy to AWS S3

1. **Build the app**
   ```bash
   expo build:web
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync web-build/ s3://your-bucket-name --acl public-read
   ```

## 🐛 Troubleshooting

### Common Issues

#### 1. Metro Bundler Issues
```bash
# Clear cache and restart
expo start -c
# or
npm start -- --reset-cache
```

#### 2. iOS Build Fails
```bash
# Clear iOS build cache
cd ios
pod deintegrate
pod install
cd ..
```

#### 3. Android Build Fails
```bash
# Clear Android build cache
cd android
./gradlew clean
cd ..
```

#### 4. TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Fix auto-fixable issues
npm run lint -- --fix
```

#### 5. API Connection Issues

**Check backend is running:**
```bash
curl http://localhost:8080/api/auth/user
```

**Check CORS configuration:**
- Ensure backend allows requests from mobile app
- Check network configuration for physical devices

**For Android Emulator:**
- Use `http://10.0.2.2:8080` instead of `localhost`

**For Physical Device:**
- Use computer's IP address
- Ensure same network
- Check firewall settings

#### 6. Dependencies Issues
```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# or
yarn install
```

#### 7. Expo Go App Issues
```bash
# Update Expo Go app to latest version
# Restart development server
expo start -c
```

### Performance Issues

1. **Enable Hermes (Android)**
   ```json
   // app.json
   {
     "expo": {
       "android": {
         "enableHermes": true
       }
     }
   }
   ```

2. **Optimize Images**
   - Use appropriate image sizes
   - Compress images before upload
   - Use WebP format where possible

3. **Enable Production Mode**
   ```bash
   expo start --no-dev --minify
   ```

### Debug Mode

```bash
# Enable debug mode
expo start --dev

# Open React Native Debugger
# Press 'j' in terminal to open debugger
```

## 📱 Testing

### Run on Multiple Devices

```bash
# iOS Simulator (different devices)
expo start --ios --simulator="iPhone 14 Pro"
expo start --ios --simulator="iPad Pro"

# Android Emulator (different devices)
expo start --android --device="Pixel_6_API_31"
```

### Test Different Scenarios

1. **Test with slow network**
   - Use Chrome DevTools Network throttling
   - Test offline functionality

2. **Test different screen sizes**
   - Test on various device simulators
   - Check responsive design

3. **Test role-based access**
   - Login as ADMIN, HR, EMPLOYEE
   - Verify correct screens/features shown

## 🔐 Security Checklist

Before deployment:

- [ ] Remove console.log statements
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS for API calls
- [ ] Implement proper error handling
- [ ] Add rate limiting
- [ ] Validate all user inputs
- [ ] Secure file uploads
- [ ] Implement session timeout
- [ ] Add biometric authentication (optional)
- [ ] Enable code obfuscation

## 📊 Monitoring

### Add Analytics (Optional)

```bash
npm install expo-firebase-analytics
```

### Add Crash Reporting (Optional)

```bash
npm install @sentry/react-native
```

## 🆘 Support

For issues:
1. Check this troubleshooting guide
2. Review Expo documentation: https://docs.expo.dev
3. Check React Native docs: https://reactnative.dev
4. Review backend API documentation

---

**Last Updated**: 2024
**Version**: 1.0.0

