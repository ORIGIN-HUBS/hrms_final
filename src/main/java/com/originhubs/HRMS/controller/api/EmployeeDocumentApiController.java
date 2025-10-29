package com.originhubs.HRMS.controller.api;

import com.originhubs.HRMS.model.EmployeeDocument;
import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.service.EmployeeDocumentService;
import com.originhubs.HRMS.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees/{employeeId}/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EmployeeDocumentApiController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeDocumentApiController.class);
    
    private final EmployeeDocumentService documentService;
    private final EmployeeService employeeService;
    
    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<EmployeeDocument>> getAllDocuments() {
        try {
            List<EmployeeDocument> allDocuments = documentService.getAllDocuments();
            logger.info("Retrieved {} total documents in database", allDocuments.size());
            
            for (EmployeeDocument doc : allDocuments) {
                logger.info("All Documents - Document: id={}, employeeId={}, type={}, filename={}, status={}", 
                           doc.getId(), doc.getEmployee().getId(), doc.getDocumentType(), doc.getFileName(), doc.getStatus());
            }
            
            return ResponseEntity.ok(allDocuments);
        } catch (Exception e) {
            logger.error("Error retrieving all documents", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<EmployeeDocument>> getEmployeeDocuments(@PathVariable Long employeeId) {
        try {
            logger.info("GET request for employee documents: employeeId={}", employeeId);
            
            // First check if employee exists
            Optional<Employee> employeeOpt = employeeService.getEmployeeById(employeeId);
            if (employeeOpt.isEmpty()) {
                logger.warn("Employee not found: {}", employeeId);
                return ResponseEntity.notFound().build();
            }
            
            List<EmployeeDocument> documents = documentService.getDocumentsByEmployeeId(employeeId);
            logger.info("Retrieved {} documents for employee {}", documents.size(), employeeId);
            
            // Log each document for debugging
            for (EmployeeDocument doc : documents) {
                logger.info("Document: id={}, type={}, filename={}, status={}", 
                           doc.getId(), doc.getDocumentType(), doc.getFileName(), doc.getStatus());
            }
            
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error retrieving documents for employee: " + employeeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            Authentication authentication) {
        
        logger.info("Upload request: employeeId={}, documentType={}, file={}", 
                   employeeId, documentType, file.getOriginalFilename());
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please select a file to upload"));
            }
            
            // Validate employee exists
            Optional<Employee> employeeOpt = employeeService.getEmployeeById(employeeId);
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Employee not found"));
            }

            // Create document record
            EmployeeDocument document = new EmployeeDocument();
            document.setEmployee(employeeOpt.get());
            document.setDocumentType(documentType);
            document.setStatus("PENDING");
            document.setUploadedBy(authentication.getName());

            // Upload file and save document
            EmployeeDocument savedDocument = documentService.uploadDocument(document, file);
            
            logger.info("Document uploaded successfully: ID={}", savedDocument.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Document uploaded successfully",
                "document", savedDocument
            ));
            
        } catch (Exception e) {
            logger.error("Upload failed for employee " + employeeId, e);
            return ResponseEntity.badRequest().body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }

    @PutMapping("/{documentId}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<?> verifyDocument(
            @PathVariable Long employeeId,
            @PathVariable Long documentId,
            @RequestParam String status,
            @RequestParam(required = false) String comments,
            Authentication authentication) {
        try {
            EmployeeDocument document = documentService.verifyDocument(documentId, status, comments, authentication.getName());
            logger.info("Document {} verified with status {} by {}", documentId, status, authentication.getName());
            
            return ResponseEntity.ok(Map.of(
                "message", "Document verification updated successfully",
                "document", document
            ));
            
        } catch (Exception e) {
            logger.error("Error verifying document: " + documentId, e);
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to verify document: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long employeeId,
            @PathVariable Long documentId,
            Authentication authentication) {
        try {
            documentService.deleteDocument(documentId);
            logger.info("Document {} deleted by {}", documentId, authentication.getName());
            
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
            
        } catch (Exception e) {
            logger.error("Error deleting document: " + documentId, e);
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete document: " + e.getMessage()));
        }
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long employeeId,
            @PathVariable Long documentId,
            Authentication authentication) {
        try {
            logger.info("Download request for document {} by user {}", documentId, authentication.getName());
            
            // Get document details
            Optional<EmployeeDocument> documentOpt = documentService.getDocumentById(documentId);
            if (documentOpt.isEmpty()) {
                logger.warn("Document not found: {}", documentId);
                return ResponseEntity.notFound().build();
            }
            
            EmployeeDocument document = documentOpt.get();
            
            // Check if document belongs to the specified employee
            if (!document.getEmployee().getId().equals(employeeId)) {
                logger.warn("Document {} does not belong to employee {}", documentId, employeeId);
                return ResponseEntity.badRequest().build();
            }
            
            // Load file as Resource
            String fileName = document.getFileName();
            Path filePath = Paths.get(uploadDir, "employee-docs", fileName);
            
            if (!Files.exists(filePath)) {
                logger.error("File not found on disk: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                logger.error("File not readable: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            // Determine content type
            String contentType = document.getFileType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            logger.info("Serving file: {} with content type: {}", fileName, contentType);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            logger.error("Error downloading document: " + documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<EmployeeDocument>> getPendingDocuments() {
        try {
            List<EmployeeDocument> pendingDocuments = documentService.getDocumentsByStatus("PENDING");
            logger.info("Retrieved {} pending documents", pendingDocuments.size());
            return ResponseEntity.ok(pendingDocuments);
        } catch (Exception e) {
            logger.error("Error retrieving pending documents", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}