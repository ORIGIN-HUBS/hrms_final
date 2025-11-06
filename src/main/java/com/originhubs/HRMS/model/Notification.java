package com.originhubs.HRMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String message;

    @Column(nullable = false)
    private String type; // SUCCESS, INFO, WARNING, ERROR

    @Column(nullable = false)
    private String category; // DOCUMENT, EMPLOYEE, PROJECT, OFFBOARDING

    @Column(name = "user_id")
    private Long userId; // Recipient user ID

    @Column(name = "employee_id")
    private Long employeeId; // Related employee ID (if applicable)

    @Column(name = "document_id")
    private Long documentId; // Related document ID (if applicable)

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public String getTypeClass() {
        switch (type.toUpperCase()) {
            case "SUCCESS": return "alert-success";
            case "WARNING": return "alert-warning";
            case "ERROR": return "alert-danger";
            default: return "alert-info";
        }
    }

    public String getTypeIcon() {
        switch (type.toUpperCase()) {
            case "SUCCESS": return "bi-check-circle";
            case "WARNING": return "bi-exclamation-triangle";
            case "ERROR": return "bi-x-circle";
            default: return "bi-info-circle";
        }
    }
}