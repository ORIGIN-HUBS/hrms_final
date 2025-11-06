package com.originhubs.HRMS.validation;

import com.originhubs.HRMS.exception.ValidationException;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.regex.Pattern;

public class ValidationUtils {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[+]?[1-9]\\d{1,14}$"
    );
    
    private static final Pattern EMPLOYEE_ID_PATTERN = Pattern.compile(
        "^EMP\\d{3,6}$"
    );

    public static void validateEmail(String email, String fieldName) {
        if (!StringUtils.hasText(email)) {
            throw new ValidationException(fieldName + " is required");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException(fieldName + " must be a valid email address");
        }
    }

    public static void validatePhone(String phone, String fieldName) {
        if (!StringUtils.hasText(phone)) {
            throw new ValidationException(fieldName + " is required");
        }
        if (!PHONE_PATTERN.matcher(phone.replaceAll("[\\s()-]", "")).matches()) {
            throw new ValidationException(fieldName + " must be a valid phone number");
        }
    }

    public static void validateEmployeeId(String employeeId) {
        if (!StringUtils.hasText(employeeId)) {
            throw new ValidationException("Employee ID is required");
        }
        if (!EMPLOYEE_ID_PATTERN.matcher(employeeId).matches()) {
            throw new ValidationException("Employee ID must follow format EMP001-EMP999999");
        }
    }

    public static void validateName(String name, String fieldName) {
        if (!StringUtils.hasText(name)) {
            throw new ValidationException(fieldName + " is required");
        }
        if (name.trim().length() < 2) {
            throw new ValidationException(fieldName + " must be at least 2 characters long");
        }
        if (name.trim().length() > 50) {
            throw new ValidationException(fieldName + " must not exceed 50 characters");
        }
    }

    public static void validateDate(LocalDate date, String fieldName) {
        if (date == null) {
            throw new ValidationException(fieldName + " is required");
        }
    }

    public static void validateJoiningDate(LocalDate joiningDate) {
        validateDate(joiningDate, "Joining date");
        
        LocalDate today = LocalDate.now();
        LocalDate maxFutureDate = today.plusMonths(6);
        LocalDate minPastDate = today.minusYears(50);
        
        if (joiningDate.isAfter(maxFutureDate)) {
            throw new ValidationException("Joining date cannot be more than 6 months in the future");
        }
        if (joiningDate.isBefore(minPastDate)) {
            throw new ValidationException("Joining date cannot be more than 50 years in the past");
        }
    }

    public static void validatePassword(String password) {
        if (!StringUtils.hasText(password)) {
            throw new ValidationException("Password is required");
        }
        if (password.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters long");
        }
    }

    public static void validateFileSize(long fileSize, long maxSize) {
        if (fileSize > maxSize) {
            throw new ValidationException("File size exceeds maximum allowed size of " + (maxSize / 1024 / 1024) + "MB");
        }
    }

    public static void validateFileType(String fileName, String[] allowedTypes) {
        if (!StringUtils.hasText(fileName)) {
            throw new ValidationException("File name is required");
        }
        
        String extension = getFileExtension(fileName).toLowerCase();
        for (String allowedType : allowedTypes) {
            if (extension.equals(allowedType.toLowerCase())) {
                return;
            }
        }
        
        throw new ValidationException("File type not allowed. Allowed types: " + String.join(", ", allowedTypes));
    }

    private static String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1) : "";
    }
}