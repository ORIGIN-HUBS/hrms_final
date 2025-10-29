package com.originhubs.HRMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "timesheets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Timesheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Timesheet Header Information
    @Column(name = "timesheet_id", unique = true)
    private String timesheetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "week_end_date", nullable = false)
    private LocalDate weekEndDate;

    // Status and Workflow
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TimesheetStatus status = TimesheetStatus.DRAFT;

    @Column(name = "submitted_on")
    private LocalDateTime submittedOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    // Financial Information
    @Column(name = "employee_pay_rate", precision = 10, scale = 2)
    private BigDecimal employeePayRate;

    @Column(name = "vendor_bill_rate", precision = 10, scale = 2)
    private BigDecimal vendorBillRate;

    @Column(name = "total_hours_logged", precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal totalHoursLogged = BigDecimal.ZERO;

    @Column(name = "total_billable_hours", precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal totalBillableHours = BigDecimal.ZERO;

    @Column(name = "total_non_billable_hours", precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal totalNonBillableHours = BigDecimal.ZERO;

    @Column(name = "total_overtime_hours", precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal totalOvertimeHours = BigDecimal.ZERO;

    @Column(name = "total_billable_amount", precision = 12, scale = 2, columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal totalBillableAmount = BigDecimal.ZERO;

    @Column(name = "total_payable_amount", precision = 12, scale = 2, columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal totalPayableAmount = BigDecimal.ZERO;

    @Column(name = "total_expenses", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal totalExpenses = BigDecimal.ZERO;

    // Invoice and Payment Information
    @Column(name = "invoice_id")
    private String invoiceId;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "payment_due_date")
    private LocalDate paymentDueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_record_id")
    private Invoice invoice;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // AI/ML Enhancement Fields
    @Column(name = "auto_populated", columnDefinition = "boolean default false")
    private Boolean autoPopulated = false;

    @Column(name = "anomaly_detected", columnDefinition = "boolean default false")
    private Boolean anomalyDetected = false;

    @Column(name = "anomaly_reason", length = 500)
    private String anomalyReason;

    @Column(name = "ai_confidence_score", precision = 3, scale = 2)
    private BigDecimal aiConfidenceScore;

    // Audit Information
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    // Relationships
    @OneToMany(mappedBy = "timesheet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TimesheetEntry> timesheetEntries;

    @OneToMany(mappedBy = "timesheet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TimesheetExpense> expenses;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (timesheetId == null) {
            generateTimesheetId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private void generateTimesheetId() {
        // Generate timesheet ID: TS-YYYY-MM-DD-EMP001
        String empId = employee != null ? employee.getEmployeeId() : "UNKNOWN";
        String dateStr = weekStartDate != null ? weekStartDate.toString() : LocalDate.now().toString();
        this.timesheetId = "TS-" + dateStr + "-" + empId;
    }

    // Enums
    public enum TimesheetStatus {
        DRAFT,
        SUBMITTED,
        APPROVED,
        REJECTED,
        PAID,
        ARCHIVED
    }

    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        PAID,
        OVERDUE,
        CANCELLED
    }
}