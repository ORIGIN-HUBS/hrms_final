package com.originhubs.HRMS.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public boolean sendCredentialsEmail(String toEmail, String employeeName, String username, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Welcome to OriginHubs HRMS - Your Login Credentials");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Welcome to OriginHubs HRMS!\n\n" +
                "Your login credentials are:\n" +
                "Username: %s\n" +
                "Password: %s\n\n" +
                "Please login and change your password on first login.\n\n" +
                "Best regards,\n" +
                "HR Team",
                employeeName, username, password
            ));
            message.setFrom("hr@originhubs.com");
            
            mailSender.send(message);
            log.info("Credentials email sent successfully to: {}", toEmail);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send credentials email to: {}", toEmail, e);
            log.info("=== CREDENTIALS FOR MANUAL SHARING ===");
            log.info("To: {}", toEmail);
            log.info("Employee: {}", employeeName);
            log.info("Username: {}", username);
            log.info("Password: {}", password);
            log.info("======================================");
            return false;
        }
    }
}