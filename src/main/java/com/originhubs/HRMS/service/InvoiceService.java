package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.*;
import com.originhubs.HRMS.repository.InvoiceRepository;
import com.originhubs.HRMS.repository.TimesheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {
    
    private final InvoiceRepository invoiceRepository;
    private final TimesheetRepository timesheetRepository;
    
    /**
     * Generate invoice from approved timesheets for a project within a date range
     */
    public Invoice generateInvoiceFromTimesheets(Project project, LocalDate startDate, LocalDate endDate, String generatedBy) {
        // Get all approved timesheets for the project within the date range
        List<Timesheet> approvedTimesheets = timesheetRepository.findApprovedTimesheetsForInvoicing(
            project, startDate, endDate, Timesheet.TimesheetStatus.APPROVED
        );
        
        if (approvedTimesheets.isEmpty()) {
            throw new IllegalArgumentException("No approved timesheets found for the specified period");
        }
        
        // Calculate totals
        BigDecimal totalHours = approvedTimesheets.stream()
            .map(ts -> ts.getTotalHoursLogged() != null ? ts.getTotalHoursLogged() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalOvertimeHours = approvedTimesheets.stream()
            .map(ts -> ts.getTotalOvertimeHours() != null ? ts.getTotalOvertimeHours() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalBillableAmount = approvedTimesheets.stream()
            .map(ts -> ts.getTotalBillableAmount() != null ? ts.getTotalBillableAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceId(generateInvoiceId());
        invoice.setProject(project);
        invoice.setClientName(project.getClientCompanyName());
        invoice.setVendorName(project.getVendorCompanyName());
        // Provide fallback email if project vendor email is null
        String vendorEmail = project.getVendorEmail() != null ? project.getVendorEmail() : "billing@originhubs.com";
        invoice.setVendorEmail(vendorEmail);
        invoice.setPeriodStart(startDate);
        invoice.setPeriodEnd(endDate);
        invoice.setTotalHours(totalHours);
        invoice.setTotalBillableHours(totalHours); // Assuming all hours are billable
        invoice.setTotalOvertimeHours(totalOvertimeHours);
        invoice.setGeneratedBy(generatedBy);
        invoice.setGeneratedAt(LocalDateTime.now());
        invoice.setStatus(Invoice.InvoiceStatus.PENDING);
        
        // Calculate regular and overtime amounts
        BigDecimal regularHours = totalHours.subtract(totalOvertimeHours);
        BigDecimal vendorPayRate = project.getVendorPayRate() != null ? project.getVendorPayRate() : BigDecimal.ZERO;
        BigDecimal overtimeRate = vendorPayRate.multiply(BigDecimal.valueOf(1.5)); // 1.5x for overtime
        
        BigDecimal regularAmount = regularHours.multiply(vendorPayRate);
        BigDecimal overtimeAmount = totalOvertimeHours.multiply(overtimeRate);
        
        invoice.setRegularAmount(regularAmount);
        invoice.setOvertimeAmount(overtimeAmount);
        // Set total amount as sum of regular and overtime amounts
        invoice.setTotalAmount(regularAmount.add(overtimeAmount));
        
        // Set description
        String description = String.format("Invoice for %s - %s to %s (%s)",
            project.getProjectName(),
            startDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
            endDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
            project.getEmployee().getFirstName() + " " + project.getEmployee().getLastName()
        );
        invoice.setDescription(description);
        
        // Save invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        // Update timesheets with invoice reference
        for (Timesheet timesheet : approvedTimesheets) {
            timesheet.setInvoice(savedInvoice);
            timesheet.setInvoiceId(savedInvoice.getInvoiceId());
            timesheet.setInvoiceDate(savedInvoice.getInvoiceDate());
            timesheet.setPaymentDueDate(savedInvoice.getPaymentDueDate());
            timesheetRepository.save(timesheet);
        }
        
        return savedInvoice;
    }
    
    /**
     * Mark invoice as sent (without email)
     */
    public Invoice markAsSent(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
            
        invoice.setStatus(Invoice.InvoiceStatus.SENT);
        invoice.setSentAt(LocalDateTime.now());
        invoice.setSentToEmail(invoice.getVendorEmail());
        
        return invoiceRepository.save(invoice);
    }
    
    /**
     * Mark invoice as paid
     */
    public Invoice markAsPaid(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
            
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        
        // Update related timesheets to PAID status
        List<Timesheet> timesheets = timesheetRepository.findByInvoice(invoice);
        for (Timesheet timesheet : timesheets) {
            timesheet.setPaymentStatus(Timesheet.PaymentStatus.PAID);
            timesheetRepository.save(timesheet);
        }
        
        return invoiceRepository.save(invoice);
    }
    
    /**
     * Get all invoices with pagination
     */
    public Page<Invoice> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable);
    }
    
    /**
     * Get invoices by status
     */
    public List<Invoice> getInvoicesByStatus(Invoice.InvoiceStatus status) {
        return invoiceRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    /**
     * Get invoices for a project
     */
    public List<Invoice> getInvoicesForProject(Project project) {
        return invoiceRepository.findByProjectOrderByCreatedAtDesc(project);
    }
    
    /**
     * Get invoice by ID
     */
    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }
    
    /**
     * Get overdue invoices
     */
    public List<Invoice> getOverdueInvoices() {
        List<Invoice> overdueInvoices = invoiceRepository.findOverdueInvoices(LocalDate.now());
        // Update status to OVERDUE
        for (Invoice invoice : overdueInvoices) {
            if (invoice.getStatus() == Invoice.InvoiceStatus.SENT) {
                invoice.setStatus(Invoice.InvoiceStatus.OVERDUE);
                invoiceRepository.save(invoice);
            }
        }
        return overdueInvoices;
    }
    
    /**
     * Get invoice statistics
     */
    public InvoiceStats getInvoiceStatistics() {
        long pendingCount = invoiceRepository.countByStatus(Invoice.InvoiceStatus.PENDING);
        long sentCount = invoiceRepository.countByStatus(Invoice.InvoiceStatus.SENT);
        long paidCount = invoiceRepository.countByStatus(Invoice.InvoiceStatus.PAID);
        long overdueCount = invoiceRepository.countByStatus(Invoice.InvoiceStatus.OVERDUE);
        
        Double totalPaidAmount = invoiceRepository.getTotalPaidAmountForPeriod(
            LocalDate.now().withDayOfMonth(1), LocalDate.now()
        );
        Double totalPendingAmount = invoiceRepository.getTotalPendingAmount();
        
        return new InvoiceStats(pendingCount, sentCount, paidCount, overdueCount, 
                               totalPaidAmount != null ? totalPaidAmount : 0.0,
                               totalPendingAmount != null ? totalPendingAmount : 0.0);
    }
    
    /**
     * Generate unique invoice ID
     */
    private String generateInvoiceId() {
        String prefix = "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
        long count = invoiceRepository.count() + 1;
        return prefix + String.format("%04d", count);
    }
    
    /**
     * Inner class for invoice statistics
     */
    public static class InvoiceStats {
        public final long pendingCount;
        public final long sentCount;
        public final long paidCount;
        public final long overdueCount;
        public final double totalPaidAmount;
        public final double totalPendingAmount;
        
        public InvoiceStats(long pendingCount, long sentCount, long paidCount, long overdueCount,
                           double totalPaidAmount, double totalPendingAmount) {
            this.pendingCount = pendingCount;
            this.sentCount = sentCount;
            this.paidCount = paidCount;
            this.overdueCount = overdueCount;
            this.totalPaidAmount = totalPaidAmount;
            this.totalPendingAmount = totalPendingAmount;
        }
    }
}