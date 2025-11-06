package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Timesheet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {

    // Basic timesheet queries
    Optional<Timesheet> findByEmployeeAndWeekStartDateAndWeekEndDate(
        Employee employee, LocalDate weekStart, LocalDate weekEnd);

    List<Timesheet> findByEmployeeOrderByWeekStartDateDesc(Employee employee);
    
    List<Timesheet> findByEmployee_Id(Long employeeId);

    List<Timesheet> findByEmployeeAndWeekStartDateAfterOrderByWeekStartDateDesc(
        Employee employee, LocalDate afterDate);

    // Date range queries
    List<Timesheet> findByWeekStartDateBetween(LocalDate startDate, LocalDate endDate);

    // Manager approval queries
    List<Timesheet> findByManagerAndStatus(Employee manager, Timesheet.TimesheetStatus status);

    Page<Timesheet> findByManagerAndStatus(Employee manager, Timesheet.TimesheetStatus status, Pageable pageable);

    Page<Timesheet> findByManager(Employee manager, Pageable pageable);

    @Query("SELECT t FROM Timesheet t WHERE t.manager = :manager AND t.status = :status " +
           "AND (t.employee.firstName LIKE %:employeeName% OR t.employee.lastName LIKE %:employeeName%)")
    Page<Timesheet> findByManagerAndStatusAndEmployeeNameContaining(
        @Param("manager") Employee manager, 
        @Param("status") Timesheet.TimesheetStatus status,
        @Param("employeeName") String employeeName, 
        Pageable pageable);

    @Query("SELECT t FROM Timesheet t WHERE t.manager = :manager " +
           "AND (t.employee.firstName LIKE %:employeeName% OR t.employee.lastName LIKE %:employeeName%)")
    Page<Timesheet> findByManagerAndEmployeeNameContaining(
        @Param("manager") Employee manager, 
        @Param("employeeName") String employeeName, 
        Pageable pageable);

    // Statistics queries
    long countByEmployeeAndStatusAndWeekStartDateBetween(
        Employee employee, Timesheet.TimesheetStatus status, LocalDate startDate, LocalDate endDate);

    long countByManagerAndStatus(Employee manager, Timesheet.TimesheetStatus status);

    long countByApprovedByAndApprovalDateBetween(
        Employee approvedBy, LocalDateTime startDate, LocalDateTime endDate);

    long countByApprovedByAndStatusAndApprovalDateBetween(
        Employee approvedBy, Timesheet.TimesheetStatus status, LocalDateTime startDate, LocalDateTime endDate);

    // Aggregation queries
    @Query("SELECT SUM(t.totalHoursLogged) FROM Timesheet t WHERE t.employee = :employee " +
           "AND t.weekStartDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalHoursByEmployeeAndDateRange(
        @Param("employee") Employee employee, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);

    // Project-based queries
    @Query("SELECT t FROM Timesheet t JOIN t.timesheetEntries te WHERE te.project.id = :projectId " +
           "AND t.weekStartDate BETWEEN :startDate AND :endDate")
    List<Timesheet> findByProjectAndDateRange(
        @Param("projectId") Long projectId, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);

    // Status-based queries
    List<Timesheet> findByStatusAndWeekStartDateBetween(
        Timesheet.TimesheetStatus status, LocalDate startDate, LocalDate endDate);

    @Query("SELECT t FROM Timesheet t WHERE t.status = 'SUBMITTED' " +
           "AND t.submittedOn < :cutoffDateTime ORDER BY t.submittedOn ASC")
    List<Timesheet> findOverdueSubmissions(@Param("cutoffDateTime") LocalDateTime cutoffDateTime);

    // AI/ML related queries
    List<Timesheet> findByAnomalyDetectedTrue();

    // Financial queries
    @Query("SELECT SUM(t.totalBillableAmount) FROM Timesheet t WHERE t.employee = :employee " +
           "AND t.weekStartDate BETWEEN :startDate AND :endDate AND t.status = 'APPROVED'")
    BigDecimal sumApprovedBillableAmountByEmployeeAndDateRange(
        @Param("employee") Employee employee, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(t.totalExpenses) FROM Timesheet t WHERE t.employee = :employee " +
           "AND t.weekStartDate BETWEEN :startDate AND :endDate AND t.status = 'APPROVED'")
    BigDecimal sumApprovedExpensesByEmployeeAndDateRange(
        @Param("employee") Employee employee, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);

    // Reporting queries
    @Query("SELECT t FROM Timesheet t WHERE " +
           "(:employeeId IS NULL OR t.employee.id = :employeeId) " +
           "AND (:managerId IS NULL OR t.manager.id = :managerId) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND t.weekStartDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.weekStartDate DESC")
    Page<Timesheet> findTimesheetsForReport(
        @Param("employeeId") Long employeeId,
        @Param("managerId") Long managerId,
        @Param("status") Timesheet.TimesheetStatus status,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable);

    // Performance queries
    @Query("SELECT AVG(t.totalHoursLogged) FROM Timesheet t WHERE t.employee = :employee " +
           "AND t.status = 'APPROVED' AND t.weekStartDate BETWEEN :startDate AND :endDate")
    BigDecimal getAverageWeeklyHours(
        @Param("employee") Employee employee, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);

    // Compliance queries
    @Query("SELECT t FROM Timesheet t WHERE t.totalHoursLogged > :maxHours " +
           "AND t.weekStartDate BETWEEN :startDate AND :endDate")
    List<Timesheet> findOvertimeViolations(
        @Param("maxHours") BigDecimal maxHours,
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);

    // Recent activity
    @Query("SELECT t FROM Timesheet t WHERE t.updatedAt > :since ORDER BY t.updatedAt DESC")
    List<Timesheet> findRecentlyUpdated(@Param("since") LocalDateTime since);

    // Custom business logic queries
    @Query("SELECT t FROM Timesheet t WHERE t.employee.manager.id = :managerId " +
           "AND t.status IN ('SUBMITTED', 'APPROVED') " +
           "AND t.weekStartDate = :weekStart")
    List<Timesheet> findTeamTimesheetsForWeek(
        @Param("managerId") Long managerId, 
        @Param("weekStart") LocalDate weekStart);

    // Additional methods for HR approval workflow
    List<Timesheet> findByStatusOrderBySubmittedOnAsc(Timesheet.TimesheetStatus status);
    
    @Query("SELECT t FROM Timesheet t WHERE t.status IN :statuses ORDER BY t.updatedAt DESC")
    List<Timesheet> findTop10ByStatusInOrderByUpdatedAtDesc(@Param("statuses") List<Timesheet.TimesheetStatus> statuses, Pageable pageable);
    
    // Count methods for dashboard stats - using @Query since we need to count by different statuses
    @Query("SELECT COUNT(t) FROM Timesheet t WHERE t.status = 'APPROVED' AND t.approvalDate > :date")
    long countApprovedAfterDate(@Param("date") LocalDateTime date);
    
    @Query("SELECT COUNT(t) FROM Timesheet t WHERE t.status = 'REJECTED' AND t.approvalDate > :date")
    long countRejectedAfterDate(@Param("date") LocalDateTime date);
    
    // Invoice-related queries
    @Query("SELECT t FROM Timesheet t WHERE t.project = :project AND t.status = :status " +
           "AND t.weekStartDate >= :startDate AND t.weekEndDate <= :endDate " +
           "AND t.invoice IS NULL ORDER BY t.weekStartDate")
    List<Timesheet> findApprovedTimesheetsForInvoicing(
        @Param("project") com.originhubs.HRMS.model.Project project,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("status") Timesheet.TimesheetStatus status);
    
    List<Timesheet> findByInvoice(com.originhubs.HRMS.model.Invoice invoice);
    
    // Method to find timesheet with basic relationships loaded (avoiding multiple bags)
    @Query("SELECT t FROM Timesheet t " +
           "LEFT JOIN FETCH t.employee " +
           "LEFT JOIN FETCH t.manager " +
           "LEFT JOIN FETCH t.approvedBy " +
           "LEFT JOIN FETCH t.timesheetEntries te " +
           "LEFT JOIN FETCH te.project " +
           "WHERE t.id = :id")
    Optional<Timesheet> findByIdWithRelations(@Param("id") Long id);
    
    // Separate query for expenses to avoid multiple bag fetch
    @Query("SELECT t FROM Timesheet t " +
           "LEFT JOIN FETCH t.expenses e " +
           "LEFT JOIN FETCH e.project " +
           "WHERE t.id = :id")
    Optional<Timesheet> findByIdWithExpenses(@Param("id") Long id);
}