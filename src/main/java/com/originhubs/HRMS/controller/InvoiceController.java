package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.*;
import com.originhubs.HRMS.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/invoice")
@RequiredArgsConstructor
public class InvoiceController {
    
    private final InvoiceService invoiceService;
    private final ProjectService projectService;
    
    /**
     * HR Invoice Dashboard
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String invoiceDashboard(Model model) {
        // Get invoice statistics
        InvoiceService.InvoiceStats stats = invoiceService.getInvoiceStatistics();
        
        // Get recent invoices
        List<Invoice> pendingInvoices = invoiceService.getInvoicesByStatus(Invoice.InvoiceStatus.PENDING);
        List<Invoice> sentInvoices = invoiceService.getInvoicesByStatus(Invoice.InvoiceStatus.SENT);
        List<Invoice> overdueInvoices = invoiceService.getOverdueInvoices();
        
        model.addAttribute("stats", stats);
        model.addAttribute("pendingInvoices", pendingInvoices);
        model.addAttribute("sentInvoices", sentInvoices);
        model.addAttribute("overdueInvoices", overdueInvoices);
        
        return "invoice/dashboard";
    }
    
    /**
     * List all invoices with filtering
     */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String listInvoices(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            Model model) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Invoice> invoices = invoiceService.getAllInvoices(pageable);
        
        model.addAttribute("invoices", invoices);
        model.addAttribute("currentStatus", status);
        
        return "invoice/list";
    }
    
    /**
     * Generate invoice form
     */
    @GetMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String showGenerateInvoiceForm(Model model) {
        // Get all active projects for dropdown
        List<Project> projects = projectService.getAllProjects();
        model.addAttribute("projects", projects);
        
        return "invoice/generate";
    }
    
    /**
     * Generate invoice from timesheets
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String generateInvoice(
            @RequestParam Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication auth,
            RedirectAttributes redirectAttributes) {
        
        try {
            Optional<Project> projectOpt = projectService.getProjectById(projectId);
            if (projectOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Project not found");
                return "redirect:/invoice/generate";
            }
            
            Project project = projectOpt.get();
            String generatedBy = auth.getName();
            
            Invoice invoice = invoiceService.generateInvoiceFromTimesheets(project, startDate, endDate, generatedBy);
            
            redirectAttributes.addFlashAttribute("success", 
                "Invoice " + invoice.getInvoiceId() + " generated successfully for $" + invoice.getTotalAmount());
            
            return "redirect:/invoice/view/" + invoice.getId();
            
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/invoice/generate";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error generating invoice: " + e.getMessage());
            return "redirect:/invoice/generate";
        }
    }
    
    /**
     * View invoice details
     */
    @GetMapping("/view/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String viewInvoice(@PathVariable Long id, Model model) {
        Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(id);
        if (invoiceOpt.isEmpty()) {
            model.addAttribute("error", "Invoice not found");
            return "error/404";
        }
        
        Invoice invoice = invoiceOpt.get();
        model.addAttribute("invoice", invoice);
        
        return "invoice/view";
    }
    
    /**
     * Mark invoice as sent
     */
    @PostMapping("/mark-sent/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String markInvoiceAsSent(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Invoice invoice = invoiceService.markAsSent(id);
            redirectAttributes.addFlashAttribute("success", 
                "Invoice " + invoice.getInvoiceId() + " marked as sent to " + invoice.getVendorEmail());
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error marking invoice as sent: " + e.getMessage());
        }
        
        return "redirect:/invoice/view/" + id;
    }
    
    /**
     * Mark invoice as paid
     */
    @PostMapping("/mark-paid/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String markInvoiceAsPaid(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Invoice invoice = invoiceService.markAsPaid(id);
            redirectAttributes.addFlashAttribute("success", 
                "Invoice " + invoice.getInvoiceId() + " marked as paid");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error marking invoice as paid: " + e.getMessage());
        }
        
        return "redirect:/invoice/view/" + id;
    }
    
    /**
     * Get projects for AJAX dropdown
     */
    @GetMapping("/api/projects")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @ResponseBody
    public List<Project> getProjectsForDropdown() {
        return projectService.getAllProjects();
    }
}