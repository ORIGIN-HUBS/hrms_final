package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Optional;

@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final EmployeeService employeeService;

    /**
     * Helper method to get current employee from authentication
     */
    private Employee getCurrentEmployee(Authentication auth) {
        Optional<Employee> employee = employeeService.findByUsername(auth.getName());
        if (employee.isEmpty()) {
            throw new IllegalStateException("Employee not found for user: " + auth.getName());
        }
        return employee.get();
    }

    /**
     * Show employee profile page
     */
    @GetMapping("")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String viewProfile(Authentication auth, Model model) {
        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            
            model.addAttribute("employee", currentEmployee);
            
            return "profile/my-profile";
        } catch (IllegalStateException e) {
            model.addAttribute("error", e.getMessage());
            return "error/employee-not-found";
        }
    }
}