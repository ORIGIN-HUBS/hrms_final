package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.SelfServiceTicket;
import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.repository.SelfServiceTicketRepository;
import com.originhubs.HRMS.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SelfServiceTicketService {
    
    @Autowired
    private SelfServiceTicketRepository ticketRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    // Generate unique ticket number
    private String generateTicketNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "TKT-" + timestamp;
    }
    
    // Create new ticket
    public SelfServiceTicket createTicket(SelfServiceTicket ticket) {
        // Generate unique ticket number
        String ticketNumber;
        do {
            ticketNumber = generateTicketNumber();
            // Add small delay to ensure uniqueness if called rapidly
            try {
                Thread.sleep(1);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        } while (ticketRepository.findByTicketNumber(ticketNumber).isPresent());
        
        ticket.setTicketNumber(ticketNumber);
        ticket.setStatus(SelfServiceTicket.TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        
        return ticketRepository.save(ticket);
    }
    
    // Get ticket by ID
    public Optional<SelfServiceTicket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }
    
    // Get ticket by number
    public Optional<SelfServiceTicket> getTicketByNumber(String ticketNumber) {
        return ticketRepository.findByTicketNumber(ticketNumber);
    }
    
    // Get tickets for employee
    public Page<SelfServiceTicket> getTicketsForEmployee(Long employeeId, Pageable pageable) {
        return ticketRepository.findByEmployeeId(employeeId, pageable);
    }
    
    // Get all tickets (for admin/HR)
    public Page<SelfServiceTicket> getAllTickets(Pageable pageable) {
        return ticketRepository.findRecentTickets(pageable);
    }
    
    // Get tickets by status
    public Page<SelfServiceTicket> getTicketsByStatus(SelfServiceTicket.TicketStatus status, Pageable pageable) {
        return ticketRepository.findByStatus(status, pageable);
    }
    
    // Get tickets by category
    public Page<SelfServiceTicket> getTicketsByCategory(SelfServiceTicket.TicketCategory category, Pageable pageable) {
        return ticketRepository.findByCategory(category, pageable);
    }
    
    // Get unassigned tickets
    public Page<SelfServiceTicket> getUnassignedTickets(Pageable pageable) {
        return ticketRepository.findUnassignedTickets(pageable);
    }
    
    // Assign ticket to employee
    public SelfServiceTicket assignTicket(Long ticketId, Long assignedToId) {
        Optional<SelfServiceTicket> ticketOpt = ticketRepository.findById(ticketId);
        Optional<Employee> employeeOpt = employeeRepository.findById(assignedToId);
        
        if (ticketOpt.isPresent() && employeeOpt.isPresent()) {
            SelfServiceTicket ticket = ticketOpt.get();
            ticket.setAssignedTo(employeeOpt.get());
            ticket.setStatus(SelfServiceTicket.TicketStatus.IN_PROGRESS);
            ticket.setUpdatedAt(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }
        
        throw new RuntimeException("Ticket or Employee not found");
    }
    
    // Update ticket status
    public SelfServiceTicket updateTicketStatus(Long ticketId, SelfServiceTicket.TicketStatus status, String resolution) {
        Optional<SelfServiceTicket> ticketOpt = ticketRepository.findById(ticketId);
        
        if (ticketOpt.isPresent()) {
            SelfServiceTicket ticket = ticketOpt.get();
            ticket.setStatus(status);
            ticket.setUpdatedAt(LocalDateTime.now());
            
            if (status == SelfServiceTicket.TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
                if (resolution != null && !resolution.trim().isEmpty()) {
                    ticket.setResolution(resolution);
                }
            }
            
            return ticketRepository.save(ticket);
        }
        
        throw new RuntimeException("Ticket not found");
    }
    
    // Add admin notes
    public SelfServiceTicket addAdminNotes(Long ticketId, String notes) {
        Optional<SelfServiceTicket> ticketOpt = ticketRepository.findById(ticketId);
        
        if (ticketOpt.isPresent()) {
            SelfServiceTicket ticket = ticketOpt.get();
            ticket.setAdminNotes(notes);
            ticket.setUpdatedAt(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }
        
        throw new RuntimeException("Ticket not found");
    }
    
    // Get ticket statistics
    public List<Object[]> getTicketStatsByStatus() {
        return ticketRepository.countTicketsByStatus();
    }
    
    public List<Object[]> getTicketStatsByCategory() {
        return ticketRepository.countTicketsByCategory();
    }
    
    // Get open tickets count
    public Long getOpenTicketsCount() {
        return ticketRepository.countOpenTickets();
    }
    
    // Search tickets with filters
    public Page<SelfServiceTicket> searchTickets(SelfServiceTicket.TicketCategory category,
                                                  SelfServiceTicket.TicketStatus status,
                                                  SelfServiceTicket.TicketPriority priority,
                                                  Long employeeId,
                                                  Pageable pageable) {
        return ticketRepository.findByFilters(category, status, priority, employeeId, pageable);
    }
}