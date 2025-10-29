package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Project;
import com.originhubs.HRMS.model.Timesheet;
import com.originhubs.HRMS.model.TimesheetExpense;
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

@Repository
public interface TimesheetExpenseRepository extends JpaRepository<TimesheetExpense, Long> {

    // Basic expense queries
    List<TimesheetExpense> findByTimesheet(Timesheet timesheet);
    
    List<TimesheetExpense> findByTimesheetOrderByExpenseDateDesc(Timesheet timesheet);

    // Employee queries
    @Query("SELECT te FROM TimesheetExpense te WHERE te.timesheet.employee = :employee " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findByEmployeeAndDateRange(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Project queries
    @Query("SELECT te FROM TimesheetExpense te WHERE te.project = :project " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findByProjectAndDateRange(
        @Param("project") Project project,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Amount aggregation queries
    @Query("SELECT SUM(te.expenseAmount) FROM TimesheetExpense te WHERE te.timesheet = :timesheet")
    BigDecimal sumExpenseAmountByTimesheet(@Param("timesheet") Timesheet timesheet);

    @Query("SELECT SUM(te.expenseAmount) FROM TimesheetExpense te WHERE te.timesheet.employee = :employee " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate " +
           "AND te.status = 'APPROVED'")
    BigDecimal sumApprovedExpensesByEmployeeAndDateRange(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(te.expenseAmount) FROM TimesheetExpense te WHERE te.project = :project " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate " +
           "AND te.status = 'APPROVED'")
    BigDecimal sumApprovedExpensesByProjectAndDateRange(
        @Param("project") Project project,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Status-based queries
    List<TimesheetExpense> findByStatus(TimesheetExpense.ExpenseStatus status);

    @Query("SELECT te FROM TimesheetExpense te WHERE te.status = :status " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findByStatusAndDateRange(
        @Param("status") TimesheetExpense.ExpenseStatus status,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Approval workflow queries
    @Query("SELECT te FROM TimesheetExpense te WHERE te.timesheet.manager = :manager " +
           "AND te.status = 'PENDING_APPROVAL'")
    List<TimesheetExpense> findPendingApprovalsByManager(@Param("manager") Employee manager);

    @Query("SELECT COUNT(te) FROM TimesheetExpense te WHERE te.timesheet.manager = :manager " +
           "AND te.status = 'PENDING_APPROVAL'")
    long countPendingApprovalsByManager(@Param("manager") Employee manager);

    // Expense type analysis
    @Query("SELECT te.expenseType, SUM(te.expenseAmount), COUNT(te) FROM TimesheetExpense te " +
           "WHERE te.timesheet.employee = :employee " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate " +
           "GROUP BY te.expenseType " +
           "ORDER BY SUM(te.expenseAmount) DESC")
    List<Object[]> getExpenseTypeDistribution(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Policy compliance queries
    @Query("SELECT te FROM TimesheetExpense te WHERE te.policyCompliance = false " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findPolicyViolations(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT te FROM TimesheetExpense te WHERE te.expenseAmount > :threshold " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findHighValueExpenses(
        @Param("threshold") BigDecimal threshold,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // AI/ML detection queries
    List<TimesheetExpense> findByAnomalyDetectedTrue();

    // AI queries
    @Query("SELECT te FROM TimesheetExpense te WHERE te.autoCategorized = true " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findAiCategorizedExpenses(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Receipt management
    @Query("SELECT te FROM TimesheetExpense te WHERE te.receiptFilePath IS NULL " +
           "AND te.expenseAmount > :minimumAmount")
    List<TimesheetExpense> findMissingReceipts(@Param("minimumAmount") BigDecimal minimumAmount);

    @Query("SELECT te FROM TimesheetExpense te WHERE te.receiptFilePath IS NOT NULL " +
           "AND te.receiptUploaded = true")
    List<TimesheetExpense> findUnverifiedReceipts();

    // Currency and conversion
    @Query("SELECT te FROM TimesheetExpense te WHERE te.currency <> :baseCurrency " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findForeignCurrencyExpenses(
        @Param("baseCurrency") String baseCurrency,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Mileage and travel expenses
    @Query("SELECT te FROM TimesheetExpense te WHERE te.expenseType = 'MILEAGE' " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findMileageExpenses(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(te.expenseAmount) FROM TimesheetExpense te WHERE te.timesheet.employee = :employee " +
           "AND te.expenseType = 'MILEAGE' " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumMileageByEmployeeAndDateRange(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Reimbursement tracking
    @Query("SELECT te FROM TimesheetExpense te WHERE te.status = :status " +
           "AND te.expenseDate BETWEEN :startDate AND :endDate")
    List<TimesheetExpense> findByReimbursementStatus(
        @Param("status") String status,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(te.expenseAmount) FROM TimesheetExpense te WHERE te.status = 'PENDING' " +
           "AND te.timesheet.employee = :employee")
    BigDecimal sumPendingReimbursements(@Param("employee") Employee employee);

    // Recent activity
    @Query("SELECT te FROM TimesheetExpense te WHERE te.updatedAt > :since " +
           "ORDER BY te.updatedAt DESC")
    List<TimesheetExpense> findRecentlyUpdated(@Param("since") LocalDateTime since);

    // Expense reporting
    @Query("SELECT te.expenseType, te.project.projectName, SUM(te.expenseAmount), COUNT(te) " +
           "FROM TimesheetExpense te WHERE te.expenseDate BETWEEN :startDate AND :endDate " +
           "AND te.status = 'APPROVED' " +
           "GROUP BY te.expenseType, te.project.projectName " +
           "ORDER BY SUM(te.expenseAmount) DESC")
    List<Object[]> getExpenseReportSummary(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Vendor analysis
    @Query("SELECT te.vendorName, SUM(te.expenseAmount), COUNT(te) FROM TimesheetExpense te " +
           "WHERE te.expenseDate BETWEEN :startDate AND :endDate " +
           "AND te.vendorName IS NOT NULL AND te.status = 'APPROVED' " +
           "GROUP BY te.vendorName " +
           "ORDER BY SUM(te.expenseAmount) DESC")
    List<Object[]> getVendorExpenseSummary(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Budget tracking
    @Query("SELECT te.project.id, te.project.projectName, SUM(te.expenseAmount) " +
           "FROM TimesheetExpense te WHERE te.expenseDate BETWEEN :startDate AND :endDate " +
           "AND te.status = 'APPROVED' " +
           "GROUP BY te.project.id, te.project.projectName")
    List<Object[]> getProjectExpenseSummary(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Approval statistics
    @Query("SELECT te.approvedBy, COUNT(te), SUM(te.expenseAmount) FROM TimesheetExpense te " +
           "WHERE te.approvedBy IS NOT NULL " +
           "AND te.approvalDate BETWEEN :startDate AND :endDate " +
           "GROUP BY te.approvedBy")
    List<Object[]> getApprovalStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
}
