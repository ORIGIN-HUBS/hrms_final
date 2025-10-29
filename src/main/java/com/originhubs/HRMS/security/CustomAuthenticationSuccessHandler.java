package com.originhubs.HRMS.security;

import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    
    public CustomAuthenticationSuccessHandler(@Lazy UserService userService) {
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        
        if (user != null) {
            // Update last login time
            user.setLastLogin(LocalDateTime.now());
            userService.updateUserLastLogin(user);
            
            // Check if user has temporary password
            if (Boolean.TRUE.equals(user.getIsTemporaryPassword())) {
                // Redirect to change password page for first-time login
                response.sendRedirect("/auth/change-password?firstLogin=true");
                return;
            }
        }
        
        // Normal login flow - redirect to dashboard
        response.sendRedirect("/dashboard");
    }
}