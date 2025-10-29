package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.EmployeeDocument;
import com.originhubs.HRMS.service.DashboardService;
import com.originhubs.HRMS.service.EmployeeDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Controller
@RequestMapping("/documents")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class DocumentController {

    private final EmployeeDocumentService documentService;
    private final DashboardService dashboardService;

    @GetMapping
    public String documentManagement(Model model, 
                                   @RequestParam(required = false) String status,
                                   @RequestParam(required = false) String search) {
        List<EmployeeDocument> documents;
        
        if (status != null && !status.isEmpty()) {
            documents = documentService.getDocumentsByStatus(status);
        } else {
            documents = documentService.getAllDocuments();
        }
        
        // Filter by search term if provided
        if (search != null && !search.trim().isEmpty()) {
            documents = documents.stream()
                .filter(doc -> 
                    doc.getEmployee().getFirstName().toLowerCase().contains(search.toLowerCase()) ||
                    doc.getEmployee().getLastName().toLowerCase().contains(search.toLowerCase()) ||
                    doc.getEmployee().getEmployeeId().toLowerCase().contains(search.toLowerCase()) ||
                    doc.getDocumentType().toLowerCase().contains(search.toLowerCase())
                )
                .toList();
        }
        
        model.addAttribute("documents", documents);
        model.addAttribute("selectedStatus", status);
        model.addAttribute("searchTerm", search);
        
        // Add real document statistics from DashboardService
        var documentStats = dashboardService.getDocumentStatistics();
        model.addAttribute("documentStats", documentStats);
        
        // Backward compatibility for existing template
        model.addAttribute("totalDocuments", documentStats.get("totalDocuments"));
        model.addAttribute("pendingDocuments", documentStats.get("pendingDocuments"));
        model.addAttribute("verifiedDocuments", documentStats.get("verifiedDocuments"));
        model.addAttribute("rejectedDocuments", documentStats.get("rejectedDocuments"));
        
        return "documents/management";
    }

    @GetMapping("/{documentId}/view")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long documentId) {
        try {
            EmployeeDocument document = documentService.getDocumentById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            
            Path filePath = Paths.get("./uploads/employee-docs/" + document.getFileName());
            Resource resource = new FileSystemResource(filePath.toFile());
            
            if (resource.exists()) {
                String contentType = getContentType(document.getFileType(), document.getFileName());
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "inline; filename=\"" + document.getFileName() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found on disk");
            }
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        try {
            EmployeeDocument document = documentService.getDocumentById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            
            Path filePath = Paths.get("./uploads/employee-docs/" + document.getFileName());
            Resource resource = new FileSystemResource(filePath.toFile());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + document.getFileName() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found on disk");
            }
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{documentId}/verify")
    public String verifyDocument(@PathVariable Long documentId, 
                                @RequestParam String status,
                                @RequestParam(required = false) String notes,
                                Authentication authentication,
                                RedirectAttributes redirectAttributes) {
        try {
            documentService.verifyDocument(documentId, status, notes, authentication.getName());
            redirectAttributes.addFlashAttribute("success", 
                "Document " + status.toLowerCase() + " successfully!");
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating document: " + e.getMessage());
        }
        
        return "redirect:/documents";
    }

    private String getContentType(String fileType, String fileName) {
        if (fileType != null && !fileType.isEmpty()) {
            return fileType;
        }
        
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "pdf":
                return "application/pdf";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default:
                return "application/octet-stream";
        }
    }
}