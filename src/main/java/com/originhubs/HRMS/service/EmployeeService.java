package com.originhubs.HRMS.service;

import com.originhubs.HRMS.dto.EmployeeCreateRequest;
import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Role;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.repository.EmployeeDocumentRepository;
import com.originhubs.HRMS.repository.EmployeeRepository;
import com.originhubs.HRMS.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final PasswordResetService passwordResetService;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    public Optional<Employee> getEmployeeByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeId(employeeId);
    }

    public List<Employee> getEmployeesByStatus(String status) {
        return employeeRepository.findByStatus(status);
    }

    public List<Employee> searchEmployees(String keyword) {
        return employeeRepository.searchEmployees(keyword);
    }

    public Optional<Employee> findByWorkEmail(String workEmail) {
        return employeeRepository.findByWorkEmail(workEmail);
    }

    public Optional<Employee> findByUsername(String username) {
        // Try multiple approaches to find the employee
        Optional<Employee> employee;
        
        // 1. Try to find by employee ID (exact match)
        employee = employeeRepository.findByEmployeeId(username);
        if (employee.isPresent()) {
            return employee;
        }
        
        // 2. Try to find by work email (exact match)
        employee = employeeRepository.findByWorkEmail(username);
        if (employee.isPresent()) {
            return employee;
        }
        
        // 3. Try to find by personal email
        employee = employeeRepository.findByPersonalEmail(username);
        if (employee.isPresent()) {
            return employee;
        }
        
        // 4. Try case-insensitive search for employee ID
        employee = employeeRepository.findByEmployeeIdIgnoreCase(username);
        if (employee.isPresent()) {
            return employee;
        }
        
        // 5. Try case-insensitive search for work email
        employee = employeeRepository.findByWorkEmailIgnoreCase(username);
        if (employee.isPresent()) {
            return employee;
        }
        
        // 6. Try finding by work email prefix (username part before @)
        if (!username.contains("@")) {
            List<Employee> allEmployees = employeeRepository.findAll();
            for (Employee emp : allEmployees) {
                if (emp.getWorkEmail() != null) {
                    String emailPrefix = emp.getWorkEmail().split("@")[0];
                    if (emailPrefix.equalsIgnoreCase(username)) {
                        return Optional.of(emp);
                    }
                }
            }
        }
        
        // 7. Try fuzzy matching for common variations (handles typos, missing chars, etc.)
        if (!username.contains("@")) {
            List<Employee> allEmployees = employeeRepository.findAll();
            for (Employee emp : allEmployees) {
                if (emp.getWorkEmail() != null) {
                    String emailPrefix = emp.getWorkEmail().split("@")[0];
                    if (isFuzzyMatch(username, emailPrefix)) {
                        return Optional.of(emp);
                    }
                }
            }
        }
        
        // 8. Try partial name matching (first.last vs firstname.lastname)
        if (username.contains(".")) {
            List<Employee> allEmployees = employeeRepository.findAll();
            String[] usernameParts = username.toLowerCase().split("\\.");
            if (usernameParts.length >= 2) {
                for (Employee emp : allEmployees) {
                    if (emp.getFirstName() != null && emp.getLastName() != null) {
                        String firstName = emp.getFirstName().toLowerCase();
                        String lastName = emp.getLastName().toLowerCase();
                        
                        // Check if username matches firstname.lastname pattern
                        if (firstName.startsWith(usernameParts[0]) && lastName.startsWith(usernameParts[1])) {
                            return Optional.of(emp);
                        }
                    }
                }
            }
        }
        
        return Optional.empty();
    }
    
    /**
     * Generic fuzzy matching algorithm that handles various types of username variations
     * - Exact matches
     * - Case differences
     * - Missing/extra characters (typos)
     * - Partial matches
     */
    private boolean isFuzzyMatch(String username1, String username2) {
        if (username1 == null || username2 == null) return false;
        
        String u1 = username1.toLowerCase();
        String u2 = username2.toLowerCase();
        
        // Exact match
        if (u1.equals(u2)) return true;
        
        // One contains the other (substring match)
        if (u1.contains(u2) || u2.contains(u1)) return true;
        
        // Remove dots and special characters for comparison
        String clean1 = u1.replaceAll("[^a-zA-Z0-9]", "");
        String clean2 = u2.replaceAll("[^a-zA-Z0-9]", "");
        if (clean1.equals(clean2)) return true;
        
        // Handle common character variations (missing/extra characters)
        if (Math.abs(u1.length() - u2.length()) <= 3) {
            // Calculate simple edit distance for close matches
            return calculateEditDistance(u1, u2) <= 3;
        }
        
        return false;
    }
    
    /**
     * Calculate Levenshtein distance (edit distance) between two strings
     * Used for fuzzy matching to handle typos and small variations
     */
    private int calculateEditDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1),
                        dp[i-1][j-1] + (s1.charAt(i-1) == s2.charAt(j-1) ? 0 : 1)
                    );
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }

    public List<Employee> findAllActive() {
        return employeeRepository.findByStatus("ACTIVE");
    }

    @Transactional
    public Employee createEmployee(Employee employee) {
        if (employee.getEmployeeId() == null || employee.getEmployeeId().isEmpty()) {
            employee.setEmployeeId(generateEmployeeId());
        }

        if (employee.getWorkEmail() == null || employee.getWorkEmail().isEmpty()) {
            employee.setWorkEmail(generateWorkEmail(employee.getFirstName(), employee.getLastName()));
        }

        Employee savedEmployee = employeeRepository.save(employee);
        
        // Create user account for the employee
        createUserAccountForEmployee(savedEmployee);
        
        return savedEmployee;
    }

    @Transactional
    public Employee createEmployee(EmployeeCreateRequest request) {
        // Convert DTO to Employee entity
        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setMiddleName(request.getMiddleName());
        employee.setLastName(request.getLastName());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setGender(request.getGender());
        employee.setPronouns(request.getPronouns());
        employee.setContactNumber(request.getContactNumber());
        employee.setAlternateContactNumber(request.getAlternateContactNumber());
        employee.setPersonalEmail(request.getPersonalEmail());
        employee.setWorkEmail(request.getWorkEmail());
        employee.setResidentialAddress(request.getResidentialAddress());
        employee.setEmergencyContactName(request.getEmergencyContactName());
        employee.setEmergencyContactNumber(request.getEmergencyContactNumber());
        employee.setEmergencyContactRelation(request.getEmergencyContactRelation());
        employee.setSsn(request.getSsn());
        employee.setWorkPermit(request.getWorkPermit());
        employee.setJobTitle(request.getJobTitle());
        employee.setSupervisor(request.getSupervisor());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setWorkLocation(request.getWorkLocation());
        employee.setCurrentLocation(request.getCurrentLocation());
        employee.setWorkMode(request.getWorkMode());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus(request.getStatus() != null ? request.getStatus() : "ONBOARDING");

        // Generate employee ID
        if (employee.getEmployeeId() == null || employee.getEmployeeId().isEmpty()) {
            employee.setEmployeeId(generateEmployeeId());
        }

        // Use work email from request if provided, otherwise generate
        if (employee.getWorkEmail() == null || employee.getWorkEmail().isEmpty()) {
            employee.setWorkEmail(generateWorkEmail(employee.getFirstName(), employee.getLastName()));
        }

        Employee savedEmployee = employeeRepository.save(employee);
        
        return savedEmployee;
    }

    @Transactional
    public Employee updateEmployee(Long id, Employee employeeDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        employee.setFirstName(employeeDetails.getFirstName());
        employee.setMiddleName(employeeDetails.getMiddleName());
        employee.setLastName(employeeDetails.getLastName());
        employee.setDateOfBirth(employeeDetails.getDateOfBirth());
        employee.setGender(employeeDetails.getGender());
        employee.setPronouns(employeeDetails.getPronouns());
        employee.setContactNumber(employeeDetails.getContactNumber());
        employee.setAlternateContactNumber(employeeDetails.getAlternateContactNumber());
        employee.setPersonalEmail(employeeDetails.getPersonalEmail());
        employee.setResidentialAddress(employeeDetails.getResidentialAddress());
        employee.setEmergencyContactName(employeeDetails.getEmergencyContactName());
        employee.setEmergencyContactNumber(employeeDetails.getEmergencyContactNumber());
        employee.setEmergencyContactRelation(employeeDetails.getEmergencyContactRelation());
        employee.setSsn(employeeDetails.getSsn());
        employee.setWorkPermit(employeeDetails.getWorkPermit());
        employee.setJobTitle(employeeDetails.getJobTitle());
        employee.setSupervisor(employeeDetails.getSupervisor());
        employee.setEmploymentType(employeeDetails.getEmploymentType());
        employee.setWorkLocation(employeeDetails.getWorkLocation());
        employee.setCurrentLocation(employeeDetails.getCurrentLocation());
        employee.setWorkMode(employeeDetails.getWorkMode());
        employee.setJoiningDate(employeeDetails.getJoiningDate());
        employee.setStatus(employeeDetails.getStatus());

        return employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        // First, delete all documents associated with this employee
        employeeDocumentRepository.deleteAll(employeeDocumentRepository.findByEmployeeId(id));
        
        // Delete the associated user account if it exists
        User associatedUser = userService.findByEmployeeId(id);
        if (associatedUser != null) {
            userService.deleteUser(associatedUser.getId());
        }
        
        // Finally, delete the employee
        employeeRepository.deleteById(id);
    }

    public long countByStatus(String status) {
        return employeeRepository.countByStatus(status);
    }

    private void createUserAccountForEmployee(Employee employee) {
        try {
            // Check if user already exists with this email
            if (userService.existsByEmail(employee.getWorkEmail())) {
                log.info("User account already exists for email: {}", employee.getWorkEmail());
                return;
            }

            // Generate username from work email (before @)
            String username = employee.getWorkEmail().substring(0, employee.getWorkEmail().indexOf("@"));
            
            // Check if username already exists
            if (userService.existsByUsername(username)) {
                log.info("Username {} already exists, skipping user creation for employee: {}", username, employee.getEmployeeId());
                return;
            }

            // Create new user
            User user = new User();
            user.setUsername(username);
            user.setEmail(employee.getWorkEmail());
            user.setFullName(employee.getFirstName() + " " + employee.getLastName());
            
            // Generate default password: employeeId + "123"
            String defaultPassword = employee.getEmployeeId().toLowerCase() + "123";
            user.setPassword(defaultPassword);
            user.setEnabled(true);
            user.setIsTemporaryPassword(true); // Mark as temporary password

            // Get ROLE_EMPLOYEE role
            Role employeeRole = roleRepository.findByName(Role.RoleName.ROLE_EMPLOYEE)
                    .orElseThrow(() -> new RuntimeException("ROLE_EMPLOYEE not found"));

            // Save user with EMPLOYEE role
            userService.saveUser(user, Arrays.asList(employeeRole.getId()));
            
            log.info("=== USER ACCOUNT CREATED ===");
            log.info("Employee ID: {}", employee.getEmployeeId());
            log.info("Work Email: {}", employee.getWorkEmail());
            log.info("Generated Username: {}", username);
            log.info("Generated Password: {}", defaultPassword);
            log.info("Full Name: {}", employee.getFirstName() + " " + employee.getLastName());
            log.info("========================");
                    
        } catch (Exception e) {
            log.error("Failed to create user account for employee: {}", employee.getEmployeeId(), e);
            // Don't throw exception as employee creation should not fail due to user account creation
        }
    }

    private void createUserAccountForEmployee(Employee employee, String customUsername, String customPassword) {
        try {
            // Check if user already exists with this email
            if (userService.existsByEmail(employee.getWorkEmail())) {
                log.info("User account already exists for email: {}", employee.getWorkEmail());
                return;
            }

            // Use custom username if provided, otherwise generate from work email
            String username = (customUsername != null && !customUsername.isEmpty()) ? 
                customUsername : employee.getWorkEmail().substring(0, employee.getWorkEmail().indexOf("@"));
            
            // Check if username already exists
            if (userService.existsByUsername(username)) {
                log.info("Username {} already exists, skipping user creation for employee: {}", username, employee.getEmployeeId());
                return;
            }

            // Use custom password if provided, otherwise generate default password
            String password = (customPassword != null && !customPassword.isEmpty()) ? 
                customPassword : employee.getEmployeeId().toLowerCase() + "123";

            // Create new user
            User user = new User();
            user.setUsername(username);
            user.setEmail(employee.getWorkEmail());
            user.setFullName(employee.getFirstName() + " " + employee.getLastName());
            user.setPassword(password); // This will be hashed by UserService
            user.setEnabled(true);
            user.setIsTemporaryPassword(true); // Mark as temporary password

            // Get ROLE_EMPLOYEE role
            Role employeeRole = roleRepository.findByName(Role.RoleName.ROLE_EMPLOYEE)
                    .orElseThrow(() -> new RuntimeException("ROLE_EMPLOYEE not found"));

            // Save user with EMPLOYEE role
            userService.saveUser(user, Arrays.asList(employeeRole.getId()));
            
            log.info("=== USER ACCOUNT CREATED ===");
            log.info("Employee ID: {}", employee.getEmployeeId());
            log.info("Work Email: {}", employee.getWorkEmail());
            log.info("Generated Username: {}", username);
            log.info("Generated Password: {}", password);
            log.info("Full Name: {}", employee.getFirstName() + " " + employee.getLastName());
            log.info("========================");
                    
        } catch (Exception e) {
            log.error("Failed to create user account for employee: {}", employee.getEmployeeId(), e);
            // Don't throw exception as employee creation should not fail due to user account creation
        }
    }
    
    /**
     * Get user credentials for an employee (for display purposes only)
     */
    public String[] getUserCredentialsForEmployee(Employee employee) {
        String username = employee.getWorkEmail().substring(0, employee.getWorkEmail().indexOf("@"));
        String password = employee.getEmployeeId().toLowerCase() + "123";
        return new String[]{username, password};
    }
    
    /**
     * Create user account and return the actual credentials used
     */
    public String[] createUserAccountAndGetCredentials(Employee employee) {
        try {
            // Check if user already exists with this email
            if (userService.existsByEmail(employee.getWorkEmail())) {
                log.info("User account already exists for email: {}", employee.getWorkEmail());
                return null;
            }

            // Generate username from work email (before @)
            String username = employee.getWorkEmail().substring(0, employee.getWorkEmail().indexOf("@"));
            
            // Check if username already exists
            if (userService.existsByUsername(username)) {
                log.info("Username {} already exists, skipping user creation for employee: {}", username, employee.getEmployeeId());
                return null;
            }

            // Generate default password: employeeId + "123"
            String password = employee.getEmployeeId().toLowerCase() + "123";

            // Create new user
            User user = new User();
            user.setUsername(username);
            user.setEmail(employee.getWorkEmail());
            user.setFullName(employee.getFirstName() + " " + employee.getLastName());
            user.setPassword(password); // This will be hashed by UserService
            user.setEnabled(true);
            user.setIsTemporaryPassword(true); // Mark as temporary password

            // Get ROLE_EMPLOYEE role
            Role employeeRole = roleRepository.findByName(Role.RoleName.ROLE_EMPLOYEE)
                    .orElseThrow(() -> new RuntimeException("ROLE_EMPLOYEE not found"));

            // Save user with EMPLOYEE role
            userService.saveUser(user, Arrays.asList(employeeRole.getId()));
            
            log.info("=== USER ACCOUNT CREATED ===");
            log.info("Employee ID: {}", employee.getEmployeeId());
            log.info("Work Email: {}", employee.getWorkEmail());
            log.info("Generated Username: {}", username);
            log.info("Generated Password: {}", password);
            log.info("Full Name: {}", employee.getFirstName() + " " + employee.getLastName());
            log.info("========================");
            
            // Return the actual credentials used
            return new String[]{username, password};
                    
        } catch (Exception e) {
            log.error("Failed to create user account for employee: {}", employee.getEmployeeId(), e);
            return null;
        }
    }

    /**
     * Generate password reset link for an employee
     */
    public String generatePasswordResetLinkForEmployee(Employee employee) {
        try {
            String token = passwordResetService.createPasswordResetToken(employee.getWorkEmail());
            return passwordResetService.getResetLink(token);
        } catch (Exception e) {
            log.error("Failed to generate password reset link for employee: {}", employee.getEmployeeId(), e);
            return null;
        }
    }

    /**
     * Generate password reset link by username
     */
    public String generatePasswordResetLinkByUsername(String username) {
        try {
            String token = passwordResetService.createPasswordResetTokenByUsername(username);
            return passwordResetService.getResetLink(token);
        } catch (Exception e) {
            log.error("Failed to generate password reset link for username: {}", username, e);
            return null;
        }
    }

    private String generateEmployeeId() {
        String prefix = "EMP";
        long maxId = 0;
        
        // Find the highest existing employee ID number
        List<Employee> allEmployees = employeeRepository.findAll();
        for (Employee employee : allEmployees) {
            String empId = employee.getEmployeeId();
            if (empId != null && empId.startsWith(prefix)) {
                try {
                    String numberPart = empId.substring(prefix.length());
                    long idNumber = Long.parseLong(numberPart);
                    if (idNumber > maxId) {
                        maxId = idNumber;
                    }
                } catch (NumberFormatException e) {
                    // Skip non-numeric employee IDs
                }
            }
        }
        
        // Generate the next ID
        String newEmployeeId;
        do {
            maxId++;
            newEmployeeId = prefix + String.format("%05d", maxId);
        } while (employeeRepository.findByEmployeeId(newEmployeeId).isPresent());
        
        return newEmployeeId;
    }

    private String generateWorkEmail(String firstName, String lastName) {
        String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + "@originhubs.com";
        return email.replaceAll("\\s+", "");
    }
}

