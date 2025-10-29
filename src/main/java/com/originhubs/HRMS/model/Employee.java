package com.originhubs.HRMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String employeeId;

    // Personal Information
    @Column(nullable = false)
    private String firstName;

    private String middleName;

    @Column(nullable = false)
    private String lastName;

    private LocalDate dateOfBirth;

    private String gender;

    private String pronouns;

    // Contact Information
    @Column(nullable = false)
    private String contactNumber;

    private String alternateContactNumber;

    @Column(nullable = false)
    private String personalEmail;

    private String workEmail;

    // Address
    @Column(length = 500)
    private String residentialAddress;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactNumber;
    private String emergencyContactRelation;

    // Legal Information
    private String ssn;
    private String workPermit;

    // Employment Details
    @Column(nullable = false)
    private String jobTitle;

    private String supervisor;

    // Manager relationship - self-referential
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    // Direct reports
    @OneToMany(mappedBy = "manager", fetch = FetchType.LAZY)
    private Set<Employee> directReports;

    // Manager ID for convenience queries
    @Column(name = "manager_id", insertable = false, updatable = false)
    private Long managerId;

    // User roles for authorization
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "employee_roles",
        joinColumns = @JoinColumn(name = "employee_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    @Column(nullable = false)
    private String employmentType; // Full-time, Part-time, Contract

    private String workLocation; // Office location

    private String currentLocation;

    private String workMode; // Onsite, Remote, Hybrid

    private LocalDate joiningDate;

    private LocalDate terminationDate;

    @Column(nullable = false)
    private String status; // ACTIVE, ONBOARDING, OFFBOARDING, TERMINATED

    // Audit Fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "ONBOARDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        return firstName + (middleName != null ? " " + middleName : "") + " " + lastName;
    }
}

