package com.originhubs.HRMS.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String projectName;

    @Column(nullable = false)
    private String jobTitle;

    // Vendor Information
    @Column(nullable = false)
    private String vendorCompanyName;

    private String pocName;

    private String pocTitle;

    private String pocEmail;

    private String pocPhone;

    private String vendorEmail; // Email for sending invoices

    @Column(length = 1000)
    private String agreementTerms;

    private String vendorLocation;

    // Client Information
    @Column(nullable = false)
    private String clientCompanyName;

    private String clientLocation;

    private String workMode; // Onsite, Remote, Hybrid

    // Financial Information
    private BigDecimal vendorPayRate;

    private BigDecimal candidatePayRate;

    // Timeline
    private LocalDate projectStartDate;

    private LocalDate projectEndDate;

    private LocalDate extensionDate;

    // Project Status
    @Column(nullable = false)
    private String status; // ACTIVE, COMPLETED, EXTENDED, TERMINATED

    // Employee Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties({"directReports", "manager", "roles", "hibernateLazyInitializer", "handler"})
    private Employee employee;

    // Audit Fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

