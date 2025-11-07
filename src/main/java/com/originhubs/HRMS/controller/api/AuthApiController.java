package com.originhubs.HRMS.controller.api;

import com.originhubs.HRMS.dto.LoginRequest;
import com.originhubs.HRMS.dto.LoginResponse;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.service.UserService;
import com.originhubs.HRMS.service.EmployeeService;
import com.originhubs.HRMS.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, allowCredentials = "true")
public class AuthApiController {

    private static final Logger logger = LoggerFactory.getLogger(AuthApiController.class);
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final EmployeeService employeeService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            // Set the authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Create session
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            // Get user details
            User user = userService.findByUsername(loginRequest.getUsername());
            if (user != null) {
                // Update last login
                userService.updateUserLastLogin(user);
                
                // Create response
                LoginResponse response = new LoginResponse();
                response.setSuccess(true);
                response.setMessage("Login successful");
                
                // Create user info
                LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
                userInfo.setId(user.getId());
                userInfo.setUsername(user.getUsername());
                userInfo.setFullName(user.getFullName());
                userInfo.setEmail(user.getEmail());
                userInfo.setRoles(user.getRoles().stream()
                    .map(role -> role.getName().toString())
                    .collect(Collectors.toList()));
                userInfo.setIsTemporaryPassword(user.getIsTemporaryPassword());
                
                // Find employee ID if user is an employee
                try {
                    Optional<Employee> employeeOpt = employeeService.findByWorkEmail(user.getEmail());
                    if (employeeOpt.isPresent()) {
                        Employee employee = employeeOpt.get();
                        userInfo.setEmployeeId(employee.getId());
                        logger.info("Found employee record for user {}: Employee ID = {}, DB ID = {}", 
                                   user.getEmail(), employee.getEmployeeId(), employee.getId());
                    } else {
                        logger.warn("No employee record found for user email: {}", user.getEmail());
                    }
                } catch (Exception e) {
                    logger.error("Error finding employee by email: {}", user.getEmail(), e);
                    // Employee not found, leave employeeId as null
                }
                
                response.setUser(userInfo);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(new LoginResponse(false, "User not found", null));
            }

        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Invalid username or password", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Login failed: " + e.getMessage(), null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            // Invalidate session
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            
            // Clear security context
            SecurityContextHolder.clearContext();
            
            return ResponseEntity.ok().body("{\"message\": \"Logout successful\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Logout failed\"}");
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        try {
            String username = authentication.getName();
            logger.info("Getting current user for username: {}", username);
            
            User user = userService.findByUsername(username);
            if (user != null) {
                logger.info("User found: {} with {} roles", user.getUsername(), user.getRoles().size());
                user.getRoles().forEach(role -> logger.info("Role: {}", role.getName()));
                
                LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
                userInfo.setId(user.getId());
                userInfo.setUsername(user.getUsername());
                userInfo.setFullName(user.getFullName());
                userInfo.setEmail(user.getEmail());
                
                List<String> roleNames = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList());
                logger.info("Converted roles: {}", roleNames);
                userInfo.setRoles(roleNames);
                userInfo.setIsTemporaryPassword(user.getIsTemporaryPassword());
                
                // Find employee ID if user is an employee
                try {
                    Optional<Employee> employeeOpt = employeeService.findByWorkEmail(user.getEmail());
                    if (employeeOpt.isPresent()) {
                        userInfo.setEmployeeId(employeeOpt.get().getId());
                    }
                } catch (Exception e) {
                    // Employee not found, leave employeeId as null
                }
                
                logger.info("Returning user info: {}", userInfo);
                return ResponseEntity.ok(userInfo);
            } else {
                logger.warn("User not found for username: {}", username);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting current user", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestParam("currentPassword") String currentPassword,
                                          @RequestParam("newPassword") String newPassword,
                                          @RequestParam("confirmPassword") String confirmPassword,
                                          Authentication authentication) {
        try {
            if (!newPassword.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body("{\"error\": \"New passwords do not match!\"}");
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("{\"error\": \"New password must be at least 6 characters long!\"}");
            }
            
            User user = userService.findByUsername(authentication.getName());
            if (user == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"User not found!\"}");
            }
            
            // Verify current password
            if (!passwordResetService.verifyCurrentPassword(user, currentPassword)) {
                return ResponseEntity.badRequest().body("{\"error\": \"Current password is incorrect!\"}");
            }
            
            // Update password
            userService.updateUserPassword(user, newPassword);
            
            return ResponseEntity.ok("{\"message\": \"Password changed successfully!\"}");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Error changing password: " + e.getMessage() + "\"}");
        }
    }
}