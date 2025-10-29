package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.EmployeeDocument;
import com.originhubs.HRMS.model.Project;
import com.originhubs.HRMS.model.Offboarding;
import com.originhubs.HRMS.model.Invoice;
import com.originhubs.HRMS.model.Timesheet;
import com.originhubs.HRMS.repository.EmployeeRepository;
import com.originhubs.HRMS.repository.EmployeeDocumentRepository;
import com.originhubs.HRMS.repository.ProjectRepository;
import com.originhubs.HRMS.repository.OffboardingRepository;
import com.originhubs.HRMS.repository.InvoiceRepository;
import com.originhubs.HRMS.repository.TimesheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private OffboardingRepository offboardingRepository;

    @Autowired
    private EmployeeDocumentRepository documentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private TimesheetRepository timesheetRepository;

    public Map<String, Object> getDashboardAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // Employee Statistics
        List<Employee> allEmployees = employeeRepository.findAll();
        analytics.put("totalEmployees", allEmployees.size());
        analytics.put("activeEmployees", employeeRepository.countByStatus("ACTIVE"));
        analytics.put("onboardingEmployees", employeeRepository.countByStatus("ONBOARDING"));
        analytics.put("inactiveEmployees", employeeRepository.countByStatus("INACTIVE"));

        // Project Statistics
        List<Project> allProjects = projectRepository.findAll();
        analytics.put("totalProjects", allProjects.size());
        analytics.put("activeProjects", projectRepository.countByStatus("ACTIVE"));
        analytics.put("completedProjects", projectRepository.countByStatus("COMPLETED"));
        analytics.put("onHoldProjects", projectRepository.countByStatus("ON_HOLD"));

        // Document Statistics
        List<EmployeeDocument> allDocuments = documentRepository.findAll();
        analytics.put("totalDocuments", allDocuments.size());
        analytics.put("pendingDocuments", documentRepository.findByStatus("PENDING").size());
        analytics.put("verifiedDocuments", documentRepository.findByStatus("VERIFIED").size());
        analytics.put("rejectedDocuments", documentRepository.findByStatus("REJECTED").size());
        analytics.put("recentDocuments", getRecentDocuments(allDocuments, 5));

        // Offboarding Statistics
        List<Offboarding> allOffboardings = offboardingRepository.findAll();
        analytics.put("totalOffboardings", allOffboardings.size());
        analytics.put("pendingOffboardings", offboardingRepository.findByStatus("PENDING").size());
        analytics.put("inProgressOffboardings", offboardingRepository.findByStatus("IN_PROGRESS").size());
        analytics.put("completedOffboardings", offboardingRepository.findByStatus("COMPLETED").size());

        // Invoice Statistics
        List<Invoice> allInvoices = invoiceRepository.findAll();
        analytics.put("totalInvoices", allInvoices.size());
        analytics.put("paidInvoices", allInvoices.stream().mapToInt(i -> "PAID".equals(i.getStatus()) ? 1 : 0).sum());
        analytics.put("pendingInvoices", allInvoices.stream().mapToInt(i -> "PENDING".equals(i.getStatus()) ? 1 : 0).sum());
        analytics.put("overdueInvoices", allInvoices.stream().mapToInt(i -> "OVERDUE".equals(i.getStatus()) ? 1 : 0).sum());
        analytics.put("totalInvoiceAmount", allInvoices.stream()
            .filter(i -> i.getTotalAmount() != null)
            .mapToDouble(i -> i.getTotalAmount().doubleValue())
            .sum());

        // Timesheet Statistics  
        List<Timesheet> allTimesheets = timesheetRepository.findAll();
        analytics.put("totalTimesheets", allTimesheets.size());
        analytics.put("submittedTimesheets", allTimesheets.stream().mapToInt(t -> "SUBMITTED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        analytics.put("approvedTimesheets", allTimesheets.stream().mapToInt(t -> "APPROVED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        analytics.put("rejectedTimesheets", allTimesheets.stream().mapToInt(t -> "REJECTED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        analytics.put("draftTimesheets", allTimesheets.stream().mapToInt(t -> "DRAFT".equals(t.getStatus().toString()) ? 1 : 0).sum());
        analytics.put("pendingApprovalTimesheets", allTimesheets.stream().mapToInt(t -> "SUBMITTED".equals(t.getStatus().toString()) ? 1 : 0).sum());

        // Recent Activities
        analytics.put("recentEmployees", getRecentEmployees(allEmployees, 5));
        analytics.put("recentProjects", getRecentProjects(allProjects, 5));
        analytics.put("recentOffboardings", getRecentOffboardings(allOffboardings, 5));

        // Department wise statistics (if department field exists)
        analytics.put("departmentStats", getDepartmentStatistics(allEmployees));

        // Monthly trends (simplified)
        analytics.put("monthlyHires", getMonthlyHires(allEmployees));
        analytics.put("monthlyOffboardings", getMonthlyOffboardingTrends(allOffboardings));

        // Employee tenure analysis
        analytics.put("tenureAnalysis", getTenureAnalysis(allEmployees));

        return analytics;
    }

    private List<Employee> getRecentEmployees(List<Employee> employees, int limit) {
        return employees.stream()
                .filter(emp -> emp.getJoiningDate() != null)
                .sorted((e1, e2) -> e2.getJoiningDate().compareTo(e1.getJoiningDate()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<Project> getRecentProjects(List<Project> projects, int limit) {
        return projects.stream()
                .filter(proj -> proj.getProjectStartDate() != null)
                .sorted((p1, p2) -> p2.getProjectStartDate().compareTo(p1.getProjectStartDate()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<Offboarding> getRecentOffboardings(List<Offboarding> offboardings, int limit) {
        return offboardings.stream()
                .filter(off -> off.getInitiatedAt() != null)
                .sorted((o1, o2) -> o2.getInitiatedAt().compareTo(o1.getInitiatedAt()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private Map<String, Long> getDepartmentStatistics(List<Employee> employees) {
        return employees.stream()
                .filter(emp -> emp.getWorkLocation() != null && !emp.getWorkLocation().isEmpty())
                .collect(Collectors.groupingBy(
                    Employee::getWorkLocation,
                    Collectors.counting()
                ));
    }

    private Map<String, Long> getMonthlyHires(List<Employee> employees) {
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        
        return employees.stream()
                .filter(emp -> emp.getJoiningDate() != null && 
                             emp.getJoiningDate().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                    emp -> emp.getJoiningDate().getYear() + "-" + 
                           String.format("%02d", emp.getJoiningDate().getMonthValue()),
                    Collectors.counting()
                ));
    }

    private Map<String, Long> getMonthlyOffboardingTrends(List<Offboarding> offboardings) {
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        
        return offboardings.stream()
                .filter(off -> off.getInitiatedAt() != null)
                .filter(off -> off.getInitiatedAt().toLocalDate().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                    off -> off.getInitiatedAt().getYear() + "-" + 
                           String.format("%02d", off.getInitiatedAt().getMonthValue()),
                    Collectors.counting()
                ));
    }

    private Map<String, Object> getTenureAnalysis(List<Employee> employees) {
        Map<String, Object> tenure = new HashMap<>();
        LocalDate now = LocalDate.now();
        
        long newHires = employees.stream()
                .filter(emp -> emp.getJoiningDate() != null)
                .filter(emp -> ChronoUnit.MONTHS.between(emp.getJoiningDate(), now) <= 6)
                .count();
        
        long experienced = employees.stream()
                .filter(emp -> emp.getJoiningDate() != null)
                .filter(emp -> ChronoUnit.YEARS.between(emp.getJoiningDate(), now) >= 2)
                .count();
        
        long midLevel = employees.size() - newHires - experienced;
        
        tenure.put("newHires", newHires);
        tenure.put("midLevel", midLevel);
        tenure.put("experienced", experienced);
        
        return tenure;
    }

    private List<EmployeeDocument> getRecentDocuments(List<EmployeeDocument> documents, int limit) {
        return documents.stream()
                .filter(doc -> doc.getUploadedAt() != null)
                .sorted((d1, d2) -> d2.getUploadedAt().compareTo(d1.getUploadedAt()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getEmployeeSpecificAnalytics(String employeeId) {
        Map<String, Object> analytics = new HashMap<>();
        
        Employee employee = employeeRepository.findByEmployeeId(employeeId).orElse(null);
        if (employee != null) {
            analytics.put("employee", employee);
            analytics.put("projects", projectRepository.findByEmployeeId(employee.getId()));
            analytics.put("offboarding", offboardingRepository.findByEmployeeId(employee.getId()).orElse(null));
            
            // Calculate tenure
            if (employee.getJoiningDate() != null) {
                long tenure = ChronoUnit.DAYS.between(employee.getJoiningDate(), LocalDate.now());
                analytics.put("tenureDays", tenure);
            }
        }
        
        return analytics;
    }

    // Employee-specific dashboard data
    public Map<String, Object> getEmployeeDashboardData(Long employeeId) {
        Map<String, Object> employeeData = new HashMap<>();
        
        // Employee's timesheets
        List<Timesheet> employeeTimesheets = timesheetRepository.findByEmployee_Id(employeeId);
        employeeData.put("totalTimesheets", employeeTimesheets.size());
        employeeData.put("draftTimesheets", employeeTimesheets.stream().mapToInt(t -> "DRAFT".equals(t.getStatus().toString()) ? 1 : 0).sum());
        employeeData.put("submittedTimesheets", employeeTimesheets.stream().mapToInt(t -> "SUBMITTED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        employeeData.put("approvedTimesheets", employeeTimesheets.stream().mapToInt(t -> "APPROVED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        employeeData.put("rejectedTimesheets", employeeTimesheets.stream().mapToInt(t -> "REJECTED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        
        // Recent timesheets for the employee
        employeeData.put("recentTimesheets", employeeTimesheets.stream()
            .sorted((t1, t2) -> t2.getWeekStartDate().compareTo(t1.getWeekStartDate()))
            .limit(5)
            .collect(Collectors.toList()));
            
        // Employee's documents
        List<EmployeeDocument> employeeDocs = documentRepository.findByEmployeeId(employeeId);
        employeeData.put("totalDocuments", employeeDocs.size());
        employeeData.put("pendingDocs", employeeDocs.stream().mapToInt(d -> "PENDING".equals(d.getStatus()) ? 1 : 0).sum());
        employeeData.put("verifiedDocs", employeeDocs.stream().mapToInt(d -> "VERIFIED".equals(d.getStatus()) ? 1 : 0).sum());
        
        return employeeData;
    }

    public Map<String, Object> getProjectStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<Project> allProjects = projectRepository.findAll();
        
        stats.put("totalProjects", allProjects.size());
        stats.put("activeProjects", allProjects.stream().mapToInt(p -> "ACTIVE".equals(p.getStatus()) ? 1 : 0).sum());
        stats.put("completedProjects", allProjects.stream().mapToInt(p -> "COMPLETED".equals(p.getStatus()) ? 1 : 0).sum());
        stats.put("onHoldProjects", allProjects.stream().mapToInt(p -> "ON_HOLD".equals(p.getStatus()) ? 1 : 0).sum());
        
        return stats;
    }

    public Map<String, Object> getInvoiceStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<Invoice> allInvoices = invoiceRepository.findAll();
        
        stats.put("totalInvoices", allInvoices.size());
        stats.put("paidInvoices", allInvoices.stream().mapToInt(i -> "PAID".equals(i.getStatus()) ? 1 : 0).sum());
        stats.put("pendingInvoices", allInvoices.stream().mapToInt(i -> "PENDING".equals(i.getStatus()) ? 1 : 0).sum());
        stats.put("overdueInvoices", allInvoices.stream().mapToInt(i -> "OVERDUE".equals(i.getStatus()) ? 1 : 0).sum());
        
        return stats;
    }

    public Map<String, Object> getUserStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<Employee> allEmployees = employeeRepository.findAll();
        
        // Count users by status
        stats.put("totalUsers", allEmployees.size());
        stats.put("activeUsers", employeeRepository.countByStatus("ACTIVE"));
        stats.put("inactiveUsers", employeeRepository.countByStatus("INACTIVE"));
        stats.put("onboardingUsers", employeeRepository.countByStatus("ONBOARDING"));
        
        // Count users by role (assuming role is stored in jobTitle)
        long adminUsers = allEmployees.stream().filter(emp -> 
            emp.getJobTitle() != null && emp.getJobTitle().toLowerCase().contains("admin")).count();
        long hrUsers = allEmployees.stream().filter(emp -> 
            emp.getJobTitle() != null && emp.getJobTitle().toLowerCase().contains("hr")).count();
        long regularUsers = allEmployees.size() - adminUsers - hrUsers;
        
        stats.put("adminUsers", adminUsers);
        stats.put("hrUsers", hrUsers);
        stats.put("employeeUsers", regularUsers);
        
        return stats;
    }

    public Map<String, Object> getTimesheetStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<Timesheet> allTimesheets = timesheetRepository.findAll();
        
        stats.put("totalTimesheets", allTimesheets.size());
        stats.put("draftTimesheets", allTimesheets.stream().mapToInt(t -> "DRAFT".equals(t.getStatus().toString()) ? 1 : 0).sum());
        stats.put("submittedTimesheets", allTimesheets.stream().mapToInt(t -> "SUBMITTED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        stats.put("approvedTimesheets", allTimesheets.stream().mapToInt(t -> "APPROVED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        stats.put("rejectedTimesheets", allTimesheets.stream().mapToInt(t -> "REJECTED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        stats.put("pendingApprovalTimesheets", allTimesheets.stream().mapToInt(t -> "SUBMITTED".equals(t.getStatus().toString()) ? 1 : 0).sum());
        
        return stats;
    }

    public Map<String, Object> getDocumentStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<EmployeeDocument> allDocuments = documentRepository.findAll();
        
        stats.put("totalDocuments", allDocuments.size());
        stats.put("pendingDocuments", documentRepository.findByStatus("PENDING").size());
        stats.put("verifiedDocuments", documentRepository.findByStatus("VERIFIED").size());
        stats.put("rejectedDocuments", documentRepository.findByStatus("REJECTED").size());
        
        return stats;
    }
}