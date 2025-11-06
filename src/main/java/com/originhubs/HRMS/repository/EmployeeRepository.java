package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByEmployeeIdIgnoreCase(String employeeId);
    boolean existsByEmployeeId(String employeeId);
    List<Employee> findByStatus(String status);
    Optional<Employee> findByWorkEmail(String workEmail);
    Optional<Employee> findByWorkEmailIgnoreCase(String workEmail);
    Optional<Employee> findByPersonalEmail(String personalEmail);

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.employeeId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.personalEmail) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Employee> searchEmployees(String keyword);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.status = :status")
    long countByStatus(String status);
}

