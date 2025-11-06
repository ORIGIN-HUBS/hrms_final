package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.ProjectDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {
    List<ProjectDocument> findByProjectId(Long projectId);
    List<ProjectDocument> findByProjectIdAndDocumentType(Long projectId, String documentType);
    List<ProjectDocument> findByStatus(String status);
}

