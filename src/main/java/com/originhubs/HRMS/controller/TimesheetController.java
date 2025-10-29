package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.*;
import com.originhubs.HRMS.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetService timesheetService;
    private final EmployeeService employeeService;
    private final ProjectService projectService;
    private final NotificationService notificationService;
    private final DashboardService dashboardService;

    // ========== HELPER METHODS ==========

    /**
     * Helper method to get current employee from authentication
     */
    private Employee getCurrentEmployee(Authentication auth) {
        return employeeService.findByUsername(auth.getName())
            .orElseThrow(() -> new IllegalStateException("Employee not found for user: " + auth.getName()));
    }

    // ========== EMPLOYEE TIMESHEET OPERATIONS ==========

    /**
     * Timesheet list page - shows all timesheets with statistics
     */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    public String listTimesheets(Model model, Authentication auth) {
        Employee currentEmployee = getCurrentEmployee(auth);
        
        // Get timesheets based on role
        List<Timesheet> timesheets;
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("HR") || a.getAuthority().contains("ADMIN"))) {
            // HR/Admin can see all timesheets
            timesheets = timesheetService.getAllTimesheets();
        } else {
            // Employee can only see their own timesheets
            timesheets = timesheetService.getTimesheetsByEmployee(currentEmployee);
        }
        model.addAttribute("timesheets", timesheets);
        
        // Add timesheet statistics from DashboardService
        java.util.Map<String, Object> timesheetStats = dashboardService.getTimesheetStatistics();
        model.addAllAttributes(timesheetStats);
        
        return "timesheet/list";
    }

    /**
     * Employee timesheet dashboard - shows current week and recent timesheets
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    public String timesheetDashboard(Model model, Authentication auth) {
        Optional<Employee> employeeOpt = employeeService.findByUsername(auth.getName());
        if (employeeOpt.isEmpty()) {
            throw new IllegalStateException("Employee not found for user: " + auth.getName());
        }
        Employee currentEmployee = employeeOpt.get();
        
        // Get current week timesheet
        Timesheet currentWeek = timesheetService.getCurrentWeekTimesheet(currentEmployee);
        model.addAttribute("currentTimesheet", currentWeek);
        
        // Get recent timesheets (last 8 weeks)
        List<Timesheet> recentTimesheets = timesheetService.getRecentTimesheets(currentEmployee, 8);
        model.addAttribute("recentTimesheets", recentTimesheets);
        
        // Get timesheet statistics
        Map<String, Object> stats = timesheetService.getTimesheetStatistics(currentEmployee);
        model.addAttribute("stats", stats);
        
        // Get pending actions (for managers)
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("HR") || a.getAuthority().contains("ADMIN"))) {
            List<Timesheet> pendingApprovals = timesheetService.getPendingApprovals(currentEmployee);
            model.addAttribute("pendingApprovals", pendingApprovals);
        }
        
        return "timesheet/dashboard";
    }

    /**
     * Create or edit timesheet for a specific week
     */
    @GetMapping("/week/{weekStart}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    public String editWeeklyTimesheet(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
                                    Model model, Authentication auth) {
        Employee currentEmployee = getCurrentEmployee(auth);
        
        Timesheet timesheet = timesheetService.getOrCreateTimesheet(currentEmployee, weekStart);
        model.addAttribute("timesheet", timesheet);
        
        // Get available projects for the employee
        List<Project> availableProjects = projectService.getActiveProjectsForEmployee(currentEmployee.getId());
        model.addAttribute("projects", availableProjects);
        
        // Check if timesheet is editable
        boolean isEditable = timesheetService.isTimesheetEditable(timesheet, currentEmployee);
        model.addAttribute("isEditable", isEditable);
        
        return "timesheet/weekly-entry";
    }

    /**
     * Submit timesheet for approval
     */
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    public String submitTimesheet(@PathVariable Long id, 
                                RedirectAttributes redirectAttributes,
                                Authentication auth) {
        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            Timesheet timesheet = timesheetService.submitTimesheet(id, currentEmployee);
            
            // Send notification to manager
            if (timesheet.getManager() != null) {
                notificationService.notifyTimesheetSubmitted(timesheet.getId(), currentEmployee, timesheet.getManager());
            }
            
            redirectAttributes.addFlashAttribute("success", "Timesheet submitted for approval successfully!");
            return "redirect:/timesheets";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to submit timesheet: " + e.getMessage());
            return "redirect:/timesheets/week/" + LocalDate.now();
        }
    }

    /**
     * Save timesheet entries (auto-save functionality)
     */
    @PostMapping("/{id}/save")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    @ResponseBody
    public ResponseEntity<?> saveTimesheet(@PathVariable Long id,
                                         @RequestBody List<TimesheetEntry> entries,
                                         Authentication auth) {
        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            Timesheet savedTimesheet = timesheetService.saveTimesheetEntries(id, entries, currentEmployee);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Timesheet saved successfully",
                "totalHours", savedTimesheet.getTotalHoursLogged(),
                "lastSaved", LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to save timesheet: " + e.getMessage()
            ));
        }
    }

    // ========== MANAGER APPROVAL OPERATIONS ==========

    /**
     * Manager approval dashboard
     */
    @GetMapping("/approvals")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public String approvalDashboard(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(required = false) String status,
                                  @RequestParam(required = false) String employee,
                                  Model model, Authentication auth) {
        
        Employee currentManager = getCurrentEmployee(auth);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedOn").descending());
        Page<Timesheet> pendingTimesheets = timesheetService.getTimesheetsForApproval(
            currentManager, status, employee, pageable);
        
        model.addAttribute("timesheets", pendingTimesheets);
        model.addAttribute("currentStatus", status);
        model.addAttribute("currentEmployee", employee);
        
        // Get approval statistics
        Map<String, Long> approvalStats = timesheetService.getApprovalStatistics(currentManager);
        model.addAttribute("approvalStats", approvalStats);
        
        return "timesheet/approvals";
    }

    /**
     * View timesheet details for approval
     */
    @GetMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public String reviewTimesheet(@PathVariable Long id, Model model, Authentication auth) {
        Employee currentManager = getCurrentEmployee(auth);
        Timesheet timesheet = timesheetService.getTimesheetForReview(id, currentManager);
        
        if (timesheet == null) {
            throw new IllegalArgumentException("Timesheet not found or not authorized");
        }
        
        model.addAttribute("timesheet", timesheet);
        
        // Get AI insights and anomaly detection results
        Map<String, Object> aiInsights = timesheetService.getAIInsights(timesheet);
        model.addAttribute("aiInsights", aiInsights);
        
        // Get historical patterns for comparison
        Map<String, Object> historicalData = timesheetService.getHistoricalPatterns(timesheet.getEmployee());
        model.addAttribute("historicalData", historicalData);
        
        return "timesheet/review";
    }

    /**
     * Approve timesheet
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public String approveTimesheet(@PathVariable Long id,
                                 @RequestParam(required = false) String comments,
                                 RedirectAttributes redirectAttributes,
                                 Authentication auth) {
        try {
            Employee currentManager = getCurrentEmployee(auth);
            Timesheet timesheet = timesheetService.approveTimesheet(id, currentManager, comments);
            
            // Send notification to employee
            notificationService.notifyTimesheetApproved(timesheet.getId(), timesheet.getEmployee(), currentManager);
            
            redirectAttributes.addFlashAttribute("success", 
                "Timesheet approved for " + timesheet.getEmployee().getFirstName() + " " + timesheet.getEmployee().getLastName());
            
            return "redirect:/timesheets/approvals";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to approve timesheet: " + e.getMessage());
            return "redirect:/timesheets/" + id + "/review";
        }
    }

    /**
     * Reject timesheet
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public String rejectTimesheet(@PathVariable Long id,
                                @RequestParam String rejectionReason,
                                RedirectAttributes redirectAttributes,
                                Authentication auth) {
        try {
            Employee currentManager = getCurrentEmployee(auth);
            Timesheet timesheet = timesheetService.rejectTimesheet(id, currentManager, rejectionReason);
            
            // Send notification to employee
            notificationService.notifyTimesheetRejected(timesheet.getId(), timesheet.getEmployee(), currentManager, rejectionReason);
            
            redirectAttributes.addFlashAttribute("success", 
                "Timesheet rejected for " + timesheet.getEmployee().getFirstName() + " " + timesheet.getEmployee().getLastName());
            
            return "redirect:/timesheets/approvals";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to reject timesheet: " + e.getMessage());
            return "redirect:/timesheets/" + id + "/review";
        }
    }

    // ========== EXPENSE MANAGEMENT ==========

    /**
     * Add expense to timesheet
     */
    @PostMapping("/{id}/expenses")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    @ResponseBody
    public ResponseEntity<?> addExpense(@PathVariable Long id,
                                      @Valid @RequestBody TimesheetExpense expense,
                                      BindingResult result,
                                      Authentication auth) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "errors", result.getAllErrors()
            ));
        }
        
        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            TimesheetExpense savedExpense = timesheetService.addExpense(id, expense, currentEmployee);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "expense", savedExpense,
                "message", "Expense added successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to add expense: " + e.getMessage()
            ));
        }
    }

    // ========== REPORTING AND ANALYTICS ==========

    /**
     * Timesheet reports dashboard
     */
    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public String reportsPage(@RequestParam(required = false) String reportType,
                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                            @RequestParam(required = false) Long employeeId,
                            @RequestParam(required = false) Long projectId,
                            Model model) {
        
        // Set default date range if not provided
        if (startDate == null) startDate = LocalDate.now().minusMonths(1);
        if (endDate == null) endDate = LocalDate.now();
        
        model.addAttribute("startDate", startDate);
        model.addAttribute("endDate", endDate);
        model.addAttribute("reportType", reportType);
        
        // Get available employees and projects for filters
        model.addAttribute("employees", employeeService.findAllActive());
        model.addAttribute("projects", projectService.findAllActive());
        
        if (reportType != null) {
            Map<String, Object> reportData = timesheetService.generateReport(
                reportType, startDate, endDate, employeeId, projectId);
            model.addAttribute("reportData", reportData);
        }
        
        return "timesheet/reports";
    }

    /**
     * Export timesheet report
     */
    @GetMapping("/reports/export")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<?> exportReport(@RequestParam String format,
                                        @RequestParam String reportType,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                        @RequestParam(required = false) Long employeeId,
                                        @RequestParam(required = false) Long projectId) {
        
        try {
            byte[] reportData = timesheetService.exportReport(
                format, reportType, startDate, endDate, employeeId, projectId);
            
            String filename = String.format("timesheet_report_%s_%s_%s.%s", 
                reportType, startDate, endDate, format.toLowerCase());
            
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .header("Content-Type", getContentType(format))
                .body(reportData);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to export report: " + e.getMessage()
            ));
        }
    }

    // ========== API ENDPOINTS FOR MOBILE/INTEGRATION ==========

    /**
     * API: Get timesheet summary
     */
    @GetMapping("/api/summary")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    @ResponseBody
    public ResponseEntity<?> getTimesheetSummary(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
                                               Authentication auth) {
        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            if (weekStart == null) weekStart = LocalDate.now();
            
            Map<String, Object> summary = timesheetService.getTimesheetSummary(currentEmployee, weekStart);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * API: Auto-populate timesheet from calendar
     */
    @PostMapping("/api/{id}/auto-populate")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    @ResponseBody
    public ResponseEntity<?> autoPopulateTimesheet(@PathVariable Long id, Authentication auth) {
        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            Timesheet timesheet = timesheetService.autoPopulateFromCalendar(id, currentEmployee);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "timesheet", timesheet,
                "message", "Timesheet auto-populated from calendar"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to auto-populate: " + e.getMessage()
            ));
        }
    }

    // ========== UTILITY METHODS ==========

    private String getContentType(String format) {
        switch (format.toLowerCase()) {
            case "pdf": return "application/pdf";
            case "excel": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "csv": return "text/csv";
            default: return "application/octet-stream";
        }
    }
}