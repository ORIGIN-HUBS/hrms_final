# HRMS Development Guidelines

## Code Quality Standards

### Package Structure & Organization
- **Consistent Package Naming**: All packages follow `com.originhubs.HRMS.[layer]` pattern
- **Layer Separation**: Clear separation between `controller`, `service`, `repository`, `model`, `dto`, `config`, `exception`, `validation`
- **Feature-Based Grouping**: Related functionality grouped together (e.g., all timesheet-related classes)

### Class Design Patterns
- **Service Layer Pattern**: All business logic encapsulated in `@Service` classes
- **Repository Pattern**: Data access through Spring Data JPA repositories
- **DTO Pattern**: Separate DTOs for API requests/responses (e.g., `EmployeeCreateRequest`, `LoginResponse`)
- **Builder Pattern**: Lombok `@RequiredArgsConstructor` for dependency injection

### Annotation Usage Standards
```java
// Service classes consistently use:
@Service
@RequiredArgsConstructor  // For dependency injection
@Slf4j               // For logging (when needed)
@Transactional       // For methods requiring transactions

// Validation classes use:
@Component           // For utility classes
public class ValidationUtils // Static utility methods

// Configuration classes use:
@Configuration
@EnableCaching       // Feature-specific annotations
```

### Method Organization Patterns
Services organize methods in consistent sections:
1. **Core Operations** (CRUD operations)
2. **Business Logic Methods** (complex workflows)
3. **Utility/Helper Methods** (private support methods)
4. **Statistics/Analytics Methods** (reporting functionality)

## Naming Conventions

### Method Naming Standards
- **CRUD Operations**: `getAllX()`, `getXById()`, `createX()`, `updateX()`, `deleteX()`
- **Search Methods**: `searchX()`, `findByX()`, `getXByStatus()`
- **Business Operations**: `submitTimesheet()`, `approveTimesheet()`, `generateEmployeeId()`
- **Validation Methods**: `validateX()`, `isXEditable()`, `hasAdminRole()`
- **Statistics Methods**: `getXStatistics()`, `getXAnalytics()`, `countByX()`

### Variable Naming Patterns
```java
// Repository fields consistently named:
private final TimesheetRepository timesheetRepository;
private final EmployeeRepository employeeRepository;

// Service method parameters:
public Timesheet getOrCreateTimesheet(Employee employee, LocalDate weekStart)
public Employee createEmployee(EmployeeCreateRequest request)

// Local variables use descriptive names:
LocalDate sunday = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
String defaultPassword = employee.getEmployeeId().toLowerCase() + "123";
```

### Constants and Configuration
```java
// Pattern constants in validation:
private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
private static final Pattern EMPLOYEE_ID_PATTERN = Pattern.compile("^EMP\\d{3,6}$");

// String literals for status values:
"ACTIVE", "ONBOARDING", "DRAFT", "SUBMITTED", "APPROVED"
```

## Error Handling Patterns

### Exception Handling Strategy
```java
// Standard exception throwing pattern:
.orElseThrow(() -> new IllegalArgumentException("Timesheet not found"));
.orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

// Business rule validation:
if (!isTimesheetEditable(timesheet, employee)) {
    throw new IllegalStateException("Timesheet is not editable");
}

// Custom validation exceptions:
throw new ValidationException(fieldName + " is required");
throw new ValidationException("File size exceeds maximum allowed size");
```

### Logging Patterns
```java
// Consistent logging approach:
log.info("=== USER ACCOUNT CREATED ===");
log.info("Employee ID: {}", employee.getEmployeeId());
log.error("Failed to create user account for employee: {}", employee.getEmployeeId(), e);

// Error handling with logging:
} catch (Exception e) {
    log.error("Failed to generate password reset link for employee: {}", employee.getEmployeeId(), e);
    return null;
}
```

## Data Access Patterns

### Repository Method Naming
```java
// Standard Spring Data JPA patterns:
findByEmployeeId(String employeeId)
findByStatus(String status)
findByEmployeeAndWeekStartDateAndWeekEndDate(Employee employee, LocalDate start, LocalDate end)
countByStatus(String status)
countByEmployeeAndStatusAndWeekStartDateBetween(Employee employee, Status status, LocalDate start, LocalDate end)
```

### Transaction Management
```java
// Consistent transaction annotation usage:
@Transactional
public Employee createEmployee(Employee employee) {
    // Multiple database operations
    Employee savedEmployee = employeeRepository.save(employee);
    createUserAccountForEmployee(savedEmployee);
    return savedEmployee;
}
```

### Pagination and Filtering
```java
// Standard pagination pattern:
public Page<Timesheet> getTimesheetsForApproval(Employee manager, String status, 
                                               String employeeName, Pageable pageable) {
    // Conditional filtering based on parameters
    if (status != null && !status.isEmpty()) {
        // Apply status filter
    }
    return repository.findByManager(manager, pageable);
}
```

## Business Logic Patterns

### Validation Patterns
```java
// Input validation before processing:
if (!StringUtils.hasText(email)) {
    throw new ValidationException(fieldName + " is required");
}

// Business rule validation:
if (timesheet.getStatus() != Timesheet.TimesheetStatus.SUBMITTED) {
    throw new IllegalStateException("Timesheet is not in submitted state");
}
```

### ID Generation Patterns
```java
// Consistent ID generation approach:
private String generateEmployeeId() {
    String prefix = "EMP";
    // Find max existing ID
    // Generate next sequential ID
    // Ensure uniqueness
    return newEmployeeId;
}

private String generateTicketNumber() {
    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    return "TKT-" + timestamp;
}
```

### Status Management
```java
// Enum-based status management:
timesheet.setStatus(Timesheet.TimesheetStatus.DRAFT);
ticket.setStatus(SelfServiceTicket.TicketStatus.OPEN);

// Status transition validation:
if (timesheet.getStatus() != Timesheet.TimesheetStatus.DRAFT && 
    timesheet.getStatus() != Timesheet.TimesheetStatus.REJECTED) {
    throw new IllegalStateException("Timesheet is not in a submittable state");
}
```

## API Design Patterns

### Controller Structure
```java
// RESTful endpoint naming:
@GetMapping("/api/employees")           // List all
@GetMapping("/api/employees/{id}")     // Get by ID
@PostMapping("/api/employees")         // Create
@PutMapping("/api/employees/{id}")     // Update
@DeleteMapping("/api/employees/{id}")  // Delete
```

### Response Patterns
```java
// Consistent response structure:
public Map<String, Object> getTimesheetSummary(Employee employee, LocalDate weekStart) {
    Map<String, Object> summary = new HashMap<>();
    summary.put("timesheetId", timesheet.getId());
    summary.put("status", timesheet.getStatus());
    summary.put("isEditable", isTimesheetEditable(timesheet, employee));
    return summary;
}
```

## Security Patterns

### Authentication & Authorization
```java
// Role-based access control:
private boolean hasAdminRole(Employee employee) {
    return employee.getRoles() != null && 
           employee.getRoles().stream()
               .anyMatch(role -> role.getName().equals("ADMIN") || role.getName().equals("HR"));
}

// Permission validation:
if (!timesheet.getEmployee().getId().equals(employee.getId())) {
    throw new IllegalStateException("Cannot submit timesheet for another employee");
}
```

### Password Management
```java
// Secure password generation:
String defaultPassword = employee.getEmployeeId().toLowerCase() + "123";
user.setIsTemporaryPassword(true); // Mark for password reset requirement
```

## Performance Optimization Patterns

### Caching Strategy
```java
// Method-level caching:
@Cacheable("dashboardStats")
public Map<String, Object> getDashboardAnalytics() {
    // Expensive operations cached
}

@Cacheable(value = "dashboardStats", key = "'employee-' + #employeeId")
public Map<String, Object> getEmployeeDashboardData(Long employeeId) {
    // Employee-specific caching
}
```

### Efficient Data Processing
```java
// Stream API for data processing:
long draftCount = timesheetRepository.countByEmployeeAndStatusAndWeekStartDateBetween(
    employee, Timesheet.TimesheetStatus.DRAFT, thirtyDaysAgo, today);

// Bulk operations:
timesheetEntryRepository.deleteByTimesheet(timesheet);
// Process multiple entries in single transaction
```

## Testing Patterns

### Service Layer Testing
```java
// Dependency injection in tests:
@MockBean
private TimesheetRepository timesheetRepository;

@MockBean  
private EmployeeRepository employeeRepository;

// Test method naming:
@Test
void shouldCreateTimesheetWhenValidDataProvided() {
    // Arrange, Act, Assert pattern
}
```

## Documentation Standards

### Method Documentation
```java
/**
 * Get or create timesheet for a specific week
 * Ensures weekStart is adjusted to Sunday (start of week)
 */
@Transactional
public Timesheet getOrCreateTimesheet(Employee employee, LocalDate weekStart) {
    // Implementation with clear comments
}
```

### Code Comments
```java
// Clear section headers:
// ========== CORE TIMESHEET OPERATIONS ==========
// ========== MANAGER APPROVAL OPERATIONS ==========
// ========== EXPENSE MANAGEMENT ==========

// Inline comments for complex logic:
// Ensure weekStart is a Sunday
LocalDate sunday = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
```

## Configuration Management

### Application Properties
```properties
# Clear categorization:
# Database Configuration
spring.datasource.url=jdbc:postgresql://...

# File Upload Configuration  
spring.servlet.multipart.max-file-size=10MB

# JWT Configuration
jwt.secret=${JWT_SECRET:default-secret}
```

### Dependency Injection
```java
// Constructor injection with Lombok:
@RequiredArgsConstructor
public class TimesheetService {
    private final TimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;
    // All dependencies injected via constructor
}
```