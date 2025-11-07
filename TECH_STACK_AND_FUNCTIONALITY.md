# HRMS Tech Stack & Functionality Guide

## Technology Stack

### Backend
- **Java**: 21 (LTS)
- **Spring Boot**: 3.5.7
- **Spring Security**: 6.x
- **Spring Data JPA**: Hibernate ORM
- **Maven**: 3.8+ (Build Tool)

### Database
- **PostgreSQL**: 14+
- **Connection Pool**: HikariCP (Default)
- **Migration**: Hibernate DDL Auto-Update

### Frontend
- **Template Engine**: Thymeleaf
- **CSS Framework**: Bootstrap 5.3
- **Icons**: Bootstrap Icons
- **JavaScript**: Vanilla JS

### Security
- **Authentication**: Spring Security
- **Password Encryption**: BCrypt
- **Session Management**: Spring Session
- **CSRF Protection**: Enabled

### File Management
- **Storage**: Local File System
- **Upload Limit**: 10MB
- **Supported Formats**: PDF, DOC, DOCX, JPG, PNG

## Core Functionality

### 1. User Management & Authentication
```
Roles: Admin, HR, Employee
Features:
- Role-based access control
- Secure login/logout
- Session management
- Password encryption
```

### 2. Employee Data Management
```
Features:
- Employee onboarding
- Personal information management
- Employment details tracking
- Emergency contacts
- Document management
- Status tracking (Onboarding, Active, Offboarding, Terminated)
- Auto-generated Employee IDs
- Work email generation (@originhubs)
```

### 3. Project Management
```
Features:
- Project creation and tracking
- Vendor and client information
- Employee assignment to projects
- Financial tracking (pay rates)
- Timeline management
- Project document management
- MSA, SOW, NDA tracking
```

### 4. Onboarding Module
```
Features:
- Multi-step onboarding workflow
- Personal information capture
- Employment setup
- Emergency contact management
- Document upload and verification
- Status progression tracking
```

### 5. Offboarding Module
```
Features:
- Exit workflow automation
- Resignation tracking
- Last working day management
- Financial settlement
- IT access revocation (Email, Slack)
- Asset collection tracking
- Exit document generation
```

### 6. Document Management
```
Features:
- Multi-type document support
- Upload and storage
- Status tracking (Pending, Verified, Rejected)
- Secure file access
- Document categorization
```

## API Endpoints Structure

### Authentication
```
POST /login - User login
POST /logout - User logout
```

### Employee Management
```
GET /employee/list - List employees
GET /employee/add - Add employee form
POST /employee/add - Create employee
GET /employee/view/{id} - View employee
GET /employee/edit/{id} - Edit employee form
POST /employee/edit/{id} - Update employee
POST /employee/delete/{id} - Delete employee (Admin only)
POST /employee/{id}/documents/upload - Upload document
```

### Project Management
```
GET /project/list - List projects
GET /project/add - Add project form
POST /project/add - Create project
GET /project/view/{id} - View project
GET /project/edit/{id} - Edit project form
POST /project/edit/{id} - Update project
POST /project/delete/{id} - Delete project (Admin only)
POST /project/{id}/documents/upload - Upload document
```

### Offboarding
```
GET /offboarding/list - List offboardings
GET /offboarding/initiate - Initiate form
POST /offboarding/initiate - Start offboarding
GET /offboarding/view/{id} - View details
GET /offboarding/edit/{id} - Edit form
POST /offboarding/edit/{id} - Update offboarding
POST /offboarding/{id}/revoke-access - Revoke IT access
```

## Database Schema

### Core Tables
```sql
users - User authentication data
roles - System roles (Admin, HR, Employee)
user_roles - User-role mapping
employees - Employee master data
projects - Project information
employee_documents - Employee document tracking
project_documents - Project document tracking
offboarding - Exit process tracking
```

## Security Configuration

### Access Control
```
Admin: Full system access
HR: Employee and project management
Employee: View personal information only
```

### Security Features
```
- BCrypt password encryption
- CSRF protection enabled
- Session timeout management
- Role-based URL protection
- Secure file upload validation
```

## File Storage Structure
```
./uploads/
├── employee-docs/
│   ├── {employeeId}/
│   │   ├── offer-letter/
│   │   ├── i9-form/
│   │   ├── passport/
│   │   └── visa/
└── project-docs/
    ├── {projectId}/
    │   ├── msa/
    │   ├── sow/
    │   └── nda/
```

## Configuration Properties

### Database Configuration
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hrms_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
```

### File Upload Configuration
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Server Configuration
```properties
server.port=8080
server.servlet.session.timeout=30m
```

## Default System Users

| Role     | Username | Password | Access Level |
|----------|----------|----------|--------------|
| Admin    | admin    | admin123 | Full system  |
| HR       | hr       | hr123    | HR functions |
| Employee | employee | emp123   | Personal view|

## Development Environment Setup

### Prerequisites
1. Java 21 JDK
2. PostgreSQL 14+
3. Maven 3.8+
4. IDE (IntelliJ/Eclipse/VS Code)

### Quick Start
```bash
# Clone project
cd /path/to/project

# Build
mvnw clean install

# Run
mvnw spring-boot:run

# Access
http://localhost:8080
```

## Future Sprint Enhancements

### Sprint 2 - Advanced Features
```
- Email notifications
- Calendar integration
- Timesheet management
- Expense tracking
- Advanced analytics
- Reporting dashboards
```

### Sprint 3 - AI/ML Integration
```
- Document OCR
- Automated classification
- Predictive analytics
- Smart recommendations
- Compliance monitoring
```

## Performance Considerations

### Database Optimization
- Connection pooling with HikariCP
- JPA query optimization
- Proper indexing strategy
- Pagination for large datasets

### File Management
- Efficient file storage structure
- File size validation
- Secure file access controls
- Cleanup strategies for old files

## Monitoring & Logging

### Application Monitoring
- Spring Boot Actuator endpoints
- Health checks
- Metrics collection
- Performance monitoring

### Logging Strategy
- Structured logging with Logback
- Error tracking and alerting
- Audit trail for sensitive operations
- Debug logging for development

---

**Document Version**: 1.0  
**Last Updated**: Current Date  
**Maintained By**: Development Team