package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.service.DashboardService;
import com.originhubs.HRMS.service.NotificationService;
import com.originhubs.HRMS.service.UserService;
import com.originhubs.HRMS.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;
import java.util.Optional;

@Controller
public class HomeController {

    @Autowired
    private DashboardService dashboardService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/")
    public String home() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String login(@RequestParam(value = "error", required = false) String error,
                       @RequestParam(value = "logout", required = false) String logout,
                       Model model) {
        if (error != null) {
            model.addAttribute("error", "Invalid username or password!");
        }
        if (logout != null) {
            model.addAttribute("message", "You have been logged out successfully.");
        }
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        if (authentication != null && authentication.isAuthenticated()) {
            model.addAttribute("username", authentication.getName());
            model.addAttribute("authorities", authentication.getAuthorities());
            
            // Get current user
            User currentUser = userService.findByUsername(authentication.getName());
            if (currentUser != null) {
                // Check if user is HR/Admin or Employee
                boolean isHROrAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_HR") || auth.getAuthority().equals("ROLE_ADMIN"));
                
                if (isHROrAdmin) {
                    // HR/Admin Dashboard - show full analytics
                    Map<String, Object> analytics = dashboardService.getDashboardAnalytics();
                    model.addAllAttributes(analytics);
                    
                    Long unreadCount = notificationService.getUnreadCount(currentUser.getId());
                    model.addAttribute("unreadNotificationCount", unreadCount);
                    model.addAttribute("recentNotifications", 
                        notificationService.getRecentNotifications(currentUser.getId(), 5));
                    
                    return "dashboard";  // Use main dashboard for HR/Admin with full analytics
                } else {
                    // Employee Dashboard - show personal data
                    Optional<Employee> employeeOpt = employeeService.findByUsername(authentication.getName());
                    Employee employee = employeeOpt.orElse(null);
                    
                    if (employee == null) {
                        // Try to find by email if username doesn't match employeeId
                        employee = employeeService.getAllEmployees().stream()
                            .filter(emp -> authentication.getName().equals(emp.getPersonalEmail()) ||
                                         authentication.getName().equals(emp.getWorkEmail()))
                            .findFirst().orElse(null);
                    }
                    
                    if (employee != null) {
                        Map<String, Object> employeeData = dashboardService.getEmployeeDashboardData(employee.getId());
                        model.addAllAttributes(employeeData);
                        model.addAttribute("employee", employee);
                    }
                    
                    Long unreadCount = notificationService.getUnreadCount(currentUser.getId());
                    model.addAttribute("unreadNotificationCount", unreadCount);
                    model.addAttribute("recentNotifications", 
                        notificationService.getRecentNotifications(currentUser.getId(), 5));
                    
                    return "employee_dashboard";  // Employee-specific dashboard
                }
            }
            
            return "dashboard";  // Fallback to basic dashboard
        }
        return "redirect:/login";
    }

    @GetMapping("/access-denied")
    public String accessDenied() {
        return "access-denied";
    }
}