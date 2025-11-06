package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Notification;
import com.originhubs.HRMS.model.Role;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.repository.EmployeeRepository;
import com.originhubs.HRMS.repository.NotificationRepository;
import com.originhubs.HRMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public void createDocumentNotification(String type, String title, String message, 
                                         Long userId, Long employeeId, Long documentId) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCategory("DOCUMENT");
        notification.setUserId(userId);
        notification.setEmployeeId(employeeId);
        notification.setDocumentId(documentId);
        
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyDocumentUploaded(Long employeeId, Long documentId, String documentType, String uploadedBy) {
        // Get employee details
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return; // Skip notification if employee not found
        }
        
        String employeeName = employee.getFirstName() + " " + employee.getLastName();
        String employeeIdStr = employee.getEmployeeId();
        
        // Notify all admin and HR users
        List<User> adminHrUsers = userRepository.findUsersWithRoles(List.of(Role.RoleName.ROLE_ADMIN, Role.RoleName.ROLE_HR));
        
        for (User user : adminHrUsers) {
            createDocumentNotification(
                "INFO",
                "Document Upload - " + employeeName + " (" + employeeIdStr + ")",
                employeeName + " (" + employeeIdStr + ") has uploaded a new " + 
                documentType.replace("_", " ") + " document for review. Click to view document details.",
                user.getId(),
                employeeId,
                documentId
            );
        }
    }

    @Transactional
    public void notifyDocumentVerified(Long employeeId, Long documentId, String documentType, 
                                     String status, String verifiedBy) {
        // Find the employee's user account
        User employeeUser = userRepository.findByEmployeeId(employeeId);
        
        if (employeeUser != null) {
            String title = status.equals("VERIFIED") ? "Document Verified" : "Document Rejected";
            String message = "Your " + documentType.replace("_", " ") + " document has been " + 
                           status.toLowerCase() + " by " + verifiedBy + ".";
            String type = status.equals("VERIFIED") ? "SUCCESS" : "WARNING";
            
            createDocumentNotification(type, title, message, employeeUser.getId(), employeeId, documentId);
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null && !notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    public List<Notification> getRecentNotifications(Long userId, int limit) {
        List<Notification> all = notificationRepository.findRecentByUserId(userId);
        return all.size() > limit ? all.subList(0, limit) : all;
    }

    // ========== TIMESHEET NOTIFICATION METHODS ==========

    @Transactional
    public void notifyTimesheetSubmitted(Long timesheetId, Employee employee, Employee manager) {
        if (manager != null) {
            String title = "Timesheet Submitted for Approval";
            String message = String.format("Timesheet for week %s submitted by %s for approval", 
                getWeekDescription(timesheetId), employee.getFullName());
            
            createTimesheetNotification("TIMESHEET_SUBMITTED", title, message, 
                null, manager.getId(), timesheetId);
        }
    }

    @Transactional
    public void notifyTimesheetApproved(Long timesheetId, Employee employee, Employee approver) {
        String title = "Timesheet Approved";
        String message = String.format("Your timesheet for week %s has been approved by %s", 
            getWeekDescription(timesheetId), approver.getFullName());
        
        createTimesheetNotification("TIMESHEET_APPROVED", title, message, 
            null, employee.getId(), timesheetId);
    }

    @Transactional
    public void notifyTimesheetRejected(Long timesheetId, Employee employee, Employee rejector, String reason) {
        String title = "Timesheet Rejected";
        String message = String.format("Your timesheet for week %s has been rejected by %s. Reason: %s", 
            getWeekDescription(timesheetId), rejector.getFullName(), reason);
        
        createTimesheetNotification("TIMESHEET_REJECTED", title, message, 
            null, employee.getId(), timesheetId);
    }

    @Transactional
    public void notifyTimesheetReminder(Long employeeId, String weekDescription) {
        String title = "Timesheet Reminder";
        String message = String.format("Please submit your timesheet for week %s", weekDescription);
        
        createTimesheetNotification("TIMESHEET_REMINDER", title, message, 
            null, employeeId, null);
    }

    @Transactional
    public void notifyTimesheetOverdue(Long employeeId, String weekDescription) {
        String title = "Overdue Timesheet";
        String message = String.format("Your timesheet for week %s is overdue. Please submit immediately.", weekDescription);
        
        createTimesheetNotification("TIMESHEET_OVERDUE", title, message, 
            null, employeeId, null);
    }

    @Transactional
    private void createTimesheetNotification(String type, String title, String message, 
                                           Long userId, Long employeeId, Long timesheetId) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCategory("TIMESHEET");
        notification.setUserId(userId);
        notification.setEmployeeId(employeeId);
        
        // Set timesheet-specific data in metadata or additional fields
        if (timesheetId != null) {
            notification.setDocumentId(timesheetId); // Reuse documentId for timesheetId
        }
        
        notificationRepository.save(notification);
    }

    private String getWeekDescription(Long timesheetId) {
        // Placeholder - in real implementation, fetch timesheet and format week dates
        return "current week";
    }
}