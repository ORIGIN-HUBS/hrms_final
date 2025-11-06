# HRMS Technology Stack

## Backend Technology Stack

### Core Framework
- **Java 21**: Latest LTS version with modern language features
- **Spring Boot 3.5.7**: Enterprise-grade application framework
- **Spring Security 6**: Authentication and authorization
- **Spring Data JPA**: Data access and ORM layer
- **Hibernate**: Object-relational mapping

### Database & Storage
- **PostgreSQL**: Primary production database (Neon cloud hosting)
- **H2 Database**: In-memory database for local development
- **HikariCP**: High-performance connection pooling
- **File System**: Local storage for document uploads

### Security & Authentication
- **JWT (JSON Web Tokens)**: Stateless authentication
- **BCrypt**: Password hashing and encryption
- **JJWT Library 0.11.5**: JWT implementation
- **Spring Security**: Role-based access control

### API & Documentation
- **REST APIs**: RESTful web services
- **SpringDoc OpenAPI 2.2.0**: API documentation (Swagger UI)
- **Jackson**: JSON serialization/deserialization
- **Bean Validation**: Input validation

### Monitoring & Operations
- **Spring Boot Actuator**: Application monitoring
- **Micrometer**: Metrics collection
- **Prometheus**: Metrics registry
- **Logback**: Logging framework

### Build & Development
- **Maven**: Dependency management and build tool
- **Lombok**: Boilerplate code reduction
- **Commons IO 2.11.0**: File handling utilities

## Mobile Technology Stack

### Core Framework
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe JavaScript development
- **Expo**: Development platform and toolchain

### State Management & Data
- **Redux Toolkit**: State management
- **RTK Query**: Data fetching and caching
- **AsyncStorage**: Local data persistence

### Navigation & UI
- **React Navigation**: Navigation library
- **Custom Components**: Reusable UI component library
- **Theme System**: Consistent design system

### Development Tools
- **Metro**: JavaScript bundler
- **Babel**: JavaScript compiler
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Development Environment

### Prerequisites
```bash
# Backend Requirements
Java 21 (Oracle JDK or OpenJDK)
Maven 3.8+
PostgreSQL 14+
IDE (IntelliJ IDEA, Eclipse, VS Code)

# Mobile Requirements
Node.js 18+
npm or yarn
Expo CLI
Android Studio (for Android development)
Xcode (for iOS development, macOS only)
```

### Backend Development Commands
```bash
# Build project
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Run tests
./mvnw test

# Package for deployment
./mvnw clean package

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Mobile Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for production
npm run build

# Run tests
npm test
```

## Configuration Management

### Backend Configuration (application.properties)
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://[host]/[database]
spring.datasource.username=[username]
spring.datasource.password=[password]

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# File Upload
spring.servlet.multipart.max-file-size=10MB
file.upload-dir=./uploads

# JWT Configuration
jwt.secret=[secret-key]
jwt.expiration=86400000

# Server Configuration
server.port=8080
```

### Mobile Configuration
```typescript
// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Environment Variables
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_APP_NAME=HRMS Mobile
```

## Database Configuration

### Production Database (Neon PostgreSQL)
- **Host**: ep-billowing-meadow-ad4cij1i-pooler.c-2.us-east-1.aws.neon.tech
- **Database**: neondb
- **SSL**: Required
- **Connection Pool**: HikariCP with 10 max connections

### Development Database Options
1. **Local PostgreSQL**: Full-featured local development
2. **H2 In-Memory**: Quick testing and development
3. **Docker PostgreSQL**: Containerized development environment

## Deployment Architecture

### Backend Deployment
- **JAR Packaging**: Spring Boot executable JAR
- **Java 21 Runtime**: Required on deployment environment
- **Environment Variables**: Configuration through environment variables
- **Health Checks**: Actuator endpoints for monitoring

### Mobile Deployment
- **Expo Build Service**: Cloud-based build and deployment
- **App Store Distribution**: iOS App Store and Google Play Store
- **Over-the-Air Updates**: Expo Updates for quick deployments

## Security Configuration

### Backend Security
- **HTTPS**: SSL/TLS encryption in production
- **CORS**: Configured for mobile app origins
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation at API layer
- **SQL Injection Protection**: JPA/Hibernate parameterized queries

### Mobile Security
- **Secure Storage**: Encrypted local storage for sensitive data
- **API Authentication**: JWT token-based API access
- **Network Security**: HTTPS-only API communication
- **Input Sanitization**: Client-side input validation

## Performance Optimization

### Backend Performance
- **Connection Pooling**: HikariCP for database connections
- **JPA Optimization**: Lazy loading and query optimization
- **Caching**: Application-level caching for frequently accessed data
- **Pagination**: Efficient data retrieval for large datasets

### Mobile Performance
- **State Management**: Efficient Redux state updates
- **Image Optimization**: Optimized image loading and caching
- **Navigation**: Optimized screen transitions
- **Bundle Optimization**: Code splitting and lazy loading

## Development Workflow

### Backend Development
1. **Local Development**: H2 database for quick iteration
2. **Testing**: Unit and integration tests with Spring Boot Test
3. **Code Quality**: Lombok for clean code, validation annotations
4. **API Documentation**: Automatic OpenAPI documentation generation

### Mobile Development
1. **Component Development**: Reusable component library
2. **State Management**: Redux DevTools for debugging
3. **Testing**: Jest and React Native Testing Library
4. **Hot Reloading**: Fast development iteration with Expo