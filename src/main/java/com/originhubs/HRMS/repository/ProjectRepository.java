package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(String status);
    List<Project> findByEmployeeId(Long employeeId);
    List<Project> findByEmployeeIdAndStatus(Long employeeId, String status);

    @Query("SELECT p FROM Project p WHERE " +
           "LOWER(p.projectName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.clientCompanyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.vendorCompanyName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Project> searchProjects(String keyword);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
    long countByStatus(String status);
}

