package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.*;
import com.originhubs.HRMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final TimesheetEntryRepository timesheetEntryRepository;
    private final TimesheetExpenseRepository timesheetExpenseRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;

    // ========== CORE TIMESHEET OPERATIONS ==========
    
    /**
     * Get all timesheets (for HR/Admin)
     */
    public List<Timesheet> getAllTimesheets() {
        return timesheetRepository.findAll();
    }
    
    /**
     * Get timesheets by employee
     */
    public List<Timesheet> getTimesheetsByEmployee(Employee employee) {
        return timesheetRepository.findByEmployeeOrderByWeekStartDateDesc(employee);
    }

    /**
     * Get or create timesheet for a specific week
     */
    @Transactional
    public Timesheet getOrCreateTimesheet(Employee employee, LocalDate weekStart) {
        // Ensure weekStart is a Sunday
        LocalDate sunday = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate saturday = sunday.plusDays(6);
        
        Optional<Timesheet> existingTimesheet = timesheetRepository
            .findByEmployeeAndWeekStartDateAndWeekEndDate(employee, sunday, saturday);
            
        if (existingTimesheet.isPresent()) {
            return existingTimesheet.get();
        }
        
        // Create new timesheet
        Timesheet timesheet = new Timesheet();
        timesheet.setEmployee(employee);
        timesheet.setWeekStartDate(sunday);
        timesheet.setWeekEndDate(saturday);
        timesheet.setStatus(Timesheet.TimesheetStatus.DRAFT);
        timesheet.setCreatedBy(employee.getEmployeeId());
        
        // Set manager if available
        if (employee.getManager() != null) {
            timesheet.setManager(employee.getManager());
        }
        
        return timesheetRepository.save(timesheet);
    }

    /**
     * Get current week timesheet
     */
    public Timesheet getCurrentWeekTimesheet(Employee employee) {
        return getOrCreateTimesheet(employee, LocalDate.now());
    }

    /**
     * Get recent timesheets for an employee
     */
    public List<Timesheet> getRecentTimesheets(Employee employee, int weekCount) {
        return timesheetRepository.findByEmployeeOrderByWeekStartDateDesc(employee)
            .stream()
            .limit(weekCount)
            .collect(Collectors.toList());
    }

    /**
     * Check if timesheet is editable by employee
     */
    public boolean isTimesheetEditable(Timesheet timesheet, Employee employee) {
        // Employee can only edit their own draft or rejected timesheets
        if (!timesheet.getEmployee().getId().equals(employee.getId())) {
            return false;
        }
        
        return timesheet.getStatus() == Timesheet.TimesheetStatus.DRAFT || 
               timesheet.getStatus() == Timesheet.TimesheetStatus.REJECTED;
    }

    /**
     * Save timesheet entries
     */
    @Transactional
    public Timesheet saveTimesheetEntries(Long timesheetId, List<TimesheetEntry> entries, Employee employee) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found"));
            
        // Verify employee can edit this timesheet
        if (!isTimesheetEditable(timesheet, employee)) {
            throw new IllegalStateException("Timesheet is not editable");
        }
        
        // Clear existing entries for this timesheet
        timesheetEntryRepository.deleteByTimesheet(timesheet);
        
        // Save new entries
        BigDecimal totalHours = BigDecimal.ZERO;
        BigDecimal totalBillable = BigDecimal.ZERO;
        BigDecimal totalNonBillable = BigDecimal.ZERO;
        BigDecimal totalOvertime = BigDecimal.ZERO;
        
        for (TimesheetEntry entry : entries) {
            entry.setTimesheet(timesheet);
            entry.setCreatedBy(employee.getEmployeeId());
            entry.setUpdatedBy(employee.getEmployeeId());
            
            // Validate entry data
            if (entry.getHoursWorked() != null) {
                totalHours = totalHours.add(entry.getHoursWorked());
            }
            if (entry.getBillableHours() != null) {
                totalBillable = totalBillable.add(entry.getBillableHours());
            }
            if (entry.getNonBillableHours() != null) {
                totalNonBillable = totalNonBillable.add(entry.getNonBillableHours());
            }
            if (entry.getOvertimeHours() != null) {
                totalOvertime = totalOvertime.add(entry.getOvertimeHours());
            }
            
            timesheetEntryRepository.save(entry);
        }
        
        // Update timesheet totals
        timesheet.setTotalHoursLogged(totalHours);
        timesheet.setTotalBillableHours(totalBillable);
        timesheet.setTotalNonBillableHours(totalNonBillable);
        timesheet.setTotalOvertimeHours(totalOvertime);
        
        // Calculate amounts if rates are available
        if (timesheet.getVendorBillRate() != null) {
            timesheet.setTotalBillableAmount(totalBillable.multiply(timesheet.getVendorBillRate()));
        }
        if (timesheet.getEmployeePayRate() != null) {
            timesheet.setTotalPayableAmount(totalHours.multiply(timesheet.getEmployeePayRate()));
        }
        
        timesheet.setUpdatedBy(employee.getEmployeeId());
        
        return timesheetRepository.save(timesheet);
    }

    /**
     * Submit timesheet for approval
     */
    @Transactional
    public Timesheet submitTimesheet(Long timesheetId, Employee employee) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found"));
            
        // Verify employee can submit this timesheet
        if (!timesheet.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalStateException("Cannot submit timesheet for another employee");
        }
        
        if (timesheet.getStatus() != Timesheet.TimesheetStatus.DRAFT && 
            timesheet.getStatus() != Timesheet.TimesheetStatus.REJECTED) {
            throw new IllegalStateException("Timesheet is not in a submittable state");
        }
        
        // Validate timesheet has entries
        if (timesheet.getTimesheetEntries() == null || timesheet.getTimesheetEntries().isEmpty()) {
            throw new IllegalStateException("Cannot submit empty timesheet");
        }
        
        timesheet.setStatus(Timesheet.TimesheetStatus.SUBMITTED);
        timesheet.setSubmittedOn(java.time.LocalDateTime.now());
        timesheet.setUpdatedBy(employee.getEmployeeId());
        
        return timesheetRepository.save(timesheet);
    }

    // ========== MANAGER APPROVAL OPERATIONS ==========

    /**
     * Get timesheets pending approval for a manager
     */
    public List<Timesheet> getPendingApprovals(Employee manager) {
        return timesheetRepository.findByManagerAndStatus(manager, Timesheet.TimesheetStatus.SUBMITTED);
    }

    /**
     * Get timesheets for approval with pagination and filters
     */
    public Page<Timesheet> getTimesheetsForApproval(Employee manager, String status, String employeeName, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            Timesheet.TimesheetStatus timesheetStatus = Timesheet.TimesheetStatus.valueOf(status);
            if (employeeName != null && !employeeName.isEmpty()) {
                return timesheetRepository.findByManagerAndStatusAndEmployeeNameContaining(manager, timesheetStatus, employeeName, pageable);
            }
            return timesheetRepository.findByManagerAndStatus(manager, timesheetStatus, pageable);
        }
        
        if (employeeName != null && !employeeName.isEmpty()) {
            return timesheetRepository.findByManagerAndEmployeeNameContaining(manager, employeeName, pageable);
        }
        
        return timesheetRepository.findByManager(manager, pageable);
    }

    /**
     * Get timesheet for review by manager
     */
    public Timesheet getTimesheetForReview(Long timesheetId, Employee manager) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found"));
            
        // Verify manager can review this timesheet
        if (timesheet.getManager() != null && !timesheet.getManager().getId().equals(manager.getId())) {
            // Check if manager has HR/Admin role for cross-team approval
            if (!hasAdminRole(manager)) {
                throw new IllegalStateException("Not authorized to review this timesheet");
            }
        }
        
        return timesheet;
    }

    /**
     * Approve timesheet
     */
    @Transactional
    public Timesheet approveTimesheet(Long timesheetId, Employee manager, String comments) {
        Timesheet timesheet = getTimesheetForReview(timesheetId, manager);
        
        if (timesheet.getStatus() != Timesheet.TimesheetStatus.SUBMITTED) {
            throw new IllegalStateException("Timesheet is not in submitted state");
        }
        
        timesheet.setStatus(Timesheet.TimesheetStatus.APPROVED);
        timesheet.setApprovedBy(manager);
        timesheet.setApprovalDate(java.time.LocalDateTime.now());
        timesheet.setUpdatedBy(manager.getEmployeeId());
        
        // Add comments as metadata if provided
        if (comments != null && !comments.isEmpty()) {
            // Store comments in a notes field or metadata
        }
        
        return timesheetRepository.save(timesheet);
    }

    /**
     * Reject timesheet
     */
    @Transactional
    public Timesheet rejectTimesheet(Long timesheetId, Employee manager, String rejectionReason) {
        Timesheet timesheet = getTimesheetForReview(timesheetId, manager);
        
        if (timesheet.getStatus() != Timesheet.TimesheetStatus.SUBMITTED) {
            throw new IllegalStateException("Timesheet is not in submitted state");
        }
        
        timesheet.setStatus(Timesheet.TimesheetStatus.REJECTED);
        timesheet.setRejectionReason(rejectionReason);
        timesheet.setApprovedBy(manager);
        timesheet.setApprovalDate(java.time.LocalDateTime.now());
        timesheet.setUpdatedBy(manager.getEmployeeId());
        
        return timesheetRepository.save(timesheet);
    }

    // ========== EXPENSE MANAGEMENT ==========

    /**
     * Add expense to timesheet
     */
    @Transactional
    public TimesheetExpense addExpense(Long timesheetId, TimesheetExpense expense, Employee employee) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found"));
            
        // Verify employee can add expenses to this timesheet
        if (!isTimesheetEditable(timesheet, employee)) {
            throw new IllegalStateException("Cannot add expenses to this timesheet");
        }
        
        expense.setTimesheet(timesheet);
        expense.setCreatedBy(employee.getEmployeeId());
        expense.setUpdatedBy(employee.getEmployeeId());
        
        TimesheetExpense savedExpense = timesheetExpenseRepository.save(expense);
        
        // Update timesheet total expenses
        updateTimesheetExpenseTotals(timesheet);
        
        return savedExpense;
    }

    /**
     * Update timesheet expense totals
     */
    private void updateTimesheetExpenseTotals(Timesheet timesheet) {
        BigDecimal totalExpenses = timesheetExpenseRepository.sumExpenseAmountByTimesheet(timesheet);
        timesheet.setTotalExpenses(totalExpenses != null ? totalExpenses : BigDecimal.ZERO);
        timesheetRepository.save(timesheet);
    }

    // ========== STATISTICS AND ANALYTICS ==========

    /**
     * Get timesheet statistics for an employee
     */
    public Map<String, Object> getTimesheetStatistics(Employee employee) {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        
        // Count timesheets by status in last 30 days
        long draftCount = timesheetRepository.countByEmployeeAndStatusAndWeekStartDateBetween(
            employee, Timesheet.TimesheetStatus.DRAFT, thirtyDaysAgo, today);
        long submittedCount = timesheetRepository.countByEmployeeAndStatusAndWeekStartDateBetween(
            employee, Timesheet.TimesheetStatus.SUBMITTED, thirtyDaysAgo, today);
        long approvedCount = timesheetRepository.countByEmployeeAndStatusAndWeekStartDateBetween(
            employee, Timesheet.TimesheetStatus.APPROVED, thirtyDaysAgo, today);
        
        stats.put("draftCount", draftCount);
        stats.put("submittedCount", submittedCount);
        stats.put("approvedCount", approvedCount);
        
        // Total hours in last 30 days
        BigDecimal totalHours = timesheetRepository.sumTotalHoursByEmployeeAndDateRange(employee, thirtyDaysAgo, today);
        stats.put("totalHours", totalHours != null ? totalHours : BigDecimal.ZERO);
        
        // Average weekly hours
        long weekCount = 4; // approximately 30 days
        BigDecimal avgWeeklyHours = totalHours != null ? 
            totalHours.divide(BigDecimal.valueOf(weekCount), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
        stats.put("avgWeeklyHours", avgWeeklyHours);
        
        return stats;
    }

    /**
     * Get approval statistics for a manager
     */
    public Map<String, Long> getApprovalStatistics(Employee manager) {
        Map<String, Long> stats = new HashMap<>();
        
        stats.put("pendingCount", timesheetRepository.countByManagerAndStatus(manager, Timesheet.TimesheetStatus.SUBMITTED));
        stats.put("approvedThisWeek", timesheetRepository.countByApprovedByAndApprovalDateBetween(
            manager, LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY)).atStartOfDay(),
            LocalDate.now().atTime(23, 59, 59)));
        stats.put("rejectedThisWeek", timesheetRepository.countByApprovedByAndStatusAndApprovalDateBetween(
            manager, Timesheet.TimesheetStatus.REJECTED,
            LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY)).atStartOfDay(),
            LocalDate.now().atTime(23, 59, 59)));
        
        return stats;
    }

    /**
     * Get AI insights for timesheet anomaly detection
     */
    public Map<String, Object> getAIInsights(Timesheet timesheet) {
        Map<String, Object> insights = new HashMap<>();
        
        // Placeholder for AI/ML integration
        insights.put("anomalyDetected", timesheet.getAnomalyDetected() != null ? timesheet.getAnomalyDetected() : false);
        insights.put("confidenceScore", timesheet.getAiConfidenceScore() != null ? timesheet.getAiConfidenceScore() : BigDecimal.ZERO);
        insights.put("patterns", new ArrayList<>());
        insights.put("recommendations", new ArrayList<>());
        
        return insights;
    }

    /**
     * Get historical patterns for comparison
     */
    public Map<String, Object> getHistoricalPatterns(Employee employee) {
        Map<String, Object> patterns = new HashMap<>();
        
        // Get last 12 weeks of data for pattern analysis
        LocalDate twelveWeeksAgo = LocalDate.now().minusWeeks(12);
        List<Timesheet> historicalTimesheets = timesheetRepository
            .findByEmployeeAndWeekStartDateAfterOrderByWeekStartDateDesc(employee, twelveWeeksAgo);
        
        // Calculate average hours per day
        OptionalDouble avgHoursPerWeek = historicalTimesheets.stream()
            .filter(ts -> ts.getTotalHoursLogged() != null)
            .mapToDouble(ts -> ts.getTotalHoursLogged().doubleValue())
            .average();
        
        patterns.put("avgWeeklyHours", avgHoursPerWeek.orElse(0.0));
        patterns.put("weekCount", historicalTimesheets.size());
        patterns.put("totalWeeks", 12);
        
        return patterns;
    }

    // ========== REPORTING ==========

    /**
     * Generate timesheet report
     */
    public Map<String, Object> generateReport(String reportType, LocalDate startDate, LocalDate endDate, 
                                            Long employeeId, Long projectId) {
        Map<String, Object> reportData = new HashMap<>();
        
        // This would be implemented based on specific report requirements
        // For now, return basic structure
        reportData.put("reportType", reportType);
        reportData.put("startDate", startDate);
        reportData.put("endDate", endDate);
        reportData.put("data", new ArrayList<>());
        
        return reportData;
    }

    /**
     * Export report in specified format
     */
    public byte[] exportReport(String format, String reportType, LocalDate startDate, LocalDate endDate,
                             Long employeeId, Long projectId) {
        // This would integrate with report generation libraries (JasperReports, Apache POI, etc.)
        // For now, return placeholder
        return new byte[0];
    }

    /**
     * Get timesheet summary for API
     */
    public Map<String, Object> getTimesheetSummary(Employee employee, LocalDate weekStart) {
        Timesheet timesheet = getOrCreateTimesheet(employee, weekStart);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("timesheetId", timesheet.getId());
        summary.put("weekStart", timesheet.getWeekStartDate());
        summary.put("weekEnd", timesheet.getWeekEndDate());
        summary.put("status", timesheet.getStatus());
        summary.put("totalHours", timesheet.getTotalHoursLogged());
        summary.put("totalBillableHours", timesheet.getTotalBillableHours());
        summary.put("totalExpenses", timesheet.getTotalExpenses());
        summary.put("isEditable", isTimesheetEditable(timesheet, employee));
        
        return summary;
    }

    /**
     * Auto-populate timesheet from calendar (AI/ML integration placeholder)
     */
    @Transactional
    public Timesheet autoPopulateFromCalendar(Long timesheetId, Employee employee) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found"));
            
        if (!isTimesheetEditable(timesheet, employee)) {
            throw new IllegalStateException("Timesheet is not editable");
        }
        
        // Placeholder for calendar integration and AI-powered auto-population
        // This would integrate with calendar APIs and use ML to categorize meetings/tasks
        
        timesheet.setAutoPopulated(true);
        timesheet.setAiConfidenceScore(new BigDecimal("0.85")); // 85% confidence
        
        return timesheetRepository.save(timesheet);
    }

    /**
     * Save timesheet
     */
    @Transactional
    public Timesheet saveTimesheet(Timesheet timesheet) {
        return timesheetRepository.save(timesheet);
    }

    /**
     * Get or create timesheet entry for a specific date
     */
    @Transactional
    public TimesheetEntry getOrCreateTimesheetEntry(Timesheet timesheet, LocalDate entryDate) {
        Optional<TimesheetEntry> existingEntry = timesheetEntryRepository
            .findByTimesheetAndEntryDate(timesheet, entryDate);
            
        if (existingEntry.isPresent()) {
            return existingEntry.get();
        }
        
        // Create new entry
        TimesheetEntry entry = new TimesheetEntry();
        entry.setTimesheet(timesheet);
        entry.setEntryDate(entryDate);
        return entry;
    }

    /**
     * Save timesheet entry
     */
    @Transactional
    public TimesheetEntry saveTimesheetEntry(TimesheetEntry entry) {
        return timesheetEntryRepository.save(entry);
    }

    // ========== UTILITY METHODS ==========

    private boolean hasAdminRole(Employee employee) {
        // Check if employee has admin or HR role
        return employee.getRoles() != null && 
               employee.getRoles().stream()
                   .anyMatch(role -> role.getName().equals("ADMIN") || role.getName().equals("HR"));
    }
}