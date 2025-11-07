package com.originhubs.HRMS.controller.api;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.service.DashboardService;
import com.originhubs.HRMS.service.EmployeeService;
import com.originhubs.HRMS.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
public class DashboardApiController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserService userService;

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            
            // Check if user has EMPLOYEE role (and not ADMIN or HR)
            boolean isEmployee = user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equals("ROLE_EMPLOYEE"))
                && user.getRoles().stream()
                .noneMatch(role -> role.getName().name().equals("ROLE_ADMIN") || role.getName().name().equals("ROLE_HR"));
            
            if (isEmployee) {
                // Find employee by work email or personal email
                Optional<Employee> employeeOpt = employeeService.findByWorkEmail(user.getEmail());
                
                if (employeeOpt.isPresent()) {
                    // Return employee-specific analytics
                    String employeeId = employeeOpt.get().getEmployeeId();
                    Map<String, Object> analytics = dashboardService.getEmployeeSpecificAnalytics(employeeId);
                    return ResponseEntity.ok(analytics);
                } else {
                    // If no employee record found, return empty analytics
                    Map<String, Object> analytics = dashboardService.getEmployeeSpecificAnalytics(null);
                    return ResponseEntity.ok(analytics);
                }
            } else {
                // Return full analytics for admin/HR
                Map<String, Object> analytics = dashboardService.getDashboardAnalytics();
                return ResponseEntity.ok(analytics);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/employee-analytics/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or #employeeId == authentication.name")
    public ResponseEntity<Map<String, Object>> getEmployeeAnalytics(@PathVariable String employeeId) {
        try {
            Map<String, Object> analytics = dashboardService.getEmployeeSpecificAnalytics(employeeId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}