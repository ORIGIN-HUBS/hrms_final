# HRMS Development Rules & Guidelines

## Code Structure Rules

### Package Organization
- Controllers: `com.originhubs.HRMS.controller`
- Models/Entities: `com.originhubs.HRMS.model`
- Services: `com.originhubs.HRMS.service`
- Repositories: `com.originhubs.HRMS.repository`
- Configuration: `com.originhubs.HRMS.config`
- Security: `com.originhubs.HRMS.security`

### Naming Conventions
- Classes: PascalCase (e.g., `EmployeeController`)
- Methods: camelCase (e.g., `findEmployeeById`)
- Variables: camelCase (e.g., `employeeId`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- Database tables: snake_case (e.g., `employee_documents`)

## Security Rules

### Authentication & Authorization
- All endpoints require authentication except `/login`
- Use `@PreAuthorize` for method-level security
- Admin role: Full access to all operations
- HR role: Employee and project management only
- Employee role: Read-only access to personal data

### Data Protection
- Never log sensitive information (passwords, SSNs)
- Use BCrypt for password hashing
- Validate all user inputs
- Sanitize file uploads
- Implement CSRF protection

## Database Rules

### Entity Design
- Use `@Entity` annotation for JPA entities
- Primary keys: `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)`
- Foreign keys: Use `@ManyToOne`, `@OneToMany` appropriately
- Timestamps: Include `createdAt` and `updatedAt` fields
- Soft deletes: Use status fields instead of hard deletes

### Repository Pattern
- Extend `JpaRepository<Entity, Long>`
- Custom queries: Use `@Query` annotation
- Method naming: Follow Spring Data JPA conventions
- Pagination: Use `Pageable` for large datasets

## Controller Rules

### REST Endpoints
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate HTTP status codes
- Use `@RequestMapping` for base paths
- Validate request parameters with `@Valid`
- Handle exceptions with `@ExceptionHandler`

### Thymeleaf Integration
- Model attributes: Use descriptive names
- Form binding: Use command objects
- Error handling: Display user-friendly messages
- Redirect after POST: Follow PRG pattern

## Service Layer Rules

### Business Logic
- Keep controllers thin, services fat
- Use `@Transactional` for database operations
- Implement proper exception handling
- Validate business rules in service layer
- Use DTOs for data transfer between layers

### File Management
- Validate file types and sizes
- Use secure file naming conventions
- Store files outside web root
- Implement file cleanup strategies
- Log file operations for audit

## Frontend Rules

### Thymeleaf Templates
- Use semantic HTML5 elements
- Bootstrap classes for consistent styling
- Form validation with client-side and server-side
- Responsive design for mobile compatibility
- Accessibility compliance (ARIA labels, alt text)

### JavaScript Guidelines
- Minimal JavaScript usage
- Progressive enhancement approach
- Form validation and user feedback
- AJAX for dynamic content updates
- No inline JavaScript in templates

## Testing Rules

### Unit Testing
- Test all service methods
- Mock external dependencies
- Use meaningful test names
- Achieve minimum 80% code coverage
- Test both positive and negative scenarios

### Integration Testing
- Test controller endpoints
- Test database operations
- Test security configurations
- Test file upload functionality
- Use test profiles for configuration

## Performance Rules

### Database Optimization
- Use appropriate fetch strategies (LAZY/EAGER)
- Implement pagination for large datasets
- Use database indexes for frequently queried fields
- Avoid N+1 query problems
- Monitor query performance

### Caching Strategy
- Cache static reference data
- Use Spring Cache abstraction
- Implement cache eviction policies
- Monitor cache hit ratios
- Cache expensive computations

## Error Handling Rules

### Exception Management
- Use custom exception classes
- Implement global exception handler
- Log errors with appropriate levels
- Return user-friendly error messages
- Include error codes for debugging

### Validation Rules
- Server-side validation is mandatory
- Use Bean Validation annotations
- Custom validators for business rules
- Validate file uploads thoroughly
- Sanitize all user inputs

## Documentation Rules

### Code Documentation
- JavaDoc for public methods
- Inline comments for complex logic
- README files for modules
- API documentation with examples
- Database schema documentation

### Configuration Documentation
- Document all application properties
- Explain security configurations
- Document deployment procedures
- Maintain change logs
- Version control documentation

## Deployment Rules

### Environment Configuration
- Use profiles for different environments
- Externalize configuration properties
- Secure sensitive configuration data
- Use environment variables for secrets
- Implement health checks

### Build and Release
- Automated testing in CI/CD pipeline
- Code quality checks with SonarQube
- Security scanning for vulnerabilities
- Database migration scripts
- Rollback procedures documented

## Monitoring Rules

### Logging Standards
- Use structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Include correlation IDs for tracing
- Log security events (login, access violations)
- Implement log rotation and retention

### Metrics Collection
- Monitor application performance
- Track business metrics
- Database connection pool monitoring
- File system usage monitoring
- User activity tracking

## Code Review Rules

### Review Checklist
- Security vulnerabilities check
- Performance impact assessment
- Code style and conventions
- Test coverage verification
- Documentation completeness

### Approval Process
- Minimum two reviewers required
- Security review for sensitive changes
- Performance review for database changes
- Documentation review for API changes
- Final approval by tech lead

---

**Rules Version**: 1.0  
**Effective Date**: Current  
**Review Cycle**: Monthly