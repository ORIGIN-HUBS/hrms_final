package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.PasswordResetToken;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.service.PasswordResetService;
import com.originhubs.HRMS.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final PasswordResetService passwordResetService;
    private final UserService userService;

    @GetMapping("/forgot-password")
    public String forgotPasswordForm() {
        return "auth/forgot-password";
    }

    @PostMapping("/forgot-password")
    public String processForgotPassword(@RequestParam("email") String email, 
                                      RedirectAttributes redirectAttributes) {
        try {
            String token = passwordResetService.createPasswordResetToken(email);
            String resetLink = passwordResetService.getResetLink(token);
            
            redirectAttributes.addFlashAttribute("success", 
                "Password reset instructions have been sent. You can also use this direct link: " + 
                "http://localhost:8080" + resetLink);
                
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", 
                "If an account with that email exists, you will receive password reset instructions.");
        }
        
        return "redirect:/auth/forgot-password";
    }

    @GetMapping("/reset-password")
    public String resetPasswordForm(@RequestParam("token") String token, Model model) {
        if (!passwordResetService.validateToken(token)) {
            model.addAttribute("error", "Invalid or expired reset token.");
            return "auth/reset-password-error";
        }
        
        Optional<PasswordResetToken> resetToken = passwordResetService.findByToken(token);
        if (resetToken.isPresent()) {
            model.addAttribute("token", token);
            model.addAttribute("username", resetToken.get().getUser().getUsername());
            return "auth/reset-password";
        }
        
        model.addAttribute("error", "Invalid reset token.");
        return "auth/reset-password-error";
    }

    @PostMapping("/reset-password")
    public String processResetPassword(@RequestParam("token") String token,
                                     @RequestParam("password") String password,
                                     @RequestParam("confirmPassword") String confirmPassword,
                                     RedirectAttributes redirectAttributes) {
        
        if (!password.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("error", "Passwords do not match.");
            return "redirect:/auth/reset-password?token=" + token;
        }
        
        if (password.length() < 6) {
            redirectAttributes.addFlashAttribute("error", "Password must be at least 6 characters long.");
            return "redirect:/auth/reset-password?token=" + token;
        }
        
        boolean success = passwordResetService.resetPassword(token, password);
        
        if (success) {
            redirectAttributes.addFlashAttribute("success", 
                "Your password has been successfully reset. You can now login with your new password.");
            return "redirect:/login";
        } else {
            redirectAttributes.addFlashAttribute("error", "Invalid or expired reset token.");
            return "redirect:/auth/reset-password?token=" + token;
        }
    }

    @GetMapping("/change-password")
    public String changePasswordForm(@RequestParam(value = "firstLogin", required = false) Boolean firstLogin,
                                   Model model, Authentication authentication) {
        model.addAttribute("firstLogin", firstLogin != null && firstLogin);
        
        if (authentication != null) {
            User user = userService.findByUsername(authentication.getName());
            model.addAttribute("user", user);
        }
        
        return "auth/change-password";
    }
    
    @PostMapping("/change-password")
    public String changePassword(@RequestParam("currentPassword") String currentPassword,
                               @RequestParam("newPassword") String newPassword,
                               @RequestParam("confirmPassword") String confirmPassword,
                               Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        
        if (!newPassword.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("error", "New passwords do not match!");
            return "redirect:/auth/change-password";
        }
        
        if (newPassword.length() < 6) {
            redirectAttributes.addFlashAttribute("error", "New password must be at least 6 characters long!");
            return "redirect:/auth/change-password";
        }
        
        try {
            User user = userService.findByUsername(authentication.getName());
            
            // Verify current password
            if (!passwordResetService.verifyCurrentPassword(user, currentPassword)) {
                redirectAttributes.addFlashAttribute("error", "Current password is incorrect!");
                return "redirect:/auth/change-password";
            }
            
            // Update password
            userService.updateUserPassword(user, newPassword);
            
            redirectAttributes.addFlashAttribute("success", 
                "Password changed successfully! You can now access all features.");
            
            return "redirect:/dashboard";
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error changing password: " + e.getMessage());
            return "redirect:/auth/change-password";
        }
    }

    @PostMapping("/generate-reset-link")
    @ResponseBody
    public String generateResetLink(@RequestParam("username") String username) {
        try {
            String token = passwordResetService.createPasswordResetTokenByUsername(username);
            String resetLink = passwordResetService.getResetLink(token);
            return "http://localhost:8080" + resetLink;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}