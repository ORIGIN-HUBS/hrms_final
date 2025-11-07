package com.originhubs.HRMS.controller.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.service.UserService;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, allowCredentials = "true")
public class UserApiController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> getCurrentUserProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Create response with user profile data
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("email", user.getEmail());
            profile.put("fullName", user.getFullName());
            
            // Parse first and last name from fullName
            String[] nameParts = user.getFullName().split(" ", 2);
            profile.put("firstName", nameParts.length > 0 ? nameParts[0] : "");
            profile.put("lastName", nameParts.length > 1 ? nameParts[1] : "");
            
            // Convert Role set to string array
            String[] roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())  // Get enum name as string
                .toArray(String[]::new);
            profile.put("roles", roleNames);
            
            profile.put("enabled", user.isEnabled());
            profile.put("createdAt", user.getCreatedAt());
            profile.put("lastLogin", user.getLastLogin());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> changePassword(
            @RequestBody Map<String, String> passwordData,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Current password and new password are required");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userService.findByUsername(username);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Current password is incorrect");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setIsTemporaryPassword(false);
            userService.saveUser(user, null);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/{userId}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> resetUserPassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> passwordData) {
        try {
            String newPassword = passwordData.get("newPassword");

            if (newPassword == null || newPassword.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "New password is required");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userService.findById(userId);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Reset password
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setIsTemporaryPassword(true); // Mark as temporary so user must change it
            userService.saveUser(user, null);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to reset password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/{userId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> toggleUserStatus(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            user.setEnabled(!user.isEnabled());
            userService.saveUser(user, null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", user.isEnabled() ? "User enabled successfully" : "User disabled successfully");
            response.put("enabled", user.isEnabled());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to toggle user status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> deleteUser(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            userService.deleteUser(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userService.findByEmail(email);
            
            // Always return success message for security reasons (don't reveal if email exists)
            Map<String, String> response = new HashMap<>();
            response.put("message", "If an account exists with this email, you will receive password reset instructions.");
            
            if (user != null) {
                // TODO: Generate reset token and send email
                // For now, just generate a temporary password
                String tempPassword = generateTemporaryPassword();
                userService.updateUserWithTemporaryPassword(user, tempPassword);
                
                // In a real application, send email with reset link or temp password
                System.out.println("Temporary password for " + email + ": " + tempPassword);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to process forgot password request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private String generateTemporaryPassword() {
        // Generate a random 8-character password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            int index = (int) (Math.random() * chars.length());
            password.append(chars.charAt(index));
        }
        return password.toString();
    }
}