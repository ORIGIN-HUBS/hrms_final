package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Project;
import com.originhubs.HRMS.model.Timesheet;
import com.originhubs.HRMS.model.TimesheetEntry;
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
public interface TimesheetEntryRepository extends JpaRepository<TimesheetEntry, Long> {

    // Basic entry queries
    List<TimesheetEntry> findByTimesheet(Timesheet timesheet);
    
    List<TimesheetEntry> findByTimesheetOrderByEntryDateAsc(Timesheet timesheet);
    
    Optional<TimesheetEntry> findByTimesheetAndEntryDate(Timesheet timesheet, LocalDate entryDate);
    
    void deleteByTimesheet(Timesheet timesheet);

    // Project-based queries
    List<TimesheetEntry> findByProject(Project project);
    
    @Query("SELECT te FROM TimesheetEntry te WHERE te.project = :project " +
           "AND te.entryDate BETWEEN :startDate AND :endDate")
    List<TimesheetEntry> findByProjectAndDateRange(
        @Param("project") Project project,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Employee queries
    @Query("SELECT te FROM TimesheetEntry te WHERE te.timesheet.employee = :employee " +
           "AND te.entryDate BETWEEN :startDate AND :endDate")
    List<TimesheetEntry> findByEmployeeAndDateRange(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Hours aggregation queries
    @Query("SELECT SUM(te.hoursWorked) FROM TimesheetEntry te WHERE te.timesheet = :timesheet")
    BigDecimal sumHoursByTimesheet(@Param("timesheet") Timesheet timesheet);

    @Query("SELECT SUM(te.billableHours) FROM TimesheetEntry te WHERE te.timesheet = :timesheet")
    BigDecimal sumBillableHoursByTimesheet(@Param("timesheet") Timesheet timesheet);

    @Query("SELECT SUM(te.overtimeHours) FROM TimesheetEntry te WHERE te.timesheet = :timesheet")
    BigDecimal sumOvertimeHoursByTimesheet(@Param("timesheet") Timesheet timesheet);

    // Project hours summaries
    @Query("SELECT SUM(te.hoursWorked) FROM TimesheetEntry te WHERE te.project = :project " +
           "AND te.entryDate BETWEEN :startDate AND :endDate")
    BigDecimal sumHoursByProjectAndDateRange(
        @Param("project") Project project,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(te.billableHours) FROM TimesheetEntry te WHERE te.project = :project " +
           "AND te.entryDate BETWEEN :startDate AND :endDate")
    BigDecimal sumBillableHoursByProjectAndDateRange(
        @Param("project") Project project,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Work type analysis
    @Query("SELECT te.workType, SUM(te.hoursWorked) FROM TimesheetEntry te " +
           "WHERE te.timesheet.employee = :employee " +
           "AND te.entryDate BETWEEN :startDate AND :endDate " +
           "GROUP BY te.workType")
    List<Object[]> getWorkTypeDistribution(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Location analysis
    @Query("SELECT te.workLocation, COUNT(te) FROM TimesheetEntry te " +
           "WHERE te.timesheet.employee = :employee " +
           "AND te.entryDate BETWEEN :startDate AND :endDate " +
           "GROUP BY te.workLocation")
    List<Object[]> getWorkLocationDistribution(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // AI/ML related queries
    List<TimesheetEntry> findByAnomalyFlaggedTrue();

    @Query("SELECT te FROM TimesheetEntry te WHERE te.productivityScore < :threshold")
    List<TimesheetEntry> findLowProductivityEntries(@Param("threshold") BigDecimal threshold);

    // Daily pattern analysis
    @Query(value = "SELECT EXTRACT(DOW FROM te.entry_date) as dayOfWeek, AVG(te.hours_worked) " +
           "FROM timesheet_entries te " +
           "JOIN timesheets t ON te.timesheet_id = t.id " +
           "WHERE t.employee_id = :#{#employee.id} " +
           "AND te.entry_date BETWEEN :startDate AND :endDate " +
           "GROUP BY EXTRACT(DOW FROM te.entry_date) " +
           "ORDER BY dayOfWeek", nativeQuery = true)
    List<Object[]> getDailyAverageHours(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Performance metrics
    @Query("SELECT AVG(te.productivityScore) FROM TimesheetEntry te " +
           "WHERE te.timesheet.employee = :employee " +
           "AND te.entryDate BETWEEN :startDate AND :endDate")
    BigDecimal getAverageProductivityScore(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Task complexity analysis
    @Query("SELECT te.taskDescription, te.hoursWorked, te.productivityScore " +
           "FROM TimesheetEntry te WHERE te.timesheet.employee = :employee " +
           "AND te.entryDate BETWEEN :startDate AND :endDate " +
           "ORDER BY te.productivityScore DESC")
    List<Object[]> getTaskProductivityAnalysis(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Billing analysis
    @Query("SELECT te.project, SUM(te.billableHours), SUM(te.nonBillableHours) " +
           "FROM TimesheetEntry te WHERE te.timesheet.employee = :employee " +
           "AND te.entryDate BETWEEN :startDate AND :endDate " +
           "GROUP BY te.project")
    List<Object[]> getBillingAnalysisByProject(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Overtime analysis
    @Query("SELECT te FROM TimesheetEntry te WHERE te.overtimeHours > 0 " +
           "AND te.entryDate BETWEEN :startDate AND :endDate " +
           "ORDER BY te.overtimeHours DESC")
    List<TimesheetEntry> findOvertimeEntries(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Recent activity
    @Query("SELECT te FROM TimesheetEntry te WHERE te.updatedAt > :since " +
           "ORDER BY te.updatedAt DESC")
    List<TimesheetEntry> findRecentlyUpdated(@Param("since") LocalDateTime since);

    // Compliance checks
    @Query("SELECT te FROM TimesheetEntry te WHERE te.hoursWorked > :maxDailyHours " +
           "AND te.entryDate BETWEEN :startDate AND :endDate")
    List<TimesheetEntry> findDailyHourViolations(
        @Param("maxDailyHours") BigDecimal maxDailyHours,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Auto-capture analysis
    @Query("SELECT te FROM TimesheetEntry te WHERE te.autoCaptured = true " +
           "AND te.entryDate BETWEEN :startDate AND :endDate")
    List<TimesheetEntry> findAutoCapturedEntries(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Entry validation
    @Query("SELECT te FROM TimesheetEntry te WHERE " +
           "(te.hoursWorked IS NULL OR te.hoursWorked <= 0) " +
           "OR (te.billableHours IS NOT NULL AND te.billableHours > te.hoursWorked) " +
           "OR (te.nonBillableHours IS NOT NULL AND te.nonBillableHours > te.hoursWorked)")
    List<TimesheetEntry> findInvalidEntries();

    // Project utilization
    @Query("SELECT te.project.id, te.project.projectName, " +
           "SUM(te.hoursWorked), SUM(te.billableHours), COUNT(DISTINCT te.timesheet.employee) " +
           "FROM TimesheetEntry te WHERE te.entryDate BETWEEN :startDate AND :endDate " +
           "GROUP BY te.project.id, te.project.projectName " +
           "ORDER BY SUM(te.hoursWorked) DESC")
    List<Object[]> getProjectUtilizationSummary(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Time distribution analysis
    @Query("SELECT EXTRACT(HOUR FROM te.startTime) as hour, COUNT(te) " +
           "FROM TimesheetEntry te WHERE te.timesheet.employee = :employee " +
           "AND te.entryDate BETWEEN :startDate AND :endDate " +
           "AND te.startTime IS NOT NULL " +
           "GROUP BY EXTRACT(HOUR FROM te.startTime) " +
           "ORDER BY hour")
    List<Object[]> getHourlyDistribution(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
}