package com.originhubs.HRMS.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String employeeId;
    private String firstName;
    private String middleName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String pronouns;
    private String contactNumber;
    private String alternateContactNumber;
    private String personalEmail;
    private String workEmail;
    private String address; // Maps to residentialAddress
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String department; // Maps to jobTitle
    private String position; // Maps to jobTitle
    private LocalDate hireDate; // Maps to joiningDate
    private BigDecimal salary; // Not available in current model
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields from Employee model that might be useful
    private String emergencyContactName;
    private String emergencyContactNumber;
    private String emergencyContactRelation;
    private String jobTitle;
    private String supervisor;
    private String employmentType;
    private String workLocation;
    private String workMode;
    private LocalDate joiningDate;
    private LocalDate terminationDate;
}