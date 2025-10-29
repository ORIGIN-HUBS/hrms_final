package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.ProjectDocument;
import com.originhubs.HRMS.repository.ProjectDocumentRepository;
import lombok.RequiredArgsConstructor;
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
public class ProjectDocumentService {

    private final ProjectDocumentRepository documentRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<ProjectDocument> getDocumentsByProjectId(Long projectId) {
        return documentRepository.findByProjectId(projectId);
    }

    public Optional<ProjectDocument> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    public List<ProjectDocument> getDocumentsByStatus(String status) {
        return documentRepository.findByStatus(status);
    }

    @Transactional
    public ProjectDocument uploadDocument(ProjectDocument document, MultipartFile file) throws IOException {
        String fileName = saveFile(file);
        document.setFileName(file.getOriginalFilename());
        document.setFilePath(fileName);
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        return documentRepository.save(document);
    }

    @Transactional
    public ProjectDocument updateDocumentStatus(Long id, String status) {
        ProjectDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        document.setStatus(status);
        return documentRepository.save(document);
    }

    @Transactional
    public void deleteDocument(Long id) throws IOException {
        ProjectDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        deleteFile(document.getFilePath());
        documentRepository.deleteById(id);
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir, "project-docs");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    private void deleteFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir, "project-docs", fileName);
        Files.deleteIfExists(filePath);
    }
}

