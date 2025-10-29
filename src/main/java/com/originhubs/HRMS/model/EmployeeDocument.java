package com.originhubs.HRMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String documentType; // OFFER_LETTER, I9, PASSPORT, SSN, DL, PHOTO, VISA, I20, I94, EDUCATIONAL, SERVICE_AGREEMENT

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String fileType; // PDF, JPG, PNG, etc.

    private Long fileSize;

    private LocalDate expiryDate; // For documents like Visa, I-94, etc.

    private String documentNumber; // Passport number, Visa number, etc.

    private String status; // PENDING, VERIFIED, REJECTED, EXPIRED

    private String verifiedBy;

    private LocalDateTime verifiedAt;

    @Column(length = 500)
    private String notes;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }
}

