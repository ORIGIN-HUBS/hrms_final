package com.originhubs.HRMS.config;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Project;
import com.originhubs.HRMS.model.Role;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.model.Timesheet;
import com.originhubs.HRMS.model.TimesheetEntry;
import com.originhubs.HRMS.model.TimesheetExpense;
import com.originhubs.HRMS.repository.EmployeeRepository;
import com.originhubs.HRMS.repository.ProjectRepository;
import com.originhubs.HRMS.repository.RoleRepository;
import com.originhubs.HRMS.repository.UserRepository;
import com.originhubs.HRMS.repository.TimesheetRepository;
import com.originhubs.HRMS.repository.TimesheetEntryRepository;
import com.originhubs.HRMS.repository.TimesheetExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component  // Re-enabled to initialize default data
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;
    private final TimesheetRepository timesheetRepository;
    private final TimesheetEntryRepository timesheetEntryRepository;
    private final TimesheetExpenseRepository timesheetExpenseRepository;

    @Override
    public void run(String... args) {
        // Clean up old test data first
        cleanupOldTestData();
        
        // Create roles if they don't exist
        createRoleIfNotExists(Role.RoleName.ROLE_ADMIN);
        createRoleIfNotExists(Role.RoleName.ROLE_HR);
        createRoleIfNotExists(Role.RoleName.ROLE_EMPLOYEE);

        // Create default admin user if it doesn't exist
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@originhubs.com");
            admin.setFullName("System Administrator");
            admin.setEnabled(true);

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found")));
            admin.setRoles(roles);

            userRepository.save(admin);
            System.out.println("Default admin user created - Username: admin, Password: admin123");
        }

        // Create default HR user if it doesn't exist
        if (!userRepository.existsByUsername("hr")) {
            User hr = new User();
            hr.setUsername("hr");
            hr.setPassword(passwordEncoder.encode("hr123"));
            hr.setEmail("hr@originhubs.com");
            hr.setFullName("HR Manager");
            hr.setEnabled(true);

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(Role.RoleName.ROLE_HR)
                    .orElseThrow(() -> new RuntimeException("HR role not found")));
            hr.setRoles(roles);

            userRepository.save(hr);
            System.out.println("Default HR user created - Username: hr, Password: hr123");
        }

        // Create default employee user if it doesn't exist
        if (!userRepository.existsByUsername("employee")) {
            User employee = new User();
            employee.setUsername("employee");
            employee.setPassword(passwordEncoder.encode("emp123"));
            employee.setEmail("employee@originhubs.com");
            employee.setFullName("Test Employee");
            employee.setEnabled(true);

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(Role.RoleName.ROLE_EMPLOYEE)
                    .orElseThrow(() -> new RuntimeException("Employee role not found")));
            employee.setRoles(roles);

            userRepository.save(employee);
            System.out.println("Default employee user created - Username: employee, Password: emp123");
        }

        // Create sample employees if they don't exist
        createSampleEmployees();
    }

    private void createSampleEmployees() {
        if (employeeRepository.count() == 0) {
            // Sample Employee 1
            Employee emp1 = new Employee();
            emp1.setEmployeeId("EMP001");
            emp1.setFirstName("John");
            emp1.setLastName("Smith");
            emp1.setWorkEmail("john.smith@originhubs.com");
            emp1.setPersonalEmail("john.smith@gmail.com");
            emp1.setContactNumber("+1-555-0101");
            emp1.setJobTitle("Software Developer");
            emp1.setEmploymentType("Full-time");
            emp1.setJoiningDate(LocalDate.of(2023, 1, 15));
            emp1.setStatus("ACTIVE");
            emp1.setSupervisor("Sarah Wilson");
            emp1.setEmergencyContactName("Jane Smith");
            emp1.setEmergencyContactNumber("+1-555-0102");
            emp1.setResidentialAddress("123 Main St, New York, NY 10001");
            emp1.setWorkLocation("New York Office");
            emp1.setWorkMode("Hybrid");
            emp1.setCreatedBy("admin");
            employeeRepository.save(emp1);

            // Sample Employee 2
            Employee emp2 = new Employee();
            emp2.setEmployeeId("EMP002");
            emp2.setFirstName("Sarah");
            emp2.setLastName("Wilson");
            emp2.setWorkEmail("sarah.wilson@originhubs.com");
            emp2.setPersonalEmail("sarah.wilson@gmail.com");
            emp2.setContactNumber("+1-555-0201");
            emp2.setJobTitle("Senior Software Developer");
            emp2.setEmploymentType("Full-time");
            emp2.setJoiningDate(LocalDate.of(2022, 6, 1));
            emp2.setStatus("ACTIVE");
            emp2.setSupervisor("Mike Johnson");
            emp2.setEmergencyContactName("Tom Wilson");
            emp2.setEmergencyContactNumber("+1-555-0202");
            emp2.setResidentialAddress("456 Oak Ave, Brooklyn, NY 11201");
            emp2.setWorkLocation("New York Office");
            emp2.setWorkMode("Onsite");
            emp2.setCreatedBy("admin");
            employeeRepository.save(emp2);

            // Sample Employee 3
            Employee emp3 = new Employee();
            emp3.setEmployeeId("EMP003");
            emp3.setFirstName("Mike");
            emp3.setLastName("Johnson");
            emp3.setWorkEmail("mike.johnson@originhubs.com");
            emp3.setPersonalEmail("mike.johnson@gmail.com");
            emp3.setContactNumber("+1-555-0301");
            emp3.setJobTitle("IT Manager");
            emp3.setEmploymentType("Full-time");
            emp3.setJoiningDate(LocalDate.of(2021, 3, 10));
            emp3.setStatus("ACTIVE");
            emp3.setSupervisor("CEO");
            emp3.setEmergencyContactName("Lisa Johnson");
            emp3.setEmergencyContactNumber("+1-555-0302");
            emp3.setResidentialAddress("789 Pine St, Manhattan, NY 10002");
            emp3.setWorkLocation("New York Office");
            emp3.setWorkMode("Hybrid");
            emp3.setCreatedBy("admin");
            employeeRepository.save(emp3);

            // Sample Employee 4 - In Onboarding Status
            Employee emp4 = new Employee();
            emp4.setEmployeeId("EMP004");
            emp4.setFirstName("Emily");
            emp4.setLastName("Davis");
            emp4.setWorkEmail("emily.davis@originhubs.com");
            emp4.setPersonalEmail("emily.davis@gmail.com");
            emp4.setContactNumber("+1-555-0401");
            emp4.setJobTitle("Junior Developer");
            emp4.setEmploymentType("Full-time");
            emp4.setJoiningDate(LocalDate.now().minusDays(5));
            emp4.setStatus("ONBOARDING");
            emp4.setSupervisor("Sarah Wilson");
            emp4.setEmergencyContactName("Robert Davis");
            emp4.setEmergencyContactNumber("+1-555-0402");
            emp4.setResidentialAddress("321 Elm St, Queens, NY 11101");
            emp4.setWorkLocation("New York Office");
            emp4.setWorkMode("Remote");
            emp4.setCreatedBy("hr");
            employeeRepository.save(emp4);

            System.out.println("Sample employees created successfully!");
        }
        
        // Initialize project assignments after employees are created
        initializeProjectAssignments();
    }
    
    private void initializeProjectAssignments() {
        try {
            log.info("Starting project assignment initialization...");
            
            // Check if we have any projects
            List<Project> existingProjects = projectRepository.findAll();
            log.info("Found {} existing projects", existingProjects.size());
            
            // Check if we have employees
            List<Employee> employees = employeeRepository.findByStatus("ACTIVE");
            log.info("Found {} active employees", employees.size());
            
            if (employees.isEmpty()) {
                log.warn("No active employees found, skipping project assignment");
                return;
            }
            
            // Create sample projects if none exist
            if (existingProjects.isEmpty()) {
                log.info("No projects found, creating sample projects...");
                createSampleProjects(employees);
            } else {
                // Assign existing projects to employees without assignments
                assignProjectsToEmployees(existingProjects, employees);
            }
            
            log.info("Project assignment initialization completed");
            
        } catch (Exception e) {
            log.error("Error during project assignment initialization", e);
        }
    }
    
    private void createSampleProjects(List<Employee> employees) {
        try {
            // Create sample projects and assign them to employees
            for (int i = 0; i < Math.min(3, employees.size()); i++) {
                Employee employee = employees.get(i);
                
                Project project = new Project();
                project.setProjectName("Client Project " + (i + 1));
                project.setJobTitle(employee.getJobTitle() != null ? employee.getJobTitle() : "Software Developer");
                project.setVendorCompanyName("OriginHubs");
                project.setClientCompanyName("TechCorp " + (i + 1));
                project.setPocName("John Manager " + (i + 1));
                project.setPocTitle("Project Manager");
                project.setPocEmail("manager" + (i + 1) + "@techcorp.com");
                project.setPocPhone("555-010" + i);
                project.setAgreementTerms("Standard MSA Agreement");
                project.setVendorLocation("Remote");
                project.setClientLocation("Client Site " + (i + 1));
                project.setWorkMode("HYBRID");
                project.setVendorPayRate(BigDecimal.valueOf(85.0 + (i * 5)));
                project.setCandidatePayRate(BigDecimal.valueOf(80.0 + (i * 5)));
                project.setProjectStartDate(LocalDate.now().minusMonths(1));
                project.setProjectEndDate(LocalDate.now().plusMonths(6));
                project.setStatus("ACTIVE");
                project.setEmployee(employee); // Assign to employee
                
                Project savedProject = projectRepository.save(project);
                log.info("Created project '{}' and assigned to employee '{}' (ID: {})", 
                    savedProject.getProjectName(), 
                    employee.getFirstName() + " " + employee.getLastName(),
                    employee.getId());
            }
        } catch (Exception e) {
            log.error("Error creating sample projects", e);
        }
    }
    
    private void assignProjectsToEmployees(List<Project> projects, List<Employee> employees) {
        try {
            // Find projects without employee assignments
            List<Project> unassignedProjects = projects.stream()
                .filter(project -> project.getEmployee() == null)
                .toList();
                
            if (unassignedProjects.isEmpty()) {
                log.info("All projects are already assigned");
                return;
            }
            
            log.info("Found {} unassigned projects", unassignedProjects.size());
            
            // Assign unassigned projects to employees
            for (int i = 0; i < unassignedProjects.size() && i < employees.size(); i++) {
                Project project = unassignedProjects.get(i);
                Employee employee = employees.get(i % employees.size()); // Cycle through employees
                
                project.setEmployee(employee);
                project.setStatus("ACTIVE"); // Ensure it's active
                
                Project savedProject = projectRepository.save(project);
                log.info("Assigned project '{}' to employee '{}' (ID: {})", 
                    savedProject.getProjectName(), 
                    employee.getFirstName() + " " + employee.getLastName(),
                    employee.getId());
            }
        } catch (Exception e) {
            log.error("Error assigning projects to employees", e);
        }
    }

    private void createRoleIfNotExists(Role.RoleName roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
            System.out.println("Role created: " + roleName);
        }
    }
    
    /**
     * Clean up old test data from 2022 that appears as DRAFT status
     */
    private void cleanupOldTestData() {
        try {
            log.info("Starting cleanup of old test timesheet data...");
            
            // Define date range for test data (from create_test_timesheets.sql)
            LocalDate testStartDate = LocalDate.of(2024, 10, 14);
            LocalDate testEndDate = LocalDate.of(2024, 10, 27);
            
            // Get timesheets in the test date range
            List<Timesheet> testTimesheets = timesheetRepository.findByWeekStartDateBetween(testStartDate, testEndDate);
            
            if (!testTimesheets.isEmpty()) {
                log.info("Found {} test timesheets to clean up", testTimesheets.size());
                
                int deletedExpenses = 0;
                int deletedEntries = 0;
                
                // Delete related data first (foreign key constraints)
                for (Timesheet timesheet : testTimesheets) {
                    // Delete expenses
                    List<TimesheetExpense> expenses = timesheetExpenseRepository.findByTimesheet(timesheet);
                    deletedExpenses += expenses.size();
                    timesheetExpenseRepository.deleteAll(expenses);
                    
                    // Delete entries
                    List<TimesheetEntry> entries = timesheetEntryRepository.findByTimesheet(timesheet);
                    deletedEntries += entries.size();
                    timesheetEntryRepository.deleteAll(entries);
                }
                
                // Delete timesheets
                timesheetRepository.deleteAll(testTimesheets);
                
                log.info("Cleanup completed: {} timesheets, {} entries, {} expenses deleted", 
                        testTimesheets.size(), deletedEntries, deletedExpenses);
            } else {
                log.info("No test timesheet data found to clean up");
            }
            
        } catch (Exception e) {
            log.error("Error during old test data cleanup", e);
        }
    }
}

