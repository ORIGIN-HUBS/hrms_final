package com.originhubs.HRMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timesheet_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timesheet_id", nullable = false)
    private Timesheet timesheet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // Daily Entry Information
    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "task_description", length = 1000)
    private String taskDescription;

    @Column(name = "activity_description", length = 1000)
    private String activityDescription;

    // Time Information
    @Column(name = "hours_worked", precision = 5, scale = 2, nullable = false)
    private BigDecimal hoursWorked = BigDecimal.ZERO;

    @Column(name = "billable_hours", precision = 5, scale = 2)
    private BigDecimal billableHours = BigDecimal.ZERO;

    @Column(name = "non_billable_hours", precision = 5, scale = 2)
    private BigDecimal nonBillableHours = BigDecimal.ZERO;

    @Column(name = "overtime_hours", precision = 5, scale = 2)
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(name = "break_hours", precision = 5, scale = 2)
    private BigDecimal breakHours = BigDecimal.ZERO;

    // Time Tracking Details
    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "comments", length = 1000)
    private String comments;

    // Work Type and Location
    @Enumerated(EnumType.STRING)
    @Column(name = "work_type")
    private WorkType workType = WorkType.REGULAR;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_location")
    private WorkLocation workLocation = WorkLocation.OFFICE;

    // AI/ML Enhancement Fields
    @Column(name = "auto_captured", columnDefinition = "boolean default false")
    private Boolean autoCaptured = false;

    @Column(name = "calendar_synced", columnDefinition = "boolean default false")
    private Boolean calendarSynced = false;

    @Column(name = "productivity_score", precision = 3, scale = 2)
    private BigDecimal productivityScore;

    @Column(name = "anomaly_flagged", columnDefinition = "boolean default false")
    private Boolean anomalyFlagged = false;

    @Column(name = "anomaly_type")
    private String anomalyType;

    // Audit Information
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Auto-calculate billable/non-billable hours if not set
        if (billableHours == null && nonBillableHours == null && hoursWorked != null) {
            // Default to billable unless specified otherwise
            billableHours = hoursWorked;
            nonBillableHours = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Enums
    public enum WorkType {
        REGULAR,
        OVERTIME,
        HOLIDAY,
        WEEKEND,
        SICK_LEAVE,
        VACATION,
        TRAINING,
        MEETING,
        TRAVEL
    }

    public enum WorkLocation {
        OFFICE,
        REMOTE,
        CLIENT_SITE,
        HYBRID,
        TRAVEL
    }
}