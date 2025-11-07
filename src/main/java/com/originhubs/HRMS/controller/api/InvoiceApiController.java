package com.originhubs.HRMS.controller.api;

import com.originhubs.HRMS.model.Invoice;
import com.originhubs.HRMS.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoice")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, allowCredentials = "true")
public class InvoiceApiController {

    private final InvoiceService invoiceService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getInvoices(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Invoice> invoicePage = invoiceService.getAllInvoices(pageable);
        
        // Get statistics
        InvoiceService.InvoiceStats stats = invoiceService.getInvoiceStatistics();
        
        Map<String, Object> response = new HashMap<>();
        response.put("invoices", invoicePage.getContent());
        response.put("totalElements", invoicePage.getTotalElements());
        response.put("totalPages", invoicePage.getTotalPages());
        response.put("currentPage", page);
        response.put("stats", Map.of(
            "pending", stats.pendingCount,
            "sent", stats.sentCount,
            "paid", stats.paidCount,
            "overdue", stats.overdueCount,
            "totalPaidAmount", stats.totalPaidAmount,
            "totalPendingAmount", stats.totalPendingAmount
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/mark-sent/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> markAsSent(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.markAsSent(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Invoice marked as sent",
                "invoice", invoice
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/mark-paid/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> markAsPaid(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.markAsPaid(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Invoice marked as paid",
                "invoice", invoice
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}