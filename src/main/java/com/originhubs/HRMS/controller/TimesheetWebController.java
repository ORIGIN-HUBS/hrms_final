package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.*;
import com.originhubs.HRMS.model.Timesheet.TimesheetStatus;
import com.originhubs.HRMS.service.*;
import com.originhubs.HRMS.repository.TimesheetRepository;
import com.originhubs.HRMS.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Controller
@RequestMapping("/timesheet")
@RequiredArgsConstructor
public class TimesheetWebController {

    private final TimesheetService timesheetService;
    private final EmployeeService employeeService;
    private final ProjectService projectService;
    private final TimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * Helper method to get current employee from authentication
     */
    private Employee getCurrentEmployee(Authentication auth) {
        Optional<Employee> employee = employeeService.findByUsername(auth.getName());
        if (employee.isEmpty()) {
            // If employee not found, try to find by different fields or create a more detailed error
            throw new IllegalStateException("Employee not found for user: " + auth.getName() + 
                ". Please ensure your employee record exists in the system.");
        }
        return employee.get();
    }

    // ========== EMPLOYEE PROJECT VIEW ==========
    
    /**
     * Employee view - My assigned projects
     */
    @GetMapping("/my-projects")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String myProjects(Authentication auth, Model model) {
        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            List<Project> myProjects = projectService.getActiveProjectsForEmployee(currentEmployee.getId());
            
            model.addAttribute("projects", myProjects);
            model.addAttribute("employee", currentEmployee);
            
            return "timesheet/my-projects";
        } catch (IllegalStateException e) {
            model.addAttribute("error", e.getMessage());
            return "error/employee-not-found";
        }
    }

    // ========== TIMESHEET LIST VIEWS ==========

    /**
     * Admin/HR view - All timesheets with filters
     */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String timesheetList(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate payPeriodStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate payPeriodEnd,
            @RequestParam(required = false) Long employeeId,
            Model model) {

        // Create pageable with correct field name
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // For now, get all timesheets - we can implement filtering later
        Page<Timesheet> timesheets = timesheetRepository.findAll(pageable);

        model.addAttribute("timesheets", timesheets.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", timesheets.getTotalPages());
        model.addAttribute("totalElements", timesheets.getTotalElements());
        
        // Add employees for filtering
        model.addAttribute("employees", employeeService.getAllEmployees());
        
        return "timesheet/list";
    }

    /**
     * Employee view - My timesheets only
     */
    @GetMapping("/my-timesheets")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String myTimesheets(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate payPeriodStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate payPeriodEnd,
            Authentication auth,
            Model model) {

        Employee currentEmployee = getCurrentEmployee(auth);
        
        // Get employee's timesheets using existing method - filter to only submitted ones
        List<Timesheet> allEmployeeTimesheets = timesheetService.getRecentTimesheets(currentEmployee, 50);
        
        // Filter to only show submitted timesheets (as requested by user)
        List<Timesheet> submittedTimesheets = allEmployeeTimesheets.stream()
            .filter(t -> t.getStatus() == TimesheetStatus.SUBMITTED || 
                        t.getStatus() == TimesheetStatus.APPROVED || 
                        t.getStatus() == TimesheetStatus.REJECTED ||
                        t.getStatus() == TimesheetStatus.PAID)
            .collect(java.util.stream.Collectors.toList());

        model.addAttribute("timesheets", submittedTimesheets);
        
        // Calculate stats for employee dashboard - using submitted timesheets
        long totalTimesheets = submittedTimesheets.size();
        long pendingTimesheets = submittedTimesheets.stream()
            .filter(t -> t.getStatus() == TimesheetStatus.SUBMITTED)
            .count();
        long approvedTimesheets = submittedTimesheets.stream()
            .filter(t -> t.getStatus() == TimesheetStatus.APPROVED || t.getStatus() == TimesheetStatus.PAID)
            .count();
        double totalEarnings = submittedTimesheets.stream()
            .filter(t -> t.getStatus() == TimesheetStatus.APPROVED || t.getStatus() == TimesheetStatus.PAID)
            .mapToDouble(t -> t.getTotalPayableAmount() != null ? t.getTotalPayableAmount().doubleValue() : 0.0)
            .sum();

        model.addAttribute("totalTimesheets", totalTimesheets);
        model.addAttribute("pendingTimesheets", pendingTimesheets);
        model.addAttribute("approvedTimesheets", approvedTimesheets);
        model.addAttribute("totalEarnings", totalEarnings);
        
        return "timesheet/my-timesheets";
    }

    // ========== EMPLOYEE TIMESHEET FORM ==========

    /**
     * Add new timesheet - redirect to submit form
     */
    @GetMapping("/add")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String addTimesheet() {
        return "redirect:/timesheet/submit";
    }

    /**
     * Show employee timesheet submission form for current week or specified week
     */
    @GetMapping("/submit")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String showEmployeeTimesheetForm(
            @RequestParam(value = "weekStart", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartParam,
            Authentication auth, Model model) {
        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            
            // Use provided week start date or default to current week (Sunday to Saturday)
            LocalDate sunday;
            if (weekStartParam != null) {
                // Ensure the provided date is a Sunday
                sunday = weekStartParam.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
            } else {
                LocalDate today = LocalDate.now();
                sunday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
            }
            LocalDate saturday = sunday.plusDays(6);
            
            // Get or create timesheet for the specified week (using Sunday as start)
            Timesheet timesheet = timesheetService.getOrCreateTimesheet(currentEmployee, sunday);
            
            // Organize timesheet entries by date for easy template access
            Map<String, TimesheetEntry> entriesByDay = new HashMap<>();
            if (timesheet.getTimesheetEntries() != null) {
                for (TimesheetEntry entry : timesheet.getTimesheetEntries()) {
                    LocalDate entryDate = entry.getEntryDate();
                    String dayKey = getDayKey(entryDate, sunday);
                    if (dayKey != null) {
                        entriesByDay.put(dayKey, entry);
                    }
                }
            }
            
            model.addAttribute("timesheet", timesheet);
            model.addAttribute("entriesByDay", entriesByDay);
            model.addAttribute("employee", currentEmployee);
            // Get only active projects assigned to the current employee
            model.addAttribute("projects", projectService.getActiveProjectsForEmployee(currentEmployee.getId()));
            model.addAttribute("weekStart", sunday);
            model.addAttribute("weekEnd", saturday);
            
            // Add individual dates for the week (Sunday to Saturday)
            model.addAttribute("sundayDate", sunday);
            model.addAttribute("mondayDate", sunday.plusDays(1));
            model.addAttribute("tuesdayDate", sunday.plusDays(2));
            model.addAttribute("wednesdayDate", sunday.plusDays(3));
            model.addAttribute("thursdayDate", sunday.plusDays(4));
            model.addAttribute("fridayDate", sunday.plusDays(5));
            model.addAttribute("saturdayDate", saturday);
            
            return "timesheet/employee-form";
        } catch (IllegalStateException e) {
            model.addAttribute("error", e.getMessage());
            model.addAttribute("username", auth.getName());
            return "error/employee-not-found";
        }
    }

    /**
     * Process employee timesheet submission (new format with regular/overtime split)
     */
    @PostMapping("/submit-weekly")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String processEmployeeTimesheetNew(
            @RequestParam Long projectId,
            @RequestParam LocalDate weekStartDate,
            @RequestParam String action,
            // Sunday
            @RequestParam(defaultValue = "0") Double sundayRegular,
            @RequestParam(defaultValue = "0") Double sundayOvertime,
            @RequestParam(required = false) String sundayDescription,
            // Monday
            @RequestParam(defaultValue = "0") Double mondayRegular,
            @RequestParam(defaultValue = "0") Double mondayOvertime,
            @RequestParam(required = false) String mondayDescription,
            // Tuesday
            @RequestParam(defaultValue = "0") Double tuesdayRegular,
            @RequestParam(defaultValue = "0") Double tuesdayOvertime,
            @RequestParam(required = false) String tuesdayDescription,
            // Wednesday
            @RequestParam(defaultValue = "0") Double wednesdayRegular,
            @RequestParam(defaultValue = "0") Double wednesdayOvertime,
            @RequestParam(required = false) String wednesdayDescription,
            // Thursday
            @RequestParam(defaultValue = "0") Double thursdayRegular,
            @RequestParam(defaultValue = "0") Double thursdayOvertime,
            @RequestParam(required = false) String thursdayDescription,
            // Friday
            @RequestParam(defaultValue = "0") Double fridayRegular,
            @RequestParam(defaultValue = "0") Double fridayOvertime,
            @RequestParam(required = false) String fridayDescription,
            // Saturday
            @RequestParam(defaultValue = "0") Double saturdayRegular,
            @RequestParam(defaultValue = "0") Double saturdayOvertime,
            @RequestParam(required = false) String saturdayDescription,
            Authentication auth,
            RedirectAttributes redirectAttributes) {

        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            
            // Get or create timesheet
            Timesheet timesheet = timesheetService.getOrCreateTimesheet(currentEmployee, weekStartDate);
            
            // Get project
            Optional<Project> projectOpt = projectService.getProjectById(projectId);
            if (projectOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Project not found");
                return "redirect:/timesheet/submit";
            }
            
            timesheet.setProject(projectOpt.get());
            
            // Calculate totals
            double totalRegularHours = sundayRegular + mondayRegular + tuesdayRegular + 
                                     wednesdayRegular + thursdayRegular + fridayRegular + saturdayRegular;
            double totalOvertimeHours = sundayOvertime + mondayOvertime + tuesdayOvertime + 
                                      wednesdayOvertime + thursdayOvertime + fridayOvertime + saturdayOvertime;
            double totalHours = totalRegularHours + totalOvertimeHours;
            
            // Validate hours
            if (totalHours == 0) {
                redirectAttributes.addFlashAttribute("error", "Please enter at least some hours worked");
                return "redirect:/timesheet/submit?weekStart=" + weekStartDate;
            }
            
            timesheet.setTotalHoursLogged(BigDecimal.valueOf(totalHours));
            timesheet.setTotalOvertimeHours(BigDecimal.valueOf(totalOvertimeHours));
            
            if ("submit".equals(action)) {
                timesheet.setStatus(TimesheetStatus.SUBMITTED);
                timesheet.setSubmittedOn(LocalDateTime.now());
                redirectAttributes.addFlashAttribute("success", "Timesheet submitted for approval successfully");
            } else {
                timesheet.setStatus(TimesheetStatus.DRAFT);
                redirectAttributes.addFlashAttribute("success", "Timesheet saved as draft successfully");
            }
            
            // Save timesheet
            timesheetService.saveTimesheet(timesheet);
            
            // Save individual daily entries
            saveDailyEntry(timesheet, weekStartDate, sundayRegular + sundayOvertime, sundayOvertime, sundayDescription);
            saveDailyEntry(timesheet, weekStartDate.plusDays(1), mondayRegular + mondayOvertime, mondayOvertime, mondayDescription);
            saveDailyEntry(timesheet, weekStartDate.plusDays(2), tuesdayRegular + tuesdayOvertime, tuesdayOvertime, tuesdayDescription);
            saveDailyEntry(timesheet, weekStartDate.plusDays(3), wednesdayRegular + wednesdayOvertime, wednesdayOvertime, wednesdayDescription);
            saveDailyEntry(timesheet, weekStartDate.plusDays(4), thursdayRegular + thursdayOvertime, thursdayOvertime, thursdayDescription);
            saveDailyEntry(timesheet, weekStartDate.plusDays(5), fridayRegular + fridayOvertime, fridayOvertime, fridayDescription);
            saveDailyEntry(timesheet, weekStartDate.plusDays(6), saturdayRegular + saturdayOvertime, saturdayOvertime, saturdayDescription);
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error processing timesheet: " + e.getMessage());
        }
        
        return "redirect:/timesheet/submit?weekStart=" + weekStartDate;
    }

    private void saveDailyEntry(Timesheet timesheet, LocalDate entryDate, double totalHours, double overtimeHours, String description) {
        if (totalHours > 0) {
            TimesheetEntry entry = timesheetService.getOrCreateTimesheetEntry(timesheet, entryDate);
            entry.setHoursWorked(BigDecimal.valueOf(totalHours));
            entry.setOvertimeHours(BigDecimal.valueOf(overtimeHours));
            entry.setTaskDescription(description);
            timesheetService.saveTimesheetEntry(entry);
        }
    }

    /**
     * Process employee timesheet submission (old format - keeping for compatibility)
     */
    @PostMapping("/submit-weekly-old")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String processEmployeeTimesheet(
            @RequestParam Long projectId,
            @RequestParam LocalDate weekStartDate,
            @RequestParam LocalDate weekEndDate,
            @RequestParam(required = false) String description,
            @RequestParam String action,
            // Monday
            @RequestParam(required = false) String mondayStartTime,
            @RequestParam(required = false) String mondayEndTime,
            @RequestParam(required = false) String mondayDescription,
            @RequestParam(defaultValue = "0") Double mondayHours,
            // Tuesday
            @RequestParam(required = false) String tuesdayStartTime,
            @RequestParam(required = false) String tuesdayEndTime,
            @RequestParam(required = false) String tuesdayDescription,
            @RequestParam(defaultValue = "0") Double tuesdayHours,
            // Wednesday
            @RequestParam(required = false) String wednesdayStartTime,
            @RequestParam(required = false) String wednesdayEndTime,
            @RequestParam(required = false) String wednesdayDescription,
            @RequestParam(defaultValue = "0") Double wednesdayHours,
            // Thursday
            @RequestParam(required = false) String thursdayStartTime,
            @RequestParam(required = false) String thursdayEndTime,
            @RequestParam(required = false) String thursdayDescription,
            @RequestParam(defaultValue = "0") Double thursdayHours,
            // Friday
            @RequestParam(required = false) String fridayStartTime,
            @RequestParam(required = false) String fridayEndTime,
            @RequestParam(required = false) String fridayDescription,
            @RequestParam(defaultValue = "0") Double fridayHours,
            // Saturday
            @RequestParam(required = false) String saturdayStartTime,
            @RequestParam(required = false) String saturdayEndTime,
            @RequestParam(required = false) String saturdayDescription,
            @RequestParam(defaultValue = "0") Double saturdayHours,
            // Sunday
            @RequestParam(required = false) String sundayStartTime,
            @RequestParam(required = false) String sundayEndTime,
            @RequestParam(required = false) String sundayDescription,
            @RequestParam(defaultValue = "0") Double sundayHours,
            Authentication auth,
            RedirectAttributes redirectAttributes) {

        try {
            Employee currentEmployee = getCurrentEmployee(auth);
            
            // Get or create timesheet
            Timesheet timesheet = timesheetService.getOrCreateTimesheet(currentEmployee, weekStartDate);
            
            // Get project
            Optional<Project> projectOpt = projectService.getProjectById(projectId);
            if (projectOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Project not found");
                return "redirect:/timesheet/submit";
            }
            
            timesheet.setProject(projectOpt.get());
            // Note: description field not available in current model
            
            // Calculate totals
            double totalHours = mondayHours + tuesdayHours + wednesdayHours + thursdayHours + 
                               fridayHours + saturdayHours + sundayHours;
            double regularHours = Math.min(mondayHours, 8) + Math.min(tuesdayHours, 8) + 
                                 Math.min(wednesdayHours, 8) + Math.min(thursdayHours, 8) + 
                                 Math.min(fridayHours, 8);
            double overtimeHours = totalHours - regularHours;
            
            timesheet.setTotalHoursLogged(BigDecimal.valueOf(totalHours));
            timesheet.setTotalOvertimeHours(BigDecimal.valueOf(overtimeHours));
            
            // Set status based on action
            if ("submit".equals(action)) {
                timesheet.setStatus(TimesheetStatus.SUBMITTED);
                timesheet.setSubmittedOn(LocalDateTime.now());
                redirectAttributes.addFlashAttribute("success", "Timesheet submitted for approval successfully");
            } else {
                timesheet.setStatus(TimesheetStatus.DRAFT);
                redirectAttributes.addFlashAttribute("success", "Timesheet saved as draft successfully");
            }
            
            timesheet.setUpdatedAt(LocalDateTime.now());
            timesheetRepository.save(timesheet);
            
            return "redirect:/timesheet/my-timesheets";

        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error saving timesheet: " + e.getMessage());
            return "redirect:/timesheet/submit";
        }
    }

    // ========== HR APPROVAL OPERATIONS ==========

    /**
     * HR/Admin approval dashboard
     */
    @GetMapping("/approvals")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String approvalDashboard(Model model) {
        // Get pending timesheets
        List<Timesheet> pendingTimesheets = timesheetRepository.findByStatusOrderBySubmittedOnAsc(TimesheetStatus.SUBMITTED);
        
        // Get recent approved/rejected timesheets (last 10)
        List<Timesheet> recentTimesheets = timesheetRepository.findTop10ByStatusInOrderByUpdatedAtDesc(
            Arrays.asList(TimesheetStatus.APPROVED, TimesheetStatus.REJECTED),
            PageRequest.of(0, 10)
        );
        
        // Calculate stats
        long pendingCount = pendingTimesheets.size();
        long approvedToday = timesheetRepository.countApprovedAfterDate(
            LocalDateTime.now().toLocalDate().atStartOfDay()
        );
        long rejectedToday = timesheetRepository.countRejectedAfterDate(
            LocalDateTime.now().toLocalDate().atStartOfDay()
        );
        long totalEmployees = employeeService.getAllEmployees().size();
        
        model.addAttribute("pendingTimesheets", pendingTimesheets);
        model.addAttribute("recentTimesheets", recentTimesheets);
        model.addAttribute("pendingCount", pendingCount);
        model.addAttribute("approvedToday", approvedToday);
        model.addAttribute("rejectedToday", rejectedToday);
        model.addAttribute("totalEmployees", totalEmployees);
        
        return "timesheet/approvals";
    }

    /**
     * Show timesheet edit form
     */
    @GetMapping("/edit/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String showEditTimesheetForm(@PathVariable Long id, Authentication auth, Model model) {
        Optional<Timesheet> timesheetOpt = timesheetRepository.findById(id);
        
        if (timesheetOpt.isEmpty()) {
            return "redirect:/timesheet/list";
        }
        
        Timesheet timesheet = timesheetOpt.get();
        
        // Security check - employees can only edit their own timesheets
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"))) {
            Employee currentEmployee = getCurrentEmployee(auth);
            if (!timesheet.getEmployee().getId().equals(currentEmployee.getId())) {
                return "redirect:/timesheet/my-timesheets";
            }
        }
        
        // Only allow editing of DRAFT timesheets
        if (timesheet.getStatus() != TimesheetStatus.DRAFT) {
            return "redirect:/timesheet/view/" + id;
        }
        
        model.addAttribute("timesheet", timesheet);
        model.addAttribute("employees", employeeService.getAllEmployees());
        model.addAttribute("projects", projectService.getAllProjects());
        
        return "timesheet/form";
    }

    /**
     * Process timesheet form submission
     */
    @PostMapping({"/add", "/edit/{id}"})
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String processTimesheetForm(
            @PathVariable(required = false) Long id,
            @Valid @ModelAttribute Timesheet timesheet,
            @RequestParam String action,
            BindingResult result,
            Authentication auth,
            RedirectAttributes redirectAttributes) {

        if (result.hasErrors()) {
            return "timesheet/form";
        }

        try {
            Employee currentEmployee = null;
            
            // For employees, ensure they can only create/edit their own timesheets
            if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"))) {
                currentEmployee = getCurrentEmployee(auth);
                timesheet.setEmployee(currentEmployee);
            }

            Timesheet savedTimesheet;
            
            if (id != null) {
                // Editing existing timesheet
                Optional<Timesheet> existingOpt = timesheetRepository.findById(id);
                if (existingOpt.isEmpty()) {
                    redirectAttributes.addFlashAttribute("error", "Timesheet not found");
                    return "redirect:/timesheet/list";
                }
                
                Timesheet existing = existingOpt.get();
                
                // Security check for employee editing
                if (currentEmployee != null && !existing.getEmployee().getId().equals(currentEmployee.getId())) {
                    redirectAttributes.addFlashAttribute("error", "You can only edit your own timesheets");
                    return "redirect:/timesheet/my-timesheets";
                }
                
                // Only allow editing of DRAFT timesheets
                if (existing.getStatus() != TimesheetStatus.DRAFT) {
                    redirectAttributes.addFlashAttribute("error", "Cannot edit timesheet that is not in DRAFT status");
                    return "redirect:/timesheet/view/" + id;
                }
                
                // Update fields - use the actual field names from the Timesheet model
                existing.setWeekStartDate(timesheet.getWeekStartDate());
                existing.setWeekEndDate(timesheet.getWeekEndDate());
                // Note: No description field in the actual model
                existing.setUpdatedAt(LocalDateTime.now());
                savedTimesheet = timesheetRepository.save(existing);
            } else {
                // Creating new timesheet
                timesheet.setStatus(TimesheetStatus.DRAFT);
                timesheet.setCreatedAt(LocalDateTime.now());
                timesheet.setUpdatedAt(LocalDateTime.now());
                savedTimesheet = timesheetRepository.save(timesheet);
            }

            // Handle different actions
            if ("submit".equals(action)) {
                savedTimesheet.setStatus(TimesheetStatus.SUBMITTED);
                savedTimesheet.setSubmittedOn(LocalDateTime.now());
                timesheetRepository.save(savedTimesheet);
                redirectAttributes.addFlashAttribute("success", "Timesheet submitted for approval successfully");
            } else {
                redirectAttributes.addFlashAttribute("success", "Timesheet saved as draft successfully");
            }

            // Redirect based on user role
            if (currentEmployee != null) {
                return "redirect:/timesheet/my-timesheets";
            } else {
                return "redirect:/timesheet/list";
            }

        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error saving timesheet: " + e.getMessage());
            return "timesheet/form";
        }
    }

    /**
     * View timesheet details
     */
    @GetMapping("/view/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String viewTimesheet(@PathVariable Long id, Authentication auth, Model model) {
        Optional<Timesheet> timesheetOpt = timesheetRepository.findByIdWithRelations(id);
        
        if (timesheetOpt.isEmpty()) {
            return "redirect:/timesheet/list";
        }
        
        Timesheet timesheet = timesheetOpt.get();
        
        // Initialize expenses collection to avoid lazy loading issues in template
        if (timesheet.getExpenses() != null) {
            timesheet.getExpenses().size(); // This triggers loading
        }
        
        // Security check - employees can only view their own timesheets
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"))) {
            Employee currentEmployee = getCurrentEmployee(auth);
            if (!timesheet.getEmployee().getId().equals(currentEmployee.getId())) {
                return "redirect:/timesheet/my-timesheets";
            }
        }
        
        model.addAttribute("timesheet", timesheet);
        
        return "timesheet/view";
    }

    // ========== UTILITY ENDPOINTS ==========

    /**
     * Debug endpoint to check existing employees (temporary)
     */
    @GetMapping("/debug/employees")
    @ResponseBody
    public String debugEmployees() {
        try {
            List<Employee> employees = employeeService.getAllEmployees();
            StringBuilder sb = new StringBuilder();
            sb.append("=== DATABASE EMPLOYEE RECORDS ===\n");
            sb.append("Total employees: ").append(employees.size()).append("\n\n");
            
            if (employees.isEmpty()) {
                sb.append("No employees found in database!\n");
                return sb.toString();
            }
            
            for (Employee emp : employees) {
                sb.append("Record #").append(emp.getId()).append(":\n");
                sb.append("  Employee ID: '").append(emp.getEmployeeId()).append("'\n");
                sb.append("  First Name: '").append(emp.getFirstName()).append("'\n");
                sb.append("  Last Name: '").append(emp.getLastName()).append("'\n");
                sb.append("  Work Email: '").append(emp.getWorkEmail()).append("'\n");
                sb.append("  Personal Email: '").append(emp.getPersonalEmail()).append("'\n");
                sb.append("  Status: '").append(emp.getStatus()).append("'\n");
                sb.append("  Job Title: '").append(emp.getJobTitle()).append("'\n");
                sb.append("  ===================================\n");
            }
            
            return sb.toString();
        } catch (Exception e) {
            return "Error fetching employees: " + e.getMessage();
        }
    }

    /**
     * Debug endpoint to check current authentication details
     */
    @GetMapping("/debug/auth")
    @ResponseBody
    public String debugAuthentication(Authentication auth) {
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("=== AUTHENTICATION DEBUG ===\n");
            sb.append("Authentication object: ").append(auth.getClass().getSimpleName()).append("\n");
            sb.append("Username (auth.getName()): '").append(auth.getName()).append("'\n");
            sb.append("Principal: ").append(auth.getPrincipal()).append("\n");
            sb.append("Principal class: ").append(auth.getPrincipal().getClass().getSimpleName()).append("\n");
            sb.append("Authenticated: ").append(auth.isAuthenticated()).append("\n");
            sb.append("Authorities: ").append(auth.getAuthorities()).append("\n");
            
            // Check if principal has more details
            Object principal = auth.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                org.springframework.security.core.userdetails.UserDetails userDetails = 
                    (org.springframework.security.core.userdetails.UserDetails) principal;
                sb.append("\nUserDetails:\n");
                sb.append("  Username: '").append(userDetails.getUsername()).append("'\n");
                sb.append("  Authorities: ").append(userDetails.getAuthorities()).append("\n");
                sb.append("  Enabled: ").append(userDetails.isEnabled()).append("\n");
                sb.append("  Account Non Expired: ").append(userDetails.isAccountNonExpired()).append("\n");
                sb.append("  Account Non Locked: ").append(userDetails.isAccountNonLocked()).append("\n");
                sb.append("  Credentials Non Expired: ").append(userDetails.isCredentialsNonExpired()).append("\n");
            }
            
            return sb.toString();
        } catch (Exception e) {
            return "Error getting authentication details: " + e.getMessage();
        }
    }

    /**
     * Debug endpoint to check users table (authentication)
     */
    @GetMapping("/debug/users")
    @ResponseBody
    public String debugUsers() {
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("=== USER vs EMPLOYEE MISMATCH ISSUE ===\n\n");
            sb.append("PROBLEM IDENTIFIED:\n");
            sb.append("1. You login with username 'kalya.a' (from users table)\n");
            sb.append("2. But employee record has email 'kalyan.a@originhubs.com'\n");
            sb.append("3. The system tries to find employee by username 'kalya.a'\n");
            sb.append("4. But no employee exists with that exact match\n\n");
            
            sb.append("SOLUTION OPTIONS:\n");
            sb.append("A. Update user record to use 'kalyan.a' as username\n");
            sb.append("B. Update employee email to 'kalya.a@originhubs.com'\n");
            sb.append("C. Improve lookup logic to handle the mismatch\n\n");
            
            sb.append("CURRENT EMPLOYEE RECORD:\n");
            sb.append("- Employee ID: EMP00008\n");
            sb.append("- Name: Kalyan A\n");
            sb.append("- Work Email: kalyan.a@originhubs.com\n");
            sb.append("- Status: ACTIVE\n\n");
            
            sb.append("EXPECTED LOGIN USERNAME: 'kalyan.a' or 'kalyan.a@originhubs.com'\n");
            
            return sb.toString();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    /**
     * Debug endpoint to test employee lookup
     */
    @GetMapping("/debug/lookup/{username}")
    @ResponseBody
    public String debugEmployeeLookup(@PathVariable String username) {
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("=== EMPLOYEE LOOKUP DEBUG ===\n");
            sb.append("Looking for username: '").append(username).append("'\n\n");
            
            // Test direct repository calls
            sb.append("Testing direct repository calls:\n");
            
            // Test employeeId lookup
            Optional<Employee> byEmployeeId = employeeRepository.findByEmployeeId(username);
            sb.append("1. findByEmployeeId('").append(username).append("'): ");
            sb.append(byEmployeeId.isPresent() ? "FOUND" : "NOT FOUND").append("\n");
            
            // Test work email lookup
            Optional<Employee> byWorkEmail = employeeRepository.findByWorkEmail(username);
            sb.append("2. findByWorkEmail('").append(username).append("'): ");
            sb.append(byWorkEmail.isPresent() ? "FOUND" : "NOT FOUND").append("\n");
            
            // Test personal email lookup
            Optional<Employee> byPersonalEmail = employeeRepository.findByPersonalEmail(username);
            sb.append("3. findByPersonalEmail('").append(username).append("'): ");
            sb.append(byPersonalEmail.isPresent() ? "FOUND" : "NOT FOUND").append("\n");
            
            // Test service lookup
            sb.append("\nTesting service lookup:\n");
            Optional<Employee> result = employeeService.findByUsername(username);
            if (result.isPresent()) {
                Employee emp = result.get();
                sb.append("SERVICE RESULT: FOUND!\n");
                sb.append("  ID: ").append(emp.getId()).append("\n");
                sb.append("  Employee ID: '").append(emp.getEmployeeId()).append("'\n");
                sb.append("  Name: ").append(emp.getFirstName()).append(" ").append(emp.getLastName()).append("\n");
                sb.append("  Work Email: '").append(emp.getWorkEmail()).append("'\n");
                sb.append("  Personal Email: '").append(emp.getPersonalEmail()).append("'\n");
                sb.append("  Status: ").append(emp.getStatus()).append("\n");
            } else {
                sb.append("SERVICE RESULT: NOT FOUND!\n");
            }
            
            return sb.toString();
        } catch (Exception e) {
            return "Error during lookup: " + e.getMessage() + "\n" + e.toString();
        }
    }

    /**
     * Temporary endpoint to create employee for current user
     */
    @PostMapping("/create-employee-profile")
    public String createEmployeeProfile(Authentication auth, RedirectAttributes redirectAttributes) {
        String username = auth.getName();
        
        try {
            // Check if employee already exists
            Optional<Employee> existingEmployee = employeeService.findByUsername(username);
            if (existingEmployee.isPresent()) {
                redirectAttributes.addFlashAttribute("info", "Employee profile already exists!");
                return "redirect:/dashboard";
            }
            
            // Create new employee
            Employee employee = new Employee();
            employee.setEmployeeId(username);
            employee.setWorkEmail(username);
            
            // Set default values - you can customize these
            String[] nameParts = username.split("\\.");
            if (nameParts.length >= 2) {
                employee.setFirstName(capitalize(nameParts[0]));
                employee.setLastName(capitalize(nameParts[1]));
            } else {
                employee.setFirstName(capitalize(username));
                employee.setLastName("User");
            }
            
            employee.setStatus("ACTIVE");
            employee.setJobTitle("Employee");
            employee.setEmploymentType("FULL_TIME");
            employee.setWorkLocation("Remote");
            employee.setWorkMode("Remote");
            
            employeeService.createEmployee(employee);
            
            redirectAttributes.addFlashAttribute("success", 
                "Employee profile created successfully! You can now access timesheet features.");
            return "redirect:/timesheet/submit";
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", 
                "Failed to create employee profile: " + e.getMessage());
            return "redirect:/dashboard";
        }
    }
    
    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    /**
     * Get projects as JSON for AJAX calls
     */
    @GetMapping("/projects/json")
    @ResponseBody
    public List<Project> getProjectsJson() {
        return projectService.getAllProjects();
    }
    
    /**
     * Helper method to map entry date to day key (sunday, monday, etc.)
     */
    private String getDayKey(LocalDate entryDate, LocalDate weekStartSunday) {
        if (entryDate == null || weekStartSunday == null) return null;
        
        long dayOffset = entryDate.toEpochDay() - weekStartSunday.toEpochDay();
        
        switch ((int) dayOffset) {
            case 0: return "sunday";
            case 1: return "monday";
            case 2: return "tuesday";
            case 3: return "wednesday";
            case 4: return "thursday";
            case 5: return "friday";
            case 6: return "saturday";
            default: return null; // Entry is not in this week
        }
    }

    /**
     * Approve a timesheet
     */
    @PostMapping("/approve/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String approveTimesheet(@PathVariable Long id, 
                                 @RequestParam(required = false) String comments,
                                 Authentication auth,
                                 RedirectAttributes redirectAttributes) {
        try {
            Optional<Timesheet> timesheetOpt = timesheetRepository.findById(id);
            if (timesheetOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Timesheet not found");
                return "redirect:/timesheet/approvals";
            }
            
            Timesheet timesheet = timesheetOpt.get();
            if (timesheet.getStatus() != TimesheetStatus.SUBMITTED) {
                redirectAttributes.addFlashAttribute("error", "Only submitted timesheets can be approved");
                return "redirect:/timesheet/approvals";
            }
            
            // Find approver employee - try multiple methods
            Optional<Employee> approverOpt = employeeService.findByUsername(auth.getName());
            
            // If not found by username, try finding by user's email
            if (approverOpt.isEmpty()) {
                // Get the user's email and try to find employee by work email
                String userEmail = ((UserDetails) auth.getPrincipal()).getUsername() + "@originhubs.com";
                if (auth.getName().equals("hr")) {
                    userEmail = "hr@originhubs.com";
                } else if (auth.getName().equals("admin")) {
                    userEmail = "admin@originhubs.com";
                }
                approverOpt = employeeService.findByWorkEmail(userEmail);
            }
            
            // If still no employee found, use fallback HR employee for "hr" and "admin" logins
            if (approverOpt.isEmpty() && (auth.getName().equals("hr") || auth.getName().equals("admin"))) {
                // Use A.L.Narasimha Rao (ID 17) as fallback HR approver
                approverOpt = employeeService.getEmployeeById(17L);
                System.out.println("Using fallback HR employee for approver: " + auth.getName());
            }
            
            timesheet.setStatus(TimesheetStatus.APPROVED);
            timesheet.setApprovalDate(LocalDateTime.now());
            timesheet.setUpdatedAt(LocalDateTime.now()); // Ensure updatedAt is set for recent query
            
            if (approverOpt.isPresent()) {
                timesheet.setApprovedBy(approverOpt.get());
                System.out.println("Timesheet approved by: " + approverOpt.get().getFirstName() + " " + approverOpt.get().getLastName());
            } else {
                // If still no employee record found, still process the approval but log it
                System.out.println("Warning: No employee record found for approver: " + auth.getName());
                // timesheet.setApprovedBy will remain null, but approval still goes through
            }
            if (comments != null && !comments.trim().isEmpty()) {
                timesheet.setRejectionReason(comments); // Using rejection_reason field for general comments
            }
            
            timesheetRepository.save(timesheet);
            
            redirectAttributes.addFlashAttribute("success", 
                "Timesheet for " + timesheet.getEmployee().getFirstName() + " " + 
                timesheet.getEmployee().getLastName() + " has been approved successfully");
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error approving timesheet: " + e.getMessage());
        }
        
        return "redirect:/timesheet/approvals";
    }

    /**
     * Reject a timesheet
     */
    @PostMapping("/reject/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String rejectTimesheet(@PathVariable Long id, 
                                @RequestParam(required = false) String comments,
                                Authentication auth,
                                RedirectAttributes redirectAttributes) {
        try {
            Optional<Timesheet> timesheetOpt = timesheetRepository.findById(id);
            if (timesheetOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Timesheet not found");
                return "redirect:/timesheet/approvals";
            }
            
            Timesheet timesheet = timesheetOpt.get();
            if (timesheet.getStatus() != TimesheetStatus.SUBMITTED) {
                redirectAttributes.addFlashAttribute("error", "Only submitted timesheets can be rejected");
                return "redirect:/timesheet/approvals";
            }
            
            // Find rejector employee - try multiple methods
            Optional<Employee> rejectorOpt = employeeService.findByUsername(auth.getName());
            
            // If not found by username, try finding by user's email
            if (rejectorOpt.isEmpty()) {
                // Get the user's email and try to find employee by work email
                String userEmail = ((UserDetails) auth.getPrincipal()).getUsername() + "@originhubs.com";
                if (auth.getName().equals("hr")) {
                    userEmail = "hr@originhubs.com";
                } else if (auth.getName().equals("admin")) {
                    userEmail = "admin@originhubs.com";
                }
                rejectorOpt = employeeService.findByWorkEmail(userEmail);
            }
            
            timesheet.setStatus(TimesheetStatus.REJECTED);
            timesheet.setApprovalDate(LocalDateTime.now()); // Set approval date for rejected timesheets too
            timesheet.setUpdatedAt(LocalDateTime.now()); // Ensure updatedAt is set
            
            if (rejectorOpt.isPresent()) {
                timesheet.setApprovedBy(rejectorOpt.get()); // Set who rejected it
            } else {
                // If still no employee record found, still process the rejection but log it
                System.out.println("Warning: No employee record found for rejector: " + auth.getName());
                // timesheet.setApprovedBy will remain null, but rejection still goes through
            }
            if (comments != null && !comments.trim().isEmpty()) {
                timesheet.setRejectionReason(comments);
            }
            
            timesheetRepository.save(timesheet);
            
            redirectAttributes.addFlashAttribute("success", 
                "Timesheet for " + timesheet.getEmployee().getFirstName() + " " + 
                timesheet.getEmployee().getLastName() + " has been rejected");
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error rejecting timesheet: " + e.getMessage());
        }
        
        return "redirect:/timesheet/approvals";
    }
}