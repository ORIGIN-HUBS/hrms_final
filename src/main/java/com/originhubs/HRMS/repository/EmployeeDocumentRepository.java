package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {
    List<EmployeeDocument> findByEmployeeId(Long employeeId);
    List<EmployeeDocument> findByEmployeeIdAndDocumentType(Long employeeId, String documentType);
    List<EmployeeDocument> findByStatus(String status);
}

