package com.originhubs.HRMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timesheet_expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetExpense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timesheet_id", nullable = false)
    private Timesheet timesheet;

    // Expense Information
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "expense_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal expenseAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false)
    private ExpenseType expenseType;

    @Column(name = "expense_description", length = 1000)
    private String expenseDescription;

    @Column(name = "vendor_name", length = 255)
    private String vendorName;

    @Column(name = "category", length = 100)
    private String category;

    // Receipt and Documentation
    @Column(name = "receipt_file_path")
    private String receiptFilePath;

    @Column(name = "receipt_file_name")
    private String receiptFileName;

    @Column(name = "receipt_file_size")
    private Long receiptFileSize;

    @Column(name = "receipt_uploaded", columnDefinition = "boolean default false")
    private Boolean receiptUploaded = false;

    // Approval and Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ExpenseStatus status = ExpenseStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    // Financial Information
    @Column(name = "reimbursable", columnDefinition = "boolean default true")
    private Boolean reimbursable = true;

    @Column(name = "billable_to_client", columnDefinition = "boolean default false")
    private Boolean billableToClient = false;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "currency", length = 3, columnDefinition = "varchar(3) default 'USD'")
    private String currency = "USD";

    @Column(name = "exchange_rate", precision = 10, scale = 4)
    private BigDecimal exchangeRate;

    @Column(name = "converted_amount", precision = 10, scale = 2)
    private BigDecimal convertedAmount;

    // AI/ML Enhancement Fields
    @Column(name = "ocr_processed", columnDefinition = "boolean default false")
    private Boolean ocrProcessed = false;

    @Column(name = "auto_categorized", columnDefinition = "boolean default false")
    private Boolean autoCategorized = false;

    @Column(name = "fraud_risk_score", precision = 3, scale = 2)
    private BigDecimal fraudRiskScore;

    @Column(name = "anomaly_detected", columnDefinition = "boolean default false")
    private Boolean anomalyDetected = false;

    @Column(name = "anomaly_reason", length = 500)
    private String anomalyReason;

    @Column(name = "policy_compliance", columnDefinition = "boolean default true")
    private Boolean policyCompliance = true;

    @Column(name = "compliance_notes", length = 1000)
    private String complianceNotes;

    // Travel and Business Context
    @Column(name = "business_purpose", length = 1000)
    private String businessPurpose;

    @Column(name = "client_related", columnDefinition = "boolean default false")
    private Boolean clientRelated = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "attendees", length = 500)
    private String attendees;

    // Audit Information
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Set converted amount to expense amount if not specified
        if (convertedAmount == null) {
            convertedAmount = expenseAmount;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Enums
    public enum ExpenseType {
        TRAVEL,
        MEALS,
        ACCOMMODATION,
        TRANSPORTATION,
        FUEL,
        PARKING,
        OFFICE_SUPPLIES,
        EQUIPMENT,
        SOFTWARE,
        TRAINING,
        CONFERENCE,
        COMMUNICATION,
        ENTERTAINMENT,
        MARKETING,
        MISCELLANEOUS
    }

    public enum ExpenseStatus {
        PENDING,
        SUBMITTED,
        APPROVED,
        REJECTED,
        REIMBURSED,
        CANCELLED
    }
}