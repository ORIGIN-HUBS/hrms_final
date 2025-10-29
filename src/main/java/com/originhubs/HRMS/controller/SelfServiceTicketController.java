package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.SelfServiceTicket;
import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.service.SelfServiceTicketService;
import com.originhubs.HRMS.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/self-service")
public class SelfServiceTicketController {
    
    @Autowired
    private SelfServiceTicketService ticketService;
    
    @Autowired
    private EmployeeService employeeService;
    
    // Debug Authentication - Temporary endpoint
    @GetMapping("/debug")
    public String debugAuth(Model model, Authentication authentication) {
        if (authentication != null) {
            model.addAttribute("username", authentication.getName());
            model.addAttribute("authorities", authentication.getAuthorities());
            model.addAttribute("authenticated", authentication.isAuthenticated());
        } else {
            model.addAttribute("message", "No authentication found");
        }
        return "self-service/debug"; // We'll create this simple template
    }
    
    // Employee Self Service Portal - Dashboard
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String selfServiceDashboard(Model model, Authentication authentication, 
                                       @RequestParam(defaultValue = "0") int page) {
        String username = authentication.getName();
        Optional<Employee> employeeOpt = employeeService.findByUsername(username);
        
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            
            // Get employee's tickets
            Pageable pageable = PageRequest.of(page, 10);
            Page<SelfServiceTicket> tickets = ticketService.getTicketsForEmployee(employee.getId(), pageable);
            
            model.addAttribute("employee", employee);
            model.addAttribute("tickets", tickets);
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", tickets.getTotalPages());
            
            return "self-service/dashboard";
        }
        
        return "redirect:/login";
    }
    
    // Create New Ticket - Form
    @GetMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String showCreateTicketForm(Model model, Authentication authentication) {
        String username = authentication.getName();
        Optional<Employee> employeeOpt = employeeService.findByUsername(username);
        
        if (employeeOpt.isPresent()) {
            model.addAttribute("employee", employeeOpt.get());
            model.addAttribute("ticket", new SelfServiceTicket());
            model.addAttribute("categories", SelfServiceTicket.TicketCategory.values());
            model.addAttribute("priorities", SelfServiceTicket.TicketPriority.values());
            
            return "self-service/create-ticket";
        }
        
        return "redirect:/login";
    }
    
    // Create New Ticket - Submit
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String createTicket(@ModelAttribute SelfServiceTicket ticket, 
                               Authentication authentication, 
                               RedirectAttributes redirectAttributes) {
        String username = authentication.getName();
        Optional<Employee> employeeOpt = employeeService.findByUsername(username);
        
        if (employeeOpt.isPresent()) {
            ticket.setEmployee(employeeOpt.get());
            SelfServiceTicket savedTicket = ticketService.createTicket(ticket);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Ticket created successfully! Ticket Number: " + savedTicket.getTicketNumber());
            
            return "redirect:/self-service";
        }
        
        return "redirect:/login";
    }
    
    // View Ticket Details - For employees (original URL pattern)
    @GetMapping("/ticket/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String viewTicketEmployee(@PathVariable Long id, Model model, Authentication authentication) {
        return viewTicketCommon(id, model, authentication);
    }

    // View Ticket Details - For admin dashboard (new URL pattern)
    @GetMapping("/view-ticket/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String viewTicketAdmin(@PathVariable Long id, Model model, Authentication authentication) {
        return viewTicketCommon(id, model, authentication);
    }

    // Common method for viewing tickets
    private String viewTicketCommon(Long id, Model model, Authentication authentication) {
        try {
            System.out.println("=== VIEW TICKET ===");
            System.out.println("Ticket ID: " + id);
            System.out.println("User: " + authentication.getName());
            System.out.println("Authorities: " + authentication.getAuthorities());
            
            // Get the ticket
            Optional<SelfServiceTicket> ticketOpt = ticketService.getTicketById(id);
            if (!ticketOpt.isPresent()) {
                System.out.println("Ticket not found!");
                return "redirect:/self-service?error=ticketNotFound";
            }
            
            SelfServiceTicket ticket = ticketOpt.get();
            model.addAttribute("ticket", ticket);
            
            // Check if user is admin/HR for back button logic
            boolean isAdminOrHR = authentication.getAuthorities().stream()
                                 .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") || 
                                                 auth.getAuthority().equals("ROLE_HR"));
            model.addAttribute("isAdminOrHR", isAdminOrHR);
            
            System.out.println("Ticket found: " + ticket.getTicketNumber());
            System.out.println("User is Admin/HR: " + isAdminOrHR);
            System.out.println("Returning simple view-ticket template");
            
            return "self-service/view-ticket-simple";
            
        } catch (Exception e) {
            System.out.println("Error in viewTicket: " + e.getMessage());
            e.printStackTrace();
            return "redirect:/self-service?error=viewError";
        }
    }
    
    // Admin/HR - View All Tickets
    @GetMapping("/admin/tickets")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String adminTicketsDashboard(Model model, 
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(required = false) String status,
                                        @RequestParam(required = false) String category,
                                        @RequestParam(required = false) String priority) {
        
        Pageable pageable = PageRequest.of(page, 20);
        Page<SelfServiceTicket> tickets;
        
        // Filter logic
        SelfServiceTicket.TicketStatus ticketStatus = null;
        SelfServiceTicket.TicketCategory ticketCategory = null;
        SelfServiceTicket.TicketPriority ticketPriority = null;
        
        try {
            if (status != null && !status.isEmpty()) {
                ticketStatus = SelfServiceTicket.TicketStatus.valueOf(status);
            }
            if (category != null && !category.isEmpty()) {
                ticketCategory = SelfServiceTicket.TicketCategory.valueOf(category);
            }
            if (priority != null && !priority.isEmpty()) {
                ticketPriority = SelfServiceTicket.TicketPriority.valueOf(priority);
            }
        } catch (IllegalArgumentException e) {
            // Invalid filter values, ignore
        }
        
        tickets = ticketService.searchTickets(ticketCategory, ticketStatus, ticketPriority, null, pageable);
        
        model.addAttribute("tickets", tickets);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", tickets.getTotalPages());
        model.addAttribute("selectedStatus", status);
        model.addAttribute("selectedCategory", category);
        model.addAttribute("selectedPriority", priority);
        
        // Add enum values for filters
        model.addAttribute("statuses", SelfServiceTicket.TicketStatus.values());
        model.addAttribute("categories", SelfServiceTicket.TicketCategory.values());
        model.addAttribute("priorities", SelfServiceTicket.TicketPriority.values());
        
        // Add statistics
        model.addAttribute("openTicketsCount", ticketService.getOpenTicketsCount());
        
        return "self-service/admin-dashboard";
    }
    
    // Admin/HR - Assign Ticket
    @PostMapping("/admin/assign/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String assignTicket(@PathVariable Long ticketId, 
                               @RequestParam Long assignedToId,
                               RedirectAttributes redirectAttributes) {
        try {
            SelfServiceTicket ticket = ticketService.assignTicket(ticketId, assignedToId);
            redirectAttributes.addFlashAttribute("successMessage", 
                "Ticket " + ticket.getTicketNumber() + " assigned successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", 
                "Error assigning ticket: " + e.getMessage());
        }
        
        return "redirect:/self-service/admin/tickets";
    }
    
    // Admin/HR - Update Ticket Status
    @PostMapping("/admin/update-status/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String updateTicketStatus(@PathVariable Long ticketId,
                                     @RequestParam String status,
                                     @RequestParam(required = false) String resolution,
                                     RedirectAttributes redirectAttributes) {
        try {
            SelfServiceTicket.TicketStatus ticketStatus = SelfServiceTicket.TicketStatus.valueOf(status);
            SelfServiceTicket ticket = ticketService.updateTicketStatus(ticketId, ticketStatus, resolution);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Ticket " + ticket.getTicketNumber() + " status updated to " + ticketStatus.getDisplayName());
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", 
                "Error updating ticket status: " + e.getMessage());
        }
        
        return "redirect:/self-service/admin/tickets";
    }
    
    // Admin/HR - Add Notes
    @PostMapping("/admin/add-notes/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String addAdminNotes(@PathVariable Long ticketId,
                                @RequestParam String notes,
                                RedirectAttributes redirectAttributes) {
        try {
            SelfServiceTicket ticket = ticketService.addAdminNotes(ticketId, notes);
            redirectAttributes.addFlashAttribute("successMessage", 
                "Notes added to ticket " + ticket.getTicketNumber());
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", 
                "Error adding notes: " + e.getMessage());
        }
        
        return "redirect:/self-service/admin/tickets";
    }
}