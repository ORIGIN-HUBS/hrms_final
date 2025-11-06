package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.EmployeeDocument;
import com.originhubs.HRMS.repository.EmployeeDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeDocumentService {

    private final EmployeeDocumentRepository documentRepository;
    private final NotificationService notificationService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<EmployeeDocument> getDocumentsByEmployeeId(Long employeeId) {
        return documentRepository.findByEmployeeId(employeeId);
    }

    public List<EmployeeDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Optional<EmployeeDocument> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    public List<EmployeeDocument> getDocumentsByStatus(String status) {
        return documentRepository.findByStatus(status);
    }

    @Transactional
    public EmployeeDocument uploadDocument(EmployeeDocument document, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        
        log.info("Uploading file: {} (size: {} bytes)", file.getOriginalFilename(), file.getSize());
        
        // Save the file to disk (returns the unique filename)
        String uniqueFileName = saveFile(file);
        
        // Set file information
        document.setFileName(uniqueFileName);
        document.setFilePath("uploads/employee-docs/" + uniqueFileName);
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        
        // Set default status if not already set
        if (document.getStatus() == null || document.getStatus().isEmpty()) {
            document.setStatus("PENDING");
        }
        
        // Save to database
        EmployeeDocument savedDocument = documentRepository.save(document);
        log.info("Document saved with ID: {}", savedDocument.getId());
        
        return savedDocument;
    }

    @Transactional
    public EmployeeDocument updateDocumentStatus(Long id, String status, String verifiedBy) {
        EmployeeDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        document.setStatus(status);
        document.setVerifiedBy(verifiedBy);
        return documentRepository.save(document);
    }

    @Transactional
    public EmployeeDocument saveEmployeeDocument(Employee employee, MultipartFile file, 
                                                String documentType, String expiryDate, 
                                                String documentNumber, String uploadedBy) throws IOException {
        EmployeeDocument document = new EmployeeDocument();
        document.setEmployee(employee);
        document.setDocumentType(documentType);
        document.setUploadedBy(uploadedBy);
        document.setDocumentNumber(documentNumber);
        document.setStatus("PENDING");
        
        // Parse expiry date if provided
        if (expiryDate != null && !expiryDate.trim().isEmpty()) {
            try {
                document.setExpiryDate(java.time.LocalDate.parse(expiryDate));
            } catch (Exception e) {
                // Log warning but don't fail upload
                System.out.println("Warning: Could not parse expiry date: " + expiryDate);
            }
        }
        
        EmployeeDocument savedDocument = uploadDocument(document, file);
        
        // Send notification to admin/HR about new document upload
        notificationService.notifyDocumentUploaded(
                employee.getId(), 
                savedDocument.getId(), 
                documentType, 
                uploadedBy
        );
        
        return savedDocument;
    }

    @Transactional
    public EmployeeDocument verifyDocument(Long documentId, String status, 
                                         String notes, String verifiedBy) {
        EmployeeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));
        
        document.setStatus(status);
        document.setVerifiedBy(verifiedBy);
        if (notes != null && !notes.trim().isEmpty()) {
            document.setNotes(notes);
        }
        
        EmployeeDocument savedDocument = documentRepository.save(document);
        
        // Send notification to employee about document verification
        notificationService.notifyDocumentVerified(
                document.getEmployee().getId(),
                documentId,
                document.getDocumentType(),
                status,
                verifiedBy
        );
        
        return savedDocument;
    }

    @Transactional
    public void deleteDocument(Long id) throws IOException {
        EmployeeDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        deleteFile(document.getFilePath());
        documentRepository.deleteById(id);
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir, "employee-docs");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    private void deleteFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir, "employee-docs", fileName);
        Files.deleteIfExists(filePath);
    }
}

