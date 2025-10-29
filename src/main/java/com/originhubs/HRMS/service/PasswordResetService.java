package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.PasswordResetToken;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.repository.PasswordResetTokenRepository;
import com.originhubs.HRMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Transactional
    public String createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        // Invalidate any existing tokens for this user
        tokenRepository.markAllUserTokensAsUsed(user, LocalDateTime.now());
        
        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24)); // 24 hours expiry
        
        tokenRepository.save(resetToken);
        
        // Send notification
        notificationService.createDocumentNotification(
            "INFO",
            "Password Reset Request",
            "A password reset link has been generated for your account. Please check your email or use the reset link. This link will expire in 24 hours.",
            user.getId(),
            null,
            null
        );
        
        return token;
    }

    @Transactional
    public String createPasswordResetTokenByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        
        return createPasswordResetToken(user.getEmail());
    }

    public boolean validateToken(String token) {
        Optional<PasswordResetToken> resetToken = tokenRepository.findByTokenAndUsedFalse(token);
        return resetToken.isPresent() && resetToken.get().isValid();
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> resetTokenOpt = tokenRepository.findByTokenAndUsedFalse(token);
        
        if (resetTokenOpt.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = resetTokenOpt.get();
        
        if (!resetToken.isValid()) {
            return false;
        }
        
        // Update user password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
        
        // Send success notification
        notificationService.createDocumentNotification(
            "SUCCESS",
            "Password Reset Successful",
            "Your password has been successfully reset. You can now login with your new password.",
            user.getId(),
            null,
            null
        );
        
        return true;
    }

    public Optional<PasswordResetToken> findByToken(String token) {
        return tokenRepository.findByToken(token);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        // Clean up tokens older than 7 days
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        tokenRepository.deleteExpiredTokens(cutoffDate);
    }

    public boolean hasActiveResetToken(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return false;
        }
        
        Optional<PasswordResetToken> activeToken = tokenRepository.findActiveTokenByUser(user.get(), LocalDateTime.now());
        return activeToken.isPresent();
    }

    public String getResetLink(String token) {
        return "/auth/reset-password?token=" + token;
    }
    
    public boolean verifyCurrentPassword(User user, String currentPassword) {
        return passwordEncoder.matches(currentPassword, user.getPassword());
    }
}