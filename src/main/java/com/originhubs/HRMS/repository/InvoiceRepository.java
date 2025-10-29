package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.Invoice;
import com.originhubs.HRMS.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    Optional<Invoice> findByInvoiceId(String invoiceId);
    
    List<Invoice> findByProjectOrderByCreatedAtDesc(Project project);
    
    List<Invoice> findByVendorEmailOrderByCreatedAtDesc(String vendorEmail);
    
    List<Invoice> findByStatusOrderByCreatedAtDesc(Invoice.InvoiceStatus status);
    
    Page<Invoice> findByStatusOrderByCreatedAtDesc(Invoice.InvoiceStatus status, Pageable pageable);
    
    @Query("SELECT i FROM Invoice i WHERE i.paymentDueDate < :date AND i.status = 'PENDING'")
    List<Invoice> findOverdueInvoices(@Param("date") LocalDate date);
    
    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate ORDER BY i.invoiceDate DESC")
    List<Invoice> findByInvoiceDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = :status")
    long countByStatus(@Param("status") Invoice.InvoiceStatus status);
    
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID' AND i.invoiceDate BETWEEN :startDate AND :endDate")
    Double getTotalPaidAmountForPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PENDING' OR i.status = 'SENT'")
    Double getTotalPendingAmount();
    
    @Query("SELECT i FROM Invoice i WHERE i.generatedAt >= :date ORDER BY i.generatedAt DESC")
    List<Invoice> findGeneratedAfterDate(@Param("date") LocalDateTime date);
}