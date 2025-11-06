package com.originhubs.HRMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "offboarding")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Offboarding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    // Exit Details
    private LocalDate resignationDate;

    @Column(length = 1000)
    private String reasonForLeaving;

    private LocalDate lastWorkingDay;

    private Integer noticePeriod; // in days

    @Column(length = 2000)
    private String assetsToCollect;

    @Column(length = 2000)
    private String feedbackAndSuggestions;

    // Settlement Details
    private BigDecimal finalSettlement;

    private BigDecimal pendingSalary;

    private String settlementStatus; // PENDING, PROCESSED, COMPLETED

    // IT Access
    private boolean emailRevoked = false;

    private boolean slackRevoked = false;

    private LocalDateTime emailRevokedAt;

    private LocalDateTime slackRevokedAt;

    // Documents
    private boolean relievingLetterGenerated = false;

    private boolean experienceCertificateGenerated = false;

    private String relievingLetterPath;

    private String experienceCertificatePath;

    // NDA
    private boolean ndaSigned = false;

    private String ndaDocumentPath;

    // Status
    @Column(nullable = false)
    private String status; // INITIATED, IN_PROGRESS, COMPLETED

    // Audit Fields
    @Column(name = "initiated_at")
    private LocalDateTime initiatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "initiated_by")
    private String initiatedBy;

    @PrePersist
    protected void onCreate() {
        initiatedAt = LocalDateTime.now();
        if (status == null) {
            status = "INITIATED";
        }
        if (settlementStatus == null) {
            settlementStatus = "PENDING";
        }
    }
}

