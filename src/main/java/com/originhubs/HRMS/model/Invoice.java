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
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String invoiceId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Employee vendor; // For vendor company details
    
    @Column(nullable = false)
    private String clientName;
    
    @Column(nullable = false)
    private String vendorName;
    
    @Column(nullable = false)
    private String vendorEmail = "billing@originhubs.com"; // Default vendor email
    
    @Column(nullable = false)
    private LocalDate invoiceDate;
    
    @Column(nullable = false)
    private LocalDate paymentDueDate;
    
    @Column(nullable = false)
    private LocalDate periodStart;
    
    @Column(nullable = false)
    private LocalDate periodEnd;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalHours;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalBillableHours;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalOvertimeHours;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal overtimeAmount;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal regularAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.PENDING;
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 500)
    private String notes;
    
    // Invoice tracking
    @Column(name = "generated_by")
    private String generatedBy;
    
    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "sent_to_email")
    private String sentToEmail;
    
    // Audit fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationship to timesheets included in this invoice
    @OneToMany(mappedBy = "invoice", fetch = FetchType.LAZY)
    private List<Timesheet> timesheets;
    
    public enum InvoiceStatus {
        PENDING,
        SENT,
        PAID,
        OVERDUE,
        CANCELLED
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (invoiceDate == null) {
            invoiceDate = LocalDate.now();
        }
        if (paymentDueDate == null) {
            paymentDueDate = invoiceDate.plusDays(30); // Default 30 days payment terms
        }
        if (status == null) {
            status = InvoiceStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public String getFormattedInvoiceId() {
        return "INV-" + String.format("%06d", id);
    }
}