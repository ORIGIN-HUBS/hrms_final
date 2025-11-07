package com.originhubs.HRMS.controller.api;

import com.originhubs.HRMS.dto.EmployeeCreateRequest;
import com.originhubs.HRMS.dto.EmployeeResponse;
import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Role;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.service.EmployeeService;
import com.originhubs.HRMS.service.RoleService;
import com.originhubs.HRMS.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.HashMap;
import com.originhubs.HRMS.service.EmailService;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, allowCredentials = "true")
public class EmployeeApiController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeApiController.class);
    
    private final EmployeeService employeeService;
    private final UserService userService;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees(@RequestParam(required = false) String search) {
        List<Employee> employees;
        if (search != null && !search.trim().isEmpty()) {
            employees = employeeService.searchEmployees(search);
        } else {
            employees = employeeService.getAllEmployees();
        }
        List<EmployeeResponse> response = employees.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeResponse> getEmployee(@PathVariable Long id) {
        Optional<Employee> employeeOpt = employeeService.getEmployeeById(id);
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToResponse(employeeOpt.get()));
    }

    @GetMapping("/by-email/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<EmployeeResponse> getEmployeeByEmail(@PathVariable String email) {
        Optional<Employee> employeeOpt = employeeService.findByWorkEmail(email);
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToResponse(employeeOpt.get()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<?> createEmployee(@RequestBody EmployeeCreateRequest request) {
        try {
            System.out.println("Received employee data: " + request.toString());
            Employee savedEmployee = employeeService.createEmployee(request);
            
            // Create user account and get actual credentials
            String[] credentials = employeeService.createUserAccountAndGetCredentials(savedEmployee);
            
            if (credentials == null) {
                // User account creation failed or already exists
                return ResponseEntity.ok(Map.of(
                    "employee", convertToResponse(savedEmployee),
                    "message", "Employee created but user account already exists or failed to create"
                ));
            }
            
            String username = credentials[0];
            String password = credentials[1];
            
            // Send credentials email to personal email
            String employeeName = savedEmployee.getFirstName() + " " + savedEmployee.getLastName();
            String emailToSend = savedEmployee.getPersonalEmail();
            boolean emailSent = false;
            
            if (emailToSend != null && !emailToSend.trim().isEmpty()) {
                emailSent = emailService.sendCredentialsEmail(emailToSend, employeeName, username, password);
            } else {
                logger.warn("No personal email provided for employee: {}", savedEmployee.getEmployeeId());
            }
            
            // Return response with credentials
            Map<String, Object> response = new HashMap<>();
            response.put("employee", convertToResponse(savedEmployee));
            response.put("credentials", Map.of(
                "username", username,
                "email", savedEmployee.getWorkEmail(),
                "password", password,
                "isTemporary", true,
                "emailSent", emailSent
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Add logging
            System.err.println("Error creating employee: " + e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Failed to create employee: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {
        try {
            Employee updatedEmployee = employeeService.updateEmployee(id, employee);
            return ResponseEntity.ok(convertToResponse(updatedEmployee));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Failed to update employee: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        try {
            Optional<Employee> employeeOpt = employeeService.getEmployeeById(id);
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeStats> getEmployeeStats() {
        EmployeeStats stats = new EmployeeStats();
        stats.setTotal(employeeService.countByStatus("ACTIVE"));
        stats.setActive(employeeService.countByStatus("ACTIVE"));
        stats.setInactive(employeeService.countByStatus("INACTIVE"));
        stats.setOnboarding(employeeService.countByStatus("ONBOARDING"));
        return ResponseEntity.ok(stats);
    }

    private EmployeeResponse convertToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setEmployeeId(employee.getEmployeeId());
        response.setFirstName(employee.getFirstName());
        response.setMiddleName(employee.getMiddleName());
        response.setLastName(employee.getLastName());
        response.setDateOfBirth(employee.getDateOfBirth());
        response.setGender(employee.getGender());
        response.setPronouns(employee.getPronouns());
        response.setContactNumber(employee.getContactNumber());
        response.setAlternateContactNumber(employee.getAlternateContactNumber());
        response.setPersonalEmail(employee.getPersonalEmail());
        response.setWorkEmail(employee.getWorkEmail());
        response.setAddress(employee.getResidentialAddress());
        response.setEmergencyContactName(employee.getEmergencyContactName());
        response.setEmergencyContactNumber(employee.getEmergencyContactNumber());
        response.setEmergencyContactRelation(employee.getEmergencyContactRelation());
        response.setJobTitle(employee.getJobTitle());
        response.setSupervisor(employee.getSupervisor());
        response.setEmploymentType(employee.getEmploymentType());
        response.setWorkLocation(employee.getWorkLocation());
        response.setWorkMode(employee.getWorkMode());
        response.setJoiningDate(employee.getJoiningDate());
        response.setTerminationDate(employee.getTerminationDate());
        response.setDepartment(employee.getJobTitle()); // Map job title to department for now
        response.setPosition(employee.getJobTitle());
        response.setHireDate(employee.getJoiningDate()); // Map joining date to hire date
        response.setStatus(employee.getStatus());
        response.setCreatedAt(employee.getCreatedAt());
        response.setUpdatedAt(employee.getUpdatedAt());
        return response;
    }

    @PostMapping("/{id}/create-user-account")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<?> createUserAccountForEmployee(@PathVariable Long id) {
        try {
            Optional<Employee> employeeOpt = employeeService.getEmployeeById(id);
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Employee employee = employeeOpt.get();

            // Check if user already exists
            if (userService.findByUsername(generateUsername(employee)) != null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User account already exists for this employee"
                ));
            }

            // Generate credentials
            String username = generateUsername(employee);
            String email = generateCompanyEmail(employee);
            String tempPassword = generateTempPassword();

            // Create user account
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(tempPassword));
            user.setEmail(email);
            user.setFullName(employee.getFirstName() + " " + employee.getLastName());
            user.setEnabled(true);
            user.setIsTemporaryPassword(true);

            // Assign EMPLOYEE role
            Role employeeRole = roleService.findByName(Role.RoleName.ROLE_EMPLOYEE);
            if (employeeRole != null) {
                Set<Role> roles = new HashSet<>();
                roles.add(employeeRole);
                user.setRoles(roles);
            }

            // Save user using repository directly since UserService methods require role IDs
            userService.saveUser(user, Arrays.asList(employeeRole.getId()));

            // Update employee with work email if not set
            if (employee.getWorkEmail() == null || employee.getWorkEmail().isEmpty()) {
                employee.setWorkEmail(email);
                employeeService.updateEmployee(id, employee);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User account created successfully",
                "credentials", Map.of(
                    "username", username,
                    "email", email,
                    "password", tempPassword,
                    "isTemporary", true
                )
            ));

        } catch (Exception e) {
            logger.error("Error creating user account for employee {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to create user account: " + e.getMessage()
            ));
        }
    }

    private String generateUsername(Employee employee) {
        String firstName = employee.getFirstName().toLowerCase().replaceAll("[^a-z]", "");
        String lastName = employee.getLastName().toLowerCase().replaceAll("[^a-z]", "");
        return firstName + "." + lastName;
    }

    private String generateCompanyEmail(Employee employee) {
        String username = generateUsername(employee);
        return username + "@originhubs.com"; // You can make this configurable
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return password.toString();
    }

    // Inner class for employee statistics
    public static class EmployeeStats {
        private long total;
        private long active;
        private long inactive;
        private long onboarding;

        // Getters and setters
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public long getActive() { return active; }
        public void setActive(long active) { this.active = active; }
        public long getInactive() { return inactive; }
        public void setInactive(long inactive) { this.inactive = inactive; }
        public long getOnboarding() { return onboarding; }
        public void setOnboarding(long onboarding) { this.onboarding = onboarding; }
    }
}