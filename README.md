# HRMS - Human Resource Management System

## Sprint 1 - Core Foundation Implementation

A comprehensive HRMS platform built with Java 21, Spring Boot 3.5.7, PostgreSQL, and Thymeleaf for Sprint-1 deliverables.

## Features Implemented (Sprint-1)

### 1. Employee Data Management
- Complete employee onboarding with personal, employment, and legal information
- Auto-generated Employee IDs and work emails (@originhubs)
- Document management (Offer Letter, I-9, Passport, Visa, etc.)
- Employee search and filtering
- Status tracking (Onboarding, Active, Offboarding, Terminated)

### 2. Project Data Management
- Project creation with vendor and client information
- Employee assignment to projects
- Financial tracking (vendor and candidate pay rates)
- Timeline management with extensions
- Project document management (MSA, SOW, NDA, etc.)

### 3. Onboarding Module
- Multi-step onboarding form
- Personal information capture
- Employment details setup
- Emergency contact management
- Document upload and verification

### 4. Offboarding Module
- Exit workflow automation
- Resignation and last working day tracking
- Financial settlement management
- IT access revocation (Email, Slack)
- Asset collection tracking
- Exit document generation (Relieving Letter, Experience Certificate)

### 5. Role-Based Access Control
- **Admin**: Full system access
- **HR**: Employee and project management
- **Employee**: View personal information

## Technology Stack

- **Java**: 21
- **Spring Boot**: 3.5.7
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security 6
- **Template Engine**: Thymeleaf
- **CSS Framework**: Bootstrap 5.3
- **Icons**: Bootstrap Icons
- **Build Tool**: Maven

## Prerequisites

1. **Java 21** - [Download](https://www.oracle.com/java/technologies/downloads/#java21)
2. **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
3. **Maven 3.8+** (comes with most IDEs)
4. **IDE** - IntelliJ IDEA, Eclipse, or VS Code

## Database Setup

1. Install PostgreSQL and start the service

2. Create the database:
```sql
CREATE DATABASE hrms_db;
```

3. The application will auto-create tables on first run (using `spring.jpa.hibernate.ddl-auto=update`)

4. Update `src/main/resources/application.properties` if your PostgreSQL credentials differ:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hrms_db
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## Installation & Running

### Option 1: Using Maven Command Line

1. **Clone or navigate to the project directory:**
```cmd
cd C:\Users\kalya\Downloads\HRMS\HRMS
```

2. **Build the project:**
```cmd
mvnw.cmd clean install
```

3. **Run the application:**
```cmd
mvnw.cmd spring-boot:run
```

### Option 2: Using IDE (IntelliJ IDEA / Eclipse)

1. **Import Project:**
   - File → Open → Select the project folder
   - Wait for Maven dependencies to download

2. **Run the Application:**
   - Locate `HrmsApplication.java`
   - Right-click → Run 'HrmsApplication'

3. **Access the application:**
   - Open browser: http://localhost:8080

## Default Login Credentials

The system comes with three pre-configured users:

| Role     | Username | Password | Description                    |
|----------|----------|----------|--------------------------------|
| Admin    | admin    | admin123 | Full system access             |
| HR       | hr       | hr123    | Employee & project management  |
| Employee | employee | emp123   | View personal information      |

## Application Structure

```
HRMS/
├── src/main/java/com/originhubs/HRMS/
│   ├── config/
│   │   ├── DataInitializer.java          # Initial data setup
│   │   └── SecurityConfig.java           # Security configuration
│   ├── controller/
│   │   ├── HomeController.java           # Dashboard & home
│   │   ├── EmployeeController.java       # Employee CRUD
│   │   ├── ProjectController.java        # Project management
│   │   └── OffboardingController.java    # Exit workflows
│   ├── model/
│   │   ├── User.java                     # User authentication
│   │   ├── Role.java                     # User roles
│   │   ├── Employee.java                 # Employee entity
│   │   ├── Project.java                  # Project entity
│   │   ├── EmployeeDocument.java         # Employee documents
│   │   ├── ProjectDocument.java          # Project documents
│   │   └── Offboarding.java              # Exit process
│   ├── repository/                       # JPA repositories
│   ├── service/                          # Business logic
│   └── security/
│       └── CustomUserDetailsService.java # User authentication
├── src/main/resources/
│   ├── templates/                        # Thymeleaf HTML templates
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── employee/                     # Employee views
│   │   ├── project/                      # Project views
│   │   └── offboarding/                  # Offboarding views
│   └── application.properties            # Configuration
└── pom.xml                               # Maven dependencies
```

## Module Details

### Employee Management
- **Add Employee**: `/employee/add`
- **List Employees**: `/employee/list`
- **View Employee**: `/employee/view/{id}`
- **Edit Employee**: `/employee/edit/{id}`
- **Upload Documents**: Available in employee view

### Project Management
- **Add Project**: `/project/add`
- **List Projects**: `/project/list`
- **View Project**: `/project/view/{id}`
- **Edit Project**: `/project/edit/{id}`
- **Upload Documents**: Available in project view

### Offboarding
- **Initiate Offboarding**: `/offboarding/initiate`
- **List Offboardings**: `/offboarding/list`
- **View Details**: `/offboarding/view/{id}`
- **Update Process**: `/offboarding/edit/{id}`

## Key Features

### AI/ML Readiness (Planned for Future Sprints)
The current implementation includes field structures ready for:
- Document OCR and classification
- Automated employee ID and email generation
- Predictive analytics dashboards
- Smart staffing recommendations

### Document Management
- Multi-type document support
- Status tracking (Pending, Verified, Rejected)
- Secure file storage in `./uploads` directory
- File size limit: 10MB

### Security Features
- BCrypt password encryption
- Role-based access control
- CSRF protection
- Session management
- Secure logout

## File Upload Configuration

Documents are stored in: `./uploads/`
- Employee documents: `./uploads/employee-docs/`
- Project documents: `./uploads/project-docs/`

Ensure the application has write permissions to create these directories.

## Troubleshooting

### Database Connection Issues
```
Error: Connection refused
Solution: Ensure PostgreSQL is running and credentials in application.properties are correct
```

### Port Already in Use
```
Error: Port 8080 is already in use
Solution: Change port in application.properties:
server.port=8081
```

### File Upload Errors
```
Error: Could not create upload directory
Solution: Ensure application has write permissions or manually create ./uploads folder
```

## Future Enhancements (Sprint-2)

1. **Notifications & Reminders**
   - Email notifications
   - Calendar integration
   - Deadline alerts

2. **Timesheets**
   - Time tracking
   - Billable hours
   - Expense management
   - Approval workflows

3. **Advanced Analytics**
   - Utilization reports
   - Financial dashboards
   - Compliance monitoring
   - Predictive insights

## API Endpoints

All endpoints require authentication:

### Employee Endpoints
- `GET /employee/list` - List all employees
- `GET /employee/add` - Add employee form
- `POST /employee/add` - Create employee
- `GET /employee/view/{id}` - View employee
- `GET /employee/edit/{id}` - Edit employee form
- `POST /employee/edit/{id}` - Update employee
- `POST /employee/delete/{id}` - Delete employee (Admin only)
- `POST /employee/{id}/documents/upload` - Upload document

### Project Endpoints
- `GET /project/list` - List all projects
- `GET /project/add` - Add project form
- `POST /project/add` - Create project
- `GET /project/view/{id}` - View project
- `GET /project/edit/{id}` - Edit project form
- `POST /project/edit/{id}` - Update project
- `POST /project/delete/{id}` - Delete project (Admin only)
- `POST /project/{id}/documents/upload` - Upload document

### Offboarding Endpoints
- `GET /offboarding/list` - List all offboardings
- `GET /offboarding/initiate` - Initiate form
- `POST /offboarding/initiate` - Start offboarding
- `GET /offboarding/view/{id}` - View details
- `GET /offboarding/edit/{id}` - Edit form
- `POST /offboarding/edit/{id}` - Update offboarding
- `POST /offboarding/{id}/revoke-access` - Revoke IT access

## Database Schema

The application auto-creates the following tables:
- `users` - User authentication
- `roles` - User roles
- `user_roles` - User-role mapping
- `employees` - Employee master data
- `projects` - Project information
- `employee_documents` - Employee document tracking
- `project_documents` - Project document tracking
- `offboarding` - Exit process tracking

## Support & Contact

For issues or questions:
- Check the troubleshooting section
- Review application logs in the console
- Verify database connectivity

## License

Proprietary - OriginHubs HRMS System

---

**Version**: 1.0.0 (Sprint-1)  
**Last Updated**: October 2025  
**Status**: Production Ready

