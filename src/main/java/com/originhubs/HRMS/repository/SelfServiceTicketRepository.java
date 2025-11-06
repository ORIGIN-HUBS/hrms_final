package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.SelfServiceTicket;
import com.originhubs.HRMS.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SelfServiceTicketRepository extends JpaRepository<SelfServiceTicket, Long> {
    
    // Find by ticket number
    Optional<SelfServiceTicket> findByTicketNumber(String ticketNumber);
    
    // Find tickets by employee (for employee dashboard)
    @Query("SELECT t FROM SelfServiceTicket t WHERE t.employee.id = :employeeId ORDER BY t.createdAt DESC")
    Page<SelfServiceTicket> findByEmployeeId(@Param("employeeId") Long employeeId, Pageable pageable);
    
    // Find tickets by status
    @Query("SELECT t FROM SelfServiceTicket t WHERE t.status = :status ORDER BY t.createdAt DESC")
    Page<SelfServiceTicket> findByStatus(@Param("status") SelfServiceTicket.TicketStatus status, Pageable pageable);
    
    // Find tickets by category  
    @Query("SELECT t FROM SelfServiceTicket t WHERE t.category = :category ORDER BY t.createdAt DESC")
    Page<SelfServiceTicket> findByCategory(@Param("category") SelfServiceTicket.TicketCategory category, Pageable pageable);
    
    // Find tickets by priority
    @Query("SELECT t FROM SelfServiceTicket t WHERE t.priority = :priority ORDER BY t.createdAt DESC")
    Page<SelfServiceTicket> findByPriority(@Param("priority") SelfServiceTicket.TicketPriority priority, Pageable pageable);
    
    // Find tickets assigned to specific employee (HR/Admin view)
    @Query("SELECT t FROM SelfServiceTicket t WHERE t.assignedTo.id = :assignedToId ORDER BY t.createdAt DESC")
    Page<SelfServiceTicket> findByAssignedToId(@Param("assignedToId") Long assignedToId, Pageable pageable);
    
    // Find unassigned tickets
    @Query("SELECT t FROM SelfServiceTicket t WHERE t.assignedTo IS NULL ORDER BY t.priority DESC, t.createdAt ASC")
    Page<SelfServiceTicket> findUnassignedTickets(Pageable pageable);
    
    // Find open tickets (for dashboard counts)
    @Query("SELECT COUNT(t) FROM SelfServiceTicket t WHERE t.status = 'OPEN'")
    Long countOpenTickets();
    
    // Find tickets created in date range
    @Query("SELECT t FROM SelfServiceTicket t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    Page<SelfServiceTicket> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate, 
                                                   Pageable pageable);
    
    // Find tickets by multiple filters
    @Query("SELECT t FROM SelfServiceTicket t WHERE " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:employeeId IS NULL OR t.employee.id = :employeeId) " +
           "ORDER BY t.createdAt DESC")
    Page<SelfServiceTicket> findByFilters(@Param("category") SelfServiceTicket.TicketCategory category,
                                          @Param("status") SelfServiceTicket.TicketStatus status,
                                          @Param("priority") SelfServiceTicket.TicketPriority priority,
                                          @Param("employeeId") Long employeeId,
                                          Pageable pageable);
    
    // Find recent tickets for dashboard
    @Query("SELECT t FROM SelfServiceTicket t ORDER BY t.createdAt DESC")
    Page<SelfServiceTicket> findRecentTickets(Pageable pageable);
    
    // Count tickets by status for dashboard
    @Query("SELECT t.status, COUNT(t) FROM SelfServiceTicket t GROUP BY t.status")
    List<Object[]> countTicketsByStatus();
    
    // Count tickets by category for reports
    @Query("SELECT t.category, COUNT(t) FROM SelfServiceTicket t GROUP BY t.category")
    List<Object[]> countTicketsByCategory();
}