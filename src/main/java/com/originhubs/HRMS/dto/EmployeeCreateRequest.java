package com.originhubs.HRMS.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCreateRequest {
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
    private String residentialAddress;
    private String emergencyContactName;
    private String emergencyContactNumber;
    private String emergencyContactRelation;
    private String ssn;
    private String workPermit;
    private String jobTitle;
    private String supervisor;
    private String employmentType;
    private String workLocation;
    private String currentLocation;
    private String workMode;
    private LocalDate joiningDate;
    private String status;
    
    // Additional fields for user account creation
    private String username;
    private String tempPassword;
}