# HRMS Project Structure

## High-Level Architecture
The HRMS system follows a multi-tier architecture with separate backend API services and mobile frontend applications, designed for scalability and maintainability.

## Root Directory Structure
```
hrms/
├── src/                          # Java Spring Boot Backend
├── hrms-mobile/                  # React Native Mobile App
├── uploads/                      # File storage for documents
├── target/                       # Maven build artifacts
├── .amazonq/                     # AI assistant configuration
├── pom.xml                       # Maven project configuration
└── README.md                     # Project documentation
```

## Backend Architecture (src/)

### Core Application Structure
```
src/main/java/com/originhubs/HRMS/
├── HrmsApplication.java          # Spring Boot main application
├── config/                       # Configuration classes
├── controller/api/               # REST API controllers
├── dto/                          # Data Transfer Objects
├── exception/                    # Exception handling
├── model/                        # JPA entities
├── repository/                   # Data access layer
├── security/                     # Authentication & authorization
├── service/                      # Business logic layer
└── validation/                   # Input validation utilities
```

### Configuration Layer (config/)
- **SecurityConfig.java**: Spring Security configuration with JWT authentication
- **DataInitializer.java**: Database seeding and initial data setup
- **CorsConfig.java**: Cross-origin resource sharing configuration
- **JacksonConfig.java**: JSON serialization configuration
- **OpenApiConfig.java**: Swagger/OpenAPI documentation setup
- **AuditConfig.java**: Entity auditing configuration
- **CacheConfig.java**: Caching strategy configuration

### API Layer (controller/api/)
- **AuthApiController.java**: Authentication endpoints (login, logout, password reset)
- **EmployeeApiController.java**: Employee CRUD operations and management
- **ProjectApiController.java**: Project management and assignment
- **TimesheetApiController.java**: Time tracking and expense management
- **DashboardApiController.java**: Analytics and reporting endpoints
- **EmployeeDocumentApiController.java**: Document upload and management

### Data Layer (model/)
Core entities representing business domain:
- **User.java**: System users with role-based access
- **Employee.java**: Employee master data and employment information
- **Project.java**: Project details with client and vendor information
- **Timesheet.java**: Time tracking with entries and expenses
- **Offboarding.java**: Exit process management
- **Notification.java**: System notifications and alerts
- **Invoice.java**: Billing and financial tracking
- **SelfServiceTicket.java**: Employee support tickets

### Business Logic (service/)
Service layer implementing core business operations:
- **EmployeeService.java**: Employee lifecycle management
- **ProjectService.java**: Project operations and resource allocation
- **TimesheetService.java**: Time tracking and approval workflows
- **DashboardService.java**: Analytics and reporting logic
- **NotificationService.java**: Communication and alert management
- **OffboardingService.java**: Exit process automation

### Data Access (repository/)
JPA repositories for database operations:
- Spring Data JPA interfaces for each entity
- Custom query methods for complex operations
- Pagination and sorting support

## Mobile Application (hrms-mobile/)

### React Native Architecture
```
hrms-mobile/src/
├── components/                   # Reusable UI components
├── screens/                      # Screen components by feature
├── navigation/                   # Navigation configuration
├── services/                     # API service layer
├── store/                        # Redux state management
├── theme/                        # Design system and styling
├── types/                        # TypeScript type definitions
└── utils/                        # Utility functions
```

### Component Architecture
- **common/**: Shared UI components (Button, Card, Input, etc.)
- **navigation/**: Custom navigation components and headers

### Screen Organization
Screens organized by functional modules:
- **auth/**: Login, password reset, authentication flows
- **dashboard/**: Main dashboard and analytics views
- **employees/**: Employee management screens
- **projects/**: Project management and assignment
- **timesheets/**: Time tracking and expense submission
- **offboarding/**: Exit process management
- **selfservice/**: Employee self-service portal

### State Management
- **Redux Toolkit**: Centralized state management
- **Slices**: Feature-based state organization (auth, employee, project, etc.)
- **Services**: API integration with RTK Query

## Key Architectural Patterns

### Backend Patterns
- **Layered Architecture**: Clear separation of concerns (Controller → Service → Repository)
- **Repository Pattern**: Data access abstraction with Spring Data JPA
- **DTO Pattern**: Data transfer objects for API communication
- **Exception Handling**: Global exception handling with custom exceptions

### Security Architecture
- **JWT Authentication**: Stateless token-based authentication
- **Role-Based Access Control**: Admin, HR, Employee role hierarchy
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Comprehensive validation at API layer

### Data Architecture
- **PostgreSQL**: Primary database with connection pooling
- **JPA/Hibernate**: ORM for database operations
- **File Storage**: Local file system for document storage
- **Audit Trail**: Entity auditing for change tracking

### Mobile Architecture
- **Component-Based**: Reusable React Native components
- **Navigation**: Stack and drawer navigation patterns
- **State Management**: Redux for global state, local state for UI
- **API Integration**: Centralized service layer for backend communication

## Integration Points
- **API Communication**: RESTful APIs with JSON data exchange
- **Authentication**: JWT token-based authentication across platforms
- **File Upload**: Multipart form data for document management
- **Real-time Updates**: Notification system for important events
- **Cross-Platform**: Shared business logic between web and mobile interfaces